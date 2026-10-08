"""Cardio Burner pose library: 19 exercises x (start, exec) = 38 poses.

Conventions: metres, the athlete faces -Y, +X is his left, floor is z = 0.
Each exercise defines build(P, adj, phase) that poses the rig from scratch and returns a dict with
`planted` contacts {part: (axis, value)} that the solver drives to exactly touch (floor, bench, wall),
plus props and camera hints. The solver re-runs build with corrected offsets until every planted
part touches within a few millimetres (measured on the deformed meshes, shoes included).
"""
import math
from mathutils import Vector, Matrix
from posing import Rx, Ry, Rz, Meas

X = Vector((1, 0, 0)); Y = Vector((0, 1, 0)); Z = Vector((0, 0, 1))
SIDES = (("l", 1), ("r", -1))
BENCH_COL = (0.022, 0.022, 0.024)

# ---------------------------------------------------------------------- dimensions
class Dims:
    def __init__(self, P):
        self.L1 = P.length("thigh_l", "calf_l")
        self.L2 = P.length("calf_l", "foot_l")
        self.A1 = P.length("upperarm_l", "lowerarm_l")
        self.A2 = P.length("lowerarm_l", "hand_l")
        self.ARM = self.A1 + self.A2
        self.ANK = P.rest_head("foot_l").z
        self.BALL_Z = P.rest_head("ball_l").z
        fd = P.rest_head("ball_l") - P.rest_head("foot_l")
        self.FOOT_LEN = fd.length
        self.FOOT_DIR = fd.normalized()
        self.HIP_Z = P.rest_head("thigh_l").z
        self.HIP_W = P.rest_head("thigh_l").x
        self.SH_W = P.rest_head("upperarm_l").x
        self.SH_Z = P.rest_head("upperarm_l").z
        self.TORSO = ((P.rest_head("upperarm_l") + P.rest_head("upperarm_r")) / 2 -
                      (P.rest_head("thigh_l") + P.rest_head("thigh_r")) / 2).length

def V(*a):
    return Vector(a)

def reset(P):
    for pb in P.pb:
        pb.matrix_basis = Matrix.Identity(4)
    P.upd()

# ---------------------------------------------------------------------- core helpers
def hips(P):
    return (P.head("thigh_l") + P.head("thigh_r")) * 0.5

def shoulders(P):
    return (P.head("upperarm_l") + P.head("upperarm_r")) * 0.5

def set_pelvis(P, hip_center, R=None):
    """Pelvis = rest rotated by world rotation R; translated so the hip-joint centre lands on hip_center."""
    R = Matrix.Identity(3) if R is None else R
    P.apply_rest_rotation("pelvis", R, head=P.rest_head("pelvis"))
    P.translate_world("pelvis", Vector(hip_center) - hips(P))

def flex(P, n, deg):
    """Sagittal flexion of a spine/neck/head bone about its own lateral axis (+ = forward)."""
    if deg:
        P.rotate_world(n, P.axis(n, "x"), deg)

def twist(P, n, deg):
    """Rotation about the bone's long axis (+ = turn toward the athlete's left)."""
    if deg:
        P.rotate_world(n, P.axis(n, "y"), deg)

def side_bend(P, n, deg):
    if deg:
        P.rotate_world(n, P.axis(n, "z"), deg)

def spine(P, s1=0, s2=0, s3=0, neck=0, head=0):
    flex(P, "spine_01", s1); flex(P, "spine_02", s2); flex(P, "spine_03", s3)
    flex(P, "neck_01", neck); flex(P, "head", head)

def clav(P, s, up=0.0, fwd=0.0):
    sg = 1 if s == "l" else -1
    if up:
        P.rotate_world(f"clavicle_{s}", Y, -up * sg)
    if fwd:
        P.rotate_world(f"clavicle_{s}", Z, -fwd * sg)

# ---------------------------------------------------------------------- legs
def toe_dir(yaw):
    return V(math.sin(math.radians(yaw)), -math.cos(math.radians(yaw)), 0)

def foot_flat(P, D, s, ax, ay, yaw, dz=0.0, pole=None, pole_up=0.15):
    """Flat foot: ankle at (ax, ay), toes along yaw (deg, + turns toes toward +X)."""
    t = toe_dir(yaw)
    P.leg(s, (ax, ay, D.ANK + dz), pole if pole is not None else t + V(0, 0, pole_up))
    P.foot_flat(s, yaw)

def foot_toes(P, D, s, bx, by, yaw, lift, dz=0.0, bend=38.0, pole=None):
    """Heel raised `lift` deg; ball (MTP joint) at (bx, by). Toes bend at most `bend` deg (shoe stiffness)."""
    Rf = Rz(yaw) @ Rx(lift)
    B = V(bx, by, D.BALL_Z + dz)
    A = B - (Rf @ D.FOOT_DIR) * D.FOOT_LEN
    P.leg(s, A, pole if pole is not None else toe_dir(yaw) + V(0, 0, 0.1))
    P.apply_rest_rotation(f"foot_{s}", Rf)
    P.apply_rest_rotation(f"ball_{s}", Rz(yaw) @ Rx(max(0.0, lift - bend)))
    return A

def kneel(P, D, s, kx, kz, shin_dir, knee_behind=True, foot="sole_up", dz=0.0, toe_lift=80.0):
    """Knee joint at height kz (on the floor) under/behind the hip; shin along shin_dir.
    foot: 'sole_up' (tops of feet on the floor) or 'tucked' (toes tucked under)."""
    H = P.head(f"thigh_{s}")
    dx, dzz = kx - H.x, (kz + dz) - H.z
    r2 = D.L1 ** 2 - dx * dx - dzz * dzz
    if r2 < 0:
        print(f"WARN kneel {s}: hip too high for knee on floor ({r2:.4f})")
        r2 = 0.0
    ky = H.y + (1 if knee_behind else -1) * math.sqrt(r2)
    K = V(kx, ky, kz + dz)
    sd = Vector(shin_dir).normalized()
    A = K + sd * D.L2
    pole = K - (H + A) * 0.5
    P.leg(s, A, pole)
    if foot == "sole_up":
        fdir = (sd + V(0, 0, -0.45)).normalized()
        P.aim_dir(f"foot_{s}", fdir, V(0, 0, -1), V(0, 0, 1))
        P.aim_dir(f"ball_{s}", (sd + V(0, 0, -0.2)).normalized(), V(0, 0, -1), V(0, 0, 1))
    else:   # toes tucked: foot points down to the floor, toes bent forward
        back = V(sd.x, sd.y, 0).normalized()
        yaw = math.degrees(math.atan2(-back.x, back.y)) * -1
        fd = (V(0, 0, -1) - back * 0.25).normalized()
        P.aim_dir(f"foot_{s}", fd, -back, V(0, 0, 1))
        P.aim_dir(f"ball_{s}", (-back + V(0, 0, -0.35)).normalized(), V(0, 0, 1), V(0, 0, 1))
    return K, A

def soleup_geom(D, kx, ky, kz, ankle_z, ax=None):
    """Knee on the floor at (kx, ky, kz); shin runs back (+Y) to the ankle at height ankle_z (tops of feet down)."""
    ax = kx if ax is None else ax
    dz, dx = ankle_z - kz, ax - kx
    return V(kx, ky, kz), V(ax, ky + math.sqrt(max(D.L2 ** 2 - dz * dz - dx * dx, 1e-6)), ankle_z)

