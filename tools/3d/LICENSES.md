# Cardio Burner 3D athlete: asset & tool licenses

Every asset that ends up in the rendered images is **CC0 1.0 (public domain dedication)**.
That means no attribution is required and commercial use plus redistribution inside a paid app are allowed.
The tools (Blender, MPFB) are GPL. That covers the software only. Neither project claims any rights over renders made with it.

## Tools (not shipped, used to produce the images)

| Tool | Version | License | Notes |
|---|---|---|---|
| Blender | 4.5.14 LTS, official Linux x64 tarball from download.blender.org | GPL-3.0-or-later | Blender's license FAQ says the artwork you make with Blender is yours. Renders are not covered by the GPL. |
| MPFB (MakeHuman Plugin For Blender) | 2.0.17, github.com/makehumancommunity/mpfb2 tag `v2.0.17` | Code: GPL-3.0-or-later. Bundled assets: CC0 1.0 | MPFB `LICENSE.md` §D: "the MakeHuman team makes no claim whatsoever over output such as … Renderings … We regard these things as your data." |
| Pillow + NumPy | system Python | HPND / BSD | Only used to composite onto #09090b and write the WebP files (scripts/finish_pose.py, composite.py) |

## Assets used in the renders

| Asset | Source (pack / author) | License | How it's used |
|---|---|---|---|
| MakeHuman base mesh, macro targets (gender/age/muscle/weight/proportions/height/ethnicity) | bundled with MPFB 2.0.17 (MakeHuman team) | CC0 1.0 (`mpfb2/LICENSE.ASSETS.md`) | Body shape |
| `game_engine` rig + skin weights | bundled with MPFB 2.0.17 | CC0 1.0 | Skeleton used for posing |
| Skin texture `young_caucasian_male` (young_lightskinned_male_diffuse.png) | makehuman_system_assets pack (makehuman_system) | CC0 | Diffuse colour of the skin. Our own procedural SSS skin shader goes on top. |
| Eyes `high-poly` + material `brown` | makehuman_system_assets | CC0 | Eyes |
| Eyebrows `eyebrow001`, eyelashes `eyelashes01` | makehuman_system_assets | CC0 | Face |
| Teeth `teeth_base`, tongue `tongue01` | makehuman_system_assets | CC0 | Mouth interior |
| Hair `short02` | makehuman_system_assets (mhclo header: "explicitly released as CC0 in september 2020") | CC0 | Hair (tinted dark brown in our shader) |
| Shoes `shoes05` (white sneakers with socks) | makehuman_system_assets (mhclo header: CC0) | CC0 | Footwear, original diffuse texture |
| T-shirt `toigo_basic_tucked_t-shirt` + `T-shirt_basic-bump.png` | shirts01 pack, Margaret Toigo, makehumancommunity.org/node/1203 | CC0 | Top. Our own heather fabric shader. The bump map is used for folds. |
| Pants `toigo_wool_pants` + `Pants_wool.png` | pants01 pack, Margaret Toigo, makehumancommunity.org/node/1194 | CC0 | **Modified by us**: cut off ~10 cm above the knee to make training shorts, with a solidified hem. The texture is only used as a fold bump. |

Pack downloads (all `*_cc0.zip`, from https://files.makehumancommunity.org/asset_packs/):
makehuman_system_assets, shirts01, pants01 (used). Also downloaded but **not used**: skins01, skins02, shoes01,
hair01, underwear04, system_clothes_materials01. The packs list a license for each asset, and every one is CC0 except
`culturalibre_heroine_boots_4` in shoes01, which is CC-BY. It is **not used** and must stay unused unless we credit it.

## Things we made ourselves (no third-party rights)
- Props in the renders: dips/skull-crusher bench, hamstring box, calf-stretch wall and dumbbells. Simple bevelled boxes and cylinders generated in `scripts/render_pose.py`.
- All 38 poses (`scripts/poses.py`), solved with our own IK and mesh-contact code.
- `scripts/*.py`: character build, aim/IK posing, studio, skin and fabric shaders, compositing.
- The procedural skin shader (random-walk SSS, pore bump, roughness variation) and the fabric shaders.
- Studio lighting and camera setup.

## Explicitly NOT used
Mixamo, Daz, Renderpeople, Reallusion, and any asset that is CC-BY, non-commercial, or unclear.
