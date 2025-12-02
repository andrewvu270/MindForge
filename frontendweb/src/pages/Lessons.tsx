import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';

export default function Lessons() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [selectedField, setSelectedField] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiService.getLessons(selectedField), apiService.getFields()])
      .then(([l, f]) => { setLessons(l); setFields(f); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedField]);

  const cardColors = ['card-coral', 'card-sage', 'card-honey', 'card-sky', 'card-lavender', 'card-rose'];

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-semibold text-charcoal tracking-tight mb-4">
            Lessons
          </h1>
          <p className="text-lg text-muted">
            Explore curated content across 6 fields. Each lesson is synthesized from multiple sources.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button 
            onClick={() => setSelectedField('')} 
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              !selectedField 
                ? 'bg-charcoal text-white' 
                : 'bg-warm-white text-muted hover:text-charcoal hover:bg-cream-dark'
            }`}
          >
            All Fields
          </button>
          {fields.map((f) => (
            <button 
              key={f.id} 
              onClick={() => setSelectedField(f.id)} 
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedField === f.id 
                  ? 'bg-charcoal text-white' 
                  : 'bg-warm-white text-muted hover:text-charcoal hover:bg-cream-dark'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="card text-center py-4">
            <div className="text-2xl font-semibold text-charcoal">{lessons.length}</div>
            <div className="text-sm text-muted">Lessons</div>
          </div>
          <div className="card text-center py-4">
            <div className="text-2xl font-semibold text-charcoal">6</div>
            <div className="text-sm text-muted">Fields</div>
          </div>
          <div className="card text-center py-4">
            <div className="text-2xl font-semibold text-charcoal">8+</div>
            <div className="text-sm text-muted">Sources</div>
          </div>
        </div>

        {/* Lessons Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-coral border-t-transparent rounded-full animate-spin" />
          </div>
        ) : lessons.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-xl font-medium text-charcoal mb-2">No lessons found</p>
            <p className="text-muted">Try selecting a different field</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
            {lessons.map((lesson, i) => (
              <Link 
                key={lesson.id} 
                to={`/lessons/${lesson.id}`} 
                className={`${cardColors[i % cardColors.length]} group block hover:shadow-lg transition-all`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="pill bg-warm-white/80 text-charcoal text-xs">{lesson.difficulty_level}</span>
                  <span className="text-xs text-muted">{lesson.estimated_minutes} min</span>
                </div>
                
                <h3 className="text-lg font-semibold text-charcoal mb-3 line-clamp-2 group-hover:underline">
                  {lesson.title}
                </h3>
                
                <p className="text-muted text-sm line-clamp-3 mb-4">
                  {lesson.content}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-charcoal/10">
                  <span className="text-xs text-muted">{lesson.field_name}</span>
                  {lesson.sources?.length > 0 && (
                    <span className="text-xs text-muted">{lesson.sources.length} sources</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 card text-center py-12">
          <h2 className="text-2xl font-semibold text-charcoal mb-3">Can't find what you're looking for?</h2>
          <p className="text-muted mb-6">Generate a custom lesson on any topic using AI</p>
          <Link to="/generate" className="btn-primary">Generate Lesson</Link>
        </div>
      </div>
    </div>
  );
}
