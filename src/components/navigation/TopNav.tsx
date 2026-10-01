import React from 'react';
import { QubifyLogo } from '../brand/QubifyLogo';
import { AppView, UserStats } from '../../types';
import { 
  BookOpen, 
  Cpu, 
  Trophy, 
  BarChart3, 
  Flame, 
  Zap, 
  Home
} from 'lucide-react';

interface TopNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  userStats: UserStats;
  onOpenProfile: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentView,
  onNavigate,
  userStats,
  onOpenProfile,
}) => {
  const navLinks: { view: AppView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { view: 'dashboard', label: 'Dashboard', icon: Home },
    { view: 'path', label: 'Curriculum', icon: BookOpen },
    { view: 'lab', label: 'Quantum Code Lab', icon: Cpu },
    { view: 'challenges', label: 'Challenges', icon: Trophy },
    { view: 'progress', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#08111F]/95 backdrop-blur-md border-b border-[#243B55] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <button
            id="topnav-brand-logo"
            onClick={() => onNavigate('landing')}
            className="hover:opacity-90 transition-opacity cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF] rounded-lg p-0.5"
            title="Qubify Home"
          >
            <QubifyLogo size="sm" />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view || (item.view === 'path' && currentView === 'lesson');
              return (
                <button
                  key={item.view}
                  id={`topnav-link-${item.view}`}
                  onClick={() => onNavigate(item.view)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'text-[#22D3EE] bg-[#1E3A5F] border border-[#22D3EE]/30 shadow-xs'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#132238]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#22D3EE]' : 'text-[#94A3B8]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right side stats & profile */}
        <div className="hidden">
        </div>

      </div>
    </header>
  );
};
