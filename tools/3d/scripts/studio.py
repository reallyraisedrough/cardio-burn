"""Studio, materials and render settings for Cardio Burner 3D renders (no MPFB dependency)."""
import bpy, math, os
from mathutils import Vector, Matrix

BG_HEX = (0x09, 0x09, 0x0b)

def srgb_to_lin(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def setup_render(res_pct=100, samples=128, out_path="/tmp/out.png"):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    cy = sc.cycles
    cy.device = 'CPU'
    cy.samples = samples
    cy.use_adaptive_sampling = True
    cy.adaptive_threshold = 0.015
    cy.use_denoising = True
    cy.denoiser = 'OPENIMAGEDENOISE'
    try:
        cy.denoising_input_passes = 'RGB_ALBEDO_NORMAL'
        cy.denoising_prefilter = 'ACCURATE'
        cy.denoising_quality = 'HIGH'
    except Exception:
        pass
    cy.max_bounces = 8
    cy.diffuse_bounces = 3
    cy.glossy_bounces = 3
    cy.transmission_bounces = 4
    cy.transparent_max_bounces = 32
    cy.sample_clamp_indirect = 8.0
    cy.blur_glossy = 0.5
    sc.render.threads_mode = 'AUTO'
    sc.render.resolution_x = 2160
    sc.render.resolution_y = 3840
    sc.render.resolution_percentage = res_pct
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    sc.render.image_settings.color_depth = '8'
    sc.view_settings.view_transform = 'AgX'
    sc.view_settings.look = 'AgX - Medium High Contrast'
    sc.view_settings.exposure = -0.3
    sc.render.filepath = out_path

def setup_world():
    w = bpy.data.worlds.new("StudioWorld") if not bpy.data.worlds else bpy.data.worlds[0]
    bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    bg = nt.nodes.get("Background") or nt.nodes.new("ShaderNodeBackground")
    bg.inputs[0].default_value = (0.012, 0.012, 0.014, 1)
    bg.inputs[1].default_value = 1.0

def add_area(name, loc, target, size, size_y, energy, color=(1, 1, 1), spread=180):
    ld = bpy.data.lights.new(name, 'AREA')
    ld.shape = 'RECTANGLE'
    ld.size = size
    ld.size_y = size_y
    ld.energy = energy
    ld.color = color
    ld.spread = math.radians(spread)
    ob = bpy.data.objects.new(name, ld)
    bpy.context.scene.collection.objects.link(ob)
    ob.location = Vector(loc)
    d = (Vector(target) - ob.location).normalized()
    ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    return ob

def setup_lights(center, cam_dir_xy, scale=1.0):
    """center: subject center; cam_dir_xy: unit 2D vector from subject toward camera."""
    cx, cy_ = cam_dir_xy
    # perpendicular (camera-left/right)
    px, py = -cy_, cx
    c = Vector(center)
    def P(fwd, side, up):
        return (c.x + cx * fwd + px * side, c.y + cy_ * fwd + py * side, up)
    # key: camera-left, up, big & soft, slightly warm
    add_area("Key", P(2.6, 2.2, 3.2), c + Vector((0, 0, 0.25)), 2.4, 2.4, 1000 * scale, (1.0, 0.95, 0.9))
    # fill: camera-right, low, weak, neutral-cool
    add_area("Fill", P(3.0, -2.6, 1.4), c, 3.0, 3.0, 55 * scale, (0.9, 0.95, 1.0))
    # rims: behind subject, both sides, strip lights
    add_area("RimL", P(-2.4, 1.9, 2.4), c + Vector((0, 0, 0.3)), 0.6, 3.0, 950 * scale, (0.92, 0.96, 1.0))
    add_area("RimR", P(-2.4, -1.9, 2.4), c + Vector((0, 0, 0.3)), 0.6, 3.0, 800 * scale, (0.92, 0.96, 1.0))
    # top for hair/shoulders
    add_area("Top", (c.x, c.y, 4.0), c, 1.5, 1.5, 120 * scale, (1, 1, 1))

def setup_floor():
    bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0))
    fl = bpy.context.active_object
    fl.name = "ShadowFloor"
    fl.is_shadow_catcher = True
    m = bpy.data.materials.new("FloorMat")
    m.use_nodes = True
    m.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.05, 0.05, 0.055, 1)
    m.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.6
    fl.data.materials.append(m)
    return fl