def tucked_geom(D, bx, by, kx, kz, lift=64.0, dzb=0.0):
    """Toes tucked: ball of the foot at (bx, by) on the floor, heel up `lift` deg; knee on the floor in front."""
    B = V(bx, by, D.BALL_Z + dzb)
    A = B - (Rx(lift) @ D.FOOT_DIR) * D.FOOT_LEN
    r2 = D.L2 ** 2 - (A.x - kx) ** 2 - (A.z - kz) ** 2
    return V(kx, A.y - math.sqrt(max(r2, 1e-6)), kz), A

def place_kneel_leg(P, s, K, A, foot="sole_up", lift=64.0, bend=50.0):
    H = P.head(f"thigh_{s}")
    P.leg(s, A, K - (H + A) * 0.5)
    if foot == "sole_up":
        sd = (A - K).normalized()
        fd = V(sd.x, sd.y, 0.06).normalized()
        P.aim_dir(f"foot_{s}", fd, V(0, 0, -1), V(0, 0, 1))
        P.aim_dir(f"ball_{s}", V(sd.x, sd.y, 0.02).normalized(), V(0, 0, -1), V(0, 0, 1))
    else:
        P.apply_rest_rotation(f"foot_{s}", Rx(lift))
        P.apply_rest_rotation(f"ball_{s}", Rx(max(0.0, lift - bend)))

def prone_legs(P, D, adj, point=0.06):
    """Lying face down: legs long, knees soft toward the floor, tops of the feet on the floor."""
    for s, sg in SIDES:
        H = P.head(f"thigh_{s}")
        az = 0.085 + adj.get(f"foot_{s}", 0)
        L = (D.L1 + D.L2) * 0.985
        dz = H.z - az
        A = V(H.x + 0.03 * sg, H.y + math.sqrt(max(L * L - dz * dz, 1e-6)), az)
        P.leg(s, A, V(0, 0, -1))
        P.aim_dir(f"foot_{s}", V(0.03 * sg, 1, point).normalized(), V(0, 0, -1), V(0, 0, 1))
        P.aim_dir(f"ball_{s}", V(0.03 * sg, 1, 0.02).normalized(), V(0, 0, -1), V(0, 0, 1))

# ---------------------------------------------------------------------- arms / hands
def arm_to(P, s, wrist, pole, fdir, palm, roll=0.75):
    return P.arm(s, Vector(wrist), Vector(pole), Vector(fdir), Vector(palm), forearm_roll_follow=roll)

def arm_dir(P, D, s, d, k=0.97, pole=None, fdir=None, palm=None, roll=0.75):
    d = Vector(d).normalized()
    S = P.head(f"upperarm_{s}")
    sg = 1 if s == "l" else -1
    return arm_to(P, s, S + d * D.ARM * k, pole if pole is not None else V(0.3 * sg, 0.6, -1),
                  fdir if fdir is not None else d, palm if palm is not None else V(-sg, 0, 0), roll)

def hands_relaxed(P, s, gather=0.5):
    """Keep the rest-pose relaxed finger curl (natural hanging hand)."""
    pass

def hand_flat_fingers(P, s, palm, fdir, curl=0.0, gather=0.35, thumb=True):
    P.fingers(s, flat_normal=Vector(palm), curl_deg={"index": curl, "middle": curl, "ring": curl, "pinky": curl,
              "thumb": 2 + curl * 0.5}, gather=gather, gather_dir=Vector(fdir), thumb_flat=thumb)

def hand_soft(P, s, palm, fdir, base=8):
    P.fingers(s, flat_normal=Vector(palm), curl_deg={"index": base, "middle": base + 3, "ring": base + 6,
              "pinky": base + 9, "thumb": 6}, gather=0.7, gather_dir=Vector(fdir), thumb_flat=True)

def hand_grip(P, s, palm, fdir, curl=75):
    P.fingers(s, flat_normal=Vector(palm), curl_deg={"index": curl, "middle": curl + 3, "ring": curl + 5,
              "pinky": curl + 8, "thumb": 35}, gather=0.8, gather_dir=Vector(fdir), thumb_flat=True)

def plant_hand(P, D, s, wrist, out_deg=12, pole=None, fwd=None, roll=0.7, palm=V(0, 0, -1), curl=0.0):
    """Palm flat on a horizontal surface, fingers along fwd (default -Y) turned out by out_deg."""
    sg = 1 if s == "l" else -1
    f = Vector(fwd) if fwd is not None else V(0, -1, 0)
    fd = (Rz(out_deg * sg) @ f).normalized() if True else f
    arm_to(P, s, wrist, pole if pole is not None else V(0.45 * sg, 1.0, 0.0), fd, palm, roll)
    hand_flat_fingers(P, s, palm, fd, curl=curl)
    return fd

def arms_hanging(P, D, k=0.965, out=0.10, fwd=-0.02, back_l=0.0, back_r=0.0):
    for s, sg in SIDES:
        bk = back_l if s == "l" else back_r
        d = V(out * sg, fwd + bk, -1)
        arm_dir(P, D, s, d, k=k, pole=V(0.25 * sg, 1.0, 0.1), fdir=V(0.05 * sg, -0.12, -1), palm=V(-sg, 0.15, 0))

# ---------------------------------------------------------------------- props
def box(name, center, size, color=BENCH_COL):
    return {"type": "box", "name": name, "center": tuple(center), "size": tuple(size), "color": color}

def dumbbell(name, center, axis, color=(0.03, 0.03, 0.035)):
    return {"type": "dumbbell", "name": name, "center": tuple(center), "axis": tuple(axis), "color": color}

# ====================================================================== exercises
# Each build returns {"planted": {...}, "props": [...]} ; adj holds solver offsets keyed by planted part.

def standing_base(P, D, adj, feet_x=0.13, toe_out=8, hip_drop=0.012, pitch=0.0, feet_y=-0.01):
    set_pelvis(P, V(0, feet_y + 0.01, D.HIP_Z - hip_drop + adj.get("_lift", 0)), Rx(pitch))
    for s, sg in SIDES:
        foot_flat(P, D, s, feet_x * sg, feet_y, toe_out * sg, dz=adj.get(f"foot_{s}", 0))

def b_stand(P, D, adj, phase):
    standing_base(P, D, adj)
    spine(P, 0, 0, 0, -2, 0)
    arms_hanging(P, D)
    return {"planted": {"foot_l": ("z", 0.0), "foot_r": ("z", 0.0)}}

# ---------------- squats
def b_squats(P, D, adj, phase):
    yaw, ax, ay = 17.0, 0.20, -0.02
    if phase == "start":
        set_pelvis(P, V(0, 0.0, D.HIP_Z - 0.03))
        for s, sg in SIDES:
            foot_flat(P, D, s, ax * sg, ay, yaw * sg, dz=adj.get(f"foot_{s}", 0), pole_up=0.3)
        spine(P, 0, 0, 0, -2, 0)
        arms_hanging(P, D, out=0.16)
    else:
        set_pelvis(P, V(0, 0.13, 0.475 + adj.get("_lift", 0)), Rx(28))
        spine(P, 5, 4, 3, -16, -14)
        for s, sg in SIDES:
            foot_flat(P, D, s, ax * sg, ay, yaw * sg, dz=adj.get(f"foot_{s}", 0))
        for s, sg in SIDES:
            clav(P, s, up=10)
            d = V(-0.06 * sg, -1.0, -0.04)
            pn = V(-0.25 * sg, 0, -1.0).normalized()
            arm_dir(P, D, s, d, k=0.975, pole=V(0.5 * sg, 0.0, -1.0), fdir=d, palm=pn, roll=0.8)
            hand_soft(P, s, pn, d, base=6)
    return {"planted": {"foot_l": ("z", 0.0), "foot_r": ("z", 0.0)}}

