import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Session from '@/models/Session';
import User from '@/models/User';
import mongoose from 'mongoose';

const VERDICT_WEIGHT = {
  'Strong Hire': 4,
  'Hire': 3,
  'Maybe': 2,
  'No Hire': 1,
};

async function resolveUserId(session) {
  const id = session?.user?.id;
  if (id && /^[a-f\d]{24}$/i.test(id)) return id;
  if (session?.user?.email) {
    const dbUser = await User.findOne({ email: session.user.email }).lean();
    return dbUser?._id?.toString() ?? null;
  }
  return null;
}

export async function GET() {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const userId = await resolveUserId(authSession);
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = await User.findById(userId).lean();
    const sessions = await Session.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();

    const totalInterviews = sessions.length;
    let avgScore = 0;
    let bestScore = 0;
    let favoriteRole = 'None';
    let bestVerdict = 'None';
    const recentActivity = sessions.slice(0, 3);

    const roleCounts = {};
    const roleScores = {};
    const difficultyScores = {};
    let highestVerdictWeight = 0;
    const sessionDates = new Set();

    if (totalInterviews > 0) {
      let totalScoreSum = 0;

      sessions.forEach(s => {
        totalScoreSum += s.overallScore || 0;
        if ((s.overallScore || 0) > bestScore) bestScore = s.overallScore;

        const role = s.role || 'Unknown';
        roleCounts[role] = (roleCounts[role] || 0) + 1;
        if (!roleScores[role]) roleScores[role] = { sum: 0, count: 0 };
        roleScores[role].sum += s.overallScore || 0;
        roleScores[role].count += 1;

        const diff = s.difficulty || 'Unknown';
        if (!difficultyScores[diff]) difficultyScores[diff] = { sum: 0, count: 0 };
        difficultyScores[diff].sum += s.overallScore || 0;
        difficultyScores[diff].count += 1;

        const verdict = s.hiringVerdict || 'None';
        const weight = VERDICT_WEIGHT[verdict] || 0;
        if (weight > highestVerdictWeight) {
          highestVerdictWeight = weight;
          bestVerdict = verdict;
        }

        if (s.createdAt) {
          const dateStr = new Date(s.createdAt).toISOString().split('T')[0];
          sessionDates.add(dateStr);
        }
      });

      avgScore = Math.round(totalScoreSum / totalInterviews);

      let maxCount = 0;
      for (const [r, count] of Object.entries(roleCounts)) {
        if (count > maxCount) {
          maxCount = count;
          favoriteRole = r;
        }
      }
    }

    const scoreByRole = Object.keys(roleScores).map(r => ({
      role: r,
      avg: Math.round(roleScores[r].sum / roleScores[r].count)
    })).sort((a, b) => b.avg - a.avg);

    const scoreByDifficulty = Object.keys(difficultyScores).map(d => ({
      difficulty: d,
      avg: Math.round(difficultyScores[d].sum / difficultyScores[d].count)
    })).sort((a, b) => b.avg - a.avg);

    let currentStreak = 0;
    const sortedDates = Array.from(sessionDates).sort((a, b) => new Date(b) - new Date(a));
    if (sortedDates.length > 0) {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let streakDate = new Date(sortedDates[0]);
      if (sortedDates[0] === todayStr || sortedDates[0] === yesterdayStr) {
        currentStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const expected = new Date(streakDate);
          expected.setDate(expected.getDate() - 1);
          const expectedStr = expected.toISOString().split('T')[0];
          
          if (sortedDates[i] === expectedStr) {
            currentStreak++;
            streakDate = expected;
          } else {
            break;
          }
        }
      }
    }

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
      },
      stats: {
        totalInterviews,
        avgScore,
        bestScore,
        favoriteRole,
        currentStreak,
      },
      performance: {
        bestVerdict,
        scoreByRole,
        scoreByDifficulty,
      },
      recentActivity,
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile data' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const userId = await resolveUserId(authSession);
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, image, currentPassword, newPassword, confirmPassword } = body;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update name if provided
    if (name) user.name = name;

    // Update image if provided
    if (image) user.image = image;

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to change password' }, { status: 400 });
      }
      
      // If user has a password (not Google-only user), verify it
      if (user.password) {
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
          return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }
      }

      // Check if new password and confirm password match
      if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: 'New passwords do not match' }, { status: 400 });
      }

      // Check minimum length in backend as well
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
      }
      
      user.password = newPassword;
    }

    await user.save();

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    // Return specific validation error if it's a Mongoose validation error
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0].message;
      return NextResponse.json({ error: firstError }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
