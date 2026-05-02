'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const VERDICT_COLORS = {
  'Strong Hire': 'text-emerald-600 bg-emerald-50 border-emerald-100', 
  'Hire': 'text-blue-600 bg-blue-50 border-blue-100',
  'Maybe': 'text-accent bg-accent/5 border-accent/10', 
  'No Hire': 'text-red-600 bg-red-50 border-red-100',
  'None': 'text-muted bg-white/10 border-depth/20',
};

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Editing states
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const fetchProfile = () => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setProfileData(data);
          setNewName(data.user.name);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status]);

  const handleUpdateProfile = async (payload) => {
    setUpdating(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      
      setSuccess(data.message || 'Updated successfully');
      fetchProfile();
      // Update session if name changed
      if (payload.name && update) await update({ name: payload.name });
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setError('Image must be less than 1MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      handleUpdateProfile({ image: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleNameSave = async () => {
    if (!newName.trim()) return;
    const ok = await handleUpdateProfile({ name: newName });
    if (ok) setIsEditingName(false);
  };

  const handlePasswordSave = async () => {
    if (passwords.new !== passwords.confirm) {
      setError('New passwords do not match');
      return;
    }
    if (passwords.new.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    const ok = await handleUpdateProfile({ 
      currentPassword: passwords.current, 
      newPassword: passwords.new,
      confirmPassword: passwords.confirm
    });
    if (ok) {
      setIsChangingPassword(false);
      setPasswords({ current: '', new: '', confirm: '' });
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-soft flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-luxury/20 border-t-luxury rounded-full animate-spin shadow-soft" />
          <div className="text-luxury font-black tracking-widest text-xs uppercase animate-pulse">Loading Profile...</div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-soft flex items-center justify-center">
        <p className="text-luxury font-black text-xl">Failed to load profile.</p>
      </div>
    );
  }

  const { user, stats, performance, recentActivity } = profileData;

  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';

  return (
    <div className="min-h-screen bg-soft selection:bg-luxury/10">
      {/* Floating Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
        <div className="glass-panel px-8 py-4 rounded-pill flex items-center justify-between shadow-soft border border-depth/20">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
            <span className="font-black text-luxury tracking-tighter text-xl">AI Mock Interviewer</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-muted hover:text-luxury text-xs font-black uppercase tracking-widest px-4 transition-colors">
              ← Dashboard
            </Link>
            <Link href="/interview/setup" className="pill-btn bg-luxury text-white px-8 py-2.5 text-sm shadow-soft hover:shadow-elevated transition-all">
              New Interview
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-32 pb-20 space-y-12">
        {/* Status Messages */}
        {((error && !isChangingPassword) || success) && (
          <div className={`soft-card p-4 flex items-center gap-3 animate-slide-up ${error ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${error ? 'bg-red-500' : 'bg-emerald-500'}`} />
            <p className="text-xs font-bold uppercase tracking-widest">{error || success}</p>
          </div>
        )}

        {/* Section 1: User Info */}
        <div className="soft-card p-10 flex flex-col md:flex-row items-center gap-8 animate-slide-up">
          <div 
            onClick={handlePhotoClick}
            className="w-32 h-32 rounded-full overflow-hidden bg-luxury/10 flex items-center justify-center border-4 border-white shadow-soft shrink-0 cursor-pointer group relative"
          >
            {user.image ? (
              <img src={user.image} alt={user.name} className="w-full h-full object-cover transition-opacity group-hover:opacity-40" />
            ) : (
              <span className="text-4xl font-black text-luxury transition-opacity group-hover:opacity-40">{initials}</span>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-black text-luxury uppercase tracking-widest text-center px-2">Change Photo</span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-soft border-2 border-luxury/10 rounded-pill px-4 py-2 text-xl font-black text-luxury outline-none focus:border-luxury/30 w-full max-w-xs"
                  />
                  <button 
                    onClick={handleNameSave}
                    disabled={updating}
                    className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:underline shrink-0"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => { setIsEditingName(false); setNewName(user.name); }}
                    className="text-[10px] font-black uppercase tracking-widest text-muted hover:underline shrink-0"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-4xl font-black text-luxury tracking-tighter">{user.name}</h1>
                  <button 
                    onClick={() => setIsEditingName(true)}
                    className="text-[10px] font-black uppercase tracking-widest text-muted hover:text-luxury transition-colors border border-depth/30 px-3 py-1 rounded-full"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
            <p className="text-muted text-lg mb-4">{user.email}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted/60">
              Practicing since {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>

        {/* Section 2: Interview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="soft-card p-6 flex flex-col justify-center items-center text-center hover:-translate-y-1 transition-transform">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Total Sessions</p>
            <p className="text-4xl font-black text-luxury">{stats.totalInterviews}</p>
          </div>
          <div className="soft-card p-6 flex flex-col justify-center items-center text-center hover:-translate-y-1 transition-transform">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Avg Score</p>
            <p className="text-4xl font-black text-luxury">{stats.avgScore}</p>
          </div>
          <div className="soft-card p-6 flex flex-col justify-center items-center text-center hover:-translate-y-1 transition-transform">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Best Score</p>
            <p className="text-4xl font-black text-emerald-600">{stats.bestScore}</p>
          </div>
          <div className="soft-card p-6 flex flex-col justify-center items-center text-center hover:-translate-y-1 transition-transform">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Fav Role</p>
            <p className="text-xl font-black text-luxury leading-tight">{stats.favoriteRole}</p>
          </div>
          <div className="soft-card p-6 flex flex-col justify-center items-center text-center hover:-translate-y-1 transition-transform bg-accent/5 border border-accent/10 col-span-2 md:col-span-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-2">Current Streak</p>
            <p className="text-4xl font-black text-accent">{stats.currentStreak} <span className="text-sm">days</span></p>
          </div>
        </div>

        {/* Section 3: Performance Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="soft-card p-8">
            <h3 className="text-xl font-black text-luxury tracking-tighter mb-6">Role Performance</h3>
            <div className="space-y-4">
              {performance.scoreByRole.length === 0 ? (
                <p className="text-sm font-medium text-muted">No data available.</p>
              ) : (
                performance.scoreByRole.slice(0, 4).map((roleData, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest text-muted mb-1">
                      <span>{roleData.role}</span>
                      <span>{roleData.avg}/100</span>
                    </div>
                    <div className="h-2 w-full bg-depth/10 rounded-full overflow-hidden">
                      <div className="h-full bg-luxury rounded-full" style={{ width: `${roleData.avg}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="soft-card p-8">
            <h3 className="text-xl font-black text-luxury tracking-tighter mb-6">Difficulty Averages</h3>
            <div className="flex items-end justify-around h-32 mb-4">
              {['Easy', 'Medium', 'Hard'].map((level) => {
                const diffData = performance.scoreByDifficulty.find(d => d.difficulty === level);
                const score = diffData ? diffData.avg : 0;
                return (
                  <div key={level} className="flex flex-col items-center gap-2 w-1/4">
                    <span className="text-xs font-black text-luxury">{score}</span>
                    <div className="w-full bg-depth/10 rounded-t-lg relative flex justify-center" style={{ height: '100px' }}>
                      <div className="absolute bottom-0 w-full bg-accent rounded-t-lg transition-all duration-1000" style={{ height: `${score}%` }} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted">{level}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 pt-6 border-t border-depth/20 flex justify-between items-center">
              <span className="text-sm font-black text-luxury uppercase tracking-widest">Best Verdict</span>
              <span className={`text-xs font-black px-3 py-1 rounded-md border uppercase tracking-tighter ${VERDICT_COLORS[performance.bestVerdict] || VERDICT_COLORS['None']}`}>
                {performance.bestVerdict}
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Recent Activity */}
        <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-luxury tracking-tighter">Recent Practice</h2>
            <Link href="/history" className="text-xs font-black uppercase tracking-widest text-muted hover:text-luxury transition-colors">View All →</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentActivity.length === 0 ? (
              <p className="text-muted italic col-span-3">No recent sessions found.</p>
            ) : (
              recentActivity.map((s) => (
                <Link key={s._id} href={`/interview/report?id=${s._id}`} className="block soft-card p-6 hover:-translate-y-1 transition-transform border border-transparent hover:border-luxury/10 group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-black text-luxury text-lg mb-1 group-hover:text-accent transition-colors">{s.role}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-xl text-luxury">{s.overallScore}<span className="text-[10px] text-muted">/100</span></p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-tighter ${VERDICT_COLORS[s.hiringVerdict] || VERDICT_COLORS['None']}`}>
                    {s.hiringVerdict || 'N/A'}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Section 5: Danger Zone */}
        <div className="animate-slide-up soft-card p-8 border-red-100 bg-red-50/30" style={{ animationDelay: '400ms' }}>
          <h3 className="text-xl font-black text-red-900 tracking-tighter mb-2">Account Actions</h3>
          <p className="text-sm font-medium text-red-800/60 mb-6">Manage your session or update your credentials.</p>
          
          {isChangingPassword ? (
            <div className="space-y-4 max-w-sm">
              <input 
                type="password" 
                placeholder="Current Password" 
                value={passwords.current}
                onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                className="w-full bg-white border-2 border-depth/20 rounded-pill px-6 py-3 outline-none focus:border-luxury/20 font-bold"
              />
              <input 
                type="password" 
                placeholder="New Password" 
                value={passwords.new}
                onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                className="w-full bg-white border-2 border-depth/20 rounded-pill px-6 py-3 outline-none focus:border-luxury/20 font-bold"
              />
              <input 
                type="password" 
                placeholder="Confirm New Password" 
                value={passwords.confirm}
                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                className="w-full bg-white border-2 border-depth/20 rounded-pill px-6 py-3 outline-none focus:border-luxury/20 font-bold"
              />
              {error && (
                <p className="text-[10px] font-black uppercase tracking-widest text-red-600 px-2 animate-pulse">
                  {error}
                </p>
              )}
              <div className="flex gap-4">
                <button 
                  onClick={handlePasswordSave}
                  disabled={updating}
                  className="pill-btn bg-luxury text-white px-8 py-3 text-xs font-black uppercase tracking-widest"
                >
                  {updating ? 'Saving...' : 'Update Password'}
                </button>
                <button 
                  onClick={() => { setIsChangingPassword(false); setError(''); setSuccess(''); }}
                  className="pill-btn bg-white text-muted border border-depth/20 px-8 py-3 text-xs font-black uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setIsChangingPassword(true)}
                className="pill-btn bg-white text-luxury border border-depth/20 px-6 py-2.5 shadow-soft hover:shadow-elevated text-xs font-black tracking-widest uppercase transition-all"
              >
                Change Password
              </button>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="pill-btn bg-red-600 text-white px-6 py-2.5 shadow-soft hover:shadow-elevated text-xs font-black tracking-widest uppercase transition-all">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
