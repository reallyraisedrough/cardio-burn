"""Aim-based posing for the MPFB 'game_engine' rig.

All targets are world-space (armature object sits at identity). Bones are posed top-down by assigning
pose_bone.matrix; leg/arm chains use an analytic 2-bone IK that preserves the rig's real bone lengths,
so feet/hands land exactly on the requested floor points.
"""
import bpy, math
from mathutils import Vector, Matrix, Quaternion

FINGERS = ["thumb", "index", "middle", "ring", "pinky"]

class Poser:
    def __init__(self, rig):
        self.rig = rig
        self.pb = rig.pose.bones
        self.rest = {b.name: b.matrix_local.copy() for b in rig.data.bones}
        for p in self.pb:
            p.rotation_mode = 'QUATERNION'
            p.matrix_basis = Matrix.Identity(4)
        self.upd()

    # ---------------------------------------------------------------- basics
    def upd(self):
        bpy.context.view_layer.update()

    def head(self, n):
        return self.pb[n].head.copy()

    def tail(self, n):
        return self.pb[n].tail.copy()

    def rest_head(self, n):
        return self.rest[n].translation.copy()

    def rest_tail(self, n):
        b = self.rig.data.bones[n]
        return b.tail_local.copy()

    def length(self, a, b):
        """distance between rest heads of bones a and b"""
        return (self.rest_head(b) - self.rest_head(a)).length

    def set_matrix(self, n, M):
        self.pb[n].matrix = M
        self.upd()

    def rotate_world(self, n, axis, angle_deg, pivot=None):
        """rotate a posed bone (and its children) in world space around its head (or pivot)."""
        M = self.pb[n].matrix.copy()
        piv = M.translation.copy() if pivot is None else Vector(pivot)
        R = Matrix.Rotation(math.radians(angle_deg), 4, Vector(axis).normalized())
        T = Matrix.Translation(piv)
        self.set_matrix(n, T @ R @ T.inverted() @ M)

    def translate_world(self, n, delta):
        M = self.pb[n].matrix.copy()
        M.translation += Vector(delta)
        self.set_matrix(n, M)

    @staticmethod
    def frame(y, r):
        y = y.normalized()
        z = (r - y * r.dot(y))
        if z.length < 1e-6:
            z = Vector((0, 0, 1)) - y * y.z
        z.normalize()
        x = y.cross(z)
        return Matrix((x, y, z)).transposed()  # columns x,y,z

    def aim(self, n, head, y_dir, ref_world, ref_rest):
        """Pose bone n so its head is at `head`, its Y axis along y_dir, and the anatomical
        reference vector `ref_rest` (defined in rest armature space) maps to `ref_world`."""
        R0 = self.rest[n].to_3x3()
        y0 = R0.col[1]
        F0 = self.frame(y0, Vector(ref_rest))
        F1 = self.frame(Vector(y_dir), Vector(ref_world))
        R = F1 @ F0.transposed()
        M = (R @ R0).to_4x4()
        M.translation = Vector(head)
        self.set_matrix(n, M)

    def apply_rest_rotation(self, n, R3, head=None):
        """Bone keeps its rest shape but rotated by world rotation R3 (3x3), head placed at `head`."""
        M = (R3 @ self.rest[n].to_3x3()).to_4x4()
        M.translation = self.head(n) if head is None else Vector(head)
        self.set_matrix(n, M)

    # ---------------------------------------------------------------- IK
    @staticmethod
    def two_bone(H, A, L1, L2, pole):
        d_vec = A - H
        d = d_vec.length
        d = max(min(d, (L1 + L2) * 0.9995), abs(L1 - L2) + 1e-4)
        u = d_vec.normalized()
        a = (L1 * L1 - L2 * L2 + d * d) / (2 * d)
        h = math.sqrt(max(L1 * L1 - a * a, 0.0))
        p = pole - u * pole.dot(u)
        p.normalize()
        K = H + u * a + p * h
        A2 = H + u * d
        return K, A2, p

    def leg(self, side, ankle, pole):
        th, ca, ft = f"thigh_{side}", f"calf_{side}", f"foot_{side}"
        H = self.head(th)
        L1, L2 = self.length(th, ca), self.length(ca, ft)
        K, A2, p = self.two_bone(H, Vector(ankle), L1, L2, Vector(pole))
        fwd = Vector((0, -1, 0))
        self.aim(th, H, K - H, p, fwd)
        self.aim(ca, K, A2 - K, p, fwd)
        return K, A2

    def foot_flat(self, side, yaw_deg, extra_pitch_deg=0.0):
        """Foot keeps its rest (flat) shape, rotated by yaw about Z; placed at current ankle."""
        R = Matrix.Rotation(math.radians(yaw_deg), 3, 'Z')
        if extra_pitch_deg:
            R = R @ Matrix.Rotation(math.radians(extra_pitch_deg), 3, 'X')
        self.apply_rest_rotation(f"foot_{side}", R)
        self.apply_rest_rotation(f"ball_{side}", R)

    def palm_normal_rest(self, side):
        w = self.rest_head(f"hand_{side}")
        i = self.rest_head(f"index_01_{side}")
        k = self.rest_head(f"pinky_01_{side}")
        n = (i - w).cross(k - w).normalized()
        # palm faces medially in the rest A-pose: for left hand (+X) palm normal should have -X
        if (side == "l" and n.x > 0) or (side == "r" and n.x < 0):
            n = -n
        return n

    def finger_dir_rest(self, side):
        return (self.rest_head(f"middle_01_{side}") - self.rest_head(f"hand_{side}")).normalized()

    def hand_rotation(self, side, finger_dir, palm_normal):
        """World rotation that maps the rest hand frame onto (finger_dir, palm_normal)."""
        F0 = self.frame(self.finger_dir_rest(side), self.palm_normal_rest(side))
        F1 = self.frame(Vector(finger_dir), Vector(palm_normal))
        return F1 @ F0.transposed()

    def arm(self, side, wrist, elbow_pole, finger_dir, palm_normal, forearm_roll_follow=0.75):
        ua, la, ha = f"upperarm_{side}", f"lowerarm_{side}", f"hand_{side}"
        S = self.head(ua)
        L1, L2 = self.length(ua, la), self.length(la, ha)
        # rest elbow pole (direction the elbow points) from rest joint positions
        rS, rE, rW = self.rest_head(ua), self.rest_head(la), self.rest_head(ha)
        u0 = (rW - rS).normalized()
        p0 = (rE - rS) - u0 * (rE - rS).dot(u0)
        p0.normalize()
        E, W2, p = self.two_bone(S, Vector(wrist), L1, L2, Vector(elbow_pole))
        self.aim(ua, S, E - S, p, p0)
        # forearm roll: blend between "follow elbow plane" and "follow hand palm" (pronation)
        Rh = self.hand_rotation(side, finger_dir, palm_normal)
        pn_rest = self.palm_normal_rest(side)
        pn_world = Rh @ pn_rest
        ref_world = (p.lerp(pn_world, forearm_roll_follow)) if forearm_roll_follow < 1 else pn_world
        ref_rest = (p0.lerp(pn_rest, forearm_roll_follow)) if forearm_roll_follow < 1 else pn_rest
        self.aim(la, E, W2 - E, ref_world, ref_rest)
        self.apply_rest_rotation(ha, Rh, head=self.head(ha))
        return E, W2

    def fingers(self, side, curl_deg=None, spread_deg=0.0, flat_normal=None, thumb_curl=None,
                gather=0.0, gather_dir=None, thumb_flat=False):
        """curl_deg: dict finger->deg per segment; flat_normal: straighten fingers into the palm plane
        (normal points out of the palm) then flex by curl_deg toward the palm; gather (0..1) pulls the
        fingers' direction toward gather_dir to close the rest-pose splay."""
        nrm = Vector(flat_normal).normalized() if flat_normal is not None else None
        for f in FINGERS:
            for seg in (1, 2, 3):
                n = f"{f}_0{seg}_{side}"
                if n not in self.pb:
                    continue
                pbn = self.pb[n]
                c = (curl_deg or {}).get(f, 0.0) * (1.0 if seg == 1 else 1.25)
                is_thumb = f == "thumb"
                if nrm is not None and (not is_thumb or thumb_flat):
                    y = pbn.matrix.to_3x3().col[1]
                    if gather and gather_dir is not None and not is_thumb and seg == 1:
                        g = Vector(gather_dir).normalized()
                        y = y.lerp(g, gather).normalized()
                    y_flat = (y - nrm * y.dot(nrm)).normalized()
                    y_new = (y_flat + nrm * math.tan(math.radians(c))).normalized()
                    M = pbn.matrix.to_3x3()
                    R = pbn.matrix.to_3x3().col[1].rotation_difference(y_new).to_matrix()
                    M2 = (R @ M).to_4x4(); M2.translation = pbn.head.copy()
                    self.set_matrix(n, M2)
                    continue
                if c:
                    pbn.rotation_quaternion = Quaternion((1, 0, 0), math.radians(c)) @ pbn.rotation_quaternion
        self.upd()

    # ---------------------------------------------------------------- contact measurement
    def hand_contact(self, body, side):
        """Return (palm_min_z, finger_min_z) of the deformed skin of one hand (armature only)."""
        saved = [(m, m.show_viewport) for m in body.modifiers]
        for m, _ in saved:
            m.show_viewport = (m.type == 'ARMATURE')
        self.upd()
        dg = bpy.context.evaluated_depsgraph_get()
        ev = body.evaluated_get(dg)
        me = ev.to_mesh()
        vg = {g.name: g.index for g in body.vertex_groups}
        palm_ids = {vg[f"hand_{side}"]}
        fing_ids = {vg[k] for k in vg if k.endswith(f"_{side}") and k.split("_")[0] in FINGERS}
        helper = {vg[k] for k in vg if k.startswith(("helper", "joint", "HelperGeometry", "JointCubes"))}
        pz, fz = 9.0, 9.0
        src = body.data.vertices
        for v in src:
            gs = {g.group: g.weight for g in v.groups}
            if any(h in gs for h in helper):
                continue
            wp = sum(w for g, w in gs.items() if g in palm_ids)
            wf = sum(w for g, w in gs.items() if g in fing_ids)
            if wp < 0.5 and wf < 0.5:
                continue
            z = (ev.matrix_world @ me.vertices[v.index].co).z
            if wp >= 0.5: pz = min(pz, z)
            else: fz = min(fz, z)
        ev.to_mesh_clear()
        for m, sv in saved:
            m.show_viewport = sv
        self.upd()
        return pz, fz


