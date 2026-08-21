import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2,
  RotateCcw, 
  RotateCw,
  CheckCircle2, 
  Circle, 
  ArrowLeft, 
  ArrowRight, 
  Star, 
  Download, 
  FileText, 
  Lightbulb, 
  Share2, 
  BookOpen, 
  Clock, 
  Layers, 
  Sparkles,
  ChevronRight,
  List,
  Edit3,
  Check,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';

export const AulaPlayerView: React.FC = () => {
  const { 
    currentLesson, 
    currentTrack, 
    nextLesson, 
    prevLesson, 
    goToNextLesson, 
    goToPrevLesson, 
    navigateToTrack, 
    navigateToLesson,
    toggleLessonCompleted,
    isCompleted,
    toggleFavorite,
    isFavorite,
    getLessonProgress,
    updateLessonProgress,
    userNotes,
    saveUserNote,
    activeRole
  } = useAcademy();

  // Video player simulator states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [realDurationSec, setRealDurationSec] = useState<number | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(80);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'conteudo' | 'recursos' | 'anotacoes' | 'playlist'>('conteudo');
  const [showBypassWarning, setShowBypassWarning] = useState<boolean>(false);
  const [maxWatchedSec, setMaxWatchedSec] = useState<number>(0);
  const [showSeekNotice, setShowSeekNotice] = useState<boolean>(false);
  
  // Note state
  const [noteText, setNoteText] = useState<string>('');
  const [noteSavedFeedback, setNoteSavedFeedback] = useState<boolean>(false);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const html5VideoRef = useRef<HTMLVideoElement>(null);

  if (!currentLesson || !currentTrack) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl">
        <p className="text-slate-600">Aula não encontrada.</p>
        <button 
          onClick={() => navigateToTrack('atendimento')}
          className="mt-3 px-4 py-2 text-xs font-semibold text-sky-600 bg-sky-50 rounded-lg"
        >
          Ir para Trilha de Atendimento
        </button>
      </div>
    );
  }

  const lessonCompleted = isCompleted(currentLesson.id);
  const totalDurationSeconds = realDurationSec || currentLesson.durationSeconds || 522;

  // Listen to browser fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Sync initial note and progress on lesson switch
  useEffect(() => {
    setNoteText(userNotes[currentLesson.id] || '');
    setIsPlaying(false);
    setRealDurationSec(null);
    setShowSeekNotice(false);
    setShowBypassWarning(false);
    
    // If already in progress, seed current time
    const initialPct = getLessonProgress(currentLesson.id) || 0;
    const startSec = Math.round((initialPct / 100) * totalDurationSeconds);
    setCurrentTimeSec(startSec);

    const isSuper = activeRole === 'super_admin';
    const done = isCompleted(currentLesson.id);
    const initialMax = (done || isSuper) ? totalDurationSeconds : startSec;
    setMaxWatchedSec(initialMax);

    if (html5VideoRef.current) {
      html5VideoRef.current.currentTime = startSec;
    }
  }, [currentLesson.id]);

  // Keep maxWatchedSec updated as current time progresses
  useEffect(() => {
    if (currentTimeSec > maxWatchedSec) {
      setMaxWatchedSec(currentTimeSec);
    }
  }, [currentTimeSec]);

  // Sincronizar velocidade e volume do vídeo HTML5
  useEffect(() => {
    if (html5VideoRef.current) {
      html5VideoRef.current.playbackRate = playbackSpeed;
      html5VideoRef.current.volume = isMuted ? 0 : volume / 100;
      html5VideoRef.current.muted = isMuted;
    }
  }, [playbackSpeed, volume, isMuted]);

  // Video progress timer simulation quando não tem videoUrl ou fallback
  useEffect(() => {
    let interval: any = null;
    const hasRealVideo = !!currentLesson.videoUrl && !isYouTubeUrl(currentLesson.videoUrl);

    // Se tiver elemento de vídeo html5 nativo, ele próprio dispara o onTimeUpdate
    if (isPlaying && !hasRealVideo) {
      interval = setInterval(() => {
        setCurrentTimeSec((prev) => {
          if (prev >= totalDurationSeconds) {
            setIsPlaying(false);
            updateLessonProgress(currentLesson.id, 100);
            return totalDurationSeconds;
          }
          const next = prev + 1 * playbackSpeed;
          const currentPct = Math.round((next / totalDurationSeconds) * 100);
          updateLessonProgress(currentLesson.id, currentPct);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, totalDurationSeconds, currentLesson.id, currentLesson.videoUrl]);

  // Helper para verificar se é YouTube
  function isYouTubeUrl(url?: string): boolean {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  // Extrair Embed do YouTube
  function getYouTubeEmbedUrl(url: string): string {
    try {
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1&controls=0&rel=0&modestbranding=1`;
      }
      if (url.includes('watch?v=')) {
        const id = url.split('watch?v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1&controls=0&rel=0&modestbranding=1`;
      }
      if (url.includes('embed/')) {
        const id = url.split('embed/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1&controls=0&rel=0&modestbranding=1`;
      }
    } catch {
      // fallback
    }
    return url;
  }

  const handleTogglePlay = () => {
    if (html5VideoRef.current && currentLesson.videoUrl && !isYouTubeUrl(currentLesson.videoUrl)) {
      if (isPlaying) {
        html5VideoRef.current.pause();
      } else {
        html5VideoRef.current.play().catch(() => {});
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleToggleFullscreen = () => {
    const container = playerContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(() => {});
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  const attemptSeek = (requestedSec: number) => {
    const done = isCompleted(currentLesson.id);

    // If lesson is fully completed, free seeking is unlocked
    if (done) {
      applySeek(requestedSec);
      setShowSeekNotice(false);
      return;
    }

    // Strictly limit forward seeking to max watched position (+2 seconds buffer)
    const maxAllowedSec = Math.min(totalDurationSeconds, maxWatchedSec + 2);

    if (requestedSec > maxAllowedSec) {
      applySeek(maxAllowedSec);
      setShowSeekNotice(true);
    } else {
      applySeek(requestedSec);
      setShowSeekNotice(false);
    }
  };

  const applySeek = (newSec: number) => {
    const clampedSec = Math.max(0, Math.min(totalDurationSeconds, newSec));
    setCurrentTimeSec(clampedSec);
    setMaxWatchedSec(prev => Math.max(prev, clampedSec));
    const newPct = Math.round((clampedSec / totalDurationSeconds) * 100);
    updateLessonProgress(currentLesson.id, newPct);

    if (html5VideoRef.current) {
      html5VideoRef.current.currentTime = clampedSec;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    attemptSeek(Number(e.target.value));
  };

  const handleSaveNote = () => {
    saveUserNote(currentLesson.id, noteText);
    setNoteSavedFeedback(true);
    setTimeout(() => setNoteSavedFeedback(false), 2000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const savedPercent = getLessonProgress(currentLesson.id) || 0;
  const currentPercent = Math.min(100, Math.round((currentTimeSec / totalDurationSeconds) * 100));
  const effectivePercent = Math.max(currentPercent, savedPercent);
  const isSuperAdmin = activeRole === 'super_admin';
  const canCompleteLesson = lessonCompleted || effectivePercent >= 80 || isSuperAdmin;

  const handleToggleComplete = () => {
    if (lessonCompleted) {
      toggleLessonCompleted(currentLesson.id);
      setShowBypassWarning(false);
    } else if (canCompleteLesson) {
      const ok = toggleLessonCompleted(currentLesson.id);
      if (!ok) {
        setShowBypassWarning(true);
      } else {
        setShowBypassWarning(false);
      }
    } else {
      setShowBypassWarning(true);
    }
  };

  const allLessonsInTrack = currentTrack.modules.flatMap(m => m.lessons);

  return (
    <div className="space-y-6 pb-16">
      {/* Breadcrumb Context */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 overflow-hidden">
          <button 
            onClick={() => navigateToTrack(currentTrack.id)}
            className="hover:text-sky-600 dark:hover:text-sky-400 font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            {currentTrack.title}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{currentLesson.moduleTitle}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
          <span className="font-bold text-slate-900 dark:text-slate-100 truncate">{currentLesson.title}</span>
        </div>

        <button
          onClick={() => navigateToTrack(currentTrack.id)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
        >
          <List className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Ver todos os módulos</span>
        </button>
      </div>

      {/* Title & Subtitle */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800/80 rounded-md">
            {currentLesson.category}
          </span>
          <span className="px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-md">
            {currentLesson.moduleTitle}
          </span>
          <span className="px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-md">
            Nível {currentLesson.level}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {currentLesson.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
          {currentLesson.description}
        </p>
      </div>

      {/* Main Grid: Player (Lg: 8 cols) + Track Modules Sidebar (Lg: 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center Column: Video Player & Actions */}
        <div className="lg:col-span-8 space-y-4">
          {/* VIDEO PLAYER CONTAINER 16:9 */}
          <div 
            ref={playerContainerRef}
            className={`relative w-full ${
              isFullscreen 
                ? 'h-full w-full rounded-none border-0' 
                : 'aspect-video rounded-2xl border border-slate-900'
            } bg-slate-950 overflow-hidden shadow-md group select-none flex flex-col justify-between`}
          >
            {/* Realistic MegaZap Interface Frame Mockup or Real Video Player */}
            {currentLesson.videoUrl ? (
              isYouTubeUrl(currentLesson.videoUrl) ? (
                <iframe
                  src={getYouTubeEmbedUrl(currentLesson.videoUrl)}
                  title={currentLesson.title}
                  className="absolute inset-0 w-full h-full z-0 border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <video
                  ref={html5VideoRef}
                  src={currentLesson.videoUrl}
                  preload="metadata"
                  poster={currentLesson.thumbnail && !currentLesson.thumbnail.includes('unsplash.com') ? currentLesson.thumbnail : undefined}
                  onLoadedMetadata={(e) => {
                    const dur = Math.round((e.target as HTMLVideoElement).duration);
                    if (dur && !isNaN(dur) && dur > 0) {
                      setRealDurationSec(dur);
                    }
                  }}
                  onDurationChange={(e) => {
                    const dur = Math.round((e.target as HTMLVideoElement).duration);
                    if (dur && !isNaN(dur) && dur > 0) {
                      setRealDurationSec(dur);
                    }
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={(e) => {
                    const video = e.target as HTMLVideoElement;
                    const current = Math.round(video.currentTime);
                    const done = lessonCompleted;

                    if (!done && current > maxWatchedSec + 2) {
                      const clamped = Math.min(totalDurationSeconds, maxWatchedSec + 2);
                      video.currentTime = clamped;
                      setCurrentTimeSec(clamped);
                      setShowSeekNotice(true);
                      return;
                    }

                    setCurrentTimeSec(current);
                    setMaxWatchedSec(prev => Math.max(prev, current));
                    const dur = realDurationSec || (video.duration && !isNaN(video.duration) ? Math.round(video.duration) : null) || totalDurationSeconds;
                    if (dur > 0) {
                      const pct = Math.min(100, Math.round((current / dur) * 100));
                      updateLessonProgress(currentLesson.id, pct);
                    }
                  }}
                  onEnded={() => {
                    setIsPlaying(false);
                    updateLessonProgress(currentLesson.id, 100);
                  }}
                  className="absolute inset-0 w-full h-full object-contain bg-black z-0 cursor-pointer"
                  onClick={handleTogglePlay}
                  playsInline
                />
              )
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/20 to-slate-950/90 z-0">
                  <img
                    src={currentLesson.thumbnail}
                    alt={currentLesson.title}
                    className="w-full h-full object-cover opacity-60 group-hover:scale-101 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* In-Video Simulated MegaZap UI Screen Overlay */}
                <div className="absolute inset-3 sm:inset-5 rounded-xl border border-white/10 bg-slate-900/80 backdrop-blur-md z-0 p-3 sm:p-4 flex flex-col justify-between pointer-events-none shadow-2xl">
                  {/* Header inside mockup */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[11px] text-slate-300">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                      <span className="font-bold text-white tracking-wide">MegaZap Multi-Atendimento</span>
                      <span className="text-[10px] text-sky-400 bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-800">
                        Live Demo
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[10px] text-slate-400">
                      <span>CANAL: +55 (11) 98765-4321</span>
                      <span>STATUS: CONECTADO</span>
                    </div>
                  </div>

                  {/* Center Content Mockup */}
                  <div className="flex-1 flex flex-col justify-center items-center text-center p-2">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-sky-600/90 text-white flex items-center justify-center shadow-lg border border-sky-400/30 mb-2">
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </div>
                    <h4 className="text-white font-bold text-xs sm:text-base drop-shadow-sm">
                      {currentLesson.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-sky-200/80 max-w-md mt-1 drop-shadow-xs line-clamp-1 sm:line-clamp-2">
                      {currentLesson.aboutText}
                    </p>
                  </div>

                  {/* Bottom tag inside mockup */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-slate-400">
                    <span>Trilha Oficial: {currentTrack.title}</span>
                    <span className="font-semibold text-slate-300">MegaZap Academy • Resolução 1080p</span>
                  </div>
                </div>
              </>
            )}

            {/* Top Bar Video Overlay */}
            <div className="relative z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10.5px] font-bold text-white bg-sky-600/90 backdrop-blur-xs rounded-md shadow-xs">
                  AULA OFICIAL
                </span>
                <span className="text-xs font-semibold text-white/90 drop-shadow-xs truncate max-w-xs sm:max-w-md">
                  {currentLesson.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleFavorite(currentLesson.id)}
                  className="p-1.5 rounded-lg bg-black/40 hover:bg-black/70 text-white transition-colors cursor-pointer"
                  title="Favoritar aula"
                >
                  <Star className={`w-4 h-4 ${isFavorite(currentLesson.id) ? 'fill-amber-400 text-amber-400' : 'text-white'}`} />
                </button>
              </div>
            </div>

            {/* Big Central Play / Pause Click Target */}
            {!isYouTubeUrl(currentLesson.videoUrl) && (
              <div 
                onClick={handleTogglePlay}
                className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
              >
                {!isPlaying && (
                  <div className="w-16 h-16 rounded-full bg-sky-600/90 hover:bg-sky-500 text-white flex items-center justify-center shadow-xl transition-all transform hover:scale-110">
                    <Play className="w-7 h-7 fill-white ml-1" />
                  </div>
                )}
              </div>
            )}

            {/* Bottom Controls Bar */}
            <div className="relative z-20 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent space-y-2">
              {/* Scrub Seek Bar */}
              <div className="flex items-center gap-2 group/slider">
                <input
                  type="range"
                  min={0}
                  max={totalDurationSeconds}
                  value={currentTimeSec}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:h-2 transition-all"
                />
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-3">
                  {/* Play/Pause */}
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="p-1 text-white hover:text-sky-400 transition-colors cursor-pointer"
                    aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
                  >
                    {isPlaying ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5 fill-white" />}
                  </button>

                  {/* Reset / Replay 10s */}
                  <button
                    type="button"
                    onClick={() => attemptSeek(currentTimeSec - 10)}
                    className="hidden sm:block p-1 text-white/80 hover:text-white transition-colors cursor-pointer"
                    title="Voltar 10s"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* Fast Forward 10s (capped) */}
                  <button
                    type="button"
                    onClick={() => attemptSeek(currentTimeSec + 10)}
                    className="hidden sm:block p-1 text-white/80 hover:text-white transition-colors cursor-pointer"
                    title="Avançar 10s (máx. 30s do trecho assistido)"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  {/* Volume Toggle & Slider */}
                  <div className="flex items-center gap-1.5 group/vol">
                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1 text-white/80 hover:text-white transition-colors cursor-pointer"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(Number(e.target.value));
                        setIsMuted(false);
                      }}
                      className="w-14 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white hidden sm:block"
                    />
                  </div>

                  {/* Time info */}
                  <span className="font-mono text-[11px] text-white/90">
                    {formatTime(currentTimeSec)} / {formatTime(totalDurationSeconds)}
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Playback Speed selector */}
                  <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-[11px]">
                    {[1, 1.25, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`px-1 rounded font-semibold cursor-pointer ${
                          playbackSpeed === speed ? 'text-sky-400 bg-white/20' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>

                  {/* Fullscreen toggle */}
                  <button
                    type="button"
                    onClick={handleToggleFullscreen}
                    className="p-1 text-white/80 hover:text-white transition-colors cursor-pointer"
                    title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
                    aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* PLAYER PROGRESS & ACTION BAR */}
          <div className="space-y-2">
            {showSeekNotice && !lessonCompleted && (
              <div className="bg-sky-50 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-200 p-3 rounded-xl text-xs flex items-center justify-between gap-2.5 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                  <div>
                    <span className="font-bold block">Avanço de vídeo bloqueado!</span>
                    <span>Para garantir o aprendizado real, você só pode avançar até o trecho da aula que já assistiu.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSeekNotice(false)}
                  className="text-xs font-bold text-sky-700 dark:text-sky-300 hover:underline shrink-0 cursor-pointer"
                >
                  Entendi
                </button>
              </div>
            )}

            {showBypassWarning && !lessonCompleted && !canCompleteLesson && (
              <div className="bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 p-3 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Assista à aula para poder concluir!</span>
                  <span>Para garantir o aprendizado real, você precisa assistir a pelo menos <b>80% do vídeo</b>. Progresso atual do vídeo: <b>{effectivePercent}%</b>.</span>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Progresso da aula</span>
                  <span className="font-bold text-sky-700 dark:text-sky-400">{effectivePercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sky-600 rounded-full transition-all duration-300"
                    style={{ width: `${effectivePercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  id="toggle-complete-lesson-btn"
                  onClick={handleToggleComplete}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    lessonCompleted
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 cursor-pointer'
                      : canCompleteLesson
                      ? 'bg-sky-600 text-white hover:bg-sky-700 cursor-pointer'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-80'
                  }`}
                  title={!canCompleteLesson ? 'Assista a pelo menos 80% do vídeo para liberar a conclusão' : undefined}
                >
                  {lessonCompleted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Aula Concluída ✓</span>
                    </>
                  ) : canCompleteLesson ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isSuperAdmin && effectivePercent < 80 ? 'Concluir (Modo Admin)' : 'Marcar como concluída'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <span>Concluir ({effectivePercent}% / 80%)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* TABS FOR LESSON DETAILS: Sobre, O que vai aprender, Recursos, Anotações */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
            {/* Tab navigation buttons */}
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 overflow-x-auto text-xs custom-scrollbar">
              <button
                onClick={() => setActiveTab('conteudo')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'conteudo'
                    ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Conteúdo & Objetivos
              </button>

              <button
                onClick={() => setActiveTab('recursos')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'recursos'
                    ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>Materiais Complementares</span>
                {currentLesson.resources && currentLesson.resources.length > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] bg-sky-200 dark:bg-sky-800 text-sky-800 dark:text-sky-100 rounded-full font-extrabold">
                    {currentLesson.resources.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('anotacoes')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'anotacoes'
                    ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Minhas Anotações</span>
              </button>
            </div>

            {/* TAB 1: CONTEÚDO */}
            {activeTab === 'conteudo' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Sobre esta aula */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Sobre esta aula
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {currentLesson.aboutText}
                  </p>
                </div>

                {/* Nesta aula você vai aprender */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                    Nesta aula você vai aprender
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentLesson.learningObjectives.map((obj, idx) => (
                      <div 
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 flex items-start gap-2.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700 dark:text-slate-200 leading-snug">{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DICA MEGAZAP (Card em Azul Claro) */}
                <div className="p-4.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/90 dark:border-sky-800/80 flex items-start gap-3.5 shadow-2xs">
                  <div className="p-2 rounded-lg bg-sky-600 text-white shrink-0 shadow-xs">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-sky-950 dark:text-sky-200 uppercase tracking-wider mb-1">
                      Dica MegaZap para Parceiros
                    </h4>
                    <p className="text-xs text-sky-900/90 dark:text-sky-300/90 leading-relaxed font-medium">
                      {currentLesson.megaZapTip}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: RECURSOS COMPLEMENTARES */}
            {activeTab === 'recursos' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                    Recursos e Materiais para Download
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Arquivos de apoio, manuais em PDF e templates prontos para você aplicar na sua operação.
                  </p>
                </div>

                {(!currentLesson.resources || currentLesson.resources.length === 0) ? (
                  <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 rounded-xl text-xs text-slate-400 dark:text-slate-400">
                    Esta aula não possui arquivos para download adicionais. O conteúdo prático está integralmente explicado no vídeo.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {currentLesson.resources.map((res) => (
                      <div
                        key={res.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:border-sky-300 dark:hover:border-sky-600 hover:bg-sky-50/30 dark:hover:bg-sky-950/30 flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{res.title}</p>
                            <span className="text-[10.5px] text-slate-400 dark:text-slate-500 font-mono">{res.size || 'Arquivo Digital'}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => alert(`Iniciando download de: ${res.title}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-600 dark:hover:bg-sky-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Baixar</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ANOTAÇÕES */}
            {activeTab === 'anotacoes' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Suas Anotações Pessoais
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Suas notas são salvas automaticamente para consultas futuras.
                    </p>
                  </div>
                  {noteSavedFeedback && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                      <Check className="w-3 h-3" />
                      Salvo!
                    </span>
                  )}
                </div>

                <textarea
                  id="lesson-note-textarea"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Escreva aqui suas observações sobre esta funcionalidade, parâmetros para configurar ou dúvidas para alinhar com sua equipe..."
                  rows={5}
                  className="w-full p-3.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 leading-relaxed"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors cursor-pointer shadow-2xs"
                  >
                    Salvar anotação
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* NAVEGAÇÃO ENTRE AULAS (BOTTOM BAR) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Aula Anterior */}
            {prevLesson ? (
              <button
                type="button"
                id="btn-prev-lesson"
                onClick={goToPrevLesson}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-600 hover:bg-sky-50/20 dark:hover:bg-slate-800/60 text-left transition-all group cursor-pointer shadow-2xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/60 text-slate-600 dark:text-slate-300 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors shrink-0">
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      ← Aula anterior
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate">
                      {prevLesson.title}
                    </h4>
                    <span className="text-[10.5px] text-slate-400 dark:text-slate-500">{prevLesson.duration}</span>
                  </div>
                </div>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 flex items-center">
                Primeira aula deste módulo.
              </div>
            )}

            {/* Próxima Aula */}
            {nextLesson ? (
              <button
                type="button"
                id="btn-next-lesson"
                onClick={goToNextLesson}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-600 hover:bg-sky-50/20 dark:hover:bg-slate-800/60 text-right transition-all group cursor-pointer shadow-2xs flex items-center justify-between sm:justify-end gap-3"
              >
                <div className="min-w-0 text-left sm:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 block">
                    Próxima aula →
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate">
                    {nextLesson.title}
                  </h4>
                  <span className="text-[10.5px] text-slate-400 dark:text-slate-500">{nextLesson.duration}</span>
                </div>
                <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 group-hover:bg-sky-600 text-sky-700 dark:text-sky-300 group-hover:text-white transition-all shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                🎉 Você chegou ao fim desta trilha!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Playlist / Módulos da Trilha */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Trilha Atual
                </span>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                  {currentTrack.title}
                </h3>
              </div>
              <span className="text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md">
                {allLessonsInTrack.length} aulas
              </span>
            </div>

            {/* Scrollable list of modules & lessons */}
            <div className="max-h-[650px] overflow-y-auto space-y-3 mt-3 custom-scrollbar text-xs">
              {currentTrack.modules.map((mod, modIdx) => (
                <div key={mod.id} className="border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/40 dark:bg-slate-950/40">
                  <div className="px-3 py-2 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60">
                      Módulo {String(modIdx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate ml-2">
                      {mod.title}
                    </span>
                  </div>

                  <div className="p-1.5 space-y-1 bg-white dark:bg-slate-900">
                    {mod.lessons.map((lesson) => {
                      const isCurrent = lesson.id === currentLesson.id;
                      const completed = isCompleted(lesson.id);

                      return (
                        <div
                          key={lesson.id}
                          id={`playlist-item-${lesson.id}`}
                          onClick={() => navigateToLesson(lesson.id, currentTrack.id)}
                          className={`p-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer border ${
                            isCurrent
                              ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-950 dark:text-sky-100 font-bold border-sky-300 dark:border-sky-700 shadow-2xs'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : isCurrent ? (
                              <div className="w-4 h-4 rounded-full bg-sky-600 flex items-center justify-center shrink-0 shadow-2xs">
                                <Play className="w-2 h-2 fill-white ml-0.5" />
                              </div>
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                            )}

                            <span className="text-xs truncate">
                              {lesson.title}
                            </span>
                          </div>

                          <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 pl-2 font-medium">
                            {lesson.duration}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