# ---------------- straight-arm plank family (push-ups start, planks start, burpees exec)
def _plank_body(P, D, adj, theta, toe_dz, ankle_pf=4.0):
    set_pelvis(P, V(0, 0.15, 0.6), Rx(theta))
    for s, sg in SIDES:
        P.rotate_world(f"foot_{s}", X, ankle_pf)
        # toes: partly bent (a shoe can't fold flat)
        fdir = P.axis(f"foot_{s}", "y")
        P.min_rot_to(f"ball_{s}", (fdir + V(0, -1.6, 0)).normalized())
    # ground: toe tips at the floor (+ solver offset)
    tz = min(P.tail("ball_l").z, P.tail("ball_r").z)
    P.translate_world("pelvis", (0, 0, 0.022 + toe_dz - tz))

def _solve_theta(P, D, adj, target_sh_z, toe_dz):
    lo, hi = 40.0, 92.0
    for _ in range(26):
        mid = (lo + hi) / 2
        reset(P); _plank_body(P, D, adj, mid, toe_dz)
        if shoulders(P).z > target_sh_z:
            lo = mid
        else:
            hi = mid
    th = (lo + hi) / 2
    reset(P); _plank_body(P, D, adj, th, toe_dz)
    return th

def _plank_high(P, D, adj, reach=0.985):
    wh = 0.032 + adj.get("hand_l", 0) * 0.5 + adj.get("hand_r", 0) * 0.5
    th = _solve_theta(P, D, adj, D.ARM * reach + wh, adj.get("foot_l", 0) * 0.5 + adj.get("foot_r", 0) * 0.5)
    spine(P, 0, 0, 0, -6, -8)
    W = {}
    for s, sg in SIDES:
        S = P.head(f"upperarm_{s}")
        W[s] = V(S.x + 0.03 * sg, S.y - 0.01, wh)
        plant_hand(P, D, s, W[s], out_deg=12)
    return th, W

def b_plank_high(P, D, adj, phase):
    _plank_high(P, D, adj)
    return {"planted": {"hand_l": ("z", 0.0), "hand_r": ("z", 0.0), "foot_l": ("z", 0.0), "foot_r": ("z", 0.0)},
            "joint": ["hand", "foot"]}

def b_pushups(P, D, adj, phase):
    if phase == "start":
        return b_plank_high(P, D, adj, phase)
    # bottom: same hands & toes as the top, chest ~7 cm off the floor, elbows ~45 deg
    th0, W = _plank_high(P, D, {k: v for k, v in adj.items() if k.startswith(("hand", "foot"))})
    toe_dz = adj.get("foot_l", 0) * 0.5 + adj.get("foot_r", 0) * 0.5
    target = 0.20
    lo, hi = 70.0, 95.0
    for _ in range(24):
        mid = (lo + hi) / 2
        reset(P); _plank_body(P, D, adj, mid, toe_dz)
        if shoulders(P).z > target:
            lo = mid
        else:
            hi = mid
    reset(P); _plank_body(P, D, adj, (lo + hi) / 2, toe_dz)
    spine(P, 0, 0, 0, -14, -8)
    for s, sg in SIDES:
        clav(P, s, up=-6, fwd=-4)
        fd = (Rz(12 * sg) @ V(0, -1, 0)).normalized()
        arm_to(P, s, W[s], V(0.55 * sg, 0.8, 0.35), fd, V(0, 0, -1), roll=0.6)
        hand_flat_fingers(P, s, V(0, 0, -1), fd)
    return {"planted": {"hand_l": ("z", 0.0), "hand_r": ("z", 0.0), "foot_l": ("z", 0.0), "foot_r": ("z", 0.0)},
            }

# ---------------- planks
def b_planks(P, D, adj, phase):
    if phase == "start":
        return b_plank_high(P, D, adj, phase)
    # forearm plank: elbows under shoulders, forearms flat, body straight, same toes as high plank
    toe_dz = adj.get("foot_l", 0) * 0.5 + adj.get("foot_r", 0) * 0.5
    eh = 0.05 + adj.get("fore_l", 0) * 0.5 + adj.get("fore_r", 0) * 0.5
    th = _solve_theta(P, D, adj, D.A1 * 0.995 + eh, toe_dz)
    spine(P, 0, 0, 0, -16, -8)
    for s, sg in SIDES:
        clav(P, s, up=-6)
    for s, sg in SIDES:
        S = P.head(f"upperarm_{s}")
        E = V(S.x, S.y, eh)
        fd = (Rz(-12 * sg) @ V(0, -1, 0)).normalized()     # forearms angle slightly inward
        Wt = E + fd * D.A2 * 0.99
        Wt.z = 0.035 + adj.get(f"hand_{s}", 0)
        arm_to(P, s, Wt, V(0, 0.4, -1), fd, V(0, 0, -1), roll=0.6)
        hand_flat_fingers(P, s, V(0, 0, -1), fd, curl=4)
    return {"planted": {"fore_l": ("z", 0.0), "fore_r": ("z", 0.0), "foot_l": ("z", 0.0), "foot_r": ("z", 0.0),
                        "hand_l": ("z", 0.0), "hand_r": ("z", 0.0)}}

# ---------------- burpees
def b_burpees(P, D, adj, phase):
    if phase == "exec":
        return b_plank_high(P, D, adj, phase)
    # athletic ready stance: soft knees, hips back a touch, arms ready in front
    set_pelvis(P, V(0, 0.05, D.HIP_Z - 0.07 + adj.get("_lift", 0)), Rx(14))
    spine(P, 2, 2, 0, -8, -4)
    for s, sg in SIDES:
        foot_flat(P, D, s, 0.15 * sg, -0.02, 10 * sg, dz=adj.get(f"foot_{s}", 0), pole_up=0.2)
    for s, sg in SIDES:
        d = V(0.12 * sg, -0.45, -1)
        arm_dir(P, D, s, d, k=0.86, pole=V(0.3 * sg, 1, -0.3), fdir=V(0.1 * sg, -0.6, -1), palm=V(-sg, 0.2, 0))
        hand_soft(P, s, V(-sg, 0.3, 0), V(0, -0.5, -1), base=14)
    return {"planted": {"foot_l": ("z", 0.0), "foot_r": ("z", 0.0)}}

