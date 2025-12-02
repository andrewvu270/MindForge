import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';

export default function LessonDetail() {
  const { id } = useParams();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) apiService.getLesson(id).then(setLesson).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-coral border-t-transparent rounded-full animate-spin" />
        </div>
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

        {/* Lesson Card */}
        <div className="card mb-8 animate-slide-up">
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

        {/* Take Quiz CTA */}
        <Link to={`/quiz/${lesson.id}`} className="btn-primary w-full text-center block py-4">
          Take Quiz
        </Link>
      </div>
    </div>
  );
}