def setup_camera(target, azimuth_deg, elev_deg, dist, lens=70, shift_y=0.0):
    """azimuth measured from the character's front (-Y) toward character's left (+X)."""
    cd = bpy.data.cameras.new("Cam")
    cd.lens = lens
    cd.sensor_fit = 'VERTICAL'
    cd.sensor_height = 36
    cd.shift_y = shift_y
    cam = bpy.data.objects.new("Cam", cd)
    bpy.context.scene.collection.objects.link(cam)
    a, e = math.radians(azimuth_deg), math.radians(elev_deg)
    t = Vector(target)
    cam.location = t + Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e))) * dist
    cam.rotation_euler = (t - cam.location).to_track_quat('-Z', 'Y').to_euler()
    bpy.context.scene.camera = cam
    return cam, (math.sin(a), -math.cos(a))

# ------------------------------------------------------------------ materials
def _new_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    return m, m.node_tree

def fabric_material(name, color, roughness=0.75, sheen=0.35, normal_img=None, bump_img=None, bump_strength=0.25, noise_bump=0.15, uv_tile=1.0, heather=0.0, spec=0.2):
    m, nt = _new_mat(name)
    p = nt.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*color, 1)
    if heather:
        # heathered yarn: fine streaky light/dark fibre variation
        tc0 = nt.nodes.new("ShaderNodeTexCoord")
        mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (1.0, 1.0, 6.0)
        nt.links.new(tc0.outputs["Object"], mp.inputs["Vector"])
        hn = nt.nodes.new("ShaderNodeTexNoise"); hn.inputs["Scale"].default_value = 260.0; hn.inputs["Detail"].default_value = 3.0
        nt.links.new(mp.outputs["Vector"], hn.inputs["Vector"])
        ramp = nt.nodes.new("ShaderNodeValToRGB")
        ramp.color_ramp.elements[0].position = 0.35; ramp.color_ramp.elements[1].position = 0.65
        ramp.color_ramp.elements[0].color = (*[c * (1 - heather) for c in color], 1)
        ramp.color_ramp.elements[1].color = (*[min(1.0, c * (1 + heather * 1.5)) for c in color], 1)
        nt.links.new(hn.outputs["Fac"], ramp.inputs["Fac"])
        nt.links.new(ramp.outputs["Color"], p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = roughness
    p.inputs["Sheen Weight"].default_value = sheen
    p.inputs["Sheen Roughness"].default_value = 0.4
    p.inputs["Specular IOR Level"].default_value = spec
    # fine knit micro-bump
    tc = nt.nodes.new("ShaderNodeTexCoord")
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 900.0
    nz.inputs["Detail"].default_value = 2.0
    nt.links.new(tc.outputs["Object"], nz.inputs["Vector"])
    # knit rows (wave) + fibre noise
    wv = nt.nodes.new("ShaderNodeTexWave"); wv.wave_type = 'BANDS'; wv.bands_direction = 'Z'
    wv.inputs["Scale"].default_value = 700.0; wv.inputs["Distortion"].default_value = 2.0
    nt.links.new(tc.outputs["Object"], wv.inputs["Vector"])
    mx = nt.nodes.new("ShaderNodeMath"); mx.operation = 'ADD'
    nt.links.new(nz.outputs["Fac"], mx.inputs[0]); nt.links.new(wv.outputs["Fac"], mx.inputs[1])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = noise_bump
    bump.inputs["Distance"].default_value = 0.0015
    nt.links.new(mx.outputs["Value"], bump.inputs["Height"])
    last_normal = bump.outputs["Normal"]
    if bump_img:
        it = nt.nodes.new("ShaderNodeTexImage")
        it.image = bump_img
        it.image.colorspace_settings.name = 'Non-Color'
        b2 = nt.nodes.new("ShaderNodeBump")
        b2.inputs["Strength"].default_value = bump_strength
        nt.links.new(it.outputs["Color"], b2.inputs["Height"])
        nt.links.new(last_normal, b2.inputs["Normal"])
        last_normal = b2.outputs["Normal"]
    if normal_img:
        it = nt.nodes.new("ShaderNodeTexImage")
        it.image = normal_img
        it.image.colorspace_settings.name = 'Non-Color'
        nm = nt.nodes.new("ShaderNodeNormalMap")
        nm.inputs["Strength"].default_value = bump_strength
        nt.links.new(it.outputs["Color"], nm.inputs["Color"])
        last_normal = nm.outputs["Normal"]
    nt.links.new(last_normal, p.inputs["Normal"])
    return m

def textured_material(name, img, roughness=0.6, tint=None, normal_img=None, normal_strength=0.6, alpha_from_img=False):
    m, nt = _new_mat(name)
    p = nt.nodes["Principled BSDF"]
    it = nt.nodes.new("ShaderNodeTexImage"); it.image = img
    col = it.outputs["Color"]
    if tint:
        mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'
        mix.inputs["Factor"].default_value = 1.0
        nt.links.new(col, mix.inputs["A"]); mix.inputs["B"].default_value = (*tint, 1)
        col = mix.outputs["Result"]
    nt.links.new(col, p.inputs["Base Color"])
    if alpha_from_img:
        nt.links.new(it.outputs["Alpha"], p.inputs["Alpha"])
    p.inputs["Roughness"].default_value = roughness
    p.inputs["Specular IOR Level"].default_value = 0.4
    if normal_img:
        nit = nt.nodes.new("ShaderNodeTexImage"); nit.image = normal_img
        nit.image.colorspace_settings.name = 'Non-Color'
        nm = nt.nodes.new("ShaderNodeNormalMap"); nm.inputs["Strength"].default_value = normal_strength
        nt.links.new(nit.outputs["Color"], nm.inputs["Color"]); nt.links.new(nm.outputs["Normal"], p.inputs["Normal"])
    return m

def skin_material(name, diffuse_img, normal_img=None, spec_img=None, normal_strength=0.5, tint=(1, 1, 1), roughness=0.48):
    """Physically based skin: random-walk SSS, pore-scale bump, spec variation."""
    m, nt = _new_mat(name)
    N = nt.nodes; L = nt.links
    p = N["Principled BSDF"]
    p.subsurface_method = 'RANDOM_WALK_SKIN'
    tex = N.new("ShaderNodeTexImage"); tex.image = diffuse_img
    hsv = N.new("ShaderNodeHueSaturation")
    hsv.inputs["Saturation"].default_value = 1.05
    hsv.inputs["Value"].default_value = 1.0
    L.new(tex.outputs["Color"], hsv.inputs["Color"])
    mix = N.new("ShaderNodeMix"); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'
    mix.inputs["Factor"].default_value = 1.0; mix.inputs["B"].default_value = (*tint, 1)
    L.new(hsv.outputs["Color"], mix.inputs["A"])
    L.new(mix.outputs["Result"], p.inputs["Base Color"])
    p.inputs["Subsurface Weight"].default_value = 1.0
    p.inputs["Subsurface Radius"].default_value = (1.0, 0.35, 0.2)
    p.inputs["Subsurface Scale"].default_value = 0.006
    p.inputs["Subsurface IOR"].default_value = 1.4
    p.inputs["Subsurface Anisotropy"].default_value = 0.8
    p.inputs["IOR"].default_value = 1.4
    p.inputs["Specular IOR Level"].default_value = 0.5
    # roughness variation (spec map if available, else noise)
    tc = N.new("ShaderNodeTexCoord")
    nz = N.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 60.0; nz.inputs["Detail"].default_value = 4.0
    L.new(tc.outputs["Object"], nz.inputs["Vector"])
    mr = N.new("ShaderNodeMapRange")
    mr.inputs["To Min"].default_value = roughness - 0.08
    mr.inputs["To Max"].default_value = roughness + 0.08
    L.new(nz.outputs["Fac"], mr.inputs["Value"])
    L.new(mr.outputs["Result"], p.inputs["Roughness"])
    # pores: fine voronoi bump
    vor = N.new("ShaderNodeTexVoronoi"); vor.feature = 'DISTANCE_TO_EDGE'
    vor.inputs["Scale"].default_value = 1400.0
    L.new(tc.outputs["Object"], vor.inputs["Vector"])
    nz2 = N.new("ShaderNodeTexNoise"); nz2.inputs["Scale"].default_value = 500.0; nz2.inputs["Detail"].default_value = 6.0
    L.new(tc.outputs["Object"], nz2.inputs["Vector"])
    addh = N.new("ShaderNodeMath"); addh.operation = 'ADD'
    L.new(vor.outputs["Distance"], addh.inputs[0]); L.new(nz2.outputs["Fac"], addh.inputs[1])
    bump = N.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.12; bump.inputs["Distance"].default_value = 0.0004
    L.new(addh.outputs["Value"], bump.inputs["Height"])
    if normal_img:
        nit = N.new("ShaderNodeTexImage"); nit.image = normal_img; nit.image.colorspace_settings.name = 'Non-Color'
        nm = N.new("ShaderNodeNormalMap"); nm.inputs["Strength"].default_value = normal_strength
        L.new(nit.outputs["Color"], nm.inputs["Color"])
        L.new(nm.outputs["Normal"], bump.inputs["Normal"])
    L.new(bump.outputs["Normal"], p.inputs["Normal"])
    p.inputs["Coat Weight"].default_value = 0.08
    p.inputs["Coat Roughness"].default_value = 0.35
    p.inputs["Sheen Weight"].default_value = 0.05
    return m
