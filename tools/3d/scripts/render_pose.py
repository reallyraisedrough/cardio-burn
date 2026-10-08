"""Render the start/exec poses of one Cardio Burner exercise (same camera for both phases).
Usage: blender -b scene/character.blend -P scripts/render_pose.py -- <exercise> <outdir> [res_pct] [samples] [start,exec]
Writes <outdir>/<exercise>-<phase>.png (RGBA, transparent bg + shadow catcher) and a .json sidecar.
"""
import bpy, sys, os, math, time, json
from mathutils import Vector, Matrix
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import studio, posing, poses
from bpy_extras.object_utils import world_to_camera_view
import importlib; importlib.reload(studio); importlib.reload(posing); importlib.reload(poses)

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
exercise = argv[0] if argv else "squats"
outdir = os.path.abspath(argv[1] if len(argv) > 1 else "/tmp/cb")
res_pct = int(argv[2]) if len(argv) > 2 else 25
samples = int(argv[3]) if len(argv) > 3 else 64
phases = (argv[4] if len(argv) > 4 else "start,exec").split(",")
os.makedirs(outdir, exist_ok=True)
DATA = os.path.expanduser("~/.config/blender/4.5/extensions/.user/user_default/mpfb/data")

rig = bpy.data.objects["AthleteRig"]
body = bpy.data.objects["Athlete"]

# ------------------------------------------------------------------ materials
def img(path):
    return bpy.data.images.load(os.path.join(DATA, path), check_existing=True)

SKIN = os.environ.get("CB_SKIN_TEX", "skins/young_caucasian_male/young_lightskinned_male_diffuse.png")
SKIN_N = os.environ.get("CB_SKIN_NRM", "")
skin = studio.skin_material("CB_Skin", img(SKIN), normal_img=img(SKIN_N) if SKIN_N else None, normal_strength=0.35)
lips = studio.skin_material("CB_Lips", img(SKIN), normal_img=None, roughness=0.38)
for i, m in enumerate(body.data.materials):
    body.data.materials[i] = lips if (m and m.name.endswith(".lips")) else skin

def obj_like(sub):
    return next(o for o in bpy.data.objects if sub in o.name)

shirt = obj_like("t-shirt"); shorts = obj_like("wool_pants"); shoes = obj_like("shoes"); hair = obj_like("short0")
SHIRT_COL = tuple(studio.srgb_to_lin(c) for c in (0x56, 0x5a, 0x63))   # heather-grey performance tee
shirt.data.materials[0] = studio.fabric_material("CB_Shirt", SHIRT_COL, roughness=0.9, sheen=0.25, heather=0.35,
    bump_img=img("clothes/toigo_basic_tucked_t-shirt/T-shirt_basic-bump.png"), bump_strength=0.45, noise_bump=0.3)
SHORTS_COL = tuple(studio.srgb_to_lin(c) for c in (0x0f, 0x0f, 0x11))
shorts.data.materials[0] = studio.fabric_material("CB_Shorts", SHORTS_COL, roughness=0.7, sheen=0.04, spec=0.12,
    bump_img=img("clothes/toigo_wool_pants/Pants_wool.png"),
    bump_strength=0.25, noise_bump=0.12)
shoes.data.materials[0] = studio.textured_material("CB_Shoes", img("clothes/shoes05/shoes05_diffuse.png"), roughness=0.55)
# hair: keep MPFB alpha material but darken & make it less shiny
hm = hair.data.materials[0]
for n in hm.node_tree.nodes:
    if n.type == 'BSDF_PRINCIPLED':
        n.inputs["Roughness"].default_value = 0.78
        n.inputs["Specular IOR Level"].default_value = 0.22
        src = n.inputs["Base Color"].links[0].from_socket if n.inputs["Base Color"].links else None
        if src is not None:
            mix = hm.node_tree.nodes.new("ShaderNodeMix"); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'
            mix.inputs["Factor"].default_value = 1.0
            mix.inputs["B"].default_value = (0.42, 0.30, 0.22, 1)   # dark brown
            hm.node_tree.links.new(src, mix.inputs["A"]); hm.node_tree.links.new(mix.outputs["Result"], n.inputs["Base Color"])

