import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ClayMascot from '../components/ClayMascot';
import Confetti from '../components/Confetti';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Topic {
  id: string;
  name: string;
  cardCount: number;
  mastered: number;
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
  const [results, setResults] = useState<{ correct: number; incorrect: number }>({ correct: 0, incorrect: 0 });
  const [mode, setMode] = useState<'browse' | 'study' | 'results'>('browse');

  const fields: Field[] = [
    {
      id: 'technology',
      name: 'Technology',
      color: 'coral',
      topics: [
        { id: 'ai-ml', name: 'AI & Machine Learning', cardCount: 12, mastered: 4 },
        { id: 'cloud', name: 'Cloud Computing', cardCount: 8, mastered: 2 },
        { id: 'cybersecurity', name: 'Cybersecurity', cardCount: 10, mastered: 0 },
        { id: 'blockchain', name: 'Blockchain', cardCount: 6, mastered: 1 },
      ],
    },
    {
      id: 'finance',
      name: 'Finance',
      color: 'sage',
      topics: [
        { id: 'investing', name: 'Investing Basics', cardCount: 15, mastered: 5 },
        { id: 'markets', name: 'Market Dynamics', cardCount: 10, mastered: 3 },
        { id: 'crypto', name: 'Cryptocurrency', cardCount: 8, mastered: 0 },
        { id: 'personal-finance', name: 'Personal Finance', cardCount: 12, mastered: 6 },
      ],
    },
    {
      id: 'economics',
      name: 'Economics',
      color: 'honey',
      topics: [
        { id: 'macro', name: 'Macroeconomics', cardCount: 14, mastered: 2 },
        { id: 'micro', name: 'Microeconomics', cardCount: 10, mastered: 1 },
        { id: 'trade', name: 'International Trade', cardCount: 8, mastered: 0 },
        { id: 'monetary', name: 'Monetary Policy', cardCount: 6, mastered: 0 },
      ],
    },
    {
      id: 'influence',
      name: 'Influence',
      color: 'lavender',
      topics: [
        { id: 'persuasion', name: 'Persuasion Principles', cardCount: 10, mastered: 3 },
        { id: 'negotiation', name: 'Negotiation', cardCount: 8, mastered: 2 },
        { id: 'leadership', name: 'Leadership', cardCount: 12, mastered: 1 },
        { id: 'communication', name: 'Communication', cardCount: 10, mastered: 4 },
      ],
    },
    {
      id: 'culture',
      name: 'Culture',
      color: 'sky',
      topics: [
        { id: 'media', name: 'Media & Society', cardCount: 8, mastered: 1 },
        { id: 'trends', name: 'Cultural Trends', cardCount: 6, mastered: 0 },
        { id: 'psychology', name: 'Social Psychology', cardCount: 10, mastered: 2 },
      ],
    },
    {
      id: 'global',
      name: 'Global Events',
      color: 'rose',
      topics: [
        { id: 'geopolitics', name: 'Geopolitics', cardCount: 12, mastered: 1 },
        { id: 'climate', name: 'Climate & Energy', cardCount: 8, mastered: 0 },
        { id: 'conflicts', name: 'Global Conflicts', cardCount: 6, mastered: 0 },
      ],
    },
  ];

  const allCards: Record<string, Flashcard[]> = {
    'ai-ml': [
      { id: '1', front: 'What is machine learning?', back: 'A subset of AI that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing algorithms that can access data and use it to learn for themselves.', topic: 'AI & Machine Learning', difficulty: 'easy' },
      { id: '2', front: 'What is a neural network?', back: 'A computing system inspired by biological neural networks. It consists of interconnected nodes (neurons) organized in layers that process information and learn patterns from data.', topic: 'AI & Machine Learning', difficulty: 'medium' },
      { id: '3', front: 'What is deep learning?', back: 'A subset of machine learning using neural networks with many layers (deep networks). It excels at learning complex patterns in large amounts of data, powering advances in image recognition, NLP, and more.', topic: 'AI & Machine Learning', difficulty: 'medium' },
      { id: '4', front: 'What is supervised learning?', back: 'A type of ML where the model learns from labeled training data. The algorithm learns to map inputs to outputs based on example input-output pairs.', topic: 'AI & Machine Learning', difficulty: 'easy' },
    ],
    'investing': [
      { id: '1', front: 'What is compound interest?', back: 'Interest calculated on both the initial principal and accumulated interest from previous periods. Often called "interest on interest," it makes money grow exponentially over time.', topic: 'Investing Basics', difficulty: 'easy' },
      { id: '2', front: 'What is diversification?', back: 'A risk management strategy that mixes different investments in a portfolio. The rationale is that different assets will perform differently, reducing overall risk.', topic: 'Investing Basics', difficulty: 'easy' },
      { id: '3', front: 'What is a P/E ratio?', back: 'Price-to-Earnings ratio measures a company\'s stock price relative to its earnings per share. A high P/E might mean overvalued or high growth expectations; low P/E might mean undervalued or low growth.', topic: 'Investing Basics', difficulty: 'medium' },
    ],
    'macro': [
      { id: '1', front: 'What is GDP?', back: 'Gross Domestic Product - the total monetary value of all goods and services produced within a country\'s borders in a specific time period. It\'s the primary measure of economic output.', topic: 'Macroeconomics', difficulty: 'easy' },
      { id: '2', front: 'What is inflation?', back: 'The rate at which the general level of prices for goods and services rises over time, eroding purchasing power. Central banks try to control it through monetary policy.', topic: 'Macroeconomics', difficulty: 'easy' },
      { id: '3', front: 'What is fiscal policy?', back: 'Government decisions about spending and taxation to influence the economy. Expansionary fiscal policy (more spending, less taxes) stimulates growth; contractionary policy does the opposite.', topic: 'Macroeconomics', difficulty: 'medium' },
    ],
    'persuasion': [
      { id: '1', front: 'What is the principle of reciprocity?', back: 'People tend to return favors. When someone does something for us, we feel obligated to reciprocate. This is why free samples and favors are powerful persuasion tools.', topic: 'Persuasion Principles', difficulty: 'easy' },
      { id: '2', front: 'What is social proof?', back: 'People look to others\' actions to determine correct behavior, especially in uncertain situations. Reviews, testimonials, and "bestseller" labels leverage this principle.', topic: 'Persuasion Principles', difficulty: 'easy' },
      { id: '3', front: 'What is the scarcity principle?', back: 'People value things more when they\'re rare or becoming unavailable. "Limited time offers" and "only 3 left" create urgency by triggering fear of missing out.', topic: 'Persuasion Principles', difficulty: 'easy' },
    ],
  };

  const loadCards = (topicId: string) => {
    const topicCards = allCards[topicId] || [];
    setCards(topicCards);
    setCurrentIndex(0);
    setFlipped(false);
    setResults({ correct: 0, incorrect: 0 });
    setMode('study');
  };

  const handleAnswer = (correct: boolean) => {
    setResults((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
    }));

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    } else {
      setMode('results');
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setResults({ correct: 0, incorrect: 0 });
    setMode('study');
  };

  const handleBack = () => {
    if (mode === 'study' || mode === 'results') {
      setMode('browse');
      setSelectedTopic(null);
    } else if (selectedField) {
      setSelectedField(null);
    }
  };

  const currentField = fields.find((f) => f.id === selectedField);

  // Results screen
  if (mode === 'results') {
    const percentage = Math.round((results.correct / cards.length) * 100);
    const isPerfect = percentage === 100;
    
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        {isPerfect && <Confetti />}
        <div className="max-w-lg mx-auto px-6 py-12">
          <div className={`card text-center py-12 ${percentage >= 70 ? 'card-sage' : 'card-coral'} animate-scale-in`}>
            <ClayMascot 
              field={selectedField || 'Culture'} 
              size="lg" 
              animation={percentage >= 70 ? 'celebrate' : 'think'}
              className="mx-auto mb-6"
            />
            <h1 className="text-2xl font-semibold text-charcoal mb-2">
              {isPerfect ? 'Perfect!' : percentage >= 70 ? 'Well done' : 'Keep practicing'}
            </h1>
            <div className="text-5xl font-semibold text-charcoal my-6">{percentage}%</div>
            <p className="text-muted mb-8">
              {results.correct} mastered · {results.incorrect} to review
            </p>
            <div className="flex gap-4 justify-center">
              <button onClick={handleRestart} className="btn-secondary">
                Practice again
              </button>
              <button onClick={handleBack} className="btn-primary">
                Choose topic
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Study mode
  if (mode === 'study' && cards.length > 0) {
    const card = cards[currentIndex];
    const progress = ((currentIndex + 1) / cards.length) * 100;

    return (
      <div className="min-h-screen bg-charcoal">
        {/* Progress */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1 bg-charcoal-light">
            <div className="h-full bg-coral transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Header */}
        <div className="fixed top-1 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between">
          <button onClick={handleBack} className="p-2 rounded-full hover:bg-white/10 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <span className="text-sm text-white/60">{currentIndex + 1} / {cards.length}</span>
          <div className="w-10" />
        </div>

        {/* Card */}
        <div className="min-h-screen flex items-center justify-center px-6 py-20">
          <div className="w-full max-w-lg perspective-1000">
            <div
              onClick={() => !flipped && setFlipped(true)}
              className={`rounded-3xl min-h-[350px] cursor-pointer transition-all duration-500 transform-style-3d ${
                flipped ? 'rotate-y-180' : ''
              }`}
              style={{
                transformStyle: 'preserve-3d',
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front */}
              <div 
                className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-honey-light to-coral-light backface-hidden ${
                  flipped ? 'opacity-0' : 'opacity-100'
                }`}
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="p-8 h-full flex flex-col justify-center min-h-[350px]">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-xs text-charcoal/50 uppercase tracking-wide">{card.topic}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      card.difficulty === 'easy' ? 'bg-sage-light text-sage' :
                      card.difficulty === 'medium' ? 'bg-honey-light text-honey' :
                      'bg-coral-light text-coral'
                    }`}>
                      {card.difficulty}
                    </span>
                  </div>
                  <p className="text-2xl font-semibold text-charcoal mb-8">{card.front}</p>
                  <p className="text-sm text-charcoal/50">Tap to reveal answer</p>
                </div>
              </div>
              
              {/* Back */}
              <div 
                className={`absolute inset-0 rounded-3xl bg-warm-white backface-hidden ${
                  flipped ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <div className="p-8 h-full flex flex-col justify-center min-h-[350px]">
                  <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-4">Answer</p>
                  <p className="text-lg text-charcoal leading-relaxed">{card.back}</p>
                </div>
              </div>
            </div>

            {/* Answer buttons */}
            {flipped && (
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => handleAnswer(false)}
                  className="flex-1 py-4 rounded-xl bg-rose-light text-charcoal font-medium hover:bg-rose/20 transition-colors"
                >
                  Still learning
                </button>
                <button
                  onClick={() => handleAnswer(true)}
                  className="flex-1 py-4 rounded-xl bg-sage-light text-charcoal font-medium hover:bg-sage/20 transition-colors"
                >
                  Got it
                </button>
              </div>
            )}
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
            <p className="text-muted">Choose a field to review</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {fields.map((field) => {
              const totalCards = field.topics.reduce((sum, t) => sum + t.cardCount, 0);
              const totalMastered = field.topics.reduce((sum, t) => sum + t.mastered, 0);
              const progress = totalCards > 0 ? Math.round((totalMastered / totalCards) * 100) : 0;

              return (
                <button
                  key={field.id}
                  onClick={() => setSelectedField(field.id)}
                  className={`card-${field.color} text-left hover:shadow-lg transition-all`}
                >
                  <h3 className="font-semibold text-charcoal mb-1">{field.name}</h3>
                  <p className="text-sm text-muted mb-3">{field.topics.length} topics</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-charcoal/10 rounded-full">
                      <div
                        className="h-full bg-charcoal/30 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted">{progress}%</span>
                  </div>
                </button>
              );
            })}
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
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-muted hover:text-charcoal mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to fields
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-charcoal mb-2">{currentField?.name}</h1>
          <p className="text-muted">Choose a topic to practice</p>
        </div>

        <div className="space-y-3">
          {currentField?.topics.map((topic) => {
            const progress = topic.cardCount > 0 ? Math.round((topic.mastered / topic.cardCount) * 100) : 0;
            const hasCards = allCards[topic.id]?.length > 0;

            return (
              <button
                key={topic.id}
                onClick={() => hasCards && loadCards(topic.id)}
                disabled={!hasCards}
                className={`card w-full text-left hover:shadow-lg transition-all ${!hasCards ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-charcoal mb-1">{topic.name}</h3>
                    <p className="text-sm text-muted">
                      {topic.cardCount} cards · {topic.mastered} mastered
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24">
                      <div className="h-1.5 bg-cream-dark rounded-full">
                        <div
                          className="h-full bg-sage rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick actions */}
        <div className="mt-8 p-6 bg-sky-light rounded-2xl">
          <h3 className="font-medium text-charcoal mb-2">Review all {currentField?.name}</h3>
          <p className="text-sm text-muted mb-4">
            Practice all cards from this field in one session.
          </p>
          <button className="btn-primary text-sm">Start review</button>
        </div>
      </div>
    </div>
  );
}
