import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [currentWord, setCurrentWord] = useState(0);
  const words = ['smarter', 'sharper', 'informed', 'confident'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <span className="text-xl font-semibold text-charcoal tracking-tight">mindforge</span>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-muted hover:text-charcoal font-medium">
            Sign in
          </Link>
          <Link to="/login" className="btn-primary">
            Start free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            {/* Big Logo */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 p-6 bg-gradient-to-br from-coral-light to-lavender-light rounded-3xl shadow-lg">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coral to-lavender flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-charcoal tracking-tight">mindforge</h2>
                  <p className="text-sm text-muted">Learn smarter, not harder</p>
                </div>
              </div>
            </div>

            <div className="inline-block px-3 py-1 bg-coral-light text-coral text-sm font-medium rounded-full mb-6">
              5 minutes a day
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-charcoal leading-tight mb-6">
              Get{' '}
              <span className="text-coral relative">
                {words[currentWord]}
                <span className="absolute bottom-0 left-0 w-full h-1 bg-coral/30 rounded" />
              </span>
              <br />
              while you scroll
            </h1>
            <p className="text-xl text-muted mb-8 leading-relaxed max-w-lg">
              Short video lessons on tech, finance, and world events. 
              Swipe through like TikTok. Actually remember what you learn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login" className="btn-primary text-lg px-8 py-4 text-center">
                Start learning free
              </Link>
              <button className="btn-secondary text-lg px-8 py-4 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch demo
              </button>
            </div>
            <p className="text-sm text-muted mt-4">No credit card required</p>
          </div>

          {/* Phone mockup */}
          <div className="relative hidden lg:block animate-scale-in">
            <div className="w-72 h-[580px] mx-auto bg-charcoal rounded-[3rem] p-3 shadow-2xl">
              <div className="w-full h-full bg-gradient-to-br from-coral to-lavender rounded-[2.5rem] overflow-hidden relative">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-charcoal rounded-b-2xl" />
                
                {/* Video preview icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                
                {/* Content preview */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 pb-16 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent">
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium w-fit mb-3">
                    Technology
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    How AI is changing healthcare
                  </h3>
                  <p className="text-white/70 text-sm">3 min · 4 sources</p>
                </div>

                {/* Action buttons */}
                <div className="absolute right-4 bottom-20 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating cards */}
            <div className="absolute -left-8 top-20 bg-warm-white rounded-2xl p-4 shadow-lg animate-float">
              <p className="text-sm font-medium text-charcoal">Daily streak</p>
              <p className="text-2xl font-semibold text-coral">12 days</p>
            </div>
            <div className="absolute -right-4 bottom-32 bg-warm-white rounded-2xl p-4 shadow-lg animate-float-delayed">
              <p className="text-sm font-medium text-charcoal">Topics learned</p>
              <p className="text-2xl font-semibold text-sage">47</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-y border-cream-dark py-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted">
            <span className="text-sm">Trusted by professionals at</span>
            <span className="font-semibold text-charcoal">Google</span>
            <span className="font-semibold text-charcoal">McKinsey</span>
            <span className="font-semibold text-charcoal">Goldman Sachs</span>
            <span className="font-semibold text-charcoal">Meta</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-charcoal mb-4">Learning that fits your life</h2>
            <p className="text-muted max-w-xl mx-auto">
              No more hour-long courses you never finish. Just scroll, watch, and get smarter.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 stagger">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-coral to-coral-light flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">Scroll through videos</h3>
              <p className="text-muted">
                Short, animated lessons you can watch anywhere. Like TikTok, but you actually learn something.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-sage to-sage-light flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">AI synthesizes for you</h3>
              <p className="text-muted">
                We pull from news, research, and expert discussions. You get the insights without the noise.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-lavender to-lavender-light flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">Actually remember it</h3>
              <p className="text-muted">
                Flashcards and quizzes help you retain what you learn. Build real knowledge over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="py-20 bg-warm-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-charcoal mb-4">What you'll learn</h2>
          <p className="text-muted mb-12">The knowledge that helps you navigate work and life</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'Technology', desc: 'AI, software, digital trends', color: 'coral' },
              { name: 'Finance', desc: 'Markets, investing, money', color: 'sage' },
              { name: 'Economics', desc: 'Policy, trade, macro trends', color: 'honey' },
              { name: 'Culture', desc: 'Society, media, ideas', color: 'sky' },
              { name: 'Influence', desc: 'Persuasion, leadership', color: 'lavender' },
              { name: 'Global Events', desc: 'Geopolitics, world affairs', color: 'rose' },
            ].map((topic) => (
              <div key={topic.name} className={`card-${topic.color} p-6`}>
                <h3 className="font-semibold text-charcoal mb-1">{topic.name}</h3>
                <p className="text-sm text-muted">{topic.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiator */}
      <section className="py-20 bg-charcoal text-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-semibold mb-6">Not another course platform</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-coral flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">5 minutes, not 5 hours</h3>
                    <p className="text-white/60 text-sm">Bite-sized lessons that respect your time</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-coral flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Multi-source synthesis</h3>
                    <p className="text-white/60 text-sm">We combine multiple sources so you get the full picture</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-coral flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Built for retention</h3>
                    <p className="text-white/60 text-sm">Spaced repetition and quizzes help you actually remember</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/5 rounded-3xl p-8">
              <div className="text-5xl font-semibold text-coral mb-2">93%</div>
              <p className="text-white/60 mb-6">of users say they feel more informed after 2 weeks</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-coral/20 flex items-center justify-center text-xs text-white">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white">
                  +2k
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold text-charcoal mb-4">
            Start getting smarter today
          </h2>
          <p className="text-muted mb-8">
            Join thousands of professionals who spend 5 minutes a day building real knowledge.
          </p>
          <Link to="/login" className="btn-primary text-lg px-8 py-4 inline-block">
            Get started free
          </Link>
          <p className="text-sm text-muted mt-4">Free forever. No credit card needed.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cream-dark py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xl font-semibold text-charcoal tracking-tight">mindforge</span>
          <p className="text-sm text-muted">Get smarter in 5 minutes a day</p>
        </div>
      </footer>
    </div>
  );
}