# smooth body for render
for o in [body]:
    if not any(m.type == 'SUBSURF' for m in o.modifiers):
        sm = o.modifiers.new("Subdiv", 'SUBSURF'); sm.levels = 1; sm.render_levels = 2
for o in bpy.data.objects:
    for m in getattr(o, "modifiers", []):
        if m.type == 'SUBSURF':
            m.render_levels = max(m.render_levels, 2 if o is body else 1)

# ------------------------------------------------------------------ pose-aware poke-through fix
def hide_skin_under(cloth, group_name, bones, near=0.02, behind=0.015, border_margin=0.015):
    """Hide body vertices that end up under/through `cloth` in the *posed* state."""
    from mathutils.bvhtree import BVHTree
    from mathutils.kdtree import KDTree
    saved = [(o, m, m.show_viewport) for o in (body, cloth) for m in o.modifiers]
    for o, m, _ in saved:
        m.show_viewport = (m.type == 'ARMATURE')
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    ce = cloth.evaluated_get(dg); cm = ce.to_mesh()
    verts = [ce.matrix_world @ v.co for v in cm.vertices]
    polys = [tuple(p.vertices) for p in cm.polygons]
    tree = BVHTree.FromPolygons(verts, polys)
    ef = {}
    for p in cm.polygons:
        for ek in p.edge_keys: ef[ek] = ef.get(ek, 0) + 1
    border = {i for ek, c in ef.items() if c == 1 for i in ek}
    kd = KDTree(max(len(border), 1))
    for k, i in enumerate(border): kd.insert(verts[i], k)
    kd.balance()
    ce.to_mesh_clear()
    be = body.evaluated_get(dg); bmesh_ = be.to_mesh()
    ids = {g.index for g in body.vertex_groups if g.name in bones}
    helper = {g.index for g in body.vertex_groups if g.name.startswith(("helper", "joint", "HelperGeometry", "JointCubes"))}
    hide = []
    for v in body.data.vertices:
        gs = v.groups
        if any(g.group in helper and g.weight > 0.5 for g in gs): continue
        if sum(g.weight for g in gs if g.group in ids) < 0.3: continue
        co = be.matrix_world @ bmesh_.vertices[v.index].co
        loc, nrm, idx, dist = tree.find_nearest(co, near + behind)
        if loc is None: continue
        side = (co - loc).dot(nrm)
        if side > -behind and kd.find(co)[2] > border_margin:
            hide.append(v.index)
    be.to_mesh_clear()
    for o, m, sv in saved: m.show_viewport = sv
    vg = body.vertex_groups.get(group_name) or body.vertex_groups.new(name=group_name)
    vg.remove([v.index for v in body.data.vertices])
    vg.add(hide, 1.0, 'REPLACE')
    if not any(m.type == 'MASK' and m.vertex_group == group_name for m in body.modifiers):
        mm = body.modifiers.new(group_name, 'MASK'); mm.vertex_group = group_name; mm.invert_vertex_group = True
        # move mask before subdivision
        while body.modifiers.find(mm.name) > 1 and body.modifiers[body.modifiers.find(mm.name) - 1].type == 'SUBSURF':
            bpy.ops.object.modifier_move_up({"object": body}, modifier=mm.name) if False else body.modifiers.move(body.modifiers.find(mm.name), body.modifiers.find(mm.name) - 1)
    bpy.context.view_layer.update()
    print("POKE hide", cloth.name, len(hide))


# ------------------------------------------------------------------ props
PROP_COLL = bpy.data.collections.new("CB_Props"); bpy.context.scene.collection.children.link(PROP_COLL)
def prop_material(name, col, rough=0.9):
    m = bpy.data.materials.get(name)
    if m: return m
    m = bpy.data.materials.new(name); m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*col, 1); p.inputs["Roughness"].default_value = rough
    p.inputs["Specular IOR Level"].default_value = 0.08 if rough > 0.5 else 0.3
    return m