# ---------------- jogging
def b_jogging(P, D, adj, phase):
    if phase == "start":
        # mid-stance on the left foot, right leg trailing back, right arm forward
        set_pelvis(P, V(0.0, 0.03, D.HIP_Z - 0.035 + adj.get("_lift", 0)), Rx(8))
        spine(P, 2, 1, 0, -6, -4)
        foot_flat(P, D, "l", 0.11, -0.03, 4, dz=adj.get("foot_l", 0), pole_up=0.2)
        # trailing leg: knee behind, heel kicked up
        H = P.head("thigh_r")
        K = H + (V(-0.01, 0.22, -1).normalized()) * D.L1
        A = K + V(0, 0.75, -0.66).normalized() * D.L2 + V(0, 0, adj.get("clr_foot_r", 0))
        P.leg("r", A, V(0, -1, -0.3))
        P.aim_dir("foot_r", V(0, -0.2, -1).normalized(), V(0, -1, 0.2), V(0, 0, 1))
        P.apply_rest_rotation("ball_r", P.pb["foot_r"].matrix.to_3x3() @ P.rest["foot_r"].to_3x3().inverted())
        fwd_s, back_s = "r", "l"
    else:
        # flight-to-drive: right knee driven up, left foot pushing off behind on the forefoot
        set_pelvis(P, V(0.0, -0.12, D.HIP_Z - 0.02 + adj.get("_lift", 0)), Rx(10))
        spine(P, 3, 1, 0, -6, -6)
        foot_toes(P, D, "l", 0.11, 0.17, 4, lift=38, dz=adj.get("foot_l", 0), bend=28, pole=V(0, -1, 0.1))
        H = P.head("thigh_r")
        K = H + V(-0.02, -0.9, -0.45).normalized() * D.L1
        A = K + V(0, 0.18, -1).normalized() * D.L2
        P.leg("r", A, V(0, -1, 0.3))
        P.aim_dir("foot_r", V(0, -1, -0.15).normalized(), V(0, -0.2, 1), V(0, 0, 1))
        P.apply_rest_rotation("ball_r", P.pb["foot_r"].matrix.to_3x3() @ P.rest["foot_r"].to_3x3().inverted())
        fwd_s, back_s = "l", "r"
    # running arms: elbows ~90 deg, forward arm hand at chest height, back arm hand by the hip
    for s, sg in SIDES:
        S = P.head(f"upperarm_{s}")
        if s == fwd_s:
            E = S + V(0.06 * sg, -0.45, -0.89).normalized() * D.A1
            Wt = E + V(-0.12 * sg, -0.87, 0.48).normalized() * D.A2 * 0.97
            pole = V(0.1 * sg, 1, -0.8)
        else:
            E = S + V(0.07 * sg, 0.62, -0.78).normalized() * D.A1
            Wt = E + V(-0.06 * sg, -0.78, -0.62).normalized() * D.A2 * 0.97
            pole = V(0.1 * sg, 1, 0.6)
        palm = V(-sg, 0.0, 0.1)
        fd = (Wt - E).normalized()
        arm_to(P, s, Wt, pole, fd, palm, roll=0.8)
        hand_grip(P, s, palm, fd, curl=48)
    planted = {"foot_l": ("z", 0.0)}
    return {"planted": planted, "clear": {"foot_r": 0.03} if phase == "start" else {}}

# ---------------- dips (bench behind)
BENCH_TOP = 0.46
def b_dips(P, D, adj, phase):
    edge_y = 0.17                       # front edge of the bench (athlete in front of it, facing -Y)
    bench = box("bench", (0, edge_y + 0.21, BENCH_TOP / 2), (1.15, 0.42, BENCH_TOP))
    wh = 0.034 + adj.get("hand_l", 0) * 0.5 + adj.get("hand_r", 0) * 0.5
    W = {s: V(0.20 * sg, edge_y + 0.085, BENCH_TOP + wh) for s, sg in SIDES}
    drop = 0.0 if phase == "start" else 0.215
    S_t = V(0, edge_y + 0.04 + (0.0 if phase == "start" else 0.03), BENCH_TOP + wh + D.ARM * 0.985 - drop)
    hy = edge_y - 0.115 - adj.get("clr_pelvis", 0)
    dy = S_t.y - hy
    H = V(0, hy, S_t.z - math.sqrt(max(D.TORSO ** 2 - dy * dy, 0.01)))
    a = -math.degrees(math.asin(dy / D.TORSO))
    set_pelvis(P, H, Rx(a))
    spine(P, 3, 4, 4, 12, 6)
    sh = shoulders(P)
    P.translate_world("pelvis", V(0, 0, S_t.z - sh.z))
    for s, sg in SIDES:
        clav(P, s, up=4 if phase == "start" else 10)
    hy = hips(P).y
    for s, sg in SIDES:
        foot_flat(P, D, s, 0.15 * sg, hy - 0.58, 6 * sg, dz=adj.get(f"foot_{s}", 0), pole_up=0.6)
    for s, sg in SIDES:
        pole = V(0.12 * sg, 1.0, 0.1) if phase == "exec" else V(0.3 * sg, 1.0, 0.0)
        fd = (Rz(6 * sg) @ V(0, -1, 0)).normalized()
        arm_to(P, s, W[s], pole, fd, V(0, 0, -1), roll=0.55)
        hand_flat_fingers(P, s, V(0, 0, -1), fd, curl=6)
    return {"planted": {"hand_l": ("z", BENCH_TOP), "hand_r": ("z", BENCH_TOP),
                        "foot_l": ("z", 0.0), "foot_r": ("z", 0.0)},
            "props": [bench], "clear_y": {"pelvis": edge_y - 0.012}}

# ---------------- lunges
def b_lunges(P, D, adj, phase):
    if phase == "start":
        set_pelvis(P, V(0, 0.0, D.HIP_Z - 0.012 + adj.get("_lift", 0)))
        for s, sg in SIDES:
            foot_flat(P, D, s, 0.12 * sg, -0.01, 7 * sg, dz=adj.get(f"foot_{s}", 0))
        spine(P, 0, 0, 0, -2, 0)
        arms_hanging(P, D)
        return {"planted": {"foot_l": ("z", 0.0), "foot_r": ("z", 0.0)}}
    # left foot forward, back (right) knee hovering ~6 cm above the floor
    fy = -0.42
    Kf = V(0.13, fy + 0.02, D.ANK + D.L2)
    hip_l = Kf + V(-0.02, D.L1 * 0.99, 0.02)
    hc = hip_l - V(D.HIP_W, 0, 0)
    set_pelvis(P, hc + V(0, 0, adj.get("_lift", 0)), Rx(4))
    spine(P, -2, -1, 0, -2, 0)
    foot_flat(P, D, "l", 0.13, fy, 6, dz=adj.get("foot_l", 0), pole=V(0.05, -1, 0.1))
    # back leg: knee below the hip, shin back to the forefoot
    H = P.head("thigh_r")
    K = H + V(0.0, 0.32, -1).normalized() * D.L1
    A = K + V(0, 1.0, 0.0).normalized() * D.L2
    B = A + V(0, -0.15, -1).normalized() * D.FOOT_LEN
    foot_toes(P, D, "r", -0.12, B.y, -2, lift=62, dz=adj.get("foot_r", 0), bend=36, pole=V(0, -0.4, -1))
    for s, sg in SIDES:
        bk = 0.25 if s == "l" else -0.25
        d = V(0.1 * sg, -0.02 + bk, -1)
        arm_dir(P, D, s, d, k=0.965, pole=V(0.25 * sg, 1.0, 0.1), fdir=V(0.05 * sg, bk * 0.5, -1), palm=V(-sg, 0.15, 0))
    return {"planted": {"foot_l": ("z", 0.0), "foot_r": ("z", 0.0)}, "clear": {"shin_r": 0.04}}

