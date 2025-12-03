import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import ClayMascot from '../components/ClayMascot';

export default function LearnVideo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (id) {
      apiService.getLesson(id)
        .then(setLesson)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading video...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted mb-4">Lesson not found</p>
          <Link to="/lessons" className="btn-primary">Browse Lessons</Link>
        </div>
      </div>
    );
  }

  // Check if video URL exists
  const hasVideo = lesson.video_url && lesson.video_url.startsWith('http');

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-charcoal/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(`/lessons/${id}`)}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <h2 className="text-white font-medium truncate max-w-md">{lesson.title}</h2>
          
          <ClayMascot 
            field={lesson.field_name || 'Technology'} 
            size="sm" 
            animation="idle"
          />
        </div>
      </div>

      {hasVideo && !videoError ? (
        /* Video Player - TikTok Style */
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <div className="relative w-full max-w-[400px] aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl">
            <video
              ref={videoRef}
              src={lesson.video_url}
              className="w-full h-full object-contain"
              controls
              playsInline
              onError={() => setVideoError(true)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            
            {/* Overlay info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
              <h3 className="text-white font-semibold text-lg mb-1">{lesson.title}</h3>
              <p className="text-white/70 text-sm">{lesson.field_name} • {lesson.difficulty_level}</p>
            </div>
          </div>
          
          {/* Actions below video */}
          <div className="flex gap-4 mt-6">
            <Link 
              to={`/learn/read/${id}`}
              className="btn-secondary px-6 py-3"
            >
              📖 Read Mode
            </Link>
            <Link 
              to={`/quiz/${id}`}
              className="btn-primary px-6 py-3"
            >
              🎯 Take Quiz
            </Link>
          </div>
        </div>
      ) : (
        /* No Video - Coming Soon */
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="mb-8 animate-float">
              <ClayMascot 
                field={lesson.field_name || 'Technology'} 
                size="lg" 
                animation="wave"
                className="mx-auto"
              />
            </div>

            <h1 className="text-4xl font-semibold text-white mb-4">
              {videoError ? 'Video Unavailable' : 'Video Coming Soon!'}
            </h1>
            
            <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
              {videoError 
                ? 'There was an issue loading this video. Try our other learning modes instead.'
                : 'This lesson doesn\'t have a video yet. Try our other learning modes in the meantime.'
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to={`/learn/read/${id}`}
                className="btn-primary px-8 py-4"
              >
                Try Deep Read Mode
              </Link>
              <Link 
                to={`/learn/${id}`}
                className="btn-secondary px-8 py-4"
              >
                Try Quick Swipe Mode
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