# ====================================================================== additions for the full pose set
def Rx(d): return Matrix.Rotation(math.radians(d), 3, 'X')
def Ry(d): return Matrix.Rotation(math.radians(d), 3, 'Y')
def Rz(d): return Matrix.Rotation(math.radians(d), 3, 'Z')

def _aim_dir(self, n, y_dir, ref_world, ref_rest, head=None):
    self.aim(n, self.head(n) if head is None else head, Vector(y_dir), Vector(ref_world), Vector(ref_rest))
Poser.aim_dir = _aim_dir

def _min_rot_to(self, n, y_dir, extra=None):
    """Rest shape of bone n rotated by the minimal rotation taking its rest Y onto y_dir."""
    y0 = self.rest[n].to_3x3().col[1]
    R = y0.rotation_difference(Vector(y_dir).normalized()).to_matrix()
    if extra is not None:
        R = extra @ R
    self.apply_rest_rotation(n, R)
Poser.min_rot_to = _min_rot_to

def _bone_axis(self, n, axis):
    M = self.pb[n].matrix.to_3x3()
    return M.col["xyz".index(axis)].normalized()
Poser.axis = _bone_axis


class Meas:
    """Mesh-based contact measurement on the armature-deformed meshes (no subdivision)."""
    HELPER = ("helper", "joint", "HelperGeometry", "JointCubes")

    def __init__(self, P, objs):
        self.P = P
        self.objs = objs          # dict: body, shoes, shirt, shorts, hair
        self._sel = {}

    def _groups(self, o):
        return {g.name: g.index for g in o.vertex_groups}

    def select(self, oname, bones, thresh=0.5):
        key = (oname, tuple(sorted(bones)), thresh)
        if key in self._sel:
            return self._sel[key]
        o = self.objs[oname]
        gi = self._groups(o)
        ids = {gi[b] for b in bones if b in gi}
        helper = {i for n, i in gi.items() if n.startswith(self.HELPER)}
        out = []
        for v in o.data.vertices:
            if helper and any(g.group in helper and g.weight > 0.5 for g in v.groups):
                continue
            if sum(g.weight for g in v.groups if g.group in ids) >= thresh:
                out.append(v.index)
        self._sel[key] = out
        return out

    def coords(self, oname):
        o = self.objs[oname]
        saved = [(m, m.show_viewport) for m in o.modifiers]
        for m, _ in saved:
            m.show_viewport = (m.type == 'ARMATURE')
        bpy.context.view_layer.update()
        dg = bpy.context.evaluated_depsgraph_get()
        ev = o.evaluated_get(dg); me = ev.to_mesh()
        co = [ev.matrix_world @ v.co for v in me.vertices]
        ev.to_mesh_clear()
        for m, sv in saved:
            m.show_viewport = sv
        bpy.context.view_layer.update()
        return co

    PARTS = {
        "hand":  [("body", ["hand", "index_01", "index_02", "index_03", "middle_01", "middle_02", "middle_03",
                            "ring_01", "ring_02", "ring_03", "pinky_01", "pinky_02", "pinky_03",
                            "thumb_01", "thumb_02", "thumb_03"])],
        "fore":  [("body", ["lowerarm"])],
        "uparm": [("body", ["upperarm"]), ("shirt", ["upperarm"])],
        "foot":  [("shoes", ["foot", "ball"])],
        "shin":  [("body", ["calf"])],
        "thigh": [("body", ["thigh"]), ("shorts", ["thigh"])],
        "pelvis": [("shorts", ["pelvis", "thigh_l", "thigh_r"]), ("body", ["pelvis"])],
        "torso": [("shirt", ["spine_01", "spine_02", "spine_03", "clavicle_l", "clavicle_r", "pelvis"]),
                  ("body", ["spine_01", "spine_02", "spine_03"])],
        "head":  [("body", ["head", "neck_01"]), ("hair", ["head"])],
    }

    def part_points(self, part, side=None, cache=None):
        cache = {} if cache is None else cache
        pts = []
        for oname, bones in self.PARTS[part]:
            if oname not in self.objs:
                continue
            bl = [(b if b.endswith(("_l", "_r")) or b in ("pelvis", "head", "neck_01") or b.startswith("spine") else f"{b}_{side}")
                  for b in bones] if side else bones
            if side is None:
                bl = [b2 for b in bones for b2 in ((b,) if b.endswith(("_l", "_r")) or b in ("pelvis", "head", "neck_01") or b.startswith("spine") else (f"{b}_l", f"{b}_r"))]
            if oname not in cache:
                cache[oname] = self.coords(oname)
            co = cache[oname]
            pts += [co[i] for i in self.select(oname, bl)]
        return pts

    def minz(self, parts):
        """parts: list like ['foot_l', 'hand_r', 'torso']  -> dict name -> min z"""
        cache = {}
        out = {}
        for p in parts:
            if p.endswith(("_l", "_r")):
                pts = self.part_points(p[:-2], p[-1], cache)
            else:
                pts = self.part_points(p, None, cache)
            out[p] = min((q.z for q in pts), default=9.0)
        return out

    def extreme(self, part, axis, sign):
        cache = {}
        pts = self.part_points(part[:-2], part[-1], cache) if part.endswith(("_l", "_r")) else self.part_points(part, None, cache)
        k = "xyz".index(axis)
        vals = [q[k] for q in pts]
        return (max(vals) if sign > 0 else min(vals)) if vals else None
