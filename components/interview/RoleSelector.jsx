'use client';

const ROLES = ['Software Engineer', 'Data Analyst', 'Product Manager', 'Frontend Developer'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const QUESTION_COUNTS = [5, 8, 10];

export default function RoleSelector({ config, setConfig }) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold text-white mb-4 tracking-wide uppercase text-sm">Select Role</h3>
        <div className="grid grid-cols-2 gap-4">
          {ROLES.map((role) => (
            <button key={role} onClick={() => setConfig({ ...config, role })}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-300 shadow-sm ${
                config.role === role
                  ? 'border-razor-accent bg-razor-accent/20 text-white shadow-razor-accent/20'
                  : 'border-razor-teal bg-razor-navy/50 text-slate-300 hover:border-razor-accent/50 hover:bg-razor-teal/30'
              }`}>
              <span className="font-bold text-sm">{role}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-4 tracking-wide uppercase text-sm">Difficulty Level</h3>
        <div className="flex gap-4">
          {DIFFICULTIES.map((diff) => {
            const getColors = (d) => {
              if (d === 'Easy') return 'razor-green';
              if (d === 'Medium') return 'razor-peach';
              return 'red-400';
            };
            const c = getColors(diff);
            
            return (
              <button key={diff} onClick={() => setConfig({ ...config, difficulty: diff })}
                className={`flex-1 py-3.5 rounded-xl border-2 font-bold text-sm transition-all duration-300 shadow-sm ${
                  config.difficulty === diff
                    ? diff === 'Hard' ? 'border-red-400 bg-red-400/20 text-white' 
                      : `border-${c} bg-${c}/20 text-white shadow-${c}/20`
                    : 'border-razor-teal bg-razor-navy/50 text-slate-300 hover:border-slate-500'
                }`}>
                {diff}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-4 tracking-wide uppercase text-sm">Number of Questions</h3>
        <div className="flex gap-4">
          {QUESTION_COUNTS.map((count) => (
            <button key={count} onClick={() => setConfig({ ...config, questionCount: count })}
              className={`flex-1 py-3.5 rounded-xl border-2 font-bold transition-all duration-300 shadow-sm text-lg ${
                config.questionCount === count
                  ? 'border-razor-accent bg-razor-accent/20 text-white shadow-razor-accent/20'
                  : 'border-razor-teal bg-razor-navy/50 text-slate-300 hover:border-razor-accent/50 hover:bg-razor-teal/30'
              }`}>
              {count}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
