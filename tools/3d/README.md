# Cardio Burner: 3D-rendered athlete

One realistic CC0 athlete (MakeHuman base via MPFB 2) rendered in Blender Cycles on CPU, in 38 poses
(19 exercises × start/exec). Licenses are in LICENSES.md. Blender, MPFB, the asset packs and .blend
files are not committed; only these scripts are.

Setup (not in git):
```
tools/blender                      -> Blender 4.5.14 LTS (official tarball from download.blender.org)
tools/mpfb-2.0.17.zip              -> MPFB extension built from github.com/makehumancommunity/mpfb2 tag v2.0.17
~/.config/blender/4.5/extensions/.user/user_default/mpfb/data  -> CC0 asset packs from files.makehumancommunity.org
```

Scripts:
```
scripts/build_character.py  -> builds the athlete (body, rig, skin, eyes, hair, tee, cut-down shorts, sneakers) -> scene/character.blend
scripts/posing.py           -> Poser (aim FK + analytic 2-bone IK on the game_engine rig) and Meas (mesh contact measurement)
scripts/poses.py            -> all 38 poses, props (bench/box/wall/dumbbells) and per-exercise camera; solve() drives
                               planted hands/feet/shins/back onto floor, bench or wall to within ~3 mm
scripts/studio.py           -> Cycles settings, lights, shadow-catcher floor, camera, skin and fabric shaders
scripts/render_pose.py      -> renders <exercise>-start/-exec with one shared camera (so the app can hard-cut)
scripts/finish_pose.py      -> composites a raw RGBA render onto #09090b -> 4K PNG + 720x1280 WebP (q85)
scripts/make_manifest.py    -> writes lib/poseFrames.ts (figure bbox per exercise for thumbnail crops)
scripts/preview_all.sh      -> low-res previews of all exercises + contact sheet
scripts/render_all.sh       -> resume-safe sequential 2160x3840 render of all 38 poses into the app's public/
scripts/sheet.py            -> contact sheet helper
```

Typical run:
```
tools/blender -b -P scripts/build_character.py
RES=18 SPP=12 scripts/preview_all.sh /tmp/prev          # check poses
setsid nohup scripts/render_all.sh > renders/render_all.log 2>&1 < /dev/null &
python3 scripts/make_manifest.py renders/raw /workspace/cardio-burner 3d1
```
`CB_BORDER=x0,x1,y0,y1` renders a crop for detail checks. Final renders use 40 samples + OpenImageDenoise.
