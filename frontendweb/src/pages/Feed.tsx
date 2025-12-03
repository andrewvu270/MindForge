import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import ClayMascot from '../components/ClayMascot';
import { LottieLoader } from '../components/LottieEnhanced';

interface FeedItem {
  id: string;
  lessonId: string;
  title: string;
  field: string;
  duration: number;
  thumbnail: string;
  videoUrl?: string;
  summary: string;
  sources: number;
}

export default function Feed() {
  const navigate = useNavigate();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const allFields = ['Technology', 'Finance', 'Economics', 'Culture', 'Influence', 'Global Events'];
  const allDifficulties = ['Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    loadFeed();
  }, [selectedFields, selectedDifficulties]);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const lessons = await apiService.getLessons('');

      // Filter lessons based on selected criteria
      let filteredLessons = lessons;

      if (selectedFields.length > 0) {
        filteredLessons = filteredLessons.filter((lesson: any) =>
          selectedFields.includes(lesson.field_name)
        );
      }

      if (selectedDifficulties.length > 0) {
        filteredLessons = filteredLessons.filter((lesson: any) =>
          selectedDifficulties.includes(lesson.difficulty_level)
        );
      }

      // Transform lessons into feed items (load more for infinite scroll)
      const feedItems: FeedItem[] = filteredLessons.slice(0, 20).map((lesson: any) => ({
        id: `feed-${lesson.id}`,
        lessonId: lesson.id,
        title: lesson.title,
        field: lesson.field_name || 'General',
        duration: lesson.estimated_minutes || 3,
        thumbnail: getFieldGradient(lesson.field_name),
        videoUrl: lesson.video_url,
        summary: lesson.content?.slice(0, 150) + '...' || '',
        sources: lesson.sources?.length || 3,
      }));

      setItems(feedItems);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleField = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const toggleDifficulty = (difficulty: string) => {
    setSelectedDifficulties(prev =>
      prev.includes(difficulty)
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const clearFilters = () => {
    setSelectedFields([]);
    setSelectedDifficulties([]);
  };

  const getFieldGradient = (field: string): string => {
    const gradients: Record<string, string> = {
      'Technology': 'from-coral to-rose',
      'Finance': 'from-sage to-sky',
      'Economics': 'from-honey to-coral',
      'Culture': 'from-sky to-lavender',
      'Influence': 'from-lavender to-rose',
      'Global Events': 'from-sage to-honey',
    };
    return gradients[field] || 'from-charcoal to-charcoal-light';
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < items.length) {
      setCurrentIndex(newIndex);
    }
  };

  const goToLesson = (lessonId: string) => {
    navigate(`/learn/${lessonId}`);
  };

  if (loading) {
    return (
      <div className="h-screen bg-charcoal flex items-center justify-center">
        <LottieLoader message="Loading feed..." />
      </div>
    );
  }

  return (
    <div className="h-screen bg-charcoal overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 px-4 py-4 flex items-center justify-between bg-gradient-to-b from-charcoal/80 to-transparent">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 rounded-full hover:bg-white/10 text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-white font-medium">Video Feed</span>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 rounded-full hover:bg-white/10 text-white relative"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {(selectedFields.length > 0 || selectedDifficulties.length > 0) && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-coral rounded-full" />
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="absolute top-16 left-0 right-0 z-50 bg-charcoal/95 backdrop-blur-lg border-b border-white/10 animate-slide-down">
          <div className="p-6 max-w-2xl mx-auto">
            {/* Fields */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium text-sm">Fields</h3>
                {selectedFields.length > 0 && (
                  <button
                    onClick={() => setSelectedFields([])}
                    className="text-coral text-xs hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {allFields.map(field => (
                  <button
                    key={field}
                    onClick={() => toggleField(field)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedFields.includes(field)
                      ? 'bg-coral text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                  >
                    {field}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulties */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium text-sm">Difficulty</h3>
                {selectedDifficulties.length > 0 && (
                  <button
                    onClick={() => setSelectedDifficulties([])}
                    className="text-coral text-xs hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {allDifficulties.map(difficulty => (
                  <button
                    key={difficulty}
                    onClick={() => toggleDifficulty(difficulty)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedDifficulties.includes(difficulty)
                      ? 'bg-sage text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 px-4 py-3 bg-coral text-white rounded-xl font-medium hover:bg-coral/90 transition-colors"
              >
                Apply Filters
              </button>
            </div>

            {/* Results count */}
            <p className="text-white/50 text-xs text-center mt-4">
              {items.length} videos {(selectedFields.length > 0 || selectedDifficulties.length > 0) && 'matching your filters'}
            </p>
          </div>
        </div>
      )}

      {/* Feed Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {items.map((item, index) => (
          <FeedCard
            key={item.id}
            item={item}
            isActive={index === currentIndex}
            onExpand={() => goToLesson(item.lessonId)}
          />
        ))}
      </div>

      {/* Progress dots */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-40">
        {items.slice(0, 8).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-white h-4' : 'bg-white/30'
              }`}
          />
        ))}
      </div>
    </div>
  );
}

interface FeedCardProps {
  item: FeedItem;
  isActive: boolean;
  onExpand: () => void;
}

function FeedCard({ item, isActive, onExpand }: FeedCardProps) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-play/pause video based on active state
  useEffect(() => {
    if (videoRef.current) {
      if (isActive && item.videoUrl) {
        videoRef.current.play().catch(() => { });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive, item.videoUrl]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div
      className="h-screen w-full snap-start snap-always relative flex items-center justify-center"
      onClick={() => setShowOverlay(!showOverlay)}
    >
      {/* Background - Video or gradient fallback */}
      <div className={`absolute inset-0 bg-gradient-to-br ${item.thumbnail}`}>
        {item.videoUrl ? (
          <video
            ref={videoRef}
            src={item.videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            loop
            muted
            playsInline
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <ClayMascot
                field={item.field}
                size="lg"
                animation={isActive ? 'wave' : 'idle'}
                className="mx-auto"
              />
              <div className="mt-6 space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                  <div className="w-2 h-2 bg-coral rounded-full animate-pulse" />
                  <span className="text-white/60 text-sm">Video coming soon</span>
                </div>
                <p className="text-white/40 text-sm">Swipe up for next lesson</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-charcoal/30" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-24">
        {/* Field tag */}
        <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium mb-3">
          {item.field}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-white mb-2 leading-tight">
          {item.title}
        </h2>

        {/* Summary */}
        <p className="text-white/70 text-sm mb-4 line-clamp-2">
          {item.summary}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-white/50 text-xs">
          <span>{item.duration} min</span>
          <span>·</span>
          <span>{item.sources} sources</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute right-4 bottom-32 flex flex-col gap-6">
        {/* Mute/Unmute button - only show if video exists */}
        {item.videoUrl && (
          <button
            onClick={toggleMute}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all hover:scale-110 shadow-lg">
              {isMuted ? (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </div>
            <span className="text-white text-sm font-semibold drop-shadow-lg">{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>
        )}

        {/* Learn/Watch button */}
        <button
          onClick={(e) => { e.stopPropagation(); onExpand(); }}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-16 h-16 rounded-full bg-coral backdrop-blur-sm flex items-center justify-center text-white hover:bg-coral/90 transition-all hover:scale-110 shadow-lg">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-white text-sm font-semibold drop-shadow-lg">Watch</span>
        </button>

        {/* Bookmark button */}
        <button
          onClick={(e) => { e.stopPropagation(); setBookmarked(!bookmarked); }}
          className="flex flex-col items-center gap-2"
        >
          <div className={`w-16 h-16 rounded-full backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 shadow-lg ${bookmarked ? 'bg-sage text-white' : 'bg-white/20 text-white hover:bg-white/30'
            }`}>
            <svg className="w-8 h-8" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <span className="text-white text-sm font-semibold drop-shadow-lg">{bookmarked ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* Expand overlay */}
      {showOverlay && (
        <div
          className="absolute inset-0 bg-charcoal/95 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
          onClick={(e) => { e.stopPropagation(); setShowOverlay(false); }}
        >
          <div className="text-center p-6 max-w-md mx-auto" onClick={(e) => e.stopPropagation()}>
            {/* Mascot */}
            <div className="mb-6">
              <ClayMascot
                field={item.field}
                size="md"
                animation="wave"
                className="mx-auto"
              />
            </div>

            {/* Title */}
            <h3 className="text-2xl font-semibold text-white mb-3">{item.title}</h3>

            {/* Summary */}
            <p className="text-white/70 text-sm mb-6 leading-relaxed">
              {item.summary}
            </p>

            {/* Meta */}
            <div className="flex items-center justify-center gap-4 text-white/50 text-sm mb-8">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {item.duration} min
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {item.sources} sources
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); onExpand(); }}
                className="px-6 py-4 bg-coral text-white rounded-xl font-medium hover:bg-coral/90 transition-colors"
              >
                Start Learning
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowOverlay(false); }}
                className="px-6 py-4 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
              >
                Keep Scrolling
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
