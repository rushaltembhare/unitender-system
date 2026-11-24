import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  FileText,
  FilePlus2,
  FolderKanban,
  DoorOpen,
  Award,
  ScrollText,
  Users2,
  CreditCard,
  Boxes,
  History,
  FileSearch,
  BookOpenCheck,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export function Sidebar({ currentTab, setCurrentTab }) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const role = user?.role || 'admin';

  // Define nav links with role accessibility rules
  const allNavItems = [
    {
      id: 'dashboard',
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
      roles: ['admin', 'department', 'committee', 'approver', 'vendor', 'auditor']
    },
    {
      id: 'notice-board',
      label: t('nav.noticeBoard'),
      icon: FileText,
      roles: ['admin', 'department', 'committee', 'approver', 'vendor', 'auditor']
    },
    {
      id: 'requisitions',
      label: t('nav.requisitions'),
      icon: FolderKanban,
      roles: ['admin', 'department', 'approver', 'auditor']
    },
    {
      id: 'create-tender',
      label: t('nav.createTender'),
      icon: FilePlus2,
      roles: ['admin']
    },
    {
      id: 'bid-opening',
      label: t('nav.bidOpening'),
      icon: DoorOpen,
      roles: ['admin', 'committee', 'approver', 'auditor']
    },
    {
      id: 'evaluation',
      label: t('nav.evaluation'),
      icon: Award,
      roles: ['admin', 'committee', 'approver', 'auditor']
    },
    {
      id: 'contracts',
      label: t('nav.contracts'),
      icon: ScrollText,
      roles: ['admin', 'approver', 'vendor', 'auditor']
    },
    {
      id: 'vendors',
      label: t('nav.vendors'),
      icon: Users2,
      roles: ['admin', 'approver', 'auditor', 'vendor']
    },
    {
      id: 'payments',
      label: t('nav.payments'),
      icon: CreditCard,
      roles: ['admin', 'approver', 'vendor', 'auditor']
    },
    {
      id: 'inventory',
      label: t('nav.inventory'),
      icon: Boxes,
      roles: ['admin', 'department', 'approver', 'auditor']
    },
    {
      id: 'audit',
      label: t('nav.audit'),
      icon: History,
      roles: ['admin', 'committee', 'approver', 'auditor']
    },
    {
      id: 'rti',
      label: t('nav.rti'),
      icon: FileSearch,
      roles: ['admin', 'department', 'committee', 'approver', 'vendor', 'auditor']
    },
    {
      id: 'guide',
      label: t('nav.guide'),
      icon: BookOpenCheck,
      roles: ['vendor', 'admin', 'department']
    }
  ];

  const visibleItems = allNavItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-[#fbf9f5] border-r border-[#e8ded3] flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      
      {/* Navigation List */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#9e877f]">
          Navigation ({role.toUpperCase()})
        </div>

        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-[#fbeee8] text-[#8f3621] shadow-xs border border-[#f2d0c4]'
                  : 'text-[#5c4742] hover:bg-[#f3ede3] hover:text-[#2c1d1a]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#8f3621]' : 'text-[#a38e87]'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#8f3621]" />}
            </button>
          );
        })}
      </div>

      {/* User Context Footer */}
      <div className="p-3 border-t border-[#e8ded3] bg-[#f5efe6]/70">
        <div className="p-3 rounded-xl bg-[#fffdfa] border border-[#e2d5c5] shadow-xs">
          <p className="text-[11px] font-bold text-[#2c1d1a] truncate">{user?.name}</p>
          <p className="text-[10px] text-[#8f3621] font-medium truncate">{user?.roleTitle || user?.role}</p>
          <div className="mt-2 flex items-center justify-between text-[10px] text-[#78615c] pt-2 border-t border-[#ebdcd0]">
            <span>2FA Protection</span>
            <span className="inline-flex items-center text-emerald-600 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
              Active
            </span>
          </div>
        </div>
      </div>

    </aside>
  );
}
