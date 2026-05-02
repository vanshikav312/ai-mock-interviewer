import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Session from '@/models/Session';
import User from '@/models/User';
import mongoose from 'mongoose';

// Helper: always resolve a real MongoDB userId string
async function resolveUserId(session) {
  const id = session?.user?.id;
  if (id && /^[a-f\d]{24}$/i.test(id)) return id;

  if (session?.user?.email) {
    const dbUser = await User.findOne({ email: session.user.email }).lean();
    return dbUser?._id?.toString() ?? null;
  }
  return null;
}

export async function GET(request, { params }) {
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

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
    }

    const session = await Session.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}
