#!/bin/bash
# Low-res preview of all (or given) exercises + contact sheet.  usage: preview_all.sh outdir [ex1 ex2 ...]
cd "$(dirname "$0")/.."
OUT=${1:-/tmp/cbprev}; shift
EXS=${@:-planks burpees jogging dips lunges squats push-ups sit-ups skull-crushers downward-dog warrior childs-pose cobra hip-flexor hamstring chest-opener shoulder-stretch quad-stretch calf-stretch}
mkdir -p $OUT
for e in $EXS; do
  tools/blender -b scene/character.blend -P scripts/render_pose.py -- $e $OUT ${RES:-15} ${SPP:-12} > $OUT/$e.log 2>&1
  grep -E "SOLVE|CONTACTS|WARN|CAM|Error|Traceback" $OUT/$e.log | grep -v "^Read" 
done
files=""; for e in $EXS; do files="$files $OUT/$e-start.png $OUT/$e-exec.png"; done
python3 scripts/sheet.py $OUT/sheet.png 8 240 $files
