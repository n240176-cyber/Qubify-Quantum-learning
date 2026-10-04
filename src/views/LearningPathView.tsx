import React from 'react';
import { LearningNodeItem, UserStats } from '../types';
import { LearningNode } from '../components/learning/LearningNode';
import { ProgressBar } from '../components/common/ProgressBar';
import { CURRICULUM_SECTIONS } from '../data/learningData';
import {
  GraduationCap,
  Lock,
  Sparkles,
} from 'lucide-react';

interface LearningPathViewProps {
  beginnerNodes: LearningNodeItem[];
  intermediateNodes: LearningNodeItem[];
  userStats: UserStats;
  onSelectNode: (item: LearningNodeItem) => void;
}

export const LearningPathView: React.FC<LearningPathViewProps> = ({
  beginnerNodes,
  intermediateNodes,
  userStats,
  onSelectNode,
}) => {
  const allNodes = [
    ...beginnerNodes,
    ...intermediateNodes,
  ];

  /*
   * Only the active core curriculum counts toward progress.
   * Advanced Quantum is future scope.
   */
  const coreNodeIds = new Set(
    CURRICULUM_SECTIONS
      .filter((section) => !section.isFuture)
      .flatMap((section) => section.nodeIds)
  );

  const coreNodes = allNodes.filter((node) =>
    coreNodeIds.has(node.id)
  );

  const completedCount = coreNodes.filter(
    (node) => node.status === 'completed'
  ).length;

  const totalCount = coreNodes.length;

  const overallProgress =
    totalCount > 0
      ? Math.round((completedCount / totalCount) * 100)
      : 0;

  /*
   * Exact horizontal coordinates used by BOTH:
   * - lesson nodes
   * - curved connectors
   *
   * Therefore every curve connects directly to the nodes.
   */
  const getNodeX = (
    index: number,
    total: number
  ) => {
    if (total <= 1) {
      return 50;
    }

    if (total === 2) {
      return index === 0 ? 40 : 60;
    }

    if (index === 0 || index === total - 1) {
      return 50;
    }

    const pattern = [
      34,
      66,
      38,
      62,
      42,
      58,
    ];

    return pattern[
      (index - 1) % pattern.length
    ];
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-14 text-left">

      {/* =====================================================
          JOURNEY HEADER
      ====================================================== */}
      <div
        className="bg-[#2B2C2D] border border-[#44474A] rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
        aria-label={`Quantum learning journey for ${userStats.name}`}
      >
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1FA7DA] mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Qubify Curriculum</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-[#F1F1F1] tracking-tight">
            Quantum Learning Journey
          </h1>

          <p className="text-xs sm:text-sm text-[#B7BABD] mt-1 max-w-lg">
            Learn quantum computing progressively — from
            foundational concepts to gates, circuits, Qiskit,
            simulation, and problem solving.
          </p>
        </div>

        <div className="sm:text-right min-w-[200px] pt-2 sm:pt-0 border-t sm:border-t-0 border-[#44474A]">
          <div className="text-xs font-semibold text-[#B7BABD] mb-1">
            Core Journey Progress
          </div>

          <ProgressBar
            value={overallProgress}
            size="sm"
            color="cyan"
          />

          <span className="text-[11px] text-[#858A8E] font-mono mt-1 block">
            {completedCount} of {totalCount} lessons completed
          </span>
        </div>
      </div>

      {/* =====================================================
          CURRICULUM
      ====================================================== */}
      {CURRICULUM_SECTIONS.map(
        (section, sectionIndex) => {
          const sectionNodes = section.nodeIds
            .map((nodeId) =>
              allNodes.find(
                (node) => node.id === nodeId
              )
            )
            .filter(
              (
                node
              ): node is LearningNodeItem =>
                Boolean(node)
            );

          return (
            <section
              key={section.id}
              className="relative"
            >
              {/* =============================================
                  SECTION HEADER
              ============================================== */}
              <div className="text-center mb-8">
                {section.isFuture ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#28292A] border border-[#44474A] text-[#858A8E] text-xs font-semibold uppercase tracking-wider mb-2">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Future Scope</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#2B2C2D] border border-[#44474A] text-[#1FA7DA] text-xs font-semibold uppercase tracking-wider mb-2">
                    <span>
                      Section {sectionIndex + 1}
                    </span>
                  </div>
                )}

                <h2
                  className={`text-xl sm:text-2xl font-bold ${
                    section.isFuture
                      ? 'text-[#858A8E]'
                      : 'text-[#F1F1F1]'
                  }`}
                >
                  {section.title}
                </h2>

                <p className="text-xs sm:text-sm text-[#858A8E] max-w-lg mx-auto mt-1">
                  {section.subtitle}
                </p>
              </div>

              {/* =============================================
                  NORMAL ACTIVE LEARNING PATH
              ============================================== */}
              {!section.isFuture && (
                <div className="relative w-full py-3">
                  <div className="relative w-full">

                    {sectionNodes.map(
                      (node, index) => {
                        const x = getNodeX(
                          index,
                          sectionNodes.length
                        );

                        const nextX =
                          index <
                          sectionNodes.length - 1
                            ? getNodeX(
                                index + 1,
                                sectionNodes.length
                              )
                            : null;

                        return (
                          <div
                            key={node.id}
                            className="relative h-[118px]"
                          >
                            {/* =============================
                                CURVED CONNECTOR
                            ============================== */}
                            {nextX !== null && (
                              <svg
                                className="absolute left-0 top-[40px] w-full h-[118px] z-0 pointer-events-none overflow-visible"
                                viewBox="0 0 100 100"
                                preserveAspectRatio="none"
                                aria-hidden="true"
                              >
                                {/* Main connector */}
                                <path
                                  d={`
                                    M ${x} 0
                                    C ${x} 34,
                                      ${nextX} 66,
                                      ${nextX} 100
                                  `}
                                  fill="none"
                                  stroke="#44474A"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  vectorEffect="non-scaling-stroke"
                                />

                                {/* Cyan highlight */}
                                <path
                                  d={`
                                    M ${x} 0
                                    C ${x} 34,
                                      ${nextX} 66,
                                      ${nextX} 100
                                  `}
                                  fill="none"
                                  stroke="#1FA7DA"
                                  strokeOpacity="0.24"
                                  strokeWidth="1"
                                  strokeLinecap="round"
                                  vectorEffect="non-scaling-stroke"
                                />
                              </svg>
                            )}

                            {/* =============================
                                LESSON NODE
                            ============================== */}
                            <div
                              className="absolute top-0 -translate-x-1/2 z-10"
                              style={{
                                left: `${x}%`,
                              }}
                            >
                              <LearningNode
                                item={{
                                  ...node,
                                  number:
                                    index + 1,
                                }}
                                onClick={
                                  onSelectNode
                                }
                              />
                            </div>
                          </div>
                        );
                      }
                    )}

                  </div>
                </div>
              )}

              {/* =============================================
                  ADVANCED — FUTURE SCOPE ONLY
              ============================================== */}
              {section.isFuture && (
                <div className="relative z-10 w-full max-w-md mx-auto">
                  <div className="rounded-2xl border border-[#44474A] bg-[#28292A] p-6 text-center opacity-75">

                    <div className="w-14 h-14 mx-auto rounded-2xl border border-[#44474A] bg-[#222324] flex items-center justify-center mb-4">
                      <Lock className="w-6 h-6 text-[#858A8E]" />
                    </div>

                    <h3 className="text-base font-bold text-[#B7BABD]">
                      Advanced Quantum
                    </h3>

                    <p className="text-xs text-[#858A8E] mt-2 max-w-sm mx-auto">
                      Noise, real quantum hardware,
                      advanced algorithms, and deeper
                      quantum topics will be introduced
                      in future versions of Qubify.
                    </p>

                    <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#44474A] text-[10px] font-semibold text-[#858A8E]">
                      <Lock className="w-3 h-3" />
                      <span>Coming Soon</span>
                    </div>

                  </div>
                </div>
              )}

             

              {/* =============================================
                  DIVIDER
              ============================================== */}
              {sectionIndex <
                CURRICULUM_SECTIONS.length -
                  1 && (
                <div className="mt-12 border-t border-[#44474A]" />
              )}
            </section>
          );
        }
      )}
    </div>
  );
};