"""Build the Cardio Burner athlete with MPFB2 (CC0 assets) and save character.blend.
Run: blender -b --factory-startup? (no: MPFB extension must load) -> blender -b -P build_character.py
"""
import bpy, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from mpfb_import import dynamic_import
HumanService = dynamic_import("mpfb.services.humanservice", "HumanService")
AssetService = dynamic_import("mpfb.services.assetservice", "AssetService")
TargetService = dynamic_import("mpfb.services.targetservice", "TargetService")
HOP = dynamic_import("mpfb.entities.objectproperties", "HumanObjectProperties")

OUT = os.path.join(os.path.dirname(__file__), "..", "scene", "character.blend")
SKIN = os.environ.get("CB_SKIN", "young_caucasian_male")

# clean scene
bpy.ops.wm.read_homefile(use_empty=True)

macro = TargetService.get_default_macro_info_dict()
macro.update({"gender": 1.0, "age": 0.56, "muscle": float(os.environ.get("CB_MUSCLE", 1.0)),
              "weight": float(os.environ.get("CB_WEIGHT", 0.32)), "proportions": 1.0, "height": float(os.environ.get("CB_HEIGHT", 0.52))})
macro["race"] = {"caucasian": 0.7, "african": 0.15, "asian": 0.15}
basemesh = HumanService.create_human(macro_detail_dict=macro)
TargetService.reapply_macro_details(basemesh)
basemesh.name = "Athlete"

rig = HumanService.add_builtin_rig(basemesh, "game_engine")
rig.name = "AthleteRig"

def f(name, sub):
    p = AssetService.find_asset_absolute_path(name, asset_subdir=sub)
    if p is None: raise RuntimeError(f"missing {sub}/{name}")
    return p

HumanService.set_character_skin(f(SKIN + ".mhmat", "skins"), basemesh, skin_type="ENHANCED_SSS")
for sub, fn, at in [("eyes", "high-poly.mhclo", "Eyes"), ("eyebrows", "eyebrow001.mhclo", "Eyebrows"),
                    ("eyelashes", "eyelashes01.mhclo", "Eyelashes"), ("teeth", "teeth_base.mhclo", "Teeth"),
                    ("tongue", "tongue01.mhclo", "Tongue")]:
    HumanService.add_mhclo_asset(f(fn, sub), basemesh, asset_type=at, subdiv_levels=0)
HAIR = os.environ.get("CB_HAIR", "short02")
HumanService.add_mhclo_asset(f(HAIR + ".mhclo", "hair"), basemesh, asset_type="Hair", subdiv_levels=1)
PANTS = "toigo_wool_pants"
for fn in ["toigo_basic_tucked_t-shirt.mhclo", PANTS + ".mhclo", "shoes05.mhclo"]:
    HumanService.add_mhclo_asset(f(fn, "clothes"), basemesh, asset_type="Clothes", subdiv_levels=1)

# --- turn the CC0 wool pants into above-knee training shorts (our own modification) ---
import bmesh
CUT_FRAC = 0.405          # hem height as a fraction of body height (~13 cm above the knee)
def body_rest_coords():
    """World coords per original vertex index with shape keys (macros) applied, no modifiers."""
    saved = [(m, m.show_viewport) for m in basemesh.modifiers]
    for m, _ in saved: m.show_viewport = False
    dg0 = bpy.context.evaluated_depsgraph_get()
    ev = basemesh.evaluated_get(dg0); me = ev.to_mesh()
    out = [basemesh.matrix_world @ v.co for v in me.vertices]
    nrm = [(basemesh.matrix_world.to_3x3() @ v.normal).normalized() for v in me.vertices]
    ev.to_mesh_clear()
    for m, sv in saved: m.show_viewport = sv
    return out, nrm
BODY_CO, BODY_N = body_rest_coords()
_helper = {g.index for g in basemesh.vertex_groups if g.name.startswith(("helper", "joint", "HelperGeometry", "JointCubes"))}
_bodyv = [v.index for v in basemesh.data.vertices if not any(g.group in _helper and g.weight > 0.5 for g in v.groups)]
zs = [BODY_CO[i].z for i in _bodyv]
body_h = max(zs) - min(zs)
_th = rig.data.bones["thigh_l"]
HEM_T = float(os.environ.get("CB_HEM_T", 0.30))   # hem at 30 % of the thigh length above the knee joint
cut = _th.tail_local.z + HEM_T * (_th.head_local.z - _th.tail_local.z)
pants = next(o for o in bpy.data.objects if PANTS in o.name and o.type == "MESH")
bm = bmesh.new(); bm.from_mesh(pants.data)
kill = [v for v in bm.verts if (pants.matrix_world @ v.co).z < cut]
bmesh.ops.delete(bm, geom=kill, context="VERTS")
bm.to_mesh(pants.data); bm.free()
sol = pants.modifiers.new("Hem", "SOLIDIFY"); sol.thickness = 0.004; sol.offset = 1.0; sol.use_rim = True
# un-hide the skin below the hem (MPFB hides body verts under clothes with a mask group)
for mod in basemesh.modifiers:
    if mod.type == "MASK" and PANTS in mod.vertex_group:
        vg = basemesh.vertex_groups[mod.vertex_group]
        legs = [i for i, c in enumerate(BODY_CO) if c.z < cut + 0.06]
        vg.remove(legs)
print("PANTS cut at z=", cut, "body_h", body_h)

# --- trim the loose wool-pants silhouette into fitted training shorts: pull each vertex toward the skin ---
from mathutils.bvhtree import BVHTree as _BVH
masks = [m for m in basemesh.modifiers if m.type == "MASK"]
for m in masks: m.show_viewport = (m.name == "Hide helpers")
_dg = bpy.context.evaluated_depsgraph_get()
_bt = _BVH.FromObject(basemesh, _dg)
for m in masks: m.show_viewport = True
TRIM_KEEP, TRIM_MIN = 0.35, 0.007      # keep 35 % of the extra looseness, never closer than 7 mm
moved = 0
for v in pants.data.vertices:
    co = pants.matrix_world @ v.co
    loc, nrm, idx, d = _bt.find_nearest(co, 0.2)
    if loc is None or (co - loc).dot(nrm) <= 0 or d <= TRIM_MIN:
        continue
    nd = TRIM_MIN + (d - TRIM_MIN) * TRIM_KEEP
    v.co = pants.matrix_world.inverted() @ (loc + (co - loc).normalized() * nd)
    moved += 1
pants.data.update()
print("PANTS trimmed verts", moved)

# --- hide skin that is fully covered by the T-shirt (prevents poke-through at shoulders/chest) ---
from mathutils.bvhtree import BVHTree
from mathutils.kdtree import KDTree
shirt = next(o for o in bpy.data.objects if "t-shirt" in o.name and o.type == "MESH")
dg = bpy.context.evaluated_depsgraph_get()
tree = BVHTree.FromObject(shirt, dg)
sm = shirt.data
edge_faces = {}
for poly in sm.polygons:
    for ek in poly.edge_keys:
        edge_faces[ek] = edge_faces.get(ek, 0) + 1
border = {i for ek, c in edge_faces.items() if c == 1 for i in ek}
kd = KDTree(len(border))
for i, vi in enumerate(border):
    kd.insert(shirt.matrix_world @ sm.vertices[vi].co, i)
kd.balance()
helper_ids = {g.index for g in basemesh.vertex_groups if g.name.startswith(("helper", "joint", "HelperGeometry", "JointCubes"))}
torso_bones = {"pelvis", "spine_01", "spine_02", "spine_03", "clavicle_l", "clavicle_r", "upperarm_l", "upperarm_r"}
torso_ids = {g.index for g in basemesh.vertex_groups if g.name in torso_bones}
covered = []
for v in basemesh.data.vertices:
    if any(g.group in helper_ids and g.weight > 0.5 for g in v.groups):
        continue
    if sum(g.weight for g in v.groups if g.group in torso_ids) < 0.6:
        continue   # only skin that is (almost) entirely driven by torso/upper-arm bones
    co = BODY_CO[v.index]
    loc, nrm, idx, dist = tree.find_nearest(co, 0.03)
    if loc is None:
        continue
    _, _, dist_border = kd.find(co)
    if dist_border > 0.016:
        covered.append(v.index)
vg = basemesh.vertex_groups.new(name="CB_hide_under_shirt")
vg.add(covered, 1.0, "REPLACE")
mm = basemesh.modifiers.new("CB_hide_under_shirt", "MASK")
mm.vertex_group = vg.name; mm.invert_vertex_group = True
# keep modifier order: Armature first, masks after
print("SHIRT hides", len(covered), "body verts")

for o in bpy.data.objects: print("OBJ", o.name, o.type, [m.type for m in getattr(o, "modifiers", [])], [m.name for m in getattr(o.data, "materials", [])] if o.type == "MESH" else "")
os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(OUT))
print("SAVED", OUT)
