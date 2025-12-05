import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { LottieLoader } from '../components/LottieEnhanced';

interface LessonCard {
  id: string;
  type: 'intro' | 'context' | 'insight' | 'deepdive' | 'sowhat' | 'takeaway' | 'learningstyles' | 'sources';
  title?: string;
  content: string;
  subContent?: string;
  sources?: any[];
}

export default function Learn() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [cards, setCards] = useState<LessonCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      apiService.getLesson(id).then((data) => {
        setLesson(data);
        setCards(generateCards(data));
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [id]);

  const generateCards = (lesson: any): LessonCard[] => {
    const cards: LessonCard[] = [];

    // 1. Hook - Why should I care?
    cards.push({
      id: 'intro',
      type: 'intro',
      title: lesson.title,
      content: lesson.field_name,
      subContent: `${lesson.estimated_minutes || 5} min · ${lesson.sources?.length || 3} sources`,
    });

    // 2. Context - What's happening?
    const contentSections = parseContent(lesson.content || '');
    if (contentSections.length > 0) {
      cards.push({
        id: 'context',
        type: 'context',
        title: 'The context',
        content: contentSections[0],
      });
    }

    // 3. Key insights - broken into digestible pieces
    contentSections.slice(1, -1).forEach((section, i) => {
      cards.push({
        id: `insight-${i}`,
        type: i % 2 === 0 ? 'insight' : 'deepdive',
        title: i % 2 === 0 ? 'Key insight' : 'Going deeper',
        content: section,
      });
    });

    // 4. So what? - Real world application
    cards.push({
      id: 'sowhat',
      type: 'sowhat',
      title: 'So what does this mean?',
      content: generateSoWhat(lesson),
    });

    // 5. Takeaway - One thing to remember
    cards.push({
      id: 'takeaway',
      type: 'takeaway',
      title: 'Your takeaway',
      content: lesson.learning_objectives?.[0] || extractTakeaway(lesson.content || ''),
    });

    // 6. Try Other Learning Styles
    cards.push({
      id: 'learningstyles',
      type: 'learningstyles',
      title: 'Try Other Learning Styles',
      content: 'Learn the same content in different ways',
    });

    // 7. Sources - Transparency
    if (lesson.sources?.length > 0) {
      cards.push({
        id: 'sources',
        type: 'sources',
        title: 'Where this came from',
        content: 'This lesson was synthesized from multiple sources to give you a balanced perspective.',
        sources: lesson.sources,
      });
    }

    return cards;
  };

  const parseContent = (content: string): string[] => {
    const parts = content.split(/\n\n+/).filter(p => p.trim().length > 50);
    if (parts.length < 2) {
      const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
      const chunks: string[] = [];
      for (let i = 0; i < sentences.length; i += 2) {
        const chunk = sentences.slice(i, i + 2).join(' ').trim();
        if (chunk.length > 50) chunks.push(chunk);
      }
      return chunks.length > 0 ? chunks : [content];
    }
    return parts;
  };

  const generateSoWhat = (lesson: any): string => {
    const field = lesson.field_name?.toLowerCase() || '';
    const templates: Record<string, string> = {
      'technology': 'Understanding this helps you make better decisions about the tools and platforms you use, and anticipate how tech will shape your industry.',
      'finance': 'This knowledge helps you make smarter decisions with your money and understand the forces affecting your investments and career.',
      'economics': 'Grasping these concepts helps you understand why prices change, how policy affects your life, and where opportunities might emerge.',
      'culture': 'This awareness helps you navigate social dynamics, understand different perspectives, and communicate more effectively.',
      'influence': 'These principles help you become more persuasive, build stronger relationships, and achieve your goals through others.',
      'global events': 'Understanding global dynamics helps you anticipate changes that could affect your career, investments, and daily life.',
    };
    return templates[field] || 'This knowledge adds to your mental toolkit, helping you understand the world more deeply and make better decisions.';
  };

  const extractTakeaway = (content: string): string => {
    const firstSentence = content.match(/^[^.!?]+[.!?]/);
    return firstSentence?.[0] || content.slice(0, 150) + '...';
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

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
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <LottieLoader message="Loading lesson..." />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-4">Lesson not found</p>
          <Link to="/lessons" className="btn-primary">Browse Lessons</Link>
        </div>
      </div>
    );
  }

  const card = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  const getCardStyle = (type: string) => {
    switch (type) {
      case 'intro': return 'bg-charcoal text-white';
      case 'context': return 'bg-sky-light text-charcoal';
      case 'insight': return 'bg-warm-white text-charcoal';
      case 'deepdive': return 'bg-cream text-charcoal';
      case 'sowhat': return 'bg-honey-light text-charcoal';
      case 'takeaway': return 'bg-sage-light text-charcoal';
      case 'learningstyles': return 'bg-gradient-to-br from-coral/10 via-sage/10 to-sky/10 text-charcoal';
      case 'sources': return 'bg-lavender-light text-charcoal';
      default: return 'bg-warm-white text-charcoal';
    }
  };

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-charcoal-light">
          <div className="h-full bg-coral transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Header */}
      <div className="fixed top-1 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full hover:bg-white/10 text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <span className="text-sm text-white/60">{currentIndex + 1} of {cards.length}</span>
        <div className="w-10" />
      </div>

      {/* Card Container */}
      <div className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-lg">
          {/* Card */}
          <div className={`rounded-3xl p-8 min-h-[420px] flex flex-col ${getCardStyle(card.type)}`}>
            {/* Card Type Label */}
            <div className={`text-xs font-medium uppercase tracking-wide mb-4 ${card.type === 'intro' ? 'text-coral' : 'text-charcoal/40'
              }`}>
              {card.type === 'intro' && 'Today\'s lesson'}
              {card.type === 'context' && 'Setting the scene'}
              {card.type === 'insight' && 'Key insight'}
              {card.type === 'deepdive' && 'Going deeper'}
              {card.type === 'sowhat' && 'Why it matters'}
              {card.type === 'takeaway' && 'Remember this'}
              {card.type === 'learningstyles' && 'More ways to learn'}
              {card.type === 'sources' && 'Our sources'}
            </div>

            {/* Title */}
            {card.title && (
              <h2 className={`text-2xl font-semibold mb-4 ${card.type === 'intro' ? 'text-white' : 'text-charcoal'
                }`}>
                {card.title}
              </h2>
            )}

            {/* Sub content for intro */}
            {card.subContent && (
              <p className={`text-sm mb-4 ${card.type === 'intro' ? 'text-white/60' : 'text-muted'}`}>
                {card.subContent}
              </p>
            )}

            {/* Content */}
            <div className="flex-1 flex flex-col justify-center">
              {card.type === 'learningstyles' ? (
                <div className="flex flex-col gap-3">
                  <Link
                    to={`/learn/read/${id}`}
                    className="px-6 py-3 bg-white text-charcoal rounded-xl font-medium hover:bg-cream transition-colors text-center"
                  >
                    Deep Read
                  </Link>
                  <Link
                    to={`/learn/video/${id}`}
                    className="px-6 py-3 bg-white text-charcoal rounded-xl font-medium hover:bg-cream transition-colors text-center"
                  >
                    Video
                  </Link>
                  <Link
                    to={`/flashcards`}
                    className="px-6 py-3 bg-white text-charcoal rounded-xl font-medium hover:bg-cream transition-colors text-center"
                  >
                    Review
                  </Link>
                </div>
              ) : card.type === 'sources' && card.sources ? (
                <div className="space-y-3">
                  <p className="text-sm text-charcoal/70 mb-4">{card.content}</p>
                  {card.sources.map((src: any, i: number) => (
                    <div key={i} className="p-3 bg-white/50 rounded-xl">
                      <div className="font-medium text-charcoal text-sm">{src.source_name || src.type}</div>
                      {src.title && <div className="text-xs text-muted mt-1">{src.title}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-lg leading-relaxed ${card.type === 'intro' ? 'text-white/80' : 'text-charcoal/80'
                  }`}>
                  {card.content}
                </p>
              )}
            </div>

            {/* Intro card extra */}
            {card.type === 'intro' && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-sm text-white/50">Swipe through to learn. Takes about 5 minutes.</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {currentIndex === cards.length - 1 ? (
              <button
                onClick={handleComplete}
                className="px-8 py-3 bg-coral text-white rounded-xl font-medium hover:bg-coral/90 transition-colors"
              >
                Test your knowledge
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-white text-charcoal rounded-xl font-medium hover:bg-white/90 transition-colors"
              >
                Continue
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
