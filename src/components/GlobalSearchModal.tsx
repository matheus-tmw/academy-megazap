import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  PlayCircle, 
  Compass, 
  Layers, 
  Clock, 
  ChevronRight, 
  ArrowRight,
  Sparkles,
  MessageSquare,
  GitBranch,
  Megaphone,
  Database,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { ALL_LESSONS, TRACKS_DATA } from '../data/coursesData';
import { Lesson, Track } from '../types';

export const GlobalSearchModal: React.FC = () => {
  const { 
    isSearchModalOpen, 
    setIsSearchModalOpen, 
    searchQuery, 
    setSearchQuery,
    navigateToLesson,
    navigateToTrack,
    isCompleted
  } = useAcademy();

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on open & keyboard shortcut Cmd+K / Escape
  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (e.key === 'Escape' && isSearchModalOpen) {
        setIsSearchModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, setIsSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  const cleanQuery = searchQuery.trim().toLowerCase();

  // Filtered tracks
  const matchedTracks: Track[] = cleanQuery
    ? TRACKS_DATA.filter(t => 
        t.title.toLowerCase().includes(cleanQuery) ||
        t.category.toLowerCase().includes(cleanQuery) ||
        t.description.toLowerCase().includes(cleanQuery)
      )
    : [];

  // Filtered lessons
  const matchedLessons: Lesson[] = cleanQuery
    ? ALL_LESSONS.filter(l => 
        l.title.toLowerCase().includes(cleanQuery) ||
        l.description.toLowerCase().includes(cleanQuery) ||
        l.moduleTitle.toLowerCase().includes(cleanQuery) ||
        l.category.toLowerCase().includes(cleanQuery) ||
        l.learningObjectives.some(obj => obj.toLowerCase().includes(cleanQuery))
      )
    : [];

  const handleSelectLesson = (lesson: Lesson) => {
    navigateToLesson(lesson.id, lesson.trackId);
    setIsSearchModalOpen(false);
  };

  const handleSelectTrack = (track: Track) => {
    navigateToTrack(track.id);
    setIsSearchModalOpen(false);
  };

  const trackIconMap: Record<string, React.ReactNode> = {
    'primeiros-passos': <Compass className="w-4 h-4 text-sky-500" />,
    'atendimento': <MessageSquare className="w-4 h-4 text-sky-500" />,
    'automacao': <GitBranch className="w-4 h-4 text-amber-500" />,
    'marketing': <Megaphone className="w-4 h-4 text-blue-500" />,
    'cadastros': <Database className="w-4 h-4 text-emerald-500" />,
    'jadi': <Sparkles className="w-4 h-4 text-purple-500" />,
    'administracao': <ShieldCheck className="w-4 h-4 text-slate-500" />,
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsSearchModalOpen(false);
        }
      }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4 cursor-pointer"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsSearchModalOpen(false)}
      />

      {/* Modal Card */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] z-10 animate-in fade-in zoom-in-95 duration-150 cursor-default"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-5 h-5 text-sky-600 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            id="global-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquise por aulas, módulos, tópicos ou trilhas (ex: mensagens, QR code, fluxos, JADI)..."
            className="w-full text-sm bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 font-medium"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="text-[10px] font-semibold text-slate-400 bg-white px-1.5 py-0.5 border border-slate-200 rounded shadow-2xs">
              ESC
            </kbd>
          )}
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar text-xs">
          {!cleanQuery ? (
            <div className="py-6 px-2 text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-700 text-sm mb-1">
                Busca Global MegaZap Academy
              </h3>
              <p className="text-slate-400 text-xs max-w-sm mx-auto mb-4">
                Digite uma palavra-chave para encontrar rapidamente aulas, tutoriais e procedimentos operacionais.
              </p>
              
              {/* Quick suggestions */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-[11px] text-slate-400">Sugestões:</span>
                {['Mensagens Rápidas', 'QR Code', 'Fluxos de Automação', 'JADI IA', 'Tags', 'Relatórios'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-2.5 py-1 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 border border-slate-200/70 rounded-full transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : matchedTracks.length === 0 && matchedLessons.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-600 font-semibold text-sm">Nenhum resultado encontrado para "{searchQuery}"</p>
              <p className="text-slate-400 text-xs mt-1">Tente pesquisar por termos mais gerais, como "atendimento", "automação" ou "configuração".</p>
            </div>
          ) : (
            <>
              {/* Matched Tracks */}
              {matchedTracks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-sky-600" />
                      Trilhas ({matchedTracks.length})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matchedTracks.map((track) => (
                      <div
                        key={track.id}
                        onClick={() => handleSelectTrack(track)}
                        className="p-3 rounded-xl border border-slate-200/80 hover:border-sky-300 hover:bg-sky-50/40 transition-all cursor-pointer group flex items-start gap-3 bg-white"
                      >
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:shadow-xs transition-all shrink-0">
                          {trackIconMap[track.id] || <Compass className="w-4 h-4 text-sky-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-slate-800 text-xs group-hover:text-sky-600 truncate">
                              {track.title}
                            </h4>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-sky-500 shrink-0" />
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {track.shortDescription}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-[10.5px] text-slate-400">
                            <span>{track.modules.length} módulos</span>
                            <span>•</span>
                            <span>{track.estimatedHours}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Lessons */}
              {matchedLessons.length > 0 && (
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                      <PlayCircle className="w-3.5 h-3.5 text-sky-600" />
                      Aulas e Tutoriais ({matchedLessons.length})
                    </span>
                  </div>

                  <div className="space-y-2">
                    {matchedLessons.map((lesson) => {
                      const completed = isCompleted(lesson.id);
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => handleSelectLesson(lesson)}
                          className="p-3 rounded-xl border border-slate-200/80 hover:border-sky-300 hover:bg-sky-50/30 transition-all cursor-pointer group flex items-start gap-3 bg-white"
                        >
                          <div className="w-16 h-11 rounded-lg overflow-hidden bg-slate-100 relative shrink-0 border border-slate-200/60">
                            <img
                              src={lesson.thumbnail}
                              alt={lesson.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center">
                              <PlayCircle className="w-4 h-4 text-white drop-shadow-xs" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-100">
                                {lesson.category}
                              </span>
                              <span className="text-[10px] text-slate-400 truncate">
                                {lesson.moduleTitle}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-semibold text-slate-800 text-xs group-hover:text-sky-600 transition-colors truncate">
                                {lesson.title}
                              </h4>
                              {completed && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 shrink-0">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                  Concluída
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {lesson.description}
                            </p>

                            <div className="flex items-center gap-3 mt-1.5 text-[10.5px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {lesson.duration}
                              </span>
                              <span>•</span>
                              <span>Nível {lesson.level}</span>
                            </div>
                          </div>

                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 self-center shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>Navegue com facilidade</span>
            <span>•</span>
            <span>MegaZap Partner Knowledge Base</span>
          </div>
          <button
            onClick={() => setIsSearchModalOpen(false)}
            className="font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Fechar janela
          </button>
        </div>
      </div>
    </div>
  );
};
