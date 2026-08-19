import React from 'react';
import { Play } from 'lucide-react';
import { Lesson } from '../types';

interface VideoThumbnailProps {
  lesson: Lesson;
  className?: string;
  showPlayOverlay?: boolean;
}

export const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  lesson,
  className = 'w-full h-full object-cover',
  showPlayOverlay = false,
}) => {
  const hasDirectVideo = !!lesson.videoUrl && !lesson.videoUrl.includes('youtube.com') && !lesson.videoUrl.includes('youtu.be');
  const hasCustomNonStockThumbnail = !!lesson.thumbnail && !lesson.thumbnail.includes('unsplash.com');

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden flex items-center justify-center select-none">
      {hasCustomNonStockThumbnail ? (
        <img
          src={lesson.thumbnail}
          alt={lesson.title}
          className={className}
          referrerPolicy="no-referrer"
        />
      ) : hasDirectVideo ? (
        /* Renderiza o próprio primeiro frame (0.5s) do vídeo real hospedado no servidor */
        <video
          src={`${lesson.videoUrl}#t=0.5`}
          preload="metadata"
          muted
          playsInline
          className={`${className} pointer-events-none`}
        />
      ) : (
        /* Fallback com identidade visual e tipografia da plataforma MegaZap */
        <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-sky-400 bg-sky-950/80 border border-sky-800/80 px-1.5 py-0.5 rounded">
              {lesson.category}
            </span>
            <span className="w-2 h-2 rounded-full bg-sky-500/80" />
          </div>
          <div className="text-center px-1">
            <span className="text-[11px] font-bold text-slate-200 line-clamp-2 leading-snug">
              {lesson.title}
            </span>
          </div>
          <div className="text-[9px] font-medium text-slate-400 truncate">
            {lesson.moduleTitle}
          </div>
        </div>
      )}

      {showPlayOverlay && (
        <div className="absolute inset-0 bg-slate-950/25 group-hover:bg-slate-950/10 transition-colors flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-sky-600/90 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-sky-500 transition-all">
            <Play className="w-4 h-4 fill-white ml-0.5" />
          </div>
        </div>
      )}
    </div>
  );
};
