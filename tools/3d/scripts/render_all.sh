#!/bin/bash
# Resume-safe sequential render of all 38 poses at 2160x3840.
# Raw RGBA renders go to renders/raw/; a pose is skipped when its raw PNG is complete.
# Each finished raw is composited to public/poses-4k/<slug>.png and public/poses/<slug>.webp.
cd "$(dirname "$0")/.."
APP=${APP:-/workspace/cardio-burner}
SPP=${SPP:-40}
RAW=renders/raw
mkdir -p $RAW $APP/public/poses-4k $APP/public/poses
EXS=${@:-planks burpees jogging dips lunges squats push-ups sit-ups skull-crushers downward-dog warrior childs-pose cobra hip-flexor hamstring chest-opener shoulder-stretch quad-stretch calf-stretch}
ok() { python3 -c "from PIL import Image;im=Image.open('$1');im.load();assert im.size==(2160,3840)" 2>/dev/null; }
T0=$(date +%s)
for e in $EXS; do
  todo=""
  for ph in start exec; do ok $RAW/$e-$ph.png || todo="$todo,$ph"; done
  todo=${todo#,}
  if [ -n "$todo" ]; then
    echo "$(date +%T) render $e [$todo]"
    tools/blender -b scene/character.blend -P scripts/render_pose.py -- $e $RAW 100 $SPP $todo > $RAW/$e.log 2>&1
    grep -E "RENDER_TIME|WARN|Error" $RAW/$e.log
  fi
  for ph in start exec; do
    if ok $RAW/$e-$ph.png; then
      if [ ! -f $APP/public/poses/$e-$ph.webp ] || [ $RAW/$e-$ph.png -nt $APP/public/poses/$e-$ph.webp ]; then
        python3 scripts/finish_pose.py $RAW/$e-$ph.png $APP/public/poses-4k/$e-$ph.png $APP/public/poses/$e-$ph.webp
      fi
    else
      echo "MISSING $e-$ph"
    fi
  done
done
echo "ALL_DONE in $(( $(date +%s) - T0 ))s"