def clear_props():
    for o in list(PROP_COLL.objects):
        bpy.data.objects.remove(o, do_unlink=True)

def add_mesh_obj(name, bm_fn, mat):
    import bmesh
    me = bpy.data.meshes.new(name); bm = bmesh.new(); bm_fn(bm); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); PROP_COLL.objects.link(o)
    me.materials.append(mat)
    for p in me.polygons: p.use_smooth = False
    return o

def make_props(props):
    import bmesh
    clear_props()
    objs = []
    for pr in props or []:
        if pr["type"] == "box":
            mat = prop_material("CB_Prop_" + pr["name"], pr["color"])
            sx, sy, sz = pr["size"]
            def fn(bm, s=(sx, sy, sz)):
                bmesh.ops.create_cube(bm, size=1.0)
                for v in bm.verts: v.co = Vector((v.co.x * s[0], v.co.y * s[1], v.co.z * s[2]))
            o = add_mesh_obj(pr["name"], fn, mat); o.location = pr["center"]
            bev = o.modifiers.new("Bevel", 'BEVEL'); bev.width = 0.012; bev.segments = 3
            objs.append(o)
        elif pr["type"] == "dumbbell":
            mat = prop_material("CB_Prop_iron", pr["color"], rough=0.38)
            ax = Vector(pr["axis"]).normalized()
            def fn(bm):
                bmesh.ops.create_cone(bm, cap_ends=True, segments=32, radius1=0.016, radius2=0.016, depth=0.15)
                for off in (-0.095, 0.095):
                    r = bmesh.ops.create_cone(bm, cap_ends=True, segments=40, radius1=0.05, radius2=0.05, depth=0.045)
                    for v in r["verts"]: v.co.z += off
            o = add_mesh_obj(pr["name"], fn, mat)
            o.rotation_euler = Vector((0, 0, 1)).rotation_difference(ax).to_euler()
            o.location = pr["center"]
            bev = o.modifiers.new("Bevel", 'BEVEL'); bev.width = 0.004; bev.segments = 2
            for p in o.data.polygons: p.use_smooth = len(p.vertices) == 4
            objs.append(o)
    bpy.context.view_layer.update()
    return objs

# ------------------------------------------------------------------ pose both phases, union camera
P = posing.Poser(rig)
M = posing.Meas(P, {"body": body, "shoes": shoes, "shirt": shirt, "shorts": shorts, "hair": hair})

def figure_points(step=6):
    pts = []
    dg = bpy.context.evaluated_depsgraph_get()
    for o in (body, shoes, hair, shirt, shorts):
        saved = [(m, m.show_viewport) for m in o.modifiers]
        for m, _ in saved: m.show_viewport = (m.type == 'ARMATURE')
        bpy.context.view_layer.update(); dg = bpy.context.evaluated_depsgraph_get()
        ev = o.evaluated_get(dg); me = ev.to_mesh()
        pts += [ev.matrix_world @ v.co for v in list(me.vertices)[::step]]
        ev.to_mesh_clear()
        for m, sv in saved: m.show_viewport = sv
    return pts

infos, all_pts, prop_pts = {}, [], []
for ph in ("start", "exec"):
    info = poses.solve(P, M, exercise, ph)
    infos[ph] = info
    all_pts += figure_points()
    for pr in info.get("props", []):
        if pr["type"] == "box" and pr["name"] != "wall":
            c, s = Vector(pr["center"]), Vector(pr["size"])
            prop_pts += [c + Vector((sx * s.x / 2, sy * s.y / 2, sz * s.z / 2)) for sx in (-1, 1) for sy in (-1, 1) for sz in (-1, 1)]

