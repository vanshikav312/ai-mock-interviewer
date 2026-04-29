import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Session from '@/models/Session';
import User from '@/models/User';
import mongoose from 'mongoose';

// Helper: always resolve a real MongoDB userId string
async function resolveUserId(session) {
  // Validate it's a real 24-char hex ObjectId before trusting it
  const id = session?.user?.id;
  if (id && /^[a-f\d]{24}$/i.test(id)) return id;

  // Fallback: look up by email (handles Google OAuth race condition)
  if (session?.user?.email) {
    const dbUser = await User.findOne({ email: session.user.email }).lean();
    return dbUser?._id?.toString() ?? null;
  }
  return null;
}

export async function GET(request) {
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

    const sessions = await Session.find({
      userId: new mongoose.Types.ObjectId(userId), // cast string → ObjectId
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(request) {
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
    const { userId: _ignored, ...safeBody } = body; // prevent body overwriting userId

    const newSession = await Session.create({
      userId: new mongoose.Types.ObjectId(userId), // cast string → ObjectId
      ...safeBody,
    });

    return NextResponse.json({ session: newSession }, { status: 201 });
  } catch (error) {
    console.error('Save session error:', error);
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
  }
}
