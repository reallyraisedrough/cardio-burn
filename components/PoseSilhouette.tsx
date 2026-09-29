/** Crisp full-body silhouettes. No photos, no room, no stick figures. */
export function PoseSilhouette() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <svg
        className="absolute bottom-[7%] left-[3%] h-[48%] w-auto"
        viewBox="0 0 200 270"
        fill="#f4f4f5"
        fillOpacity={0.46}
        stroke="#ffffff"
        strokeOpacity={0.55}
        strokeWidth={1.25}
        strokeLinejoin="round"
        shapeRendering="geometricPrecision"
      >
        <path d="M86 150 C74 158 58 176 50 196 C44 214 40 234 38 250 L34 258 C32 266 40 270 52 266 L66 260 C70 246 74 230 80 214 C88 196 100 178 110 166 C116 158 104 146 92 150 Z" />
        <path d="M104 146 C126 150 148 162 158 180 C166 196 164 216 160 234 C158 246 162 256 176 258 L184 264 L156 268 C146 260 140 248 138 234 L132 206 C126 188 112 172 96 164 C84 158 90 144 104 146 Z" />
        <path d="M78 78 C70 92 66 112 70 132 C72 146 66 156 58 164 C50 172 52 184 66 186 C84 188 102 176 112 162 C122 146 128 124 126 104 C124 88 116 76 106 70 L96 74 C90 70 84 72 78 78 Z" />
        <ellipse cx="102" cy="46" rx="20" ry="24" />
        <path d="M118 42 C126 46 128 54 118 56 C122 50 120 46 118 42 Z" />
        <path d="M92 66 L112 68 L114 82 L88 80 Z" />
        <path d="M112 86 C132 80 156 78 174 84 C184 88 184 100 172 104 L140 108 C122 110 108 106 100 98 C96 92 100 86 112 86 Z" />
      </svg>

      <svg
        className="absolute right-[1%] top-[16%] h-[30%] w-auto"
        viewBox="0 0 340 160"
        fill="#f4f4f5"
        fillOpacity={0.44}
        stroke="#ffffff"
        strokeOpacity={0.55}
        strokeWidth={1.25}
        strokeLinejoin="round"
        shapeRendering="geometricPrecision"
      >
        <path d="M72 58 L248 58 C264 58 272 68 274 82 L280 116 L296 142 L262 146 L250 116 L238 92 L72 92 Z" />
        <path d="M64 78 L86 78 L90 100 L86 142 L60 146 L46 134 L50 100 L56 78 Z" />
        <ellipse cx="48" cy="72" rx="22" ry="18" />
        <path d="M64 66 C76 72 76 84 64 88 C70 80 68 72 64 66 Z" />
        <path d="M58 84 L74 84 L72 96 L56 94 Z" />
      </svg>

      <svg
        className="absolute left-[26%] top-[5%] h-[28%] w-auto"
        viewBox="0 0 340 170"
        fill="#f4f4f5"
        fillOpacity={0.38}
        stroke="#ffffff"
        strokeOpacity={0.55}
        strokeWidth={1.25}
        strokeLinejoin="round"
        shapeRendering="geometricPrecision"
      >
        <path d="M74 96 L236 100 C252 102 260 112 262 124 L268 146 L286 160 L252 162 L242 140 L228 124 L74 120 Z" />
        <path d="M78 108 L122 116 L132 128 L114 130 L102 146 L90 162 L66 160 L62 146 L76 128 L70 114 Z" />
        <ellipse cx="50" cy="104" rx="22" ry="18" />
        <path d="M66 98 C78 104 78 116 66 120 C72 112 70 104 66 98 Z" />
        <path d="M58 116 L76 118 L72 130 L56 126 Z" />
      </svg>

      <svg
        className="absolute bottom-[4%] right-[6%] h-[46%] w-auto"
        viewBox="0 0 220 300"
        fill="#f4f4f5"
        fillOpacity={0.4}
        stroke="#ffffff"
        strokeOpacity={0.55}
        strokeWidth={1.25}
        strokeLinejoin="round"
        shapeRendering="geometricPrecision"
      >
        <path d="M96 168 C70 176 40 186 22 198 C10 206 6 220 12 232 L18 248 C22 258 18 268 10 272 L36 278 C46 268 50 256 52 244 L64 220 C76 202 92 190 108 182 C116 176 108 164 96 168 Z" />
        <path d="M118 162 C146 154 170 162 182 182 C190 198 188 220 184 240 C182 252 188 262 204 264 L212 272 L180 278 C168 268 162 254 160 240 L154 208 C148 188 132 176 114 174 C100 170 104 160 118 162 Z" />
        <path d="M104 86 C96 104 94 128 98 150 C100 162 96 172 108 178 C126 186 148 176 156 158 C164 138 164 112 158 94 C154 82 144 72 132 70 L118 76 C110 74 106 78 104 86 Z" />
        <ellipse cx="128" cy="42" rx="20" ry="24" />
        <path d="M144 38 C154 44 154 54 144 56 C150 50 148 44 144 38 Z" />
        <path d="M116 62 L136 64 L138 84 L114 80 Z" />
        <path d="M148 96 C158 112 162 132 156 150 C152 160 142 160 138 150 L136 128 C132 112 130 100 126 92 C138 88 144 90 148 96 Z" />
      </svg>
    </div>
  );
}
