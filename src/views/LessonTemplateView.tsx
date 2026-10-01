import React, { useState } from 'react';
import { LearningNodeItem, LessonStepConfig, LessonStepKey } from '../types';
import { Sidebar } from '../components/navigation/Sidebar';
import { ProgressBar } from '../components/common/ProgressBar';
import { LessonStep } from '../components/learning/LessonStep';
import { InteractivePanel } from '../components/learning/InteractivePanel';
import { TakeawayCard } from '../components/learning/TakeawayCard';
import { LESSON_4_STEPS } from '../data/learningData';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  RotateCcw,
  Zap,
  GraduationCap
} from 'lucide-react';

interface LessonTemplateViewProps {
  currentLesson: LearningNodeItem;
  allLessons: LearningNodeItem[];
  onSelectLesson: (item: LearningNodeItem) => void;
  onBackToPath: () => void;
  onCompleteLesson: () => void;
}

export const LessonTemplateView: React.FC<LessonTemplateViewProps> = ({
  currentLesson,
  allLessons,
  onSelectLesson,
  onBackToPath,
  onCompleteLesson,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Progressive step revelation state (current visible step index 0 to 7)
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([0]);

  const steps = LESSON_4_STEPS;
  const activeStep = steps[currentStepIndex];

  // Progress percentage across the 8-step pedagogical flow
  const stepProgressPercent = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      if (!completedSteps.includes(currentStepIndex)) {
        setCompletedSteps((prev) => [...prev, currentStepIndex]);
      }
    } else {
      // Completed all 8 pedagogical steps
      onCompleteLesson();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    } else {
      onBackToPath();
    }
  };

  const handleJumpToStep = (index: number) => {
    // Can jump if already unlocked
    if (index <= Math.max(...completedSteps) + 1) {
      setCurrentStepIndex(index);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden min-h-[calc(100vh-4rem)] bg-slate-50">
      
      {/* Desktop / Tablet Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          levelName="Beginner Level"
          items={allLessons}
          activeId={currentLesson.id}
          onSelectItem={onSelectLesson}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Lesson Workspace */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Lesson Header Navigation Bar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              id="lesson-back-to-path-btn"
              onClick={onBackToPath}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title="Back to Learning Path"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <span className="font-semibold text-blue-600">Beginner Track</span>
                <span>/</span>
                <span>Topic {currentLesson.number}</span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
                {currentLesson.title}: Wavefunction Collapse
              </h1>
            </div>
          </div>

          {/* Micro Progress Indicator */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-700">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {stepProgressPercent}% lesson complete
              </span>
            </div>
            <div className="w-24 sm:w-32">
              <ProgressBar value={stepProgressPercent} size="sm" showPercent={false} color="cyan" />
            </div>
          </div>
        </div>

        {/* Lesson Body Area */}
        <div className="max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-6 flex-1">
          
          {/* Pedagogical Roadmap Pills (Progressive Flow) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 px-1">
              <span className="font-bold uppercase tracking-wider text-slate-500">
                8-Step Pedagogical Model
              </span>
              <span>Click step to review</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {steps.map((step, idx) => {
                const isStepActive = idx === currentStepIndex;
                const isStepDone = completedSteps.includes(idx) && idx !== currentStepIndex;
                const isStepUnlocked = idx <= Math.max(...completedSteps) + 1;

                return (
                  <button
                    key={step.id}
                    disabled={!isStepUnlocked}
                    onClick={() => handleJumpToStep(idx)}
                    className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer text-xs font-mono font-bold ${
                      isStepActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isStepDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : isStepUnlocked
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                    }`}
                    title={`${step.stepNumber}. ${step.label}`}
                  >
                    <span>{step.stepNumber}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Step Showcase */}
          <div className="space-y-6">
            <LessonStep
              step={activeStep}
              isActive={true}
              isCompleted={completedSteps.includes(currentStepIndex)}
              isUnlocked={true}
              onActivate={() => {}}
            >
              {/* Interactive Visual slot: Shown during steps 3 (Interactive visual), 4 (Observe), and 6 (Try it) */}
              {(activeStep.id === 'interactive_visual' || 
                activeStep.id === 'observe' || 
                activeStep.id === 'try_it') && (
                <div className="my-4">
                  <InteractivePanel
                    lessonTitle={currentLesson.title}
                    onActionComplete={() => {
                      if (!completedSteps.includes(currentStepIndex)) {
                        setCompletedSteps((prev) => [...prev, currentStepIndex]);
                      }
                    }}
                  />
                </div>
              )}

              {/* Takeaway Card slot: Shown on step 7 (Takeaway) */}
              {activeStep.id === 'takeaway' && (
                <div className="my-4">
                  <TakeawayCard
                    takeaway="Measurement destroys superposition: you observe probabilities beforehand, but only classical outcomes afterward."
                    topic="Wavefunction Collapse"
                  />
                </div>
              )}

              {/* Continue Milestone Card: Shown on step 8 */}
              {activeStep.id === 'continue' && (
                <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl shadow-md space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Lesson Complete</span>
                  </div>
                  <h3 className="text-xl font-black">
                    Ready to practice in the Quantum Lab!
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                    Now that you understand measurement and state collapse, explore how the X and H gates change qubit probabilities in the circuit builder.
                  </p>
                </div>
              )}
            </LessonStep>
          </div>

          {/* Completed Steps Review Summary */}
          {currentStepIndex > 0 && (
            <div className="pt-4 border-t border-slate-200/80">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Previous Revealed Steps ({currentStepIndex})
              </div>
              <div className="space-y-2">
                {steps.slice(0, currentStepIndex).map((prevStep, prevIdx) => (
                  <div
                    key={prevStep.id}
                    onClick={() => handleJumpToStep(prevIdx)}
                    className="p-3 bg-white/70 border border-slate-200/70 rounded-xl text-xs flex items-center justify-between text-slate-600 hover:bg-white hover:text-slate-900 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="font-semibold text-slate-800">
                        Step {prevStep.stepNumber}: {prevStep.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-blue-600 font-semibold">Review</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Lesson Bottom Action Footer */}
        <div className="sticky bottom-0 z-30 bg-white border-t border-slate-200/90 px-4 sm:px-8 py-4 flex items-center justify-between gap-4 shadow-md">
          <button
            id="lesson-nav-back-button"
            onClick={handlePrevStep}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentStepIndex === 0 ? 'Learning Path' : 'Back Step'}</span>
          </button>

          <div className="text-xs font-mono text-slate-400 hidden sm:block">
            Step {currentStepIndex + 1} of {steps.length} · {activeStep.label}
          </div>

          <button
            id="lesson-nav-continue-button"
            onClick={handleNextStep}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>{currentStepIndex === steps.length - 1 ? 'Complete Lesson' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </main>

    </div>
  );
};