sc = bpy.context.scene
studio.setup_render(res_pct, samples, os.path.join(outdir, "x.png"))
studio.setup_world()
studio.setup_floor()
az, el = infos["exec"]["camera"]
pts = all_pts + prop_pts
bbmin = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
bbmax = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
ctr = (bbmin + bbmax) / 2
height = bbmax.z - bbmin.z
floor_pose = height < 1.1
FILL_W = float(os.environ.get("CB_FILL_W", 0.90 if floor_pose else 0.86))
FILL_H = float(os.environ.get("CB_FILL_H", 0.84))
CY = float(os.environ.get("CB_CY", 0.40 if floor_pose else 0.47))
cam, camdir = studio.setup_camera(ctr, az, el, 7.0, 75 if not floor_pose else 70, 0.0)
cam.data.shift_y = 0
for it in range(8):
    d = (cam.location - ctr).normalized()
    cam.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler()
    bpy.context.view_layer.update()
    cs = [world_to_camera_view(sc, cam, p) for p in pts]
    xs = [c.x for c in cs]; ys = [c.y for c in cs]
    fill = max((max(xs) - min(xs)) / FILL_W, (max(ys) - min(ys)) / FILL_H)
    dist = (cam.location - ctr).length
    cam.location = ctr + d * dist * fill
bpy.context.view_layer.update()
cs = [world_to_camera_view(sc, cam, p) for p in pts]
xs = [c.x for c in cs]; ys = [c.y for c in cs]
cam.data.shift_x = ((min(xs) + max(xs)) / 2 - 0.5) * (sc.render.resolution_x / sc.render.resolution_y)
cam.data.shift_y = ((min(ys) + max(ys)) / 2 - CY)
print("CAM", exercise, tuple(round(c, 3) for c in cam.location), "fill x %.3f y %.3f floor_pose %s" % (max(xs) - min(xs), max(ys) - min(ys), floor_pose))
studio.setup_lights(ctr, camdir)
bpy.context.view_layer.update()
fc = world_to_camera_view(sc, cam, Vector((ctr.x, ctr.y, 0.0)))
fl = [world_to_camera_view(sc, cam, Vector((x, y, 0.0))) for x in (bbmin.x, bbmax.x) for y in (bbmin.y, bbmax.y)]
cs = [world_to_camera_view(sc, cam, p) for p in pts]
bbox = [min(c.x for c in cs), 1 - max(c.y for c in cs), max(c.x for c in cs), 1 - min(c.y for c in cs)]
meta = {"bbox": bbox, "floor_center": [fc.x, 1 - fc.y], "floor_span_x": max(p.x for p in fl) - min(p.x for p in fl),
        "floor_span_y": max(p.y for p in fl) - min(p.y for p in fl)}

if os.environ.get("CB_BORDER"):
    x0, x1, y0, y1 = map(float, os.environ["CB_BORDER"].split(","))
    sc.render.use_border = True; sc.render.use_crop_to_border = True
    sc.render.border_min_x, sc.render.border_max_x, sc.render.border_min_y, sc.render.border_max_y = x0, x1, y0, y1
for _n in filter(None, os.environ.get("CB_HIDE", "").split(",")):
    bpy.data.objects[_n].hide_render = True

for ph in phases:
    info = poses.solve(P, M, exercise, ph, verbose=False)
    make_props(info.get("props"))
    hide_skin_under(shirt, "CB_hide_under_shirt", {"pelvis", "spine_01", "spine_02", "spine_03", "clavicle_l", "clavicle_r", "upperarm_l", "upperarm_r"}, border_margin=0.045)
    hide_skin_under(shorts, "CB_hide_under_shorts", {"pelvis", "thigh_l", "thigh_r", "spine_01"}, near=0.02, behind=0.02, border_margin=0.06)
    out = os.path.join(outdir, f"{exercise}-{ph}.png")
    sc.render.filepath = out
    json.dump(dict(meta, slug=f"{exercise}-{ph}", errs=info.get("errs")), open(out + ".json", "w"))
    if os.environ.get("CB_SAVE_BLEND"):
        bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "..", "scene", f"{exercise}-{ph}.blend"), copy=True)
    t0 = time.time()
    bpy.ops.render.render(write_still=True)
    print(f"RENDER_TIME {exercise}-{ph} {time.time() - t0:.1f}s -> {out}", flush=True)
