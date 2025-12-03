import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';
import ClayMascot from '../components/ClayMascot';
import { LottieLoader } from '../components/LottieEnhanced';

export default function Lessons() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiService.getLessons(selectedField || ''),
      apiService.getFields()
    ])
      .then(([l, f]) => { setLessons(l); setFields(f); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedField]);

  const fieldData = [
    { name: 'Technology', color: 'coral', description: 'AI, software, digital trends', icon: '💻' },
    { name: 'Finance', color: 'sage', description: 'Markets, investing, money', icon: '💰' },
    { name: 'Economics', color: 'honey', description: 'Policy, trade, macro trends', icon: '📊' },
    { name: 'Culture', color: 'sky', description: 'Society, media, ideas', icon: '🎭' },
    { name: 'Influence', color: 'lavender', description: 'Persuasion, leadership', icon: '🎯' },
    { name: 'Global Events', color: 'rose', description: 'Geopolitics, world affairs', icon: '🌍' },
  ];

  const getFieldData = (fieldName: string) => {
    return fieldData.find(f => f.name === fieldName) || fieldData[0];
  };

  const selectedFieldData = selectedField
    ? (() => {
      const field = fields.find(f => f.id === selectedField);
      return getFieldData(field?.name || 'Technology');
    })()
    : null;

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <LottieLoader message="Loading lessons..." />
        ) : !selectedField ? (
          /* STEP 1: Field Selection */
          <>
            {/* Header */}
            <div className="mb-12 animate-slide-up text-center">
              <h1 className="text-4xl md:text-5xl font-semibold text-charcoal tracking-tight mb-4">
                Choose Your Field
              </h1>
              <p className="text-lg text-muted max-w-2xl mx-auto">
                Select a field to explore curated lessons. Each field has its own mascot guide to help you learn.
              </p>
            </div>

            {/* Field Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
              {fieldData.map((field) => {
                const fieldObj = fields.find(f => f.name === field.name);
                const fieldLessons = fieldObj ? lessons.filter(l => l.field_id === fieldObj.id) : [];
                const lessonCount = fieldLessons.length;

                return (
                  <button
                    key={field.name}
                    onClick={() => {
                      if (fieldObj) {
                        setSelectedField(fieldObj.id);
                        setLoading(true);
                      }
                    }}
                    className={`card-${field.color} text-left hover:shadow-2xl hover:scale-105 transition-all duration-300 group relative overflow-hidden min-h-[280px] flex flex-col`}
                  >
                    {/* Decorative background pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-charcoal transform translate-x-8 -translate-y-8" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-charcoal transform -translate-x-6 translate-y-6" />
                    </div>

                    {/* Content */}
                    <div className="relative flex-1 flex flex-col">
                      {/* Mascot */}
                      <div className="flex justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                        <ClayMascot field={field.name} size="lg" animation="idle" />
                      </div>

                      {/* Field name */}
                      <h3 className="text-2xl font-semibold text-charcoal mb-2 text-center">
                        {field.name}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-muted text-center mb-6 flex-1">
                        {field.description}
                      </p>

                      {/* Stats footer */}
                      <div className="pt-4 border-t border-charcoal/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-charcoal">{lessonCount}</span>
                          <span className="text-xs text-muted">lessons</span>
                        </div>

                        {/* Arrow indicator */}
                        <div className="w-8 h-8 rounded-full bg-charcoal/5 group-hover:bg-charcoal group-hover:text-white flex items-center justify-center transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom CTA */}
            <div className="mt-16 card text-center py-12 bg-gradient-to-br from-warm-white to-cream">
              <div className="mb-4">
                <span className="text-4xl">✨</span>
              </div>
              <h2 className="text-2xl font-semibold text-charcoal mb-3">
                Can't find what you're looking for?
              </h2>
              <p className="text-muted mb-6 max-w-md mx-auto">
                Generate a custom lesson on any topic using AI
              </p>
              <Link to="/generate" className="btn-primary">
                Generate Custom Lesson
              </Link>
            </div>
          </>
        ) : (
          /* STEP 2: Lesson List for Selected Field */
          <>
            {/* Back button */}
            <button
              onClick={() => {
                setSelectedField(null);
                setLessons([]);
              }}
              className="flex items-center gap-2 text-muted hover:text-charcoal mb-8 transition-colors group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to all fields
            </button>

            {/* Field Header Card */}
            {selectedFieldData && (
              <div className={`card-${selectedFieldData.color} mb-8 animate-slide-up`}>
                <div className="flex items-center gap-6">
                  <div className="transform hover:scale-110 transition-transform">
                    <ClayMascot
                      field={selectedFieldData.name}
                      size="lg"
                      animation="wave"
                    />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-semibold text-charcoal mb-2">
                      {selectedFieldData.name}
                    </h1>
                    <p className="text-muted mb-3">
                      {selectedFieldData.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-charcoal">{lessons.length}</span>
                        <span className="text-muted">lessons available</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-muted" />
                      <span className="text-muted">
                        {lessons.reduce((acc, l) => acc + (l.estimated_minutes || 5), 0)} min total
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lessons Grid */}
            {lessons.length === 0 ? (
              <div className="card text-center py-20 animate-fade-in">
                <div className="mb-4">
                  <span className="text-6xl">📚</span>
                </div>
                <p className="text-2xl font-medium text-charcoal mb-3">No lessons yet</p>
                <p className="text-muted mb-6">
                  We're working on adding content to this field. Check back soon!
                </p>
                <Link to="/generate" className="btn-secondary">
                  Generate a Custom Lesson
                </Link>
              </div>
            ) : (
              <div className="space-y-3 stagger">
                {lessons.map((lesson, index) => (
                  <Link
                    key={lesson.id}
                    to={`/lessons/${lesson.id}`}
                    className="card flex items-center gap-4 group hover:shadow-xl transition-all hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Lesson number badge */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-coral to-lavender flex items-center justify-center text-white font-semibold shadow-md">
                      {index + 1}
                    </div>

                    {/* Lesson content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="pill pill-coral text-xs font-medium">
                          {lesson.difficulty_level || 'Beginner'}
                        </span>
                        <span className="text-xs text-muted flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {lesson.estimated_minutes || 5} min
                        </span>
                        {lesson.sources?.length > 0 && (
                          <>
                            <span className="text-xs text-muted">·</span>
                            <span className="text-xs text-muted flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {lesson.sources.length} sources
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="font-semibold text-charcoal group-hover:text-coral transition-colors text-lg">
                        {lesson.title}
                      </h3>
                      {lesson.description && (
                        <p className="text-sm text-muted mt-1 line-clamp-1">
                          {lesson.description}
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cream group-hover:bg-coral flex items-center justify-center transition-all group-hover:scale-110">
                      <svg className="w-5 h-5 text-muted group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
