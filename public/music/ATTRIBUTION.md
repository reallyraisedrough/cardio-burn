# Workout music — sources and licenses

Every track below is released under **CC0 1.0 Universal (Public Domain Dedication)**.
CC0 waives all copyright and related rights: the work may be copied, modified,
distributed and used commercially (including inside a paid app) without asking
permission and without attribution. Attribution is not required; we credit the
artists anyway as thanks.

License text: https://creativecommons.org/publicdomain/zero/1.0/
Legal code: https://creativecommons.org/publicdomain/zero/1.0/legalcode

Each license was verified on the track's source page ("License(s): CC0") on
2026-10-07. No CC-BY-NC, CC-BY-ND, YouTube rips, or Content ID–registered
material is included.

| File | Title | Artist | Source | License |
| --- | --- | --- | --- | --- |
| `empacotatron.mp3` | Empacotatron (full) | Fupi | https://opengameart.org/content/empacotatron | CC0 1.0 |
| `city-loop.mp3` | City Loop | wipics | https://opengameart.org/content/city-loop-0 | CC0 1.0 (page notice: "Public Domain") |
| `160bpm-electronic-loop.mp3` | 160BPM Electronic Loop | RUOK | https://opengameart.org/content/160bpm-electronic-loop | CC0 1.0 |
| `chiptune-adventures-stage-1.mp3` | Stage 1 (Chiptune Adventures) | Juhani Junkala (SubspaceAudio) | https://opengameart.org/content/4-chiptunes-adventure | CC0 1.0 (pack INFO.txt: "released under CC0 creative commons license") |
| `chiptune-adventures-boss-fight.mp3` | Boss Fight (Chiptune Adventures) | Juhani Junkala (SubspaceAudio) | https://opengameart.org/content/4-chiptunes-adventure | CC0 1.0 (pack INFO.txt: "released under CC0 creative commons license") |

## Processing

Downloaded from the original source files (FLAC / WAV / MP3), loudness-normalized
(EBU R128, −15 LUFS) and encoded to 128 kbps stereo MP3 with ffmpeg. No other edits.

## Use in the app

Played locally by `lib/music.ts` during workouts. Tracks are not precached by the
service worker; each one is cached the first time it plays. Music settings
(on/off, volume) are stored in `localStorage` on the device only.
