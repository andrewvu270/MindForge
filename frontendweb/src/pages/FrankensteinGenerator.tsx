import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';

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
    <div className="min-h-screen bg-light">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-dark mb-4">Generate Lesson</h1>
          <p className="text-xl text-muted">AI-powered synthesis from multiple sources</p>
        </div>

        <div className="bento-card mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-dark mb-3">Field</label>
              <select value={field} onChange={(e) => setField(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none">
                <option value="">Select a field</option>
                {fields.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-lg font-semibold text-dark mb-3">Topic</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Machine Learning Basics" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none" />
            </div>

            <div>
              <label className="block text-lg font-semibold text-dark mb-3">Number of Sources: {numSources}</label>
              <input type="range" min="2" max="5" value={numSources} onChange={(e) => setNumSources(parseInt(e.target.value))} className="w-full" />
            </div>

            <button onClick={handleGenerate} disabled={!field || !topic || generating} className="btn-primary w-full disabled:opacity-50">
              {generating ? 'Generating...' : 'Generate Lesson'}
            </button>
          </div>
        </div>

        {generating && (
          <div className="bento-card text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg text-muted">Synthesizing content from multiple sources...</p>
          </div>
        )}

        {result && (
          <div className="bento-card bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
            <div className="text-sm font-semibold text-emerald-600 mb-4">Generated Successfully</div>
            <h2 className="text-3xl font-bold text-dark mb-4">{result.lesson?.title}</h2>
            <p className="text-muted mb-6 line-clamp-4">{result.lesson?.content}</p>
            <div className="flex gap-4">
              <button onClick={() => navigate(`/lessons/${result.lesson?.id}`)} className="btn-primary">View Lesson</button>
              <button onClick={() => { setResult(null); setTopic(''); }} className="btn-secondary">Generate Another</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