# ---------------- sit-ups (on the floor)
def _supine(P, D, adj, curl, hip_y=0.0):
    """Lying on the back, head toward +Y. curl = trunk lift in degrees (0 = flat)."""
    base_z = 0.115 + adj.get("pelvis", 0)
    set_pelvis(P, V(0, hip_y, base_z), Rx(-90 + curl * 0.35))
    spine(P, curl * 0.22, curl * 0.22, curl * 0.21, 4 + curl * 0.15, 2)

def _hands_behind_head(P, D, adj):
    hb = P.pb["head"].matrix.to_3x3()
    up = hb.col[1].normalized()                               # crown direction
    face = hb.col[2].normalized()                             # toward the face
    hc = P.head("head") + up * 0.085 - face * 0.01            # head centre
    for s, sg in SIDES:
        lat = hb.col[0].normalized() * sg
        Wt = hc + lat * 0.105 - up * 0.045 + face * 0.0 + V(0, 0, adj.get(f"clr_hand_{s}", 0))
        palm = -lat
        fd = (up * 0.55 - face * 0.6).normalized()           # fingertips toward the back of the skull
        arm_to(P, s, Wt, lat + V(0, 0, 0.15), fd, palm, roll=0.7)
        hand_soft(P, s, palm, fd, base=14)

def b_situps(P, D, adj, phase):
    curl = 0 if phase == "start" else 58
    _supine(P, D, adj, curl)
    hy = hips(P).y
    for s, sg in SIDES:
        foot_flat(P, D, s, 0.14 * sg, hy - 0.50, 5 * sg, dz=adj.get(f"foot_{s}", 0), pole=V(0.12 * sg, -0.3, 1))
    _hands_behind_head(P, D, adj)
    return {"planted": {"pelvis": ("z", 0.0), "foot_l": ("z", 0.0), "foot_r": ("z", 0.0)},
            "clear": {"hand_l": 0.004, "hand_r": 0.004}}

# ---------------- skull crushers (on a flat bench)
def b_skull(P, D, adj, phase):
    top = BENCH_TOP
    bench = box("bench", (0, 0.30, top / 2), (0.32, 1.25, top))
    base_z = top + 0.115 + adj.get("torso", 0)
    set_pelvis(P, V(0, -0.12, base_z), Rx(-90))
    spine(P, 0, 0, 0, 4, 0)
    hy = hips(P).y
    for s, sg in SIDES:
        foot_flat(P, D, s, 0.30 * sg, hy - 0.52, 12 * sg, dz=adj.get(f"foot_{s}", 0), pole=V(0.4 * sg, -0.2, 1))
    props = [bench]
    for s, sg in SIDES:
        S = P.head(f"upperarm_{s}")
        if phase == "start":
            Wt = S + V(-0.04 * sg, 0.06, 1).normalized() * D.ARM * 0.97
            E_pole = V(0.3 * sg, 0.2, 0)
        else:
            E = S + V(-0.03 * sg, 0.30, 1).normalized() * D.A1
            Wt = E + V(0.0, 0.92, -0.38).normalized() * D.A2 * 0.97
            E_pole = V(0.1 * sg, -0.3, 1)
        palm = V(-sg, 0, 0)                     # neutral grip, palms facing each other
        fd = V(0, -1, 0.0) if phase == "start" else V(0, -0.3, 1).normalized()
        if phase == "start":
            fd = V(0, -0.15, 1).normalized()
        arm_to(P, s, Wt, E_pole, fd, palm, roll=0.75)
        hand_grip(P, s, palm, fd, curl=78)
        hm = P.pb[f"hand_{s}"].matrix
        hd = (P.head(f"middle_01_{s}") - P.head(f"hand_{s}")).normalized()
        grip = P.head(f"hand_{s}") + hd * 0.075 + palm * 0.028
        axis = hd.cross(palm).normalized()
        props.append(dumbbell(f"db_{s}", grip, axis))
    return {"planted": {"torso": ("z", top), "foot_l": ("z", 0.0), "foot_r": ("z", 0.0)}, "props": props}

# ---------------- downward dog (tabletop -> inverted V)
def _tabletop(P, D, adj):
    kz = 0.06 + adj.get("shin_l", 0) * 0.5 + adj.get("shin_r", 0) * 0.5
    wh = 0.032 + adj.get("hand_l", 0) * 0.5 + adj.get("hand_r", 0) * 0.5
    GK = {}
    for s, sg in SIDES:
        GK[s] = tucked_geom(D, 0.10 * sg, 0.62, 0.11 * sg, kz, lift=64, dzb=adj.get(f"foot_{s}", 0))
    Kc = (GK["l"][0] + GK["r"][0]) / 2
    hip = V(0, Kc.y + 0.02, kz + D.L1 * 0.995)
    sh_z = wh + D.ARM * 0.985
    ang = math.degrees(math.asin(max(-1, min(1, (sh_z - hip.z) / D.TORSO))))
    set_pelvis(P, hip, Rx(90 - ang))
    spine(P, 0, 0, 0, -8, -10)
    for s, sg in SIDES:
        place_kneel_leg(P, s, GK[s][0], GK[s][1], foot="tucked", lift=64, bend=50)
    W, B = {}, {}
    for s, sg in SIDES:
        S = P.head(f"upperarm_{s}")
        W[s] = V(S.x + 0.03 * sg, S.y, wh)
        plant_hand(P, D, s, W[s], out_deg=10)
        B[s] = P.head(f"ball_{s}")
    return W, B

def b_downdog(P, D, adj, phase):
    if phase == "start":
        _tabletop(P, D, adj)
        return {"planted": {"hand_l": ("z", 0.0), "hand_r": ("z", 0.0), "shin_l": ("z", 0.0), "shin_r": ("z", 0.0),
                            "foot_l": ("z", 0.0), "foot_r": ("z", 0.0)}}
    W, B = _tabletop(P, D, {k: v for k, v in adj.items() if k.startswith(("hand", "shin"))})
    B = {s: V(B[s].x, B[s].y, D.BALL_Z) for s, _ in SIDES}
    wh = W["l"].z
    lift = 28.0
    # hip height h: torso + straight arms aimed at the hands; legs reach the same toe spots
    Wc = (W["l"] + W["r"]) / 2
    Bc = (B["l"] + B["r"]) / 2

    def place(h):
        reset(P)
        # hip y from leg length (knees slightly soft)
        Rf = Rx(lift)
        A = Bc - (Rf @ D.FOOT_DIR) * D.FOOT_LEN + V(0, 0, adj.get("foot_l", 0) * 0.5 + adj.get("foot_r", 0) * 0.5)
        leg = (D.L1 + D.L2) * 0.975
        dzz = h - A.z
        hy = A.y - math.sqrt(max(leg * leg - dzz * dzz, 0.0))
        H = V(0, hy, h)
        tdir = (Wc - H)
        pitch = 180 - math.degrees(math.atan2(-tdir.y, tdir.z)) * -1
        # torso up (+Z rest) must point from hips toward the hands: rotation about X
        a = math.atan2(-tdir.y, tdir.z)
        set_pelvis(P, H, Rx(math.degrees(a)))
        return H

    lo, hi = 0.7, 1.3
    for _ in range(26):
        h = (lo + hi) / 2
        place(h)
        d = (shoulders(P) - Wc).length
        if d > D.ARM * 0.985:
            hi = h
        else:
            lo = h
    place((lo + hi) / 2)
    spine(P, -4, -3, -2, 8, 8)
    # shoulders pushed toward the hands (in line with arms): slight correction then arms
    for s, sg in SIDES:
        foot_toes(P, D, s, B[s].x, B[s].y, 0, lift=lift, dz=adj.get(f"foot_{s}", 0), bend=0, pole=V(0, -1, -0.05))
    for s, sg in SIDES:
        fd = (Rz(10 * sg) @ V(0, -1, 0)).normalized()
        arm_to(P, s, W[s], V(0.5 * sg, 0.6, -0.6), fd, V(0, 0, -1), roll=0.7)
        hand_flat_fingers(P, s, V(0, 0, -1), fd)
    return {"planted": {"hand_l": ("z", 0.0), "hand_r": ("z", 0.0), "foot_l": ("z", 0.0), "foot_r": ("z", 0.0)}}

