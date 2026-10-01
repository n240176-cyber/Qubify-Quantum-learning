import React from 'react';

interface BlochSphereVisualizerProps {
  /**
   * Polar angle in radians:
   * 0 = North Pole (|0⟩)
   * Math.PI / 2 = Equator (superposition)
   * Math.PI = South Pole (|1⟩)
   */
  theta: number;
  /**
   * Azimuthal angle in radians:
   * Defaults to Math.PI * 0.28 for natural 3D perspective.
   */
  phi?: number;
  /**
   * Whether to show subtle equator and vertical polar axis.
   */
  showEquator?: boolean;
  showAxes?: boolean;
  /**
   * Whether to display "center" label near origin dot
   */
  showCenterLabel?: boolean;
  /**
   * Whether to display "state vector" text next to the arrow shaft
   */
  showVectorLabel?: boolean;
  /**
   * Highlight status for poles, superposition, or phase states (+, -)
   */
  highlight?: '0' | '1' | 'superposition' | '+' | '-' | null;
  /**
   * Current state label near tip (e.g. '|ψ⟩', '|0⟩', '|1⟩', '|+⟩', '|−⟩')
   */
  stateLabel?: string;
  /**
   * Whether to display explicit |+⟩ and |−⟩ state markers on opposite sides of the equator
   */
  showPhaseMarkers?: boolean;
  /**
   * Subtle safety note under sphere
   */
  subtleNote?: string;
  /**
   * Secondary note under sphere (e.g. "The arrow shows the qubit’s state on this visual map.")
   */
  secondaryNote?: string;
  /**
   * Size in pixels (viewBox square)
   */
  size?: number;
  /**
   * High-contrast pointer color accent (default: cyan)
   */
  pointerAccent?: 'cyan' | 'purple' | 'amber' | 'emerald';
  /**
   * Highlight the Y-axis rotation stick (passing through center, depth direction)
   */
  showYAxisStick?: boolean;
  /**
   * Highlight the X-axis rotation stick (horizontal through |+⟩ and |−⟩)
   */
  showXAxisStick?: boolean;
  /**
   * Highlight the Z-axis rotation stick (vertical through |0⟩ and |1⟩)
   */
  showZAxisStick?: boolean;
}

