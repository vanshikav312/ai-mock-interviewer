import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-soft overflow-x-hidden selection:bg-luxury/10">
      {/* Floating Navigation */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl">
        <div className="glass-panel px-8 py-4 rounded-pill flex items-center justify-between shadow-soft border border-depth/20">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
            <span className="font-black text-luxury tracking-tighter text-xl">AI Mock Interviewer</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-bold text-muted hover:text-luxury transition-colors">Features</Link>
            </div>
            <Link href="/register" className="pill-btn bg-luxury text-white px-8 py-2.5 text-sm shadow-soft hover:shadow-elevated hover:-translate-y-0.5">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Storytelling Layout */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-10 animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-luxury/5 border border-luxury/10 text-luxury text-xs font-black px-4 py-1.5 rounded-pill tracking-widest uppercase">
            Next-Gen Interview Prep
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-luxury leading-[0.9] tracking-tighter">
            Practice.<br />
            Polish.<br />
            <span className="text-accent italic">Perfect.</span>
          </h1>
          <p className="text-muted text-xl max-w-xl leading-relaxed font-medium">
            A human-centered AI interviewer designed to help you master technical conversations through tactile feedback and real-time streaming hints.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/register" className="pill-btn bg-accent text-white px-12 py-5 text-lg shadow-soft hover:shadow-elevated hover:-translate-y-1">
              Start Free Trial
            </Link>
          </div>
        </div>

        {/* Asymmetric Mixed Layout Blocks */}
        <div className="flex-1 relative w-full h-[600px] animate-fade-in">
          <div className="absolute top-10 right-0 w-72 h-96 soft-card p-6 rotate-3 z-20 animate-float">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-soft flex items-center justify-center text-2xl shadow-inner-soft opacity-20">•</div>
              <div>
                <p className="text-[10px] font-black uppercase text-accent tracking-widest">AI Suggestion</p>
                <p className="text-xs font-bold text-luxury">Real-time Hints</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-2 w-full bg-soft rounded-full" />
              <div className="h-2 w-3/4 bg-soft rounded-full" />
              <div className="h-2 w-1/2 bg-accent/20 rounded-full" />
            </div>
            <p className="mt-8 text-xs text-muted leading-relaxed italic">"Try explaining the time complexity before writing the code..."</p>
          </div>

          <div className="absolute bottom-10 left-0 w-80 h-72 soft-card-elevated p-8 -rotate-2 z-10">
            <div className="flex justify-between items-end mb-8">
              <div>
                <p className="text-4xl font-black text-luxury">82%</p>
                <p className="text-xs font-bold text-muted uppercase">Confidence Rate</p>
              </div>
              <div className="w-16 h-16 rounded-full border-8 border-soft border-t-accent animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-bold text-muted">
                <span>Clarity</span>
                <span>9/10</span>
              </div>
              <div className="h-2 w-full bg-soft rounded-full overflow-hidden">
                <div className="h-full bg-luxury w-[90%]" />
              </div>
            </div>
          </div>

          {/* Background Decorative Blur */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-accent/5 rounded-full blur-[120px] -z-10" />
        </div>
      </section>

      {/* Feature Section - Mixed Layout */}
      <section id="features" className="py-32 px-6 bg-white/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center space-y-4">
            <h2 className="text-5xl font-black text-luxury tracking-tighter">Everything you need to lead.</h2>
            <p className="text-muted font-medium max-w-xl mx-auto text-lg">Designed for depth, built for growth. Experience the most tactile interview practice platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-7 soft-card p-12 !bg-[#0F3D2E] text-white flex flex-col justify-between group hover:-translate-y-1">
              <div>
                <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center mb-8 border border-white/10 shadow-soft overflow-hidden">
                  <img src="/feature_dynamic.png" alt="Dynamic AI" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-4xl font-black mb-4 tracking-tighter">Dynamic AI Architect</h3>
                <p className="text-white/60 text-lg font-medium leading-relaxed max-w-md">Gemini-powered questions that adapt to your role, level, and performance in real-time.</p>
              </div>
              <div className="mt-12 flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {['React', 'System Design', 'Node.js', 'Python'].map(tag => (
                  <span key={tag} className="flex-shrink-0 bg-white/10 px-6 py-2 rounded-pill text-xs font-bold border border-white/5">{tag}</span>
                ))}
              </div>
            </div>

            <div className="md:col-span-5 space-y-8">
              <div className="soft-card p-10 !bg-[#0F3D2E] text-white hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-inner-soft border border-white/10 overflow-hidden">
                  <img src="/feature_metrics.png" alt="Metrics" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Deep Score Metrics</h3>
                <p className="text-white/60 text-sm leading-relaxed font-medium">Multidimensional analysis across clarity, relevance, and technical depth.</p>
              </div>
              <div className="soft-card p-10 !bg-[#0F3D2E] text-white hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-inner-soft border border-white/10 overflow-hidden">
                  <img src="/feature_voice.png" alt="Voice" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Hear the Question. Say Your Answer.</h3>
                <p className="text-white/60 text-sm leading-relaxed font-medium">Practice speaking by answering questions out loud, just like in a real interview.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-40 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-12 animate-slide-up">
          <h2 className="text-6xl md:text-8xl font-black text-luxury tracking-tighter">Ready to rise?</h2>
          <p className="text-muted text-xl font-medium max-w-lg mx-auto">Join thousands of developers leveling up their careers with human-centered AI practice.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/register" className="pill-btn bg-luxury text-white px-12 py-5 text-lg shadow-soft hover:shadow-elevated hover:-translate-y-1">
              Create My Account
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-depth/30 text-center">
        <p className="text-muted text-sm font-bold tracking-widest uppercase opacity-50">© 2026 AI Mock Interviewer — Made for humans.</p>
      </footer>
    </main>
  );
}
