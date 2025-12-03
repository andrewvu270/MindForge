import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import ClayMascot from '../components/ClayMascot';
import LottieAnimation from '../components/LottieAnimation';
import { LottieLoader } from '../components/LottieEnhanced';

export default function LearnRead() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      apiService.getLesson(id)
        .then(setLesson)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const element = contentRef.current;
      const scrollTop = window.scrollY;
      const scrollHeight = element.scrollHeight - window.innerHeight;
      const scrollProgress = (scrollTop / scrollHeight) * 100;

      setProgress(Math.min(Math.max(scrollProgress, 0), 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleComplete = async () => {
    try {
      await apiService.completeLesson(id!, 'user_1');
    } catch (e) {
      console.error(e);
    }
    navigate(`/quiz/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <LottieLoader message="Loading lesson..." />
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

  const contentSections = lesson.content?.split('\n\n').filter((s: string) => s.trim().length > 0) || [];

  return (
    <div className="min-h-screen bg-cream">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-cream-dark">
          <div
            className="h-full bg-coral transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="sticky top-1 z-40 bg-warm-white/80 backdrop-blur-md border-b border-cream-dark">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(`/lessons/${id}`)}
            className="flex items-center gap-2 text-muted hover:text-charcoal transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">{Math.round(progress)}%</span>
            <ClayMascot
              field={lesson.field_name || 'Technology'}
              size="sm"
              animation="idle"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-16 animate-slide-up">
          {/* Field Badge */}
          <div className="flex items-center gap-3 mb-6">
            <ClayMascot
              field={lesson.field_name || 'Technology'}
              size="md"
              animation="wave"
            />
            <div>
              <span className="pill pill-coral text-xs">{lesson.field_name}</span>
              <p className="text-sm text-muted mt-1">
                {lesson.estimated_minutes} min read · {lesson.sources?.length || 0} sources
              </p>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-semibold text-charcoal mb-6 leading-tight">
            {lesson.title}
          </h1>

          {/* Learning Objectives */}
          {lesson.learning_objectives?.length > 0 && (
            <div className="card bg-sky-light p-6">
              <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-sky" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                What you'll learn
              </h3>
              <ul className="space-y-3">
                {lesson.learning_objectives.map((obj: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-sky mt-2 flex-shrink-0" />
                    <span className="text-charcoal">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Animated Divider */}
        <div className="my-12 flex justify-center">
          <LottieAnimation
            topic="learning"
            fallbackType="blob"
            fallbackColor="coral"
          />
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {contentSections.map((section: string, index: number) => (
            <div
              key={index}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Section with alternating mascot positions */}
              <div className={`flex gap-6 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Mascot appears every 2 sections */}
                {index % 2 === 0 && (
                  <div className="hidden md:block flex-shrink-0">
                    <ClayMascot
                      field={lesson.field_name || 'Technology'}
                      size="md"
                      animation={index % 4 === 0 ? 'think' : 'idle'}
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1">
                  <div className="prose prose-lg max-w-none">
                    <p className="text-charcoal leading-relaxed text-lg">
                      {section}
                    </p>
                  </div>

                  {/* Decorative element */}
                  {index < contentSections.length - 1 && (
                    <div className="mt-8 flex items-center gap-4">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cream-dark to-transparent" />
                      <div className="w-2 h-2 rounded-full bg-coral animate-pulse" />
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cream-dark to-transparent" />
                    </div>
                  )}
                </div>

                {index % 2 === 1 && (
                  <div className="hidden md:block flex-shrink-0">
                    <ClayMascot
                      field={lesson.field_name || 'Technology'}
                      size="md"
                      animation="idle"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Key Takeaway */}
        <div className="my-16 card bg-gradient-to-br from-sage-light to-honey-light p-8 animate-scale-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sage flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-charcoal mb-3">Key Takeaway</h3>
              <p className="text-charcoal/80 text-lg leading-relaxed">
                {lesson.learning_objectives?.[0] || 'Understanding this concept helps you make better decisions and stay informed about important developments in ' + (lesson.field_name || 'this field') + '.'}
              </p>
            </div>
          </div>
        </div>

        {/* Sources */}
        {lesson.sources?.length > 0 && (
          <div className="my-16 animate-fade-in">
            <h3 className="text-2xl font-semibold text-charcoal mb-6 flex items-center gap-3">
              <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Sources
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {lesson.sources.map((src: any, i: number) => (
                <div
                  key={i}
                  className="card hover:shadow-lg transition-all"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-medium text-charcoal mb-1">
                        {src.source_name || src.type}
                      </div>
                      {src.title && (
                        <div className="text-sm text-muted line-clamp-2">{src.title}</div>
                      )}
                    </div>
                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 p-2 rounded-lg hover:bg-cream transition-colors"
                      >
                        <svg className="w-5 h-5 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completion CTA */}
        <div className="my-16 text-center animate-scale-in">
          <div className="card bg-gradient-to-br from-coral-light to-lavender-light p-12">
            <ClayMascot
              field={lesson.field_name || 'Technology'}
              size="lg"
              animation="celebrate"
              className="mx-auto mb-6"
            />
            <h2 className="text-2xl font-semibold text-charcoal mb-4">
              Great job! You've completed the lesson.
            </h2>
            <p className="text-muted mb-8 max-w-md mx-auto">
              Ready to test your knowledge? Take the quiz to see how much you've learned.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleComplete}
                className="btn-primary px-8 py-4 text-lg"
              >
                Take the Quiz
              </button>
              <Link
                to="/lessons"
                className="btn-secondary px-8 py-4 text-lg"
              >
                Browse More Lessons
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
