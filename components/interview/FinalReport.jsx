'use client';
import { useRouter } from 'next/navigation';

const VERDICT_STYLES = {
  'Strong Hire': 'bg-[#0F3D2E] border-[#1F7A63]/20 text-white shadow-elevated',
  'Hire': 'bg-emerald-50 border-emerald-200 text-emerald-600',
  'Maybe': 'bg-accent/5 border-accent/20 text-accent',
  'No Hire': 'bg-red-50 border-red-200 text-red-600',
};

const GRADE_COLORS = { 
  A: 'text-[#1F7A63]', 
  B: 'text-blue-600', 
  C: 'text-accent', 
  D: 'text-red-600' 
};

export default function FinalReport({ report, role, difficulty, onSave, saving, saved }) {
  const router = useRouter();
  if (!report) return null;
  const { overallScore, grade, summary, topStrengths, criticalGaps, studyTopics, hiringVerdict, nextSteps } = report;

  return (
    <div className="space-y-10">
      <div className="soft-card-elevated p-12 text-center relative overflow-hidden group !bg-[#0F3D2E] text-white shadow-2xl">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[200px] bg-white/5 blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
        
        <div className="relative z-10">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Performance Profile: {role}</p>
          
          <div className="flex items-center justify-center gap-12 mb-10">
            <div className="text-center">
              <p className="text-8xl font-black text-white tracking-tighter">{overallScore}</p>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-2">Proficiency</p>
            </div>
            <div className="w-px h-20 bg-white/10" />
            <div className="text-center">
              <p className={`text-8xl font-black tracking-tighter ${grade === 'A' ? 'text-accent' : 'text-white'}`}>{grade}</p>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-2">Rank</p>
            </div>
          </div>

          <div className={`inline-block px-10 py-3 rounded-pill border-2 font-black tracking-widest uppercase text-xs shadow-soft mb-8 ${VERDICT_STYLES[hiringVerdict] || ''}`}>
            {hiringVerdict}
          </div>

          <p className="text-white/80 text-lg leading-relaxed max-w-3xl mx-auto font-medium italic">
            "{summary}"
          </p>
        </div>
      </div>

      {report.integrityScore !== undefined && (
        <div className={`glass-panel rounded-2xl p-5 border ${
          report.integrityScore === 100
            ? 'border-razor-green/40'
            : report.integrityScore >= 75
            ? 'border-razor-peach/40'
            : 'border-red-500/40'
        }`}>
          
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-bold ${report.integrityScore === 100 ? 'text-white' : 'text-red-500'}`}>Session Integrity</h3>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-white">
                {report.integrityScore}/100
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                report.integrityScore === 100
                  ? 'bg-razor-green/20 text-razor-green'
                  : report.integrityScore >= 75
                  ? 'bg-razor-peach/20 text-razor-peach'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {report.integrityLabel}
              </span>
            </div>
          </div>

          {report.integrityDetails?.length > 0 ? (
            <ul className="space-y-1">
              {report.integrityDetails.map((detail, i) => (
                <li key={i} 
                    className="text-red-400 text-sm flex items-center gap-2">
                  <span className="text-red-500">•</span>
                  {detail}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-razor-green text-sm">
              No integrity issues detected. Great focus!
            </p>
          )}

        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="soft-card p-8 !bg-[#0F3D2E] text-white">
          <h3 className="text-white/40 text-[10px] font-black mb-6 tracking-widest uppercase">✓ Peak Performance Areas</h3>
          <ul className="space-y-4">
            {topStrengths?.map((s, i) => (
              <li key={i} className="text-white/90 text-sm flex gap-4 font-bold leading-relaxed">
                <span className="w-6 h-6 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-[10px] shadow-soft text-accent">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="soft-card p-8 !bg-[#0F3D2E] text-white">
          <h3 className="text-white/40 text-[10px] font-black mb-6 tracking-widest uppercase">↑ Growth Opportunities</h3>
          <ul className="space-y-4">
            {criticalGaps?.map((g, i) => (
              <li key={i} className="text-white/90 text-sm flex gap-4 font-bold leading-relaxed">
                <span className="w-6 h-6 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-[10px] shadow-soft text-accent">↑</span>
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="soft-card p-10">
        <h3 className="text-luxury text-[10px] font-black mb-6 tracking-widest uppercase opacity-40">Curated Study Roadmap</h3>
        <div className="flex flex-wrap gap-3">
          {studyTopics?.map((t, i) => (
            <span key={i} className="bg-soft border-2 border-depth/30 text-luxury px-6 py-2 rounded-pill text-[10px] font-black uppercase tracking-widest shadow-soft hover:bg-white transition-all">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-accent/5 border-2 border-accent/10 rounded-3xl p-10 shadow-inner-soft">
        <h3 className="text-accent text-[10px] font-black mb-4 tracking-widest uppercase">Strategy for Next Session</h3>
        <p className="text-luxury text-base leading-relaxed font-bold opacity-80">{nextSteps}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <button onClick={onSave} disabled={saving || saved}
          className="flex-1 pill-btn bg-luxury text-white py-6 shadow-soft hover:shadow-elevated hover:-translate-y-1 transition-all text-xs font-black tracking-widest uppercase disabled:opacity-50">
          {saved ? '✓ Report Saved' : saving ? 'Archiving...' : 'Secure Report'}
        </button>
        <button onClick={() => router.push('/interview/setup')}
          className="flex-1 pill-btn bg-accent text-white py-6 shadow-soft hover:shadow-elevated hover:-translate-y-1 transition-all text-xs font-black tracking-widest uppercase">
          Start New Interview
        </button>
      </div>
    </div>
  );
}
