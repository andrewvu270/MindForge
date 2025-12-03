import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';
import LottieEnhanced from '../components/LottieEnhanced';

export default function FrankensteinGenerator() {
  const navigate = useNavigate();
  const [fields, setFields] = useState<any[]>([]);
  const [field, setField] = useState('');
  const [topic, setTopic] = useState('');
  const [numSources, setNumSources] = useState(3);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    apiService.getFields().then(setFields).catch(console.error);
  }, []);

  const handleGenerate = async () => {
    if (!field || !topic) return;
    setGenerating(true);
    setResult(null);
    try {
      const data = await apiService.generateLesson({ field, topic, num_sources: numSources, generate_quiz: true });
      setResult(data);
    } catch (error) {
      console.error('Error generating lesson:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-12 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-semibold text-charcoal tracking-tight mb-4">
            Generate Lesson
          </h1>
          <p className="text-lg text-muted">AI-powered synthesis from multiple sources</p>
        </div>

        <div className="card mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Field</label>
              <select value={field} onChange={(e) => setField(e.target.value)} className="select">
                <option value="">Select a field</option>
                {fields.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Topic</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Machine Learning Basics" className="input" />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Number of Sources: {numSources}</label>
              <input type="range" min="2" max="5" value={numSources} onChange={(e) => setNumSources(parseInt(e.target.value))} className="w-full accent-charcoal" />
              <div className="flex justify-between text-xs text-muted mt-1"><span>2</span><span>5</span></div>
            </div>

            <button onClick={handleGenerate} disabled={!field || !topic || generating} className="btn-primary w-full disabled:opacity-40">
              {generating ? 'Generating...' : 'Generate Lesson'}
            </button>
          </div>
        </div>

        {generating && (
          <div className="card text-center py-12">
            <LottieEnhanced animation="brain" size="lg" className="mx-auto mb-4" />
            <p className="text-muted">Synthesizing content from multiple sources...</p>
          </div>
        )}

        {result && (
          <div className="card-sage animate-scale-in">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-sage" />
              <span className="text-sm font-medium text-sage">Generated Successfully</span>
            </div>
            <h2 className="text-2xl font-semibold text-charcoal mb-3">{result.lesson?.title}</h2>
            <p className="text-muted mb-6 line-clamp-4">{result.lesson?.summary || result.lesson?.content}</p>
            
            {/* Sources info */}
            {result.metadata?.num_sources > 0 && (
              <div className="mb-6 p-4 bg-sage/10 rounded-xl flex items-center gap-3">
                <LottieEnhanced animation="star" size="sm" />
                <p className="text-sm text-sage font-medium">
                  Synthesized from {result.metadata.num_sources} sources
                </p>
              </div>
            )}
            
            <div className="flex gap-4">
              <button onClick={() => navigate(`/lessons/${result.lesson?.id || result.metadata?.lesson_id}`)} className="btn-primary">View Lesson</button>
              <button onClick={() => { setResult(null); setTopic(''); }} className="btn-secondary">Generate Another</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
