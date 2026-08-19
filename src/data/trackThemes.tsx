import React from 'react';
import { 
  Compass, 
  MessageSquare, 
  GitBranch, 
  Megaphone, 
  Database, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';

export interface TrackTheme {
  topBarColor: string;
  iconBg: string;
  iconBorder: string;
  iconText: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  categoryText: string;
  progressBar: string;
  hoverBorder: string;
  hoverShadow: string;
  titleHover: string;
  renderIcon: (className?: string) => React.ReactNode;
}

export const TRACK_THEMES: Record<string, TrackTheme> = {
  'primeiros-passos': {
    topBarColor: 'bg-sky-500',
    iconBg: 'bg-sky-50 dark:bg-sky-950/60',
    iconBorder: 'border-sky-200 dark:border-sky-800',
    iconText: 'text-sky-600 dark:text-sky-400',
    badgeBg: 'bg-sky-50 dark:bg-sky-950/60',
    badgeBorder: 'border-sky-200 dark:border-sky-800',
    badgeText: 'text-sky-700 dark:text-sky-300',
    categoryText: 'text-sky-600 dark:text-sky-400',
    progressBar: 'bg-sky-500',
    hoverBorder: 'hover:border-sky-400 dark:hover:border-sky-500',
    hoverShadow: 'hover:shadow-md hover:shadow-sky-500/15 dark:hover:shadow-sky-950/50',
    titleHover: 'group-hover:text-sky-600 dark:group-hover:text-sky-400',
    renderIcon: (cls = 'w-5 h-5 text-sky-600 dark:text-sky-400') => <Compass className={cls} />,
  },
  'atendimento': {
    topBarColor: 'bg-cyan-500',
    iconBg: 'bg-cyan-50 dark:bg-cyan-950/60',
    iconBorder: 'border-cyan-200 dark:border-cyan-800',
    iconText: 'text-cyan-600 dark:text-cyan-400',
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/60',
    badgeBorder: 'border-cyan-200 dark:border-cyan-800',
    badgeText: 'text-cyan-700 dark:text-cyan-300',
    categoryText: 'text-cyan-600 dark:text-cyan-400',
    progressBar: 'bg-cyan-500',
    hoverBorder: 'hover:border-cyan-400 dark:hover:border-cyan-500',
    hoverShadow: 'hover:shadow-md hover:shadow-cyan-500/15 dark:hover:shadow-cyan-950/50',
    titleHover: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400',
    renderIcon: (cls = 'w-5 h-5 text-cyan-600 dark:text-cyan-400') => <MessageSquare className={cls} />,
  },
  'automacao': {
    topBarColor: 'bg-amber-500',
    iconBg: 'bg-amber-50 dark:bg-amber-950/60',
    iconBorder: 'border-amber-200 dark:border-amber-800',
    iconText: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
    badgeBorder: 'border-amber-200 dark:border-amber-800',
    badgeText: 'text-amber-700 dark:text-amber-300',
    categoryText: 'text-amber-600 dark:text-amber-400',
    progressBar: 'bg-amber-500',
    hoverBorder: 'hover:border-amber-400 dark:hover:border-amber-500',
    hoverShadow: 'hover:shadow-md hover:shadow-amber-500/15 dark:hover:shadow-amber-950/50',
    titleHover: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    renderIcon: (cls = 'w-5 h-5 text-amber-600 dark:text-amber-400') => <GitBranch className={cls} />,
  },
  'marketing': {
    topBarColor: 'bg-blue-600',
    iconBg: 'bg-blue-50 dark:bg-blue-950/60',
    iconBorder: 'border-blue-200 dark:border-blue-800',
    iconText: 'text-blue-600 dark:text-blue-400',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/60',
    badgeBorder: 'border-blue-200 dark:border-blue-800',
    badgeText: 'text-blue-700 dark:text-blue-300',
    categoryText: 'text-blue-600 dark:text-blue-400',
    progressBar: 'bg-blue-600',
    hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-500',
    hoverShadow: 'hover:shadow-md hover:shadow-blue-500/15 dark:hover:shadow-blue-950/50',
    titleHover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
    renderIcon: (cls = 'w-5 h-5 text-blue-600 dark:text-blue-400') => <Megaphone className={cls} />,
  },
  'cadastros': {
    topBarColor: 'bg-emerald-500',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconBorder: 'border-emerald-200 dark:border-emerald-800',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    badgeBorder: 'border-emerald-200 dark:border-emerald-800',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    categoryText: 'text-emerald-600 dark:text-emerald-400',
    progressBar: 'bg-emerald-500',
    hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-500',
    hoverShadow: 'hover:shadow-md hover:shadow-emerald-500/15 dark:hover:shadow-emerald-950/50',
    titleHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    renderIcon: (cls = 'w-5 h-5 text-emerald-600 dark:text-emerald-400') => <Database className={cls} />,
  },
  'jadi': {
    topBarColor: 'bg-purple-500',
    iconBg: 'bg-purple-50 dark:bg-purple-950/60',
    iconBorder: 'border-purple-200 dark:border-purple-800',
    iconText: 'text-purple-600 dark:text-purple-400',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/60',
    badgeBorder: 'border-purple-200 dark:border-purple-800',
    badgeText: 'text-purple-700 dark:text-purple-300',
    categoryText: 'text-purple-600 dark:text-purple-400',
    progressBar: 'bg-purple-500',
    hoverBorder: 'hover:border-purple-400 dark:hover:border-purple-500',
    hoverShadow: 'hover:shadow-md hover:shadow-purple-500/15 dark:hover:shadow-purple-950/50',
    titleHover: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
    renderIcon: (cls = 'w-5 h-5 text-purple-600 dark:text-purple-400') => <Sparkles className={cls} />,
  },
  'administracao': {
    topBarColor: 'bg-slate-600',
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconBorder: 'border-slate-300 dark:border-slate-700',
    iconText: 'text-slate-700 dark:text-slate-300',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeBorder: 'border-slate-200 dark:border-slate-700',
    badgeText: 'text-slate-700 dark:text-slate-300',
    categoryText: 'text-slate-600 dark:text-slate-400',
    progressBar: 'bg-slate-600',
    hoverBorder: 'hover:border-slate-400 dark:hover:border-slate-600',
    hoverShadow: 'hover:shadow-md hover:shadow-slate-500/15 dark:hover:shadow-slate-950/50',
    titleHover: 'group-hover:text-slate-800 dark:group-hover:text-slate-200',
    renderIcon: (cls = 'w-5 h-5 text-slate-600 dark:text-slate-400') => <ShieldCheck className={cls} />,
  },
};

export const getTrackTheme = (trackIdOrBadge: string): TrackTheme => {
  if (TRACK_THEMES[trackIdOrBadge]) {
    return TRACK_THEMES[trackIdOrBadge];
  }

  // Check by color name
  if (trackIdOrBadge === 'blue' || trackIdOrBadge === 'sky') return TRACK_THEMES['primeiros-passos'];
  if (trackIdOrBadge === 'amber' || trackIdOrBadge === 'yellow' || trackIdOrBadge === 'orange') return TRACK_THEMES['automacao'];
  if (trackIdOrBadge === 'emerald' || trackIdOrBadge === 'green') return TRACK_THEMES['cadastros'];
  if (trackIdOrBadge === 'purple' || trackIdOrBadge === 'violet') return TRACK_THEMES['jadi'];
  if (trackIdOrBadge === 'indigo') return TRACK_THEMES['marketing'];
  if (trackIdOrBadge === 'slate' || trackIdOrBadge === 'zinc' || trackIdOrBadge === 'gray') return TRACK_THEMES['administracao'];

  return TRACK_THEMES['primeiros-passos'];
};
