import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';
import { LottieLoader } from '../components/LottieEnhanced';
import LottieEnhanced from '../components/LottieEnhanced';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lesson_id?: string;
}

interface Topic {
  id: string;
  name: string;
  cardCount: number;
}

interface Field {
  id: string;
  name: string;
  topics: Topic[];
  color: string;
}

export default function Flashcards() {
  const { field: fieldParam } = useParams();
  const [selectedField, setSelectedField] = useState<string | null>(fieldParam || null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState<'browse' | 'study'>('browse');
  const [loading, setLoading] = useState(false);
  const [apiFlashcards, setApiFlashcards] = useState<Flashcard[]>([]);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const response = await apiService.getFlashcards(undefined, 100);
        if (response.flashcards && response.flashcards.length > 0) {
          setApiFlashcards(response.flashcards.map((fc: any) => ({
            id: fc.id,
            front: fc.front,
            back: fc.back,
            topic: fc.topic || 'General',
            difficulty: fc.difficulty || 'medium',
            lesson_id: fc.lesson_id
          })));
        }
      } catch (error) {
        console.error('Failed to fetch flashcards:', error);
      }
    };
    fetchFlashcards();
  }, []);


  const fields: Field[] = [
    { id: 'technology', name: 'Technology', color: 'coral', topics: [
      { id: 'ai-ml', name: 'AI & Machine Learning', cardCount: 12 },
      { id: 'cloud', name: 'Cloud Computing', cardCount: 8 },
    ]},
    { id: 'finance', name: 'Finance', color: 'sage', topics: [
      { id: 'investing', name: 'Investing Basics', cardCount: 15 },
      { id: 'markets', name: 'Market Dynamics', cardCount: 10 },
    ]},
    { id: 'economics', name: 'Economics', color: 'honey', topics: [
      { id: 'macro', name: 'Macroeconomics', cardCount: 14 },
      { id: 'micro', name: 'Microeconomics', cardCount: 10 },
    ]},
    { id: 'influence', name: 'Influence', color: 'lavender', topics: [
      { id: 'persuasion', name: 'Persuasion Principles', cardCount: 10 },
      { id: 'negotiation', name: 'Negotiation', cardCount: 8 },
    ]},
    { id: 'culture', name: 'Culture', color: 'sky', topics: [
      { id: 'media', name: 'Media & Society', cardCount: 8 },
      { id: 'psychology', name: 'Social Psychology', cardCount: 10 },
    ]},
    { id: 'global', name: 'Global Events', color: 'rose', topics: [
      { id: 'geopolitics', name: 'Geopolitics', cardCount: 12 },
      { id: 'climate', name: 'Climate & Energy', cardCount: 8 },
    ]},
  ];

  const fallbackCards: Record<string, Flashcard[]> = {
    'ai-ml': [
      { id: '1', front: 'What is machine learning?', back: 'A subset of AI that enables systems to learn from experience.', topic: 'AI & ML', difficulty: 'easy' },
      { id: '2', front: 'What is a neural network?', back: 'A computing system inspired by biological neural networks.', topic: 'AI & ML', difficulty: 'medium' },
    ],
    'investing': [
      { id: '1', front: 'What is compound interest?', back: 'Interest calculated on both principal and accumulated interest.', topic: 'Investing', difficulty: 'easy' },
    ],
    'macro': [
      { id: '1', front: 'What is GDP?', back: 'Total monetary value of goods and services produced in a country.', topic: 'Economics', difficulty: 'easy' },
    ],
    'persuasion': [
      { id: '1', front: 'What is reciprocity?', back: 'People tend to return favors.', topic: 'Influence', difficulty: 'easy' },
    ],
  };

  const loadCards = (topicId: string) => {
    setLoading(true);
    const topicCards = apiFlashcards.filter(fc => 
      fc.topic?.toLowerCase().includes(topicId.replace('-', ' '))
    );
    setCards(topicCards.length > 0 ? topicCards : (fallbackCards[topicId] || []));
    setCurrentIndex(0);
    setFlipped(false);
    setLoading(false);
    setMode('study');
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    } else {
      setMode('browse');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFlipped(false);
    }
  };

  const handleBack = () => {
    if (mode === 'study') setMode('browse');
    else if (selectedField) setSelectedField(null);
  };

  const currentField = fields.find((f) => f.id === selectedField);


  // Study mode - simple flip through
  if (mode === 'study') {
    if (loading) {
      return (
        <div className="min-h-screen bg-charcoal flex items-center justify-center">
          <LottieLoader message="Loading flashcards..." animation="loading" />
        </div>
      );
    }

    if (cards.length === 0) {
      return (
        <div className="min-h-screen bg-cream">
          <Navbar />
          <div className="max-w-lg mx-auto px-6 py-20 text-center">
            <LottieEnhanced animation="book" size="lg" className="mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-charcoal mb-3">No flashcards yet</h2>
            <p className="text-muted mb-6">Generate some lessons first!</p>
            <button onClick={handleBack} className="btn-primary">Go back</button>
          </div>
        </div>
      );
    }

    const card = cards[currentIndex];
    const progress = ((currentIndex + 1) / cards.length) * 100;

    return (
      <div className="min-h-screen bg-charcoal">
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1 bg-charcoal-light">
            <div className="h-full bg-coral transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="fixed top-1 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between">
          <button onClick={handleBack} className="p-2 rounded-full hover:bg-white/10 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <span className="text-sm text-white/60">{currentIndex + 1} / {cards.length}</span>
          <div className="w-10" />
        </div>

        <div className="min-h-screen flex items-center justify-center px-6 py-20">
          <div className="w-full max-w-lg">
            <div
              onClick={() => setFlipped(!flipped)}
              className="rounded-3xl min-h-[350px] cursor-pointer transition-all duration-500"
              style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-honey-light to-coral-light ${flipped ? 'opacity-0' : 'opacity-100'}`} style={{ backfaceVisibility: 'hidden' }}>
                <div className="p-8 h-full flex flex-col justify-center min-h-[350px]">
                  <span className="text-xs text-charcoal/50 uppercase mb-6">{card.topic}</span>
                  <p className="text-2xl font-semibold text-charcoal mb-8">{card.front}</p>
                  <p className="text-sm text-charcoal/50">Tap to flip</p>
                </div>
              </div>
              <div className={`absolute inset-0 rounded-3xl bg-warm-white ${flipped ? 'opacity-100' : 'opacity-0'}`} style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <div className="p-8 h-full flex flex-col justify-center min-h-[350px]">
                  <p className="text-xs text-charcoal/50 uppercase mb-4">Answer</p>
                  <p className="text-lg text-charcoal leading-relaxed">{card.back}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-8">
              <button onClick={handlePrev} disabled={currentIndex === 0} className="p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button onClick={handleNext} className="px-8 py-3 bg-white text-charcoal rounded-xl font-medium">
                {currentIndex === cards.length - 1 ? 'Done' : 'Next'}
              </button>
              <button onClick={handleNext} disabled={currentIndex === cards.length - 1} className="p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white">
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


  // Browse mode - Field selection
  if (!selectedField) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-charcoal mb-2">Flashcards</h1>
            <p className="text-muted">Review concepts at your own pace</p>
          </div>

          {apiFlashcards.length > 0 && (
            <div className="mb-6 p-4 bg-sage-light rounded-2xl flex items-center gap-3">
              <LottieEnhanced animation="star" size="sm" />
              <p className="text-sage font-medium">{apiFlashcards.length} AI-generated flashcards available</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {fields.map((field) => (
              <button
                key={field.id}
                onClick={() => setSelectedField(field.id)}
                className={`card-${field.color} text-left hover:shadow-lg transition-all`}
              >
                <h3 className="font-semibold text-charcoal mb-1">{field.name}</h3>
                <p className="text-sm text-muted">{field.topics.length} topics</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Browse mode - Topic selection
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button onClick={handleBack} className="flex items-center gap-2 text-muted hover:text-charcoal mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to fields
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-charcoal mb-2">{currentField?.name}</h1>
          <p className="text-muted">Choose a topic to review</p>
        </div>

        <div className="space-y-3">
          {currentField?.topics.map((topic) => {
            const apiCards = apiFlashcards.filter(fc => fc.topic?.toLowerCase().includes(topic.id.replace('-', ' ')));
            const hasCards = apiCards.length > 0 || fallbackCards[topic.id]?.length > 0;

            return (
              <button
                key={topic.id}
                onClick={() => hasCards && loadCards(topic.id)}
                disabled={!hasCards}
                className={`card w-full text-left hover:shadow-lg transition-all ${!hasCards ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-charcoal mb-1">{topic.name}</h3>
                    <p className="text-sm text-muted">{apiCards.length || topic.cardCount} cards</p>
                  </div>
                  <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
