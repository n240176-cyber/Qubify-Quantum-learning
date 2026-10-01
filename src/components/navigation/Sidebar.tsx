import React from 'react';
import { LearningNodeItem } from '../../types';
import { 
  CheckCircle2, 
  Circle, 
  Lock, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  levelName: string;
  items: LearningNodeItem[];
  activeId: string;
  onSelectItem: (item: LearningNodeItem) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  levelName,
  items,
  activeId,
  onSelectItem,
  isCollapsed,
  onToggleCollapse,
}) => {
  return (
    <aside
      className={`relative transition-all duration-300 ease-in-out bg-white border-r border-slate-200/80 flex flex-col shrink-0 ${
        isCollapsed ? 'w-16' : 'w-72 md:w-80'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        {!isCollapsed ? (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Learning Track</span>
            </div>
            <h2 className="text-sm font-bold text-slate-800 mt-0.5 truncate">{levelName}</h2>
          </div>
        ) : (
          <div className="mx-auto" title={levelName}>
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>
        )}

        <button
          id="sidebar-collapse-toggle"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Lesson List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {items.map((item) => {
          const isActive = item.id === activeId;
          const isCompleted = item.status === 'completed';
          const isCurrent = item.status === 'current';
          const isLocked = item.status === 'locked';

          if (isCollapsed) {
            return (
              <button
                key={item.id}
                id={`sidebar-item-collapsed-${item.id}`}
                disabled={isLocked}
                onClick={() => onSelectItem(item)}
                className={`w-full flex items-center justify-center p-2.5 rounded-lg transition-colors cursor-pointer relative group ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : isLocked
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title={`${item.number}. ${item.title} (${item.status})`}
              >
                {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {isCurrent && <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />}
                {item.status === 'upcoming' && <Circle className="w-5 h-5 text-slate-400" />}
                {isLocked && <Lock className="w-4 h-4 text-slate-300" />}

                {/* Floating tooltip */}
                <span className="absolute left-full ml-2 hidden group-hover:block z-50 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-md">
                  {item.number}. {item.title}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              id={`sidebar-item-${item.id}`}
              disabled={isLocked}
              onClick={() => onSelectItem(item)}
              className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-blue-50/90 border border-blue-200/80 shadow-xs text-blue-950 font-semibold'
                  : isLocked
                  ? 'opacity-60 cursor-not-allowed bg-transparent text-slate-400'
                  : 'hover:bg-slate-100/80 text-slate-700'
              }`}
            >
              {/* Status Indicator Icon */}
              <div className="mt-0.5 shrink-0">
                {isCompleted && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                )}
                {isCurrent && (
                  <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  </div>
                )}
                {item.status === 'upcoming' && (
                  <Circle className="w-4 h-4 text-slate-300 stroke-[2.5]" />
                )}
                {isLocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
              </div>

              {/* Title & Subtitle */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    Step {item.number}
                  </span>
                  {isCurrent && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm font-medium truncate text-slate-800">
                  {item.title}
                </div>
                {item.subtitle && (
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {item.subtitle}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Progress Footer */}
      {!isCollapsed && (
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 text-xs text-slate-500 flex items-center justify-between">
          <span>Beginner Level</span>
          <span className="font-semibold text-blue-600 font-mono">3 / 9 Done</span>
        </div>
      )}
    </aside>
  );
};
