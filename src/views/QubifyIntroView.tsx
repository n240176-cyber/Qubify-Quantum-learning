import React, { useEffect, useState } from 'react';

interface QubifyIntroViewProps {
  onComplete: () => void;
}

export const QubifyIntroView: React.FC<QubifyIntroViewProps> = ({
  onComplete,
}) => {
  const [stage, setStage] = useState<
    'energy' | 'forming' | 'locked' | 'leaving'
  >('energy');

  useEffect(() => {
    const t1 = window.setTimeout(() => {
      setStage('forming');
    }, 450);

    const t2 = window.setTimeout(() => {
      setStage('locked');
    }, 2200);

    const t3 = window.setTimeout(() => {
      setStage('leaving');
    }, 3900);

    const t4 = window.setTimeout(() => {
      onComplete();
    }, 4550);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  const logoClass =
    stage === 'energy'
      ? 'opacity-0'
      : 'opacity-100';

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden bg-[#050713] transition-all duration-700 ${
        stage === 'leaving'
          ? 'opacity-0 scale-[1.06] blur-sm'
          : 'opacity-100'
      }`}
    >
      <style>{`

        /* =========================================================
           BACKGROUND
           ========================================================= */

        @keyframes bgPulse {
          0%, 100% {
            opacity: .45;
            transform: scale(.9);
          }

          50% {
            opacity: .8;
            transform: scale(1.08);
          }
        }

        @keyframes starPulse {
          0%, 100% {
            opacity: .2;
            transform: scale(.7);
          }

          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }

        /* =========================================================
           INITIAL ENERGY PARTICLE
           ========================================================= */

        @keyframes energyBirth {
          0% {
            opacity: 0;
            transform: scale(.1);
            box-shadow:
              0 0 0 rgba(34,211,238,0);
          }

          40% {
            opacity: 1;
            transform: scale(1.7);
            box-shadow:
              0 0 45px rgba(34,211,238,.95),
              0 0 100px rgba(217,70,239,.7);
          }

          100% {
            opacity: 1;
            transform: scale(1);
            box-shadow:
              0 0 20px rgba(34,211,238,.8),
              0 0 55px rgba(217,70,239,.4);
          }
        }

        @keyframes energyShock {
          0% {
            opacity: .9;
            transform: scale(.05);
          }

          100% {
            opacity: 0;
            transform: scale(5);
          }
        }

        /* =========================================================
           LOGO FORMATION

           These are multiple copies of the SAME transparent PNG,
           each exposing only one part of the image.

           This makes the flat image look like it is assembling.
           ========================================================= */

        @keyframes formTop {
          0% {
            opacity: 0;
            transform:
              translateY(-90px)
              scale(.55)
              rotate(-16deg);
            filter: blur(13px) brightness(2);
          }

          70% {
            opacity: 1;
            transform:
              translateY(5px)
              scale(1.04)
              rotate(2deg);
          }

          100% {
            opacity: 1;
            transform:
              translateY(0)
              scale(1)
              rotate(0);
            filter: blur(0) brightness(1);
          }
        }

        @keyframes formLeft {
          0% {
            opacity: 0;
            transform:
              translateX(-100px)
              scale(.55)
              rotate(-18deg);
            filter: blur(14px) brightness(1.8);
          }

          100% {
            opacity: 1;
            transform:
              translateX(0)
              scale(1)
              rotate(0);
            filter: blur(0);
          }
        }

        @keyframes formRight {
          0% {
            opacity: 0;
            transform:
              translateX(110px)
              scale(.55)
              rotate(20deg);
            filter: blur(14px) brightness(1.8);
          }

          100% {
            opacity: 1;
            transform:
              translateX(0)
              scale(1)
              rotate(0);
            filter: blur(0);
          }
        }

        @keyframes formBottom {
          0% {
            opacity: 0;
            transform:
              translateY(100px)
              scale(.5);
            filter: blur(14px);
          }

          100% {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
            filter: blur(0);
          }
        }

        @keyframes formCore {
          0% {
            opacity: 0;
            transform: scale(.05);
            filter: blur(18px) brightness(3);
          }

          65% {
            opacity: 1;
            transform: scale(1.22);
            filter: blur(0) brightness(1.8);
          }

          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0) brightness(1);
          }
        }

        /* =========================================================
           FINAL LOGO LOCK
           ========================================================= */

        @keyframes finalLock {
          0% {
            opacity: 0;
            transform: scale(.96);
          }

          50% {
            opacity: 1;
            transform: scale(1.035);
            filter: brightness(1.4);
          }

          100% {
            opacity: 1;
            transform: scale(1);
            filter: brightness(1);
          }
        }

        @keyframes lockRing {
          0% {
            opacity: .9;
            transform: scale(.55);
          }

          100% {
            opacity: 0;
            transform: scale(1.55);
          }
        }

        /* =========================================================
           SVG ORBITS
           ========================================================= */

        @keyframes drawOrbit {
          from {
            stroke-dashoffset: 1000;
          }

          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes rotateOrbit {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes rotateOrbitReverse {
          from {
            transform: rotate(360deg);
          }

          to {
            transform: rotate(0deg);
          }
        }

        @keyframes satelliteGlow {
          0%, 100% {
            filter:
              drop-shadow(0 0 5px #e879f9);
          }

          50% {
            filter:
              drop-shadow(0 0 18px #ec4899);
          }
        }

        /* =========================================================
           TITLE
           ========================================================= */

        @keyframes titleReveal {
          0% {
            opacity: 0;
            transform: translateY(25px);
            letter-spacing: .65em;
            filter: blur(12px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
            letter-spacing: .22em;
            filter: blur(0);
          }
        }

        @keyframes lineReveal {
          from {
            width: 0;
            opacity: 0;
          }

          to {
            width: 100%;
            opacity: 1;
          }
        }

        @keyframes subtitleReveal {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .logo-slice {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          user-select: none;
          pointer-events: none;
        }

        .slice-top {
          clip-path: polygon(
            0 0,
            100% 0,
            100% 39%,
            0 39%
          );

          animation:
            formTop
            .85s
            cubic-bezier(.16,1,.3,1)
            .05s
            both;
        }

        .slice-left {
          clip-path: polygon(
            0 30%,
            48% 30%,
            48% 83%,
            0 83%
          );

          animation:
            formLeft
            .9s
            cubic-bezier(.16,1,.3,1)
            .18s
            both;
        }

        .slice-right {
          clip-path: polygon(
            48% 28%,
            100% 28%,
            100% 84%,
            48% 84%
          );

          animation:
            formRight
            .9s
            cubic-bezier(.16,1,.3,1)
            .28s
            both;
        }

        .slice-bottom {
          clip-path: polygon(
            0 76%,
            100% 76%,
            100% 100%,
            0 100%
          );

          animation:
            formBottom
            .8s
            cubic-bezier(.16,1,.3,1)
            .42s
            both;
        }

        .slice-core {
          clip-path: circle(
            19% at 51% 52%
          );

          animation:
            formCore
            .75s
            cubic-bezier(.16,1,.3,1)
            .55s
            both;
        }

        .finished-logo {
          animation:
            finalLock
            .55s
            cubic-bezier(.16,1,.3,1)
            both;
        }

      `}</style>

      {/* =========================================================
          AMBIENT BACKGROUND
          ========================================================= */}

      <div className="absolute inset-0 pointer-events-none">

        <div
          className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-purple-600/10 blur-[120px]"
          style={{
            animation:
              'bgPulse 3s ease-in-out infinite',
          }}
        />

        <div className="absolute inset-0">
          {[
            ['14%', '20%', 'cyan'],
            ['21%', '72%', 'purple'],
            ['83%', '26%', 'pink'],
            ['75%', '78%', 'cyan'],
            ['42%', '12%', 'white'],
            ['61%', '88%', 'purple'],
          ].map(
            ([left, top, type], i) => (
              <div
                key={i}
                className={`absolute w-1.5 h-1.5 rounded-full ${
                  type === 'cyan'
                    ? 'bg-cyan-300'
                    : type === 'pink'
                    ? 'bg-pink-400'
                    : type === 'white'
                    ? 'bg-white'
                    : 'bg-purple-300'
                }`}
                style={{
                  left,
                  top,
                  animation:
                    `starPulse ${
                      2.2 + i * 0.17
                    }s ease-in-out ${
                      i * 0.22
                    }s infinite`,
                }}
              />
            )
          )}
        </div>
      </div>

      {/* =========================================================
          CENTER
          ========================================================= */}

      <div className="relative z-20 w-full h-full flex flex-col items-center justify-center px-6">

        <div className="relative w-[315px] h-[315px] sm:w-[390px] sm:h-[390px]">

          {/* =====================================================
              ENERGY BIRTH
              ===================================================== */}

          {stage === 'energy' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div
                  className="w-5 h-5 rounded-full bg-cyan-300"
                  style={{
                    animation:
                      'energyBirth .7s ease-out both',
                  }}
                />

                <div
                  className="absolute inset-[-14px] rounded-full border border-cyan-300"
                  style={{
                    animation:
                      'energyShock .8s ease-out .15s both',
                  }}
                />
              </div>
            </div>
          )}

          {/* =====================================================
              ORBIT DRAWING
              ===================================================== */}

          {stage !== 'energy' && (
            <>
              <svg
                className="absolute inset-[-35px] w-[calc(100%+70px)] h-[calc(100%+70px)]"
                viewBox="0 0 500 500"
              >
                <ellipse
                  cx="250"
                  cy="250"
                  rx="195"
                  ry="118"
                  transform="rotate(-14 250 250)"
                  fill="none"
                  stroke="url(#orbitGradient)"
                  strokeWidth="1.6"
                  strokeDasharray="1000"
                  strokeDashoffset="1000"
                  style={{
                    animation:
                      'drawOrbit 1.2s ease-out .15s forwards',
                  }}
                />

                <ellipse
                  cx="250"
                  cy="250"
                  rx="155"
                  ry="205"
                  transform="rotate(20 250 250)"
                  fill="none"
                  stroke="rgba(103,232,249,.18)"
                  strokeWidth="1"
                  strokeDasharray="1000"
                  strokeDashoffset="1000"
                  style={{
                    animation:
                      'drawOrbit 1.4s ease-out .35s forwards',
                  }}
                />

                <defs>
                  <linearGradient
                    id="orbitGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#22D3EE"
                    />

                    <stop
                      offset="50%"
                      stopColor="#A855F7"
                    />

                    <stop
                      offset="100%"
                      stopColor="#EC4899"
                    />
                  </linearGradient>
                </defs>
              </svg>

              {/* moving satellite */}
              <div
                className="absolute inset-[-24px]"
                style={{
                  animation:
                    'rotateOrbit 5s linear infinite',
                }}
              >
                <div
                  className="absolute left-1/2 top-[-2px] w-3.5 h-3.5 rounded-full bg-fuchsia-400"
                  style={{
                    animation:
                      'satelliteGlow 1.5s ease-in-out infinite',
                  }}
                />
              </div>
            </>
          )}

          {/* =====================================================
              FORMATION LOGO
              ===================================================== */}

          {stage === 'forming' && (
            <div
              className={`absolute inset-0 ${logoClass}`}
            >
              <img
                src="/qubify-logo-v2.png"
                className="logo-slice slice-top"
                draggable={false}
              />

              <img
                src="/qubify-logo-v2.png"
                className="logo-slice slice-left"
                draggable={false}
              />

              <img
                src="/qubify-logo-v2.png"
                className="logo-slice slice-right"
                draggable={false}
              />

              <img
                src="/qubify-logo-v2.png"
                className="logo-slice slice-bottom"
                draggable={false}
              />

              <img
                src="/qubify-logo-v2.png"
                className="logo-slice slice-core"
                draggable={false}
              />
            </div>
          )}

          {/* =====================================================
              FINISHED LOGO
              ===================================================== */}

          {(stage === 'locked' ||
            stage === 'leaving') && (
            <>
              <img
                src="/qubify-logo-v2.png"
                alt="Qubify"
                draggable={false}
                className="finished-logo absolute inset-0 w-full h-full object-contain select-none drop-shadow-[0_25px_40px_rgba(217,70,239,.30)]"
              />

              <div
                className="absolute inset-[14%] rounded-full border border-cyan-300/50"
                style={{
                  animation:
                    'lockRing .8s ease-out both',
                }}
              />
            </>
          )}
        </div>

        {/* =========================================================
            BRAND TEXT
            ========================================================= */}

        <div
          className={`text-center mt-2 transition-opacity duration-500 ${
            stage === 'locked' ||
            stage === 'leaving'
              ? 'opacity-100'
              : 'opacity-0'
          }`}
        >
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-black text-white"
            style={{
              animation:
                stage === 'locked'
                  ? 'titleReveal .8s cubic-bezier(.16,1,.3,1) both'
                  : undefined,
            }}
          >
            QUBIFY
          </h1>

          <div className="mx-auto mt-4 w-[280px] max-w-full h-px bg-[#243B55] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500"
              style={{
                animation:
                  stage === 'locked'
                    ? 'lineReveal .8s ease-out .3s both'
                    : undefined,
              }}
            />
          </div>

          <p
            className="mt-4 text-xs sm:text-sm font-mono tracking-[0.22em] text-[#94A3B8]"
            style={{
              animation:
                stage === 'locked'
                  ? 'subtitleReveal .7s ease-out .55s both'
                  : undefined,
            }}
          >
            LEARN
            <span className="mx-3 text-cyan-400">
              •
            </span>

            VISUALIZE

            <span className="mx-3 text-purple-400">
              •
            </span>

            SIMULATE
          </p>

          <p
            className={`mt-3 text-xs text-[#64748B] transition-all duration-700 delay-700 ${
              stage === 'locked'
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2'
            }`}
          >
            Build intuition. Run quantum circuits.
          </p>
        </div>
      </div>
    </div>
  );
};