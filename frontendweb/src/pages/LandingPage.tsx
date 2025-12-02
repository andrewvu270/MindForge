import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <span className="text-xl font-semibold text-charcoal tracking-tight">mindforge</span>
        <div className="flex items-center gap-4">
          <Link to="/lessons" className="text-muted hover:text-charcoal transition-colors font-medium">
            Explore
          </Link>
          <Link to="/dashboard" className="btn-primary">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-32">
        <div className="max-w-3xl">
          <div className="pill pill-coral mb-6">AI-Powered Learning</div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-charcoal leading-[1.1] tracking-tight mb-6">
            Learn smarter,<br />not harder
          </h1>
          <p className="text-xl text-muted max-w-xl mb-10 leading-relaxed">
            Master new skills in just 5-25 minutes a day with AI-synthesized lessons from multiple sources.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/dashboard" className="btn-primary text-lg px-8 py-4">
              Start Learning Free
            </Link>
            <Link to="/lessons" className="btn-secondary text-lg px-8 py-4">
              Browse Lessons
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-coral text-center py-8">
            <div className="text-4xl font-semibold text-charcoal mb-1">10K+</div>
            <div className="text-muted text-sm">Learners</div>
          </div>
          <div className="card-sage text-center py-8">
            <div className="text-4xl font-semibold text-charcoal mb-1">50K+</div>
            <div className="text-muted text-sm">Lessons</div>
          </div>
          <div className="card-honey text-center py-8">
            <div className="text-4xl font-semibold text-charcoal mb-1">6</div>
            <div className="text-muted text-sm">Fields</div>
          </div>
          <div className="card-sky text-center py-8">
            <div className="text-4xl font-semibold text-charcoal mb-1">95%</div>
            <div className="text-muted text-sm">Satisfaction</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-warm-white py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-semibold text-charcoal text-center mb-16">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Choose a topic', desc: 'Pick from 6 fields or generate custom lessons on any subject' },
              { num: '02', title: 'AI synthesizes', desc: 'We pull from multiple sources and create your personalized lesson' },
              { num: '03', title: 'Learn & grow', desc: 'Take quizzes, earn points, and track your progress over time' },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-cream flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-semibold text-coral">{step.num}</span>
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-3">{step.title}</h3>
                <p className="text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fields */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-semibold text-charcoal text-center mb-16">
            Learn across fields
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Technology', color: 'card-coral' },
              { name: 'Finance', color: 'card-sage' },
              { name: 'Economics', color: 'card-honey' },
              { name: 'Culture', color: 'card-sky' },
              { name: 'Influence', color: 'card-lavender' },
              { name: 'Global', color: 'card-rose' },
            ].map((field) => (
              <div key={field.name} className={`${field.color} text-center py-6`}>
                <div className="font-semibold text-charcoal">{field.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-charcoal mb-6">
            Ready to start learning?
          </h2>
          <p className="text-xl text-muted mb-10">
            Join thousands of learners mastering new skills every day
          </p>
          <Link to="/dashboard" className="btn-primary text-lg px-8 py-4">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cream-dark py-8">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-muted text-sm">© 2024 mindforge. Built with AI, designed for humans.</p>
        </div>
      </footer>
    </div>
  );
}
