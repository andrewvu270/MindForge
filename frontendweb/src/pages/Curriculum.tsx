import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';
import FieldIcon from '../components/FieldIcon';
import type { FieldName } from '../components/AnimatedIcon';
import { LottieLoader } from '../components/LottieEnhanced';

interface Field {
  id: string;
  name: FieldName;
  description: string;
  pathCount: number;
}

interface LearningPath {
  id: string;
  name: string;
  fieldId: string;
  description: string;
  lessons: PathLesson[];
  progress: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface PathLesson {
  id: string;
  title: string;
  order: number;
  completed: boolean;
  locked: boolean;
  estimatedMinutes: number;
}

export default function Curriculum() {
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      const fieldsData = await apiService.getFields();
      const formattedFields: Field[] = fieldsData.map((f: any) => ({
        id: f.id,
        name: f.name as FieldName,
        description: f.description || `Explore ${f.name} learning paths`,
        pathCount: 3, // Mock: Each field has 3 paths
      }));
      setFields(formattedFields);
    } catch (error) {
      console.error('Error loading fields:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPathsForField = async (field: Field) => {
    setLoading(true);
    try {
      // Use the intelligent learning path agent to generate paths
      const pathsData = await apiService.getLearningPaths(field.id);

      if (!pathsData || pathsData.length === 0) {
        // No paths exist, show empty state
        setPaths([]);
        setSelectedField(field);
        setLoading(false);
        return;
      }

      // Transform the agent's response to match our interface
      const formattedPaths: LearningPath[] = pathsData.map((path: any) => ({
        id: path.id || `${field.id}-${path.difficulty.toLowerCase()}`,
        name: path.name,
        fieldId: field.id,
        description: path.description,
        lessons: (path.lessons || []).map((lesson: any, index: number) => ({
          id: lesson.id,
          title: lesson.title,
          order: lesson.order_index || lesson.order || index + 1,
          completed: false,
          locked: index > 0, // First lesson unlocked, rest locked
          estimatedMinutes: lesson.estimated_minutes || lesson.estimatedMinutes || 5,
        })),
        progress: 0,
        difficulty: path.difficulty as 'Beginner' | 'Intermediate' | 'Advanced',
      }));

      setPaths(formattedPaths);
      setSelectedField(field);
    } catch (error) {
      console.error('Error loading paths:', error);
      // Fallback to empty paths if agent fails
      setPaths([]);
      setSelectedField(field);
    } finally {
      setLoading(false);
    }
  };

  const generatePathsForField = async (field: Field) => {
    setLoading(true);
    try {
      await apiService.generateLearningPaths(field.id, field.name);
      // Reload paths after generation
      await loadPathsForField(field);
    } catch (error) {
      console.error('Error generating paths:', error);
      alert('Failed to generate learning paths. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <LottieLoader message="Loading curriculum..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {!selectedField ? (
          <>
            {/* Header */}
            <div className="mb-12 animate-slide-up text-center">
              <h1 className="text-4xl md:text-5xl font-semibold text-charcoal tracking-tight mb-4">
                Learning Curriculum
              </h1>
              <p className="text-lg text-muted max-w-2xl mx-auto">
                Choose a field to explore structured learning paths
              </p>
            </div>

            {/* Fields Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
              {fields.map((field) => (
                <button
                  key={field.id}
                  onClick={() => loadPathsForField(field)}
                  className="card text-left hover:shadow-xl hover:scale-[1.02] transition-all group"
                >
                  <div className="flex justify-center mb-6">
                    <FieldIcon field={field.name} size="lg" state="idle" />
                  </div>

                  <h3 className="text-2xl font-semibold text-charcoal mb-2 text-center">
                    {field.name}
                  </h3>

                  <p className="text-sm text-muted text-center mb-4">
                    {field.description}
                  </p>

                  <div className="pt-4 border-t border-charcoal/10 flex items-center justify-between">
                    <span className="text-sm text-muted">{field.pathCount} learning paths</span>
                    <div className="w-8 h-8 rounded-full bg-charcoal/5 group-hover:bg-charcoal group-hover:text-white flex items-center justify-center transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : !selectedPath ? (
          <>
            {/* Back Button */}
            <button
              onClick={() => {
                setSelectedField(null);
                setPaths([]);
              }}
              className="flex items-center gap-2 text-muted hover:text-charcoal mb-8 transition-colors group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to fields
            </button>

            {/* Field Header */}
            <div className="card mb-8 animate-slide-up">
              <div className="flex items-center gap-6">
                <FieldIcon field={selectedField.name} size="lg" state="active" />
                <div className="flex-1">
                  <h1 className="text-3xl font-semibold text-charcoal mb-2">
                    {selectedField.name} Learning Paths
                  </h1>
                  <p className="text-muted">{selectedField.description}</p>
                </div>
              </div>
            </div>

            {/* Learning Paths Grid */}
            {paths.length === 0 ? (
              <div className="card text-center py-12 animate-slide-up">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-cream-dark rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal mb-2">
                    No Learning Paths Yet
                  </h3>
                  <p className="text-muted mb-6">
                    Generate structured learning paths for {selectedField.name} to get started with a curated curriculum.
                  </p>
                  <button
                    onClick={() => generatePathsForField(selectedField)}
                    disabled={loading}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Generate Learning Paths
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6 stagger">
                {paths.map((path) => (
                  <button
                    key={path.id}
                    onClick={() => setSelectedPath(path)}
                    className="card text-left hover:shadow-xl hover:scale-[1.02] transition-all"
                  >
                    <div className="mb-4">
                      <span className={`pill text-xs font-medium ${path.difficulty === 'Beginner' ? 'pill-sage' :
                        path.difficulty === 'Intermediate' ? 'pill-honey' :
                          'pill-coral'
                        }`}>
                        {path.difficulty}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-charcoal mb-2">
                      {path.name}
                    </h3>

                    <p className="text-sm text-muted mb-4">
                      {path.description}
                    </p>

                    <div className="flex items-center gap-3 text-sm text-muted">
                      <span>{path.lessons.length} lessons</span>
                      <span>·</span>
                      <span>{path.lessons.reduce((sum, l) => sum + l.estimatedMinutes, 0)} min</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Back Button */}
            <button
              onClick={() => setSelectedPath(null)}
              className="flex items-center gap-2 text-muted hover:text-charcoal mb-8 transition-colors group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to paths
            </button>

            {/* Path Header */}
            <div className="card mb-8 animate-slide-up">
              <div className="flex items-center gap-6 mb-6">
                <FieldIcon field={selectedField!.name} size="lg" state="active" />
                <div className="flex-1">
                  <div className="mb-2">
                    <span className={`pill text-xs font-medium ${selectedPath.difficulty === 'Beginner' ? 'pill-sage' :
                      selectedPath.difficulty === 'Intermediate' ? 'pill-honey' :
                        'pill-coral'
                      }`}>
                      {selectedPath.difficulty}
                    </span>
                  </div>
                  <h1 className="text-3xl font-semibold text-charcoal mb-2">
                    {selectedPath.name}
                  </h1>
                  <p className="text-muted mb-3">{selectedPath.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted">
                      {selectedPath.lessons.filter(l => l.completed).length} of {selectedPath.lessons.length} completed
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-3 bg-cream-dark rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-coral to-lavender rounded-full transition-all duration-500"
                  style={{ width: `${selectedPath.progress}%` }}
                />
              </div>
            </div>

            {/* Learning Path Roadmap */}
            <div className="space-y-4">
              {selectedPath.lessons.map((lesson, index) => (
                <div key={lesson.id} className="relative">
                  {/* Connector Line */}
                  {index < selectedPath.lessons.length - 1 && (
                    <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-cream-dark" />
                  )}

                  {/* Lesson Card */}
                  <div
                    className={`card flex items-center gap-4 relative ${lesson.locked ? 'opacity-60' : 'hover:shadow-xl hover:scale-[1.01] transition-all'
                      }`}
                  >
                    {/* Step Number */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg relative z-10 ${lesson.completed
                        ? 'bg-sage text-white'
                        : lesson.locked
                          ? 'bg-cream-dark text-muted'
                          : 'bg-coral text-white'
                        }`}
                    >
                      {lesson.completed ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : lesson.locked ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        lesson.order
                      )}
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-charcoal text-lg mb-1">
                        {lesson.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {lesson.estimatedMinutes} min
                        </span>
                        {lesson.locked && (
                          <span className="pill pill-default text-xs">
                            Complete previous lesson to unlock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    {!lesson.locked && (
                      <Link
                        to={`/lessons/${lesson.id}`}
                        className="btn-primary text-sm px-4 py-2 flex-shrink-0"
                      >
                        {lesson.completed ? 'Review' : 'Start'}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
