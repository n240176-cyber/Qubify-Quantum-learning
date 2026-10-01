import React, { useState } from 'react';
import { X, LogOut, RotateCcw, Laptop, Bell, Sparkles, AlertTriangle } from 'lucide-react';
import { UserStats } from '../../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStats;
  onLogout: () => void;
  onResetProgress: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userStats,
  onLogout,
  onResetProgress,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleLogout = () => {
    onClose();
    onLogout();
  };

  const handleConfirmReset = () => {
    setShowResetConfirm(false);
    onResetProgress();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div 
        id="profile-settings-modal"
        className="relative w-full max-w-md bg-[#28292A] rounded-xl shadow-2xl border border-[#44474A] overflow-hidden flex flex-col max-h-[90vh] text-left font-sans"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-[#44474A] flex items-center justify-between bg-[#202122]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1FA7DA] text-white font-bold text-xs flex items-center justify-center">
              {userStats.name ? userStats.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'QL'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F1F1F1]">{userStats.name || 'Qubify Learner'}</h3>
              <p className="text-[11px] text-[#858A8E] font-mono">Demo Account · {userStats.levelTitle || 'Quantum Initiate'}</p>
            </div>
          </div>
          <button
            id="close-profile-modal"
            onClick={onClose}
            className="p-1.5 rounded text-[#858A8E] hover:text-[#F1F1F1] hover:bg-[#2B2C2D] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          
          {/* Status summary */}
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="bg-[#202122] border border-[#44474A] rounded-lg p-2.5">
              <div className="text-base font-bold text-[#1FA7DA]">{userStats.level}</div>
              <div className="text-[10px] text-[#858A8E] mt-0.5 uppercase tracking-wider">Level</div>
            </div>
            <div className="bg-[#202122] border border-[#44474A] rounded-lg p-2.5">
              <div className="text-base font-bold text-[#F1F1F1]">{userStats.xp}</div>
              <div className="text-[10px] text-[#858A8E] mt-0.5 uppercase tracking-wider">XP</div>
            </div>
            <div className="bg-[#202122] border border-[#44474A] rounded-lg p-2.5">
              <div className="text-base font-bold text-amber-400">{userStats.streakDays}d</div>
              <div className="text-[10px] text-[#858A8E] mt-0.5 uppercase tracking-wider">Streak</div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#858A8E]">
              Preferences
            </h4>
            <div className="space-y-1.5 text-xs">
              <label className="flex items-center justify-between p-2.5 rounded-lg border border-[#44474A] bg-[#202122] cursor-pointer">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-[#1FA7DA]" />
                  <div>
                    <span className="font-semibold text-[#F1F1F1]">Qiskit Code Translation</span>
                    <p className="text-[10px] text-[#858A8E]">Show Python alongside quantum circuits</p>
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="rounded accent-[#1FA7DA] h-4 w-4 bg-[#28292A] border-[#44474A]" />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border border-[#44474A] bg-[#202122] cursor-pointer">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-semibold text-[#F1F1F1]">Study Reminders</span>
                    <p className="text-[10px] text-[#858A8E]">Streak maintenance notifications</p>
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="rounded accent-[#1FA7DA] h-4 w-4 bg-[#28292A] border-[#44474A]" />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border border-[#44474A] bg-[#202122] cursor-pointer">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#1FA7DA]" />
                  <div>
                    <span className="font-semibold text-[#F1F1F1]">Qubify AI Companion</span>
                    <p className="text-[10px] text-[#858A8E]">Enable AI explanations on lessons</p>
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="rounded accent-[#1FA7DA] h-4 w-4 bg-[#28292A] border-[#44474A]" />
              </label>
            </div>
          </div>

          {/* Account Actions */}
          <div className="pt-2 border-t border-[#44474A] space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#858A8E]">
              Account
            </h4>
            
            {/* Log Out Button */}
            <button
              id="profile-logout-btn"
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-2.5 rounded-lg border border-[#44474A] bg-[#202122] hover:bg-[#303234] text-xs font-semibold text-[#F1F1F1] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4 text-[#858A8E]" />
                <span>Log Out</span>
              </div>
              <span className="text-[10px] text-[#858A8E] font-mono">Keeps progress</span>
            </button>

            {/* Reset Prototype Progress */}
            {showResetConfirm ? (
              <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-950/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>Reset all learning progress and stats?</span>
                </div>
                <p className="text-[11px] text-[#858A8E] leading-relaxed">
                  This will return lessons, challenges, and XP to the initial beginner level.
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2.5 py-1 text-xs text-[#858A8E] hover:text-[#F1F1F1] rounded transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmReset}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded transition-colors cursor-pointer"
                  >
                    Confirm Reset
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="profile-reset-progress-btn"
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-[#44474A] bg-[#202122] hover:bg-[#303234] text-xs font-medium text-[#858A8E] hover:text-rose-400 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Prototype Progress</span>
                </div>
              </button>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#202122] border-t border-[#44474A] flex items-center justify-between text-xs">
          <span className="text-[11px] text-[#858A8E] font-mono">Qubify Prototype v2.5</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-[#1FA7DA] hover:bg-[#27B4E8] text-white font-semibold transition-colors cursor-pointer text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
