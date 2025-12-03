import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';
import ClayMascot, { MascotLoader } from '../components/ClayMascot';

export default function LessonDetail() {
  const { id } = useParams();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLearningModes, setShowLearningModes] = useState(false);

  useEffect(() => {
    if (id) apiService.getLesson(id).then(setLesson).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <MascotLoader field="Technology" message="Loading lesson..." />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="text-xl text-muted">Lesson not found</p>
          <Link to="/lessons" className="btn-primary mt-6 inline-block">Back to Lessons</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link 
          to="/lessons" 
          className="inline-flex items-center gap-2 text-muted hover:text-charcoal transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Lessons
        </Link>

        {/* Mascot Guide */}
        <div className="flex items-center gap-4 mb-6 animate-slide-up">
          <ClayMascot 
            field={lesson.field_name || 'Technology'} 
            size="md" 
            animation="wave"
          />
          <div className="flex-1">
            <p className="text-sm text-muted">Your guide for this lesson</p>
            <p className="font-medium text-charcoal">{lesson.field_name || 'Technology'}</p>
          </div>
        </div>

        {/* Lesson Card */}
        <div className="card mb-8 animate-scale-in">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="pill pill-coral">{lesson.difficulty_level}</span>
            <span className="text-sm text-muted">{lesson.estimated_minutes} min read</span>
            {lesson.sources?.length > 0 && (
              <span className="pill pill-sage">{lesson.sources.length} sources</span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-semibold text-charcoal mb-6 leading-tight">
            {lesson.title}
          </h1>

          {/* Learning Objectives */}
          {lesson.learning_objectives?.length > 0 && (
            <div className="mb-8 p-6 bg-sky-light rounded-2xl">
              <h3 className="font-semibold text-charcoal mb-4">Learning Objectives</h3>
              <ul className="space-y-3">
                {lesson.learning_objectives.map((obj: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky mt-2 flex-shrink-0" />
                    <span className="text-muted">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <p className="text-charcoal leading-relaxed whitespace-pre-wrap">
              {lesson.content}
            </p>
          </div>

          {/* Sources */}
          {lesson.sources?.length > 0 && (
            <div className="mt-10 pt-8 border-t border-cream-dark">
              <h3 className="font-semibold text-charcoal mb-4">Sources</h3>
              <div className="space-y-3">
                {lesson.sources.map((src: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-cream rounded-2xl">
                    <div>
                      <div className="font-medium text-charcoal">{src.source_name || src.type}</div>
                      {src.title && <div className="text-sm text-muted">{src.title}</div>}
                    </div>
                    {src.url && (
                      <a 
                        href={src.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-coral font-medium hover:underline"
                      >
                        View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Learning Modes Section */}
        {!showLearningModes ? (
          <div className="space-y-4">
            <button
              onClick={() => setShowLearningModes(true)}
              className="btn-primary w-full py-4 text-lg"
            >
              Start Learning
            </button>
            <Link 
              to={`/quiz/${lesson.id}`} 
              className="btn-secondary w-full py-4 text-center block"
            >
              Skip to Quiz
            </Link>
          </div>
        ) : (
          <div className="space-y-6 animate-slide-up">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-charcoal mb-3">
                Choose Your Learning Style
              </h2>
              <p className="text-muted">
                Pick the format that works best for you
              </p>
            </div>

            {/* Learning Mode Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* 1. Comprehensive Reading */}
              <Link
                to={`/learn/read/${lesson.id}`}
                className="card hover:shadow-xl transition-all group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coral to-coral-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-charcoal mb-2">
                    Deep Read
                  </h3>
                  <p className="text-sm text-muted mb-3">
                    Comprehensive article with animations
                  </p>
                  <span className="text-xs text-muted">
                    ~{lesson.estimated_minutes} min
                  </span>
                </div>
              </Link>

              {/* 2. Video Slideshow */}
              <Link
                to={`/learn/video/${lesson.id}`}
                className="card hover:shadow-xl transition-all group relative overflow-hidden"
              >
                {!lesson.video_url && (
                  <div className="absolute top-2 right-2">
                    <span className="pill pill-coral text-xs">Coming Soon</span>
                  </div>
                )}
                {lesson.video_url && (
                  <div className="absolute top-2 right-2">
                    <span className="pill pill-sage text-xs">Ready</span>
                  </div>
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sage to-sage-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-charcoal mb-2">
                    Watch Video
                  </h3>
                  <p className="text-sm text-muted mb-3">
                    Animated slideshow with narration
                  </p>
                  <span className="text-xs text-muted">
                    {lesson.video_duration_seconds 
                      ? `${Math.ceil(lesson.video_duration_seconds / 60)} min`
                      : `~${Math.ceil((lesson.estimated_minutes || 5) * 0.8)} min`
                    }
                  </span>
                </div>
              </Link>

              {/* 3. Card Swipe */}
              <Link
                to={`/learn/${lesson.id}`}
                className="card hover:shadow-xl transition-all group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lavender to-lavender-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-charcoal mb-2">
                    Quick Swipe
                  </h3>
                  <p className="text-sm text-muted mb-3">
                    Bite-sized cards, TikTok-style
                  </p>
                  <span className="text-xs text-muted">
                    ~{Math.ceil((lesson.estimated_minutes || 5) * 0.6)} min
                  </span>
                </div>
              </Link>
            </div>

            {/* Back button */}
            <button
              onClick={() => setShowLearningModes(false)}
              className="text-muted hover:text-charcoal text-sm mx-auto block"
            >
              ← Back to lesson details
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