# ---------------- warrior II (stance along X, torso faces the camera side -Y)
def b_warrior(P, D, adj, phase):
    fx, bx = 0.62, -0.62
    if phase == "start":
        set_pelvis(P, V(0, 0.0, D.HIP_Z - 0.06 + adj.get("_lift", 0)))
        foot_flat(P, D, "l", fx * 0.62, 0.0, 30, dz=adj.get("foot_l", 0), pole=V(0.4, -1, 0))
        foot_flat(P, D, "r", bx * 0.62, 0.0, -8, dz=adj.get("foot_r", 0), pole=V(-0.4, -1, 0))
        spine(P, 0, 0, 0, -2, 0)
        head_turn = 0
    else:
        Kf = V(fx, 0.0, D.ANK + D.L2 * 0.995)
        hipL = Kf + V(-D.L1 * 0.97, 0.0, 0.03)
        hc = hipL - V(D.HIP_W, 0, 0)
        set_pelvis(P, hc + V(0, 0, adj.get("_lift", 0)))
        foot_flat(P, D, "l", fx, 0.02, 88, dz=adj.get("foot_l", 0), pole=V(0.0, -0.25, 1).normalized() * 0 + V(1, -0.35, 0))
        foot_flat(P, D, "r", bx - 0.12, 0.02, 12, dz=adj.get("foot_r", 0), pole=V(-0.3, -1, 0))
        spine(P, 0, -1, -1, -2, 0)
        head_turn = 72
    twist(P, "neck_01", head_turn * 0.5); twist(P, "head", head_turn * 0.5)
    for s, sg in SIDES:
        d = V(sg, 0.0, 0.0 if phase == "exec" else -0.06)
        clav(P, s, up=2)
        arm_dir(P, D, s, d, k=0.985, pole=V(0, 0.3, -1), fdir=d, palm=V(0, 0.05, -1), roll=0.8)
        hand_soft(P, s, V(0, 0.05, -1), d, base=5)
    return {"planted": {"foot_l": ("z", 0.0), "foot_r": ("z", 0.0)}}

# ---------------- kneeling family (child's pose, hip flexor)
def _kneel_geo(D, adj, knee_x, ky=0.0, ax=None):
    kz = 0.06 + adj.get("shin_l", 0) * 0.5 + adj.get("shin_r", 0) * 0.5
    G = {}
    for s, sg in SIDES:
        G[s] = soleup_geom(D, knee_x * sg, ky, kz, 0.09 + adj.get(f"foot_{s}", 0), None if ax is None else ax * sg)
    return kz, G

def _kneel_tall(P, D, adj, knee_x=0.11):
    kz, G = _kneel_geo(D, adj, knee_x)
    set_pelvis(P, V(0, -0.01, kz + D.L1 * 0.99), Rx(-2))
    spine(P, 0, 0, 0, -2, 0)
    for s, sg in SIDES:
        place_kneel_leg(P, s, G[s][0], G[s][1])
    arms_hanging(P, D, out=0.12)
    return G

KNEEL_PLANT = {"shin_l": ("z", 0.0), "shin_r": ("z", 0.0), "foot_l": ("z", 0.0), "foot_r": ("z", 0.0)}

def b_childs(P, D, adj, phase):
    planted = dict(KNEEL_PLANT)
    if phase == "start":
        _kneel_tall(P, D, adj, knee_x=0.11)
        return {"planted": planted}
    # hips back toward the heels, knees apart, torso folded, forehead down, arms long on the floor
    kz, G = _kneel_geo(D, adj, 0.20, ax=0.09)
    hip_z = 0.34
    K = (G["l"][0] + G["r"][0]) / 2
    dx = 0.20 - D.HIP_W
    hy = K.y + math.sqrt(max(D.L1 ** 2 - (hip_z - kz) ** 2 - dx * dx, 0))
    pitch = 104 - adj.get("head", 0) * 75
    set_pelvis(P, V(0, hy, hip_z), Rx(pitch))
    spine(P, 8, 8, 6, 8, 6)
    for s, sg in SIDES:
        place_kneel_leg(P, s, G[s][0], G[s][1])
    wh = 0.03 + adj.get("hand_l", 0) * 0.5 + adj.get("hand_r", 0) * 0.5
    for s, sg in SIDES:
        S = P.head(f"upperarm_{s}")
        reach = math.sqrt(max((D.ARM * 0.99) ** 2 - (S.z - wh) ** 2, 0.0))
        Wt = V(S.x + 0.03 * sg, S.y - reach, wh)
        plant_hand(P, D, s, Wt, out_deg=4, pole=V(0.4 * sg, 0.0, 1.0))
    planted.update({"hand_l": ("z", 0.0), "hand_r": ("z", 0.0), "head": ("z", 0.0)})
    return {"planted": planted, "clear": {"fore_l": 0.0, "fore_r": 0.0}}

def b_hipflexor(P, D, adj, phase):
    if phase == "start":
        _kneel_tall(P, D, adj, knee_x=0.11)
        return {"planted": dict(KNEEL_PLANT)}
    # half-kneeling: right knee down, left foot forward (knee ~90), hips pressed forward, torso tall
    kz, G = _kneel_geo(D, adj, 0.11)
    Kr, Ar = G["r"]
    H_r = Kr + V(0.0, -math.sin(math.radians(16)) * D.L1 * 0.99, math.cos(math.radians(16)) * D.L1 * 0.99)
    set_pelvis(P, H_r + V(D.HIP_W, 0, 0), Rx(-5))
    spine(P, -2, 0, 0, -2, 0)
    place_kneel_leg(P, "r", Kr, Ar)
    Hl = P.head("thigh_l")
    kfz = D.ANK + D.L2 * 0.99 + adj.get("foot_l", 0)
    ky = Hl.y - math.sqrt(max(D.L1 ** 2 - (kfz - Hl.z) ** 2, 0))
    foot_flat(P, D, "l", 0.15, ky - 0.03, 6, dz=adj.get("foot_l", 0), pole=V(0.05, -1, 0.2))
    # hands stacked on the front thigh just above the knee
    Kl = P.head("calf_l")
    for s, sg in SIDES:
        Wt = Kl + V(0.01 + 0.035 * sg, 0.09 + (0.05 if s == "r" else 0), 0.085 + (0.025 if s == "r" else 0.0))
        palm = V(0, 0.15, -1).normalized()
        fd = V(0.15 * sg, -1, -0.3).normalized()
        arm_to(P, s, Wt, V(0.6 * sg, 0.5, -0.3), fd, palm, roll=0.7)
        hand_soft(P, s, palm, fd, base=16)
    return {"planted": {"shin_r": ("z", 0.0), "foot_r": ("z", 0.0), "foot_l": ("z", 0.0)}}

