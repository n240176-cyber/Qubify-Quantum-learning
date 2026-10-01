import React, { useState } from 'react';
import { AppView, UserStats } from '../../types';
import { QubifyLogo } from '../brand/QubifyLogo';
import { BottomNav } from './BottomNav';
import { 
  LayoutDashboard, 
  Route, 
  Code2, 
  Trophy, 
  BarChart2, 
  Flame, 
  Zap, 
  User, 
  Settings, 
  Menu, 
  X 
} from 'lucide-react';

interface AppShellProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  userStats: UserStats;
  onOpenProfile: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentView,
  onNavigate,
  userStats,
  onOpenProfile,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { view: AppView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { view: 'path', label: 'Learning Path', icon: Route },
    { view: 'lab', label: 'Quantum Code Lab', icon: Code2 },
    { view: 'challenges', label: 'Challenges', icon: Trophy },
    { view: 'progress', label: 'Progress', icon: BarChart2 },
  ];

  const pageTitles: Record<AppView, string> = {
    landing: 'Home',
    auth: 'Account',
    onboarding: 'Welcome',
    dashboard: 'Dashboard',
    path: 'Learning Path',
    lesson: 'Interactive Lesson',
    lab: 'Quantum Code Lab',
    challenges: 'Weekly Challenges',
    progress: 'Progress & Analytics',
  };

  return (
    <div className="min-h-screen bg-[#232425] text-[#F1F1F1] flex flex-row font-sans antialiased selection:bg-[#1FA7DA]/30 selection:text-white">
      
      {/* ========================================================
          DESKTOP SIDEBAR (Permanent Left Navigation)
          ======================================================== */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-[#202122] border-r border-[#44474A] min-h-screen sticky top-0 h-screen select-none">
        
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-[#44474A]/60">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 cursor-pointer focus:outline-none"
            title="Qubify Home"
          >
            <QubifyLogo size="sm" />
          </button>
        </div>

        {/* Primary Navigation Links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view || (item.view === 'path' && currentView === 'lesson');
            return (
              <button
                key={item.view}
                id={`sidebar-link-${item.view}`}
                onClick={() => onNavigate(item.view)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#2B2C2D] text-[#F1F1F1] font-semibold'
                    : 'text-[#858A8E] hover:text-[#F1F1F1] hover:bg-[#28292A]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1FA7DA]' : 'text-[#858A8E]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Lower Sidebar: Level & Profile / Settings */}
        <div className="p-3 border-t border-[#44474A]/60 space-y-2">
          
          {/* Track Level pill */}
          <div className="px-3 py-2 rounded-lg bg-[#28292A] border border-[#44474A]/60 flex items-center justify-between text-xs">
            <span className="text-[#858A8E] truncate">Level {userStats.level.replace('Level ', '')}</span>
            <span className="text-[#1FA7DA] font-semibold">{userStats.beginnerCompletionPercent}% Complete</span>
          </div>

          {/* Profile Row */}
          <button
            onClick={onOpenProfile}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#28292A] transition-colors cursor-pointer text-left text-xs"
            title="Open Profile & Settings"
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-7 h-7 rounded-md bg-[#2B2C2D] border border-[#44474A] flex items-center justify-center text-[#1FA7DA] shrink-0 font-bold">
                {(userStats.name || 'Q').charAt(0)}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-[#F1F1F1] truncate">{userStats.name}</div>
                <div className="text-[10px] text-[#858A8E] truncate">{userStats.levelTitle}</div>
              </div>
            </div>
            <Settings className="w-4 h-4 text-[#858A8E] hover:text-[#F1F1F1] shrink-0" />
          </button>
        </div>

      </aside>

      {/* ========================================================
          MAIN CONTENT AREA + MINIMAL TOP BAR
          ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Minimal Top Bar */}
        <header className="h-14 bg-[#202122] border-b border-[#44474A] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
          
          {/* Left: Mobile hamburger + Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-[#858A8E] hover:text-[#F1F1F1] hover:bg-[#28292A] rounded-md transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-sm sm:text-base font-bold text-[#F1F1F1] tracking-tight">
              {pageTitles[currentView] || 'Qubify'}
            </h1>
          </div>

          {/* Right: Restrained Stats & Profile Action */}
          <div className="flex items-center gap-3 text-xs">
            {/* Streak */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#28292A] border border-[#44474A] text-amber-400 font-semibold" title="Active Learning Streak">
              <Flame className="w-3.5 h-3.5" />
              <span>{userStats.streakDays}d</span>
            </div>

            {/* XP */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#28292A] border border-[#44474A] text-[#1FA7DA] font-semibold" title="Experience Points">
              <Zap className="w-3.5 h-3.5" />
              <span>{userStats.xp} XP</span>
            </div>

            {/* Profile trigger */}
            <button
              onClick={onOpenProfile}
              className="p-1.5 rounded-md hover:bg-[#28292A] text-[#858A8E] hover:text-[#F1F1F1] transition-colors cursor-pointer"
              title="Profile"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#202122] border-b border-[#44474A] p-3 space-y-1 animate-in fade-in">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view || (item.view === 'path' && currentView === 'lesson');
              return (
                <button
                  key={item.view}
                  onClick={() => {
                    onNavigate(item.view);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#2B2C2D] text-[#F1F1F1] font-semibold'
                      : 'text-[#858A8E] hover:text-[#F1F1F1] hover:bg-[#28292A]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#1FA7DA]' : 'text-[#858A8E]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Routed View Canvas */}
        <main className={`flex-1 p-4 sm:p-6 pb-20 md:pb-8 w-full ${
          currentView === 'lab' ? 'max-w-[1720px] mx-auto' : 'max-w-6xl mx-auto'
        }`}>
          {children}
        </main>

      </div>

      {/* Mobile Bottom Bar for fast thumb access */}
      <BottomNav currentView={currentView} onNavigate={onNavigate} />

    </div>
  );
};
