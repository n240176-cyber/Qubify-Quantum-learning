import React from 'react';
import { AppView } from '../../types';
import { BookOpen, Cpu, Trophy, BarChart3, Home } from 'lucide-react';

interface BottomNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const items: { view: AppView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { view: 'dashboard', label: 'Home', icon: Home },
    { view: 'path', label: 'Curriculum', icon: BookOpen },
    { view: 'lab', label: 'Lab', icon: Cpu },
    { view: 'challenges', label: 'Challenges', icon: Trophy },
    { view: 'progress', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <nav 
      id="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#202122] border-t border-[#44474A] px-2 py-1 flex items-center justify-around safe-bottom"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.view || (item.view === 'path' && currentView === 'lesson');
        return (
          <button
            key={item.view}
            id={`bottom-nav-${item.view}`}
            onClick={() => onNavigate(item.view)}
            className={`min-h-[44px] min-w-[44px] flex-1 flex flex-col items-center justify-center py-1 rounded-lg transition-colors cursor-pointer ${
              isActive
                ? 'text-[#F1F1F1] font-semibold'
                : 'text-[#858A8E] hover:text-[#B7BABD] font-normal'
            }`}
          >
            <div className={`p-1 rounded-md transition-colors ${isActive ? 'bg-[#2B2C2D] text-[#1FA7DA]' : 'text-[#858A8E]'}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[11px] tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
