'use client';

const ROLES = ['Software Engineer', 'Data Analyst', 'Product Manager', 'Frontend Developer'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const QUESTION_COUNTS = [5, 8, 10];

export default function RoleSelector({ config, setConfig }) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Select Role</h3>
        <div className="grid grid-cols-2 gap-3">
          {ROLES.map((role) => (
            <button key={role} onClick={() => setConfig({ ...config, role })}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                config.role === role
                  ? 'border-purple-500 bg-purple-500/20 text-white'
                  : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
              }`}>
              <span className="font-medium text-sm">{role}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Difficulty Level</h3>
        <div className="flex gap-3">
          {DIFFICULTIES.map((diff) => {
            const colors = { Easy: 'emerald', Medium: 'amber', Hard: 'red' };
            const c = colors[diff];
            return (
              <button key={diff} onClick={() => setConfig({ ...config, difficulty: diff })}
                className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200 ${
                  config.difficulty === diff
                    ? `border-${c}-500 bg-${c}-500/20 text-${c}-300`
                    : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
                }`}>
                {diff}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Number of Questions</h3>
        <div className="flex gap-3">
          {QUESTION_COUNTS.map((count) => (
            <button key={count} onClick={() => setConfig({ ...config, questionCount: count })}
              className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all duration-200 ${
                config.questionCount === count
                  ? 'border-purple-500 bg-purple-500/20 text-white'
                  : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
              }`}>
              {count}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
