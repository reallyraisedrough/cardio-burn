# 3D pose renders: attribution and licenses

`/poses/<slug>-<start|exec>.webp` (720x1280) and `/poses-4k/<slug>-<start|exec>.png` (2160x3840) are
renders of one 3D athlete made in Blender. Every asset that appears in them is **CC0 1.0** (public domain),
so commercial use and redistribution in the app are allowed and no attribution is required. We list them anyway.

| Asset | Source | License |
|---|---|---|
| MakeHuman base mesh, body-shape targets, `game_engine` rig and weights | MPFB 2.0.17 (MakeHuman Plugin for Blender), github.com/makehumancommunity/mpfb2 | CC0 1.0 (MPFB `LICENSE.ASSETS.md`) |
| Skin texture `young_caucasian_male`, eyes `high-poly`, eyebrows `eyebrow001`, eyelashes `eyelashes01`, teeth, tongue | makehuman_system_assets pack, files.makehumancommunity.org | CC0 |
| Hair `short02` | makehuman_system_assets | CC0 |
| Shoes `shoes05` | makehuman_system_assets | CC0 |
| T-shirt `toigo_basic_tucked_t-shirt` | shirts01 pack, Margaret Toigo | CC0 |
| Pants `toigo_wool_pants` (cut down into shorts by us) | pants01 pack, Margaret Toigo | CC0 |
| Bench, box, wall and dumbbell props, shaders, lighting, poses | Made by us (tools/3d/scripts) | Ours |

Tools: Blender 4.5 LTS (GPL-3.0) and MPFB 2.0.17 (code GPL-3.0). Both projects state that renders made
with them belong to the user; the GPL does not apply to the images.

Not used: Mixamo, Daz, Renderpeople, Reallusion, or any CC-BY, non-commercial or unclear-license asset.
The scripts that build, pose and render the athlete are in `tools/3d/` (no binaries or .blend files).