# ---------------- cobra (prone)
def _prone(P, D, adj, ext, phase="start"):
    base_z = 0.1 + adj.get("pelvis", 0)
    set_pelvis(P, V(0, 0.15, base_z), Rx(90 - ext * 0.06))
    neck = -ext * 0.12 - 4 - (adj.get("head", 0) * 300 if phase == "start" else 0)
    spine(P, -ext * 0.30, -ext * 0.33, -ext * 0.30, neck, -ext * 0.1 - 6)
    prone_legs(P, D, adj)

def b_cobra(P, D, adj, phase):
    wh = 0.032 + adj.get("hand_l", 0) * 0.5 + adj.get("hand_r", 0) * 0.5
    # hands are placed in the start pose (beside the chest, under the shoulders) and stay there
    reset(P); _prone(P, D, adj, 0, "start")
    W = {}
    for s, sg in SIDES:
        S = P.head(f"upperarm_{s}")
        W[s] = V(S.x + 0.07 * sg, S.y + 0.02, wh)
    if phase == "exec":
        lo, hi = 0.0, 75.0
        for _ in range(22):
            m = (lo + hi) / 2
            reset(P); _prone(P, D, adj, m, "exec")
            d = max((P.head(f"upperarm_{s}") - W[s]).length for s, _ in SIDES)
            if d > D.ARM * 0.93:
                hi = m
            else:
                lo = m
        reset(P); _prone(P, D, adj, (lo + hi) / 2, "exec")
    else:
        reset(P); _prone(P, D, adj, 0, "start")
    for s, sg in SIDES:
        pole = V(0.25 * sg, 0.6, 1.0) if phase == "start" else V(0.15 * sg, 1.0, 0.25)
        fd = (Rz(6 * sg) @ V(0, -1, 0)).normalized()
        arm_to(P, s, W[s], pole, fd, V(0, 0, -1), roll=0.65)
        hand_flat_fingers(P, s, V(0, 0, -1), fd)
    planted = {"pelvis": ("z", 0.0), "hand_l": ("z", 0.0), "hand_r": ("z", 0.0), "foot_l": ("z", 0.0), "foot_r": ("z", 0.0)}
    if phase == "start":
        planted["head"] = ("z", 0.035)
    return {"planted": planted}

# ---------------- hamstring (heel on a box)
BOX_H = 0.46
def b_hamstring(P, D, adj, phase):
    box_y = -0.80
    bx = box("box", (0.12, box_y, BOX_H / 2), (0.42, 0.38, BOX_H))
    if phase == "start":
        set_pelvis(P, V(0, 0.0, D.HIP_Z - 0.012 + adj.get("_lift", 0)))
        for s, sg in SIDES:
            foot_flat(P, D, s, 0.12 * sg, -0.01, 7 * sg, dz=adj.get(f"foot_{s}", 0))
        spine(P, 0, 0, 0, -2, 0)
        arms_hanging(P, D)
        return {"planted": {"foot_l": ("z", 0.0), "foot_r": ("z", 0.0)}, "props": [bx]}
    set_pelvis(P, V(0, 0.02, D.HIP_Z - 0.06 + adj.get("_lift", 0)), Rx(34))
    spine(P, 4, 3, 2, -12, -8)
    foot_flat(P, D, "r", -0.12, 0.0, -8, dz=adj.get("foot_r", 0), pole_up=0.25)
    # left leg straight to the box, heel on the top, toes up
    H = P.head("thigh_l")
    heel_z = BOX_H + 0.075 + adj.get("foot_l", 0)
    A = V(0.12, box_y + 0.06, heel_z)
    d = (A - H)
    leg = (D.L1 + D.L2) * 0.985
    if d.length > leg:
        A = H + d.normalized() * leg
    P.leg("l", A, V(0, -0.3, 1))
    shin = (A - P.head("calf_l")).normalized()
    fdir = (V(0, 0, 1) - shin * 0.2 + V(0, -0.35, 0)).normalized()
    P.aim_dir("foot_l", fdir, -shin, V(0, 0, 1))
    P.apply_rest_rotation("ball_l", P.pb["foot_l"].matrix.to_3x3() @ P.rest["foot_l"].to_3x3().inverted())
    # hands slide down the front of the raised shin
    Kl, Al = P.head("calf_l"), P.head("foot_l")
    for s, sg in SIDES:
        t = 0.42 if s == "l" else 0.30
        base = Kl.lerp(Al, t)
        Wt = base + V(0.07 * sg, 0.02, 0.085)
        palm = V(-0.35 * sg, 0, -1).normalized()
        fd = (Al - Kl).normalized()
        arm_to(P, s, Wt, V(0.5 * sg, 0.3, -0.6), fd, palm, roll=0.7)
        hand_soft(P, s, palm, fd, base=22)
    return {"planted": {"foot_r": ("z", 0.0), "foot_l": ("z", BOX_H)}, "props": [bx]}

# ---------------- chest opener
def b_chest(P, D, adj, phase):
    if phase == "start":
        return b_stand(P, D, adj, phase)
    standing_base(P, D, adj, pitch=-3)
    spine(P, -4, -5, -4, -6, 2)
    for s, sg in SIDES:
        clav(P, s, up=4, fwd=-12)
        d = V(sg * 0.85, 0.55, -0.35)
        arm_dir(P, D, s, d, k=0.975, pole=V(0.1 * sg, 0.3, -1), fdir=d, palm=V(0, -1, 0.2), roll=0.85)
        hand_soft(P, s, V(0, -1, 0.2), d, base=6)
    return {"planted": {"foot_l": ("z", 0.0), "foot_r": ("z", 0.0)}}

# ---------------- shoulder stretch (cross-body)
def b_shoulder(P, D, adj, phase):
    if phase == "start":
        return b_stand(P, D, adj, phase)
    standing_base(P, D, adj)
    spine(P, 0, 0, 0, -2, 0)
    twist(P, "head", 12)
    # right arm straight across the chest; left forearm hooks it just above the elbow
    S = P.head("upperarm_r")
    d = V(1.0, -0.42, -0.06).normalized()
    clav(P, "r", fwd=10)
    arm_dir(P, D, "r", d, k=0.985, pole=V(0, 0.2, -1), fdir=d, palm=V(0, 1, 0), roll=0.8)
    hand_soft(P, "r", V(0, 1, 0), d, base=10)
    Er = P.head("lowerarm_r")
    Wt = Er + V(-0.04, -0.075, -0.02)
    palm = V(0.25, 1, 0).normalized()
    arm_to(P, "l", Wt, V(0.6, 0.0, -1), V(-1, 0, 0.15).normalized(), palm, roll=0.7)
    hand_soft(P, "l", palm, V(-1, 0, 0.1), base=22)
    return {"planted": {"foot_l": ("z", 0.0), "foot_r": ("z", 0.0)}}