export const BlochSphereVisualizer: React.FC<BlochSphereVisualizerProps> = ({
  theta,
  phi = Math.PI * 0.28,
  showEquator = true,
  showAxes = true,
  showCenterLabel = true,
  showVectorLabel = true,
  highlight = null,
  stateLabel = '|ψ⟩',
  showPhaseMarkers = false,
  subtleNote = 'Visualization only — not the physical qubit.',
  secondaryNote,
  size = 360,
  pointerAccent = 'cyan',
  showYAxisStick = false,
  showXAxisStick = false,
  showZAxisStick = false,
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.35; // Sphere radius (e.g. 126px for 360)

  // Pitch angle for 3D tilt (16 degrees in radians)
  const pitch = 16 * (Math.PI / 180);
  const sinPitch = Math.sin(pitch);
  const equatorRy = R * sinPitch; // Vertical semi-minor axis of equator ellipse

  // Clamp theta between 0 and PI
  const clampedTheta = Math.max(0, Math.min(Math.PI, theta));

  // Compute 3D spherical coordinates:
  // z along polar axis (+1 at North Pole, -1 at South Pole)
  // r is distance from polar axis
  // x is horizontal on screen
  // y is depth (positive towards viewer)
  const z = Math.cos(clampedTheta);
  const r = Math.sin(clampedTheta);
  const x = r * Math.cos(phi);
  const y = r * Math.sin(phi);

  // Projected 2D screen coordinates of state tip on sphere surface:
  // At theta = 0: x=0, y=0, z=1 => px = cx, py = cy - R (exact top pole)
  // At theta = PI: x=0, y=0, z=-1 => px = cx, py = cy + R (exact bottom pole)
  // At theta = PI/2: z=0 => py = cy + R * y * sinPitch (on equator ellipse)
  const px = cx + R * x;
  const py = cy - R * z + R * y * sinPitch;

  // Vector geometry from center (cx, cy) to tip (px, py)
  const dx = px - cx;
  const dy = py - cy;
  const len = Math.hypot(dx, dy);

  // Arrowhead calculation
  const hasVector = len >= 4;
  const ux = hasVector ? dx / len : 0;
  const uy = hasVector ? dy / len : -1;
  const vx = -uy;
  const vy = ux;

  const headLen = 13;
  const headHalfWidth = 5.5;

  // Base of arrowhead
  const bx = px - ux * headLen;
  const by = py - uy * headLen;

  // Wings of arrowhead
  const w1x = bx + vx * headHalfWidth;
  const w1y = by + vy * headHalfWidth;
  const w2x = bx - vx * headHalfWidth;
  const w2y = by - vy * headHalfWidth;

  // Base center notch (for crisp sleek arrowhead shape)
  const cnx = bx + ux * 2.5;
  const cny = by + uy * 2.5;

  // Shaft connects center (cx, cy) to arrowhead base notch (cnx, cny)
  const shaftEndX = hasVector ? cnx : cx;
  const shaftEndY = hasVector ? cny : cy - 8;

  // Midpoint for "state vector" text label
  const midX = (cx + px) / 2;
  const midY = (cy + py) / 2;
  const isRightSide = px >= cx;
  const vecLabelX = midX + (isRightSide ? 10 : -10);
  const vecLabelY = midY + 3;
  const vecLabelAnchor = isRightSide ? 'start' : 'end';

  // State label placement near tip
  let stateBadgeX = px + 16;
  let stateBadgeY = py + 6;
  if (clampedTheta < 0.15) {
    // Near |0⟩ top pole
    stateBadgeX = px + 16;
    stateBadgeY = py + 6;
  } else if (clampedTheta > Math.PI - 0.15) {
    // Near |1⟩ bottom pole
    stateBadgeX = px + 16;
    stateBadgeY = py - 4;
  } else {
    stateBadgeX = px + (px >= cx ? 14 : -42);
    stateBadgeY = py + (py >= cy ? 8 : -8);
  }

  // Pointer color palettes
  const colorMap = {
    cyan: {
      line: '#38BDF8', // Sky 400
      tip: '#0EA5E9',
      glow: 'rgba(56, 189, 248, 0.45)',
      text: '#38BDF8',
    },
    purple: {
      line: '#C084FC', // Purple 400
      tip: '#A855F7',
      glow: 'rgba(192, 132, 252, 0.45)',
      text: '#C084FC',
    },
    amber: {
      line: '#FBBF24', // Amber 400
      tip: '#F59E0B',
      glow: 'rgba(251, 191, 36, 0.45)',
      text: '#FBBF24',
    },
    emerald: {
      line: '#34D399', // Emerald 400
      tip: '#10B981',
      glow: 'rgba(52, 211, 153, 0.45)',
      text: '#34D399',
    },
  };

  const activeColor = colorMap[pointerAccent];

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
        >
          <defs>
            {/* Sphere 3D body gradient: dark translucent blue-gray with calm specular lighting */}
            <radialGradient id="blochBodyGrad" cx="38%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#1E293B" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#0F172A" stopOpacity="0.95" />
              <stop offset="85%" stopColor="#08111F" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#030712" stopOpacity="1" />
            </radialGradient>

            {/* Subtle atmosphere rim */}
            <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#818CF8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#C084FC" stopOpacity="0.3" />
            </linearGradient>

            {/* Pointer arrow gradient */}
            <linearGradient id="pointerLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9" />
              <stop offset="100%" stopColor={activeColor.line} stopOpacity="1" />
            </linearGradient>

            {/* Filter for subtle glow */}
            <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Main Sphere Silhouette & 3D fill */}
          <circle
            cx={cx}
            cy={cy}
            r={R}
            fill="url(#blochBodyGrad)"
            stroke="url(#rimGrad)"
            strokeWidth="1.75"
            className="drop-shadow-xl"
          />

          {/* 2. Equator: Back half (dashed for 3D depth) */}
          {showEquator && (
            <path
              d={`M ${cx - R} ${cy} A ${R} ${equatorRy} 0 0 1 ${cx + R} ${cy}`}
              fill="none"
              stroke="#475569"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              strokeOpacity="0.6"
            />
          )}

          {/* 3. Central Vertical Polar Axis (Z-axis between |0⟩ and |1⟩) */}
          {showAxes && (
            <line
              x1={cx}
              y1={cy - R - 14}
              x2={cx}
              y2={cy + R + 14}
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray="3 3"
              strokeOpacity="0.7"
            />
          )}

          {/* 4. Equator: Front half (solid line curving towards viewer) */}
          {showEquator && (
            <path
              d={`M ${cx - R} ${cy} A ${R} ${equatorRy} 0 0 0 ${cx + R} ${cy}`}
              fill="none"
              stroke="#64748B"
              strokeWidth="1.4"
              strokeOpacity="0.7"
            />
          )}

          {/* 4b. X-Axis Stick (Horizontal: through |−⟩ and |+⟩) */}
          {showXAxisStick && (
            <g className="pointer-events-none select-none">
              <line
                x1={cx - R - 18}
                y1={cy}
                x2={cx + R + 18}
                y2={cy}
                stroke="#38BDF8"
                strokeWidth="2.5"
                strokeDasharray="4 2"
                strokeOpacity="0.9"
              />
              <circle cx={cx - R - 18} cy={cy} r="3" fill="#38BDF8" />
              <circle cx={cx + R + 18} cy={cy} r="3" fill="#38BDF8" />
              <text
                x={cx + R + 24}
                y={cy + 4}
                fill="#38BDF8"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
              >
                X-axis stick
              </text>
            </g>
          )}

          {/* 4c. Y-Axis Stick (Depth Axis: into and out of the screen through center) */}
          {showYAxisStick && (
            <g className="pointer-events-none select-none">
              {/* Perspective depth line passing tilted through center */}
              <line
                x1={cx - 52}
                y1={cy + 36}
                x2={cx + 52}
                y2={cy - 36}
                stroke="#F59E0B"
                strokeWidth="3"
                strokeLinecap="round"
                className="drop-shadow-lg"
              />
              {/* Back end (going into screen) */}
              <circle cx={cx + 52} cy={cy - 36} r="4" fill="#B45309" stroke="#F59E0B" strokeWidth="1" />
              <text
                x={cx + 58}
                y={cy - 38}
                fill="#FBBF24"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
                opacity="0.95"
              >
                into screen (depth)
              </text>

              {/* Front end (coming out towards viewer) */}
              <circle cx={cx - 52} cy={cy + 36} r="5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
              <text
                x={cx - 60}
                y={cy + 42}
                textAnchor="end"
                fill="#FBBF24"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
                opacity="0.95"
              >
                out of screen (+Y)
              </text>

              {/* Central stick label */}
              <rect
                x={cx - 44}
                y={cy - 26}
                width="88"
                height="16"
                rx="4"
                fill="#0F172A"
                fillOpacity="0.9"
                stroke="#F59E0B"
                strokeWidth="1"
              />
              <text
                x={cx}
                y={cy - 14}
                textAnchor="middle"
                fill="#FCD34D"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                Y-AXIS STICK
              </text>
            </g>
          )}

          {/* 4d. Z-Axis Stick (Vertical: through |0⟩ and |1⟩) */}
          {showZAxisStick && (
            <g className="pointer-events-none select-none">
              <line
                x1={cx}
                y1={cy - R - 20}
                x2={cx}
                y2={cy + R + 20}
                stroke="#A855F7"
                strokeWidth="2.5"
                strokeDasharray="4 2"
                strokeOpacity="0.9"
              />
              <circle cx={cx} cy={cy - R - 20} r="3.5" fill="#A855F7" />
              <circle cx={cx} cy={cy + R + 20} r="3.5" fill="#A855F7" />
              <rect
                x={cx + 10}
                y={cy - 8}
                width="84"
                height="16"
                rx="4"
                fill="#0F172A"
                fillOpacity="0.9"
                stroke="#A855F7"
                strokeWidth="1"
              />
              <text
                x={cx + 14}
                y={cy + 4}
                fill="#D8B4FE"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                Z-axis stick
              </text>
            </g>
          )}

          {/* 5. CENTER OF THE SPHERE */}
          {/* Subtle outer dashed ring around center */}
          <circle
            cx={cx}
            cy={cy}
            r="8"
            fill="none"
            stroke="#64748B"
            strokeWidth="1"
            strokeDasharray="2 2"
            opacity="0.6"
          />
          {/* Solid prominent center core dot */}
          <circle
            cx={cx}
            cy={cy}
            r="4.5"
            fill="#F8FAFC"
            stroke="#0F172A"
            strokeWidth="1.75"
          />

          {/* Center text label and pointer guide */}
          {showCenterLabel && (
            <g className="pointer-events-none select-none">
              <text
                x={cx - 13}
                y={cy + 3.5}
                textAnchor="end"
                fill="#94A3B8"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="600"
                opacity="0.9"
              >
                center
              </text>
              <line
                x1={cx - 11}
                y1={cy}
                x2={cx - 5}
                y2={cy}
                stroke="#64748B"
                strokeWidth="1"
                opacity="0.6"
              />
            </g>
          )}

          {/* 6. STATE VECTOR / ARROW (Starting at exact center, terminating on surface) */}
          {/* Shaft line: from center (cx, cy) to arrowhead base */}
          <line
            x1={cx}
            y1={cy}
            x2={shaftEndX}
            y2={shaftEndY}
            stroke="url(#pointerLineGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Arrowhead: crisp polygon pointing toward current state on the surface */}
          {hasVector && (
            <polygon
              points={`${px},${py} ${w1x},${w1y} ${cnx},${cny} ${w2x},${w2y}`}
              fill={activeColor.line}
              stroke="#FFFFFF"
              strokeWidth="0.5"
            />
          )}

          {/* Tip Glow Halo */}
          <circle
            cx={px}
            cy={py}
            r="7"
            fill={activeColor.glow}
            filter="url(#softGlow)"
          />

          {/* Tip Needle Point Node (Optionally a small point at the arrow tip) */}
          <circle
            cx={px}
            cy={py}
            r="3"
            fill="#FFFFFF"
          />

          {/* "state vector" descriptive label along arrow shaft */}
          {showVectorLabel && (
            <text
              x={vecLabelX}
              y={vecLabelY}
              textAnchor={vecLabelAnchor}
              fill={activeColor.line}
              fontSize="9"
              fontFamily="monospace"
              fontWeight="600"
              opacity="0.85"
              className="pointer-events-none select-none tracking-wide"
            >
              state vector
            </text>
          )}

          {/* State Label Floating Near Arrow Tip */}
          {stateLabel && (
            <g
              transform={`translate(${stateBadgeX}, ${stateBadgeY})`}
              className="pointer-events-none select-none"
            >
              <rect
                x="-4"
                y="-13"
                width="34"
                height="18"
                rx="5"
                fill="#0F172A"
                fillOpacity="0.9"
                stroke={activeColor.line}
                strokeWidth="1"
                strokeOpacity="0.75"
              />
              <text
                x="13"
                y="0"
                textAnchor="middle"
                fill="#F8FAFC"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {stateLabel}
              </text>
            </g>
          )}

          {/* 7. North Pole: |0⟩ (Top) */}
          <g transform={`translate(${cx}, ${cy - R})`}>
            <circle
              r={highlight === '0' ? '5.5' : '4'}
              fill={highlight === '0' ? '#22D3EE' : '#0F172A'}
              stroke="#22D3EE"
              strokeWidth={highlight === '0' ? '2.5' : '1.5'}
              className="transition-all duration-300"
            />
            <text
              x="0"
              y="-12"
              textAnchor="middle"
              fill="#22D3EE"
              fontSize="14"
              fontFamily="monospace"
              fontWeight="bold"
              className="select-none drop-shadow"
            >
              |0⟩
            </text>
          </g>

          {/* 8. South Pole: |1⟩ (Bottom) */}
          <g transform={`translate(${cx}, ${cy + R})`}>
            <circle
              r={highlight === '1' ? '5.5' : '4'}
              fill={highlight === '1' ? '#A78BFA' : '#0F172A'}
              stroke="#A78BFA"
              strokeWidth={highlight === '1' ? '2.5' : '1.5'}
              className="transition-all duration-300"
            />
            <text
              x="0"
              y="22"
              textAnchor="middle"
              fill="#A78BFA"
              fontSize="14"
              fontFamily="monospace"
              fontWeight="bold"
              className="select-none drop-shadow"
            >
              |1⟩
            </text>
          </g>

          {/* 9. Optional Equator / Superposition indicator */}
          {highlight === 'superposition' && (
            <g transform={`translate(${cx + R + 14}, ${cy})`}>
              <text
                x="0"
                y="4"
                fill="#CBD5E1"
                fontSize="10"
                fontFamily="monospace"
                opacity="0.85"
              >
                Equator
              </text>
            </g>
          )}

          {/* 10. Equator Phase Markers: |+⟩ and |−⟩ on opposite sides */}
          {showPhaseMarkers && (
            <g className="pointer-events-none select-none">
              {/* |+⟩ marker on right side of equator */}
              <g transform={`translate(${cx + R}, ${cy})`}>
                {highlight === '+' && (
                  <circle
                    r="9"
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    opacity="0.9"
                  />
                )}
                <circle
                  r={highlight === '+' ? '5' : '3.5'}
                  fill={highlight === '+' ? '#34D399' : '#0F172A'}
                  stroke="#34D399"
                  strokeWidth={highlight === '+' ? '2' : '1.5'}
                />
                <text
                  x="12"
                  y="4"
                  textAnchor="start"
                  fill="#34D399"
                  fontSize="12"
                  fontFamily="monospace"
                  fontWeight="bold"
                  className="drop-shadow"
                >
                  |+⟩
                </text>
              </g>

              {/* |−⟩ marker on left side of equator */}
              <g transform={`translate(${cx - R}, ${cy})`}>
                {highlight === '-' && (
                  <circle
                    r="9"
                    fill="none"
                    stroke="#C084FC"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    opacity="0.9"
                  />
                )}
                <circle
                  r={highlight === '-' ? '5' : '3.5'}
                  fill={highlight === '-' ? '#C084FC' : '#0F172A'}
                  stroke="#C084FC"
                  strokeWidth={highlight === '-' ? '2' : '1.5'}
                />
                <text
                  x="-12"
                  y="4"
                  textAnchor="end"
                  fill="#C084FC"
                  fontSize="12"
                  fontFamily="monospace"
                  fontWeight="bold"
                  className="drop-shadow"
                >
                  |−⟩
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* Subtle Persistent Safety Note */}
      {subtleNote && (
        <p className="mt-3 text-[11px] font-mono text-[#64748B] tracking-wider text-center select-none flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#475569]"></span>
          <span>{subtleNote}</span>
        </p>
      )}

      {/* Optional Secondary Note */}
      {secondaryNote && (
        <p className="mt-1 text-[11px] font-mono text-[#38BDF8] tracking-wider text-center select-none opacity-90">
          {secondaryNote}
        </p>
      )}
    </div>
  );
};

