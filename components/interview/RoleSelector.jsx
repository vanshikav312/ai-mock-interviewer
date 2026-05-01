'use client';

const ROLES = ['Software Engineer', 'Data Analyst', 'Product Manager', 'Frontend Developer'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const QUESTION_COUNTS = [2, 5, 8, 10];

export default function RoleSelector({ config, setConfig }) {
  return (
    <div className="space-y-12">
      <div>
        <h3 className="text-[10px] font-black text-white/40 mb-4 tracking-widest uppercase">Select Career Path</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ROLES.map((role) => (
            <button key={role} onClick={() => setConfig({ ...config, role })}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-300 shadow-sm ${
                config.role === role
                  ? 'border-accent bg-accent/20 text-white shadow-accent/20'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/40 hover:bg-white/10'
              }`}>
              <span className="font-bold text-sm">{role}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-black text-white/40 mb-4 tracking-widest uppercase">Difficulty Level</h3>
        <div className="flex gap-4">
          {DIFFICULTIES.map((diff) => {
            const getActiveStyles = (d) => {
              if (d === 'Easy') return 'border-[#A3BFA8] bg-[#A3BFA8]/20 text-white';
              if (d === 'Medium') return 'border-accent bg-accent/20 text-white shadow-accent/20';
              return 'border-red-400 bg-red-400/20 text-white';
            };
            
            return (
              <button key={diff} onClick={() => setConfig({ ...config, difficulty: diff })}
                className={`flex-1 py-3.5 rounded-xl border-2 font-bold text-sm transition-all duration-300 shadow-sm ${
                  config.difficulty === diff
                    ? getActiveStyles(diff)
                    : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30'
                }`}>
                {diff}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-black text-white/40 mb-4 tracking-widest uppercase">Number of Questions</h3>
        <div className="flex gap-4">
          {QUESTION_COUNTS.map((count) => (
            <button key={count} onClick={() => setConfig({ ...config, questionCount: count })}
              className={`flex-1 py-3.5 rounded-xl border-2 font-bold transition-all duration-300 shadow-sm text-lg ${
                config.questionCount === count
                  ? 'border-accent bg-accent/20 text-white shadow-accent/20'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/40 hover:bg-white/10'
              }`}>
              {count}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