# ---------------- quad stretch
def b_quad(P, D, adj, phase):
    if phase == "start":
        return b_stand(P, D, adj, phase)
    # stand tall on the far (right) leg; near (left) heel pulled to the glute by the left hand, knees together
    set_pelvis(P, V(0.02, 0.0, D.HIP_Z - 0.015 + adj.get("_lift", 0)), Rx(2))
    spine(P, -1, 0, 0, -2, 0)
    foot_flat(P, D, "r", -0.05, -0.01, -5, dz=adj.get("foot_r", 0))
    H = P.head("thigh_l")
    K = H + V(-0.03, 0.06, -1).normalized() * D.L1
    A = K + V(-0.02, 0.42, 1).normalized() * D.L2
    P.leg("l", A, K - (H + A) * 0.5)
    shin = (A - P.head("calf_l")).normalized()
    P.aim_dir("foot_l", (shin + V(0, 0.35, 0.0)).normalized(), V(0, 1, -0.2), V(0, 0, 1))
    P.apply_rest_rotation("ball_l", P.pb["foot_l"].matrix.to_3x3() @ P.rest["foot_l"].to_3x3().inverted())
    # left hand holds the top of the left foot / laces from behind
    Af = P.head("foot_l"); fdv = P.axis("foot_l", "y")
    grip = Af + fdv * 0.05 + V(0.035, 0.06, 0.0)
    palm = V(-0.2, -1, 0.1).normalized()
    fdir = V(-0.3, 0.1, -1).normalized()
    arm_to(P, "l", grip, V(0.5, 1, -0.2), fdir, palm, roll=0.7)
    hand_grip(P, "l", palm, fdir, curl=55)
    # right arm relaxed slightly out for balance
    arm_dir(P, D, "r", V(-0.45, -0.1, -0.9), k=0.97, pole=V(-0.3, 1, -0.2), fdir=V(-0.4, -0.1, -0.9), palm=V(0.3, 0, -1))
    hand_soft(P, "r", V(0.3, 0, -1).normalized(), V(-0.45, -0.1, -0.9).normalized(), base=10)
    return {"planted": {"foot_r": ("z", 0.0)}}

# ---------------- calf stretch (wall in front)
WALL_Y = -0.70
def b_calf(P, D, adj, phase):
    wall = box("wall", (0, WALL_Y - 0.06, 1.1), (1.1, 0.12, 2.2), color=(0.012, 0.012, 0.013))
    hand_z = 1.31
    if phase == "start":
        set_pelvis(P, V(0, -0.07, D.HIP_Z - 0.02 + adj.get("_lift", 0)), Rx(6))
        spine(P, 2, 2, 2, -6, -2)
        foot_flat(P, D, "l", 0.12, -0.10, 6, dz=adj.get("foot_l", 0))
        foot_flat(P, D, "r", -0.12, -0.07, -6, dz=adj.get("foot_r", 0))
    else:
        set_pelvis(P, V(0, -0.11, 0.835 + adj.get("_lift", 0)), Rx(24))
        spine(P, 1, 1, 0, -10, -6)
        foot_flat(P, D, "l", 0.13, 0.30, 4, dz=adj.get("foot_l", 0), pole=V(0.1, -1, 0.1))
        foot_flat(P, D, "r", -0.12, -0.30, -6, dz=adj.get("foot_r", 0), pole_up=0.2)
    wy = WALL_Y + 0.030 + adj.get("hand_l", 0) * 0.5 + adj.get("hand_r", 0) * 0.5
    for s, sg in SIDES:
        Wt = V(0.24 * sg, wy, hand_z)
        palm = V(0, -1, 0)
        fd = V(0.1 * sg, 0, 1).normalized()
        arm_to(P, s, Wt, V(0.6 * sg, 0.2, -1), fd, palm, roll=0.75)
        hand_flat_fingers(P, s, palm, fd, curl=2)
    return {"planted": {"foot_l": ("z", 0.0), "foot_r": ("z", 0.0), "hand_l": ("y", WALL_Y), "hand_r": ("y", WALL_Y)},
            "props": [wall]}

# ====================================================================== registry & camera
EXERCISES = {
    "planks": b_planks, "burpees": b_burpees, "jogging": b_jogging, "dips": b_dips, "lunges": b_lunges,
    "squats": b_squats, "push-ups": b_pushups, "sit-ups": b_situps, "skull-crushers": b_skull,
    "downward-dog": b_downdog, "warrior": b_warrior, "childs-pose": b_childs, "cobra": b_cobra,
    "hip-flexor": b_hipflexor, "hamstring": b_hamstring, "chest-opener": b_chest,
    "shoulder-stretch": b_shoulder, "quad-stretch": b_quad, "calf-stretch": b_calf,
}

# azimuth: degrees from the athlete's front toward his left (+X); elev: camera elevation
CAMERA = {
    "planks": (56, 15), "burpees": (42, 18), "jogging": (70, 8), "dips": (55, 12), "lunges": (68, 8),
    "squats": (58, 8), "push-ups": (56, 15), "sit-ups": (48, 26), "skull-crushers": (62, 20),
    "downward-dog": (60, 12), "warrior": (18, 6), "childs-pose": (42, 18), "cobra": (38, 22),
    "hip-flexor": (64, 8), "hamstring": (62, 10), "chest-opener": (30, 6), "shoulder-stretch": (22, 6),
    "quad-stretch": (90, 6), "calf-stretch": (96, 8),
}

def solve(P, M, exercise, phase, iters=7, tol=0.003, verbose=True):
    """Pose `exercise`/`phase` and drive every planted part onto its support surface.
    `clear` parts ({part: min_z}) are pushed up only if they dip below their minimum."""
    D = Dims(P)
    build = EXERCISES[exercise]
    adj = {}
    info = None
    for it in range(iters):
        reset(P)
        info = build(P, D, adj, phase) or {}
        planted = info.get("planted", {})
        errs = {}
        for part, (axis, val) in planted.items():
            m = M.extreme(part, axis, -1)
            errs[part] = (m - val) if m is not None else 0.0
        cl = {}
        for part, val in info.get("clear", {}).items():
            m = M.extreme(part, "z", -1)
            if m is not None and m < val - 0.001:
                cl[part] = m - val
        for part, val in info.get("clear_y", {}).items():
            m = M.extreme(part, "y", -1)
            # part must stay in front of (smaller y than) val: measure its max y
            m = M.extreme(part, "y", +1)
            if m is not None and m > val + 0.001:
                cl[part] = val - m
        if verbose:
            print(f"SOLVE {exercise}-{phase} it{it} " + " ".join(f"{k}={v * 1000:+.1f}mm" for k, v in errs.items()) +
                  ("  clear " + " ".join(f"{k}={v * 1000:+.1f}" for k, v in cl.items()) if cl else ""))
        if all(abs(e) < tol for e in errs.values()) and not cl:
            break
        for k, e in errs.items():
            adj[k] = adj.get(k, 0.0) - e
        for k, e in cl.items():
            adj["clr_" + k] = adj.get("clr_" + k, 0.0) - e
    # report anything that sinks into the floor
    rep = M.minz(["foot_l", "foot_r", "hand_l", "hand_r", "fore_l", "fore_r", "shin_l", "shin_r",
                  "thigh_l", "thigh_r", "pelvis", "torso", "head"])
    low = {k: round(v * 1000, 1) for k, v in rep.items() if v < 0.06}
    print(f"CONTACTS {exercise}-{phase} (mm, parts below 6 cm): {low}")
    bad = {k: v for k, v in rep.items() if v < -0.008}
    if bad:
        print(f"WARN_PENETRATION {exercise}-{phase}: {bad}")
    info["errs"] = errs
    info["camera"] = CAMERA.get(exercise, (55, 10))
    return info
