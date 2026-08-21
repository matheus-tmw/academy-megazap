import React from 'react';
import { 
  Bookmark, 
  Play, 
  Clock, 
  Trash2, 
  ArrowRight, 
  Layers,
  CheckCircle2,
  Star
} from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { ALL_LESSONS } from '../data/coursesData';
import { VideoThumbnail } from '../components/VideoThumbnail';

export const FavoritosView: React.FC = () => {
  const { 
    favoriteLessons, 
    toggleFavorite, 
    navigateToLesson, 
    navigateTo,
    isCompleted,
    getLessonDisplayDuration
  } = useAcademy();

  const favoriteLessonObjects = ALL_LESSONS.filter(l => favoriteLessons.includes(l.id));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Meus Favoritos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Aulas e tutoriais salvos para consulta rápida e revisão estratégica.
          </p>
        </div>

        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700 self-start sm:self-auto">
          {favoriteLessonObjects.length} aulas salvas
        </span>
      </div>

      {/* Grid or Empty state */}
      {favoriteLessonObjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-500 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Nenhuma aula favoritada ainda</h3>
          <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Ao assistir a uma aula, clique no ícone de estrela para salvá-la nesta lista e acessá-la com 1 clique.
          </p>
          <button
            onClick={() => navigateTo('catalogo')}
            className="mt-4 px-4 py-2 text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 rounded-lg transition-colors cursor-pointer"
          >
            Explorar Catálogo de Aulas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {favoriteLessonObjects.map((lesson) => {
            const completed = isCompleted(lesson.id);

            return (
              <div
                key={lesson.id}
                id={`favorite-card-${lesson.id}`}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  {/* Video Thumbnail */}
                  <div 
                    onClick={() => navigateToLesson(lesson.id, lesson.trackId)}
                    className="w-full h-36 bg-slate-900 relative cursor-pointer overflow-hidden"
                  >
                    <VideoThumbnail lesson={lesson} showPlayOverlay />

                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="px-2 py-0.5 text-[10px] font-bold text-slate-800 bg-white/95 backdrop-blur-xs rounded-md shadow-xs">
                        {lesson.category}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(lesson.id);
                      }}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-amber-400 backdrop-blur-xs transition-colors cursor-pointer z-10"
                      title="Remover dos favoritos"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                    </button>

                    {getLessonDisplayDuration(lesson) && (
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-slate-900/80 backdrop-blur-xs text-[10px] font-medium text-white rounded flex items-center gap-1 z-10">
                        <Clock className="w-3 h-3" />
                        {getLessonDisplayDuration(lesson)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <span className="text-[10.5px] text-slate-400 dark:text-slate-400 font-medium truncate block mb-1">
                      {lesson.moduleTitle}
                    </span>

                    <h3 
                      onClick={() => navigateToLesson(lesson.id, lesson.trackId)}
                      className="font-bold text-slate-900 dark:text-slate-100 text-sm hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer line-clamp-2 mb-2"
                    >
                      {lesson.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {lesson.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-2">
                  {completed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Concluída
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 dark:text-slate-400">
                      Nível {lesson.level}
                    </span>
                  )}

                  <button
                    onClick={() => navigateToLesson(lesson.id, lesson.trackId)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 cursor-pointer"
                  >
                    <span>Assistir aula</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
