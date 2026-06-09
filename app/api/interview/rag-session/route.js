import { NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, ...payload } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    let url = '';
    
    if (action === 'start') {
      // payload expects: jd_text, role, difficulty, num_questions
      url = `${PYTHON_API_URL}/api/v1/session/start`;
    } else if (action === 'answer') {
      // payload expects: session_id, answer
      const { session_id, ...answerPayload } = payload;
      if (!session_id) {
        return NextResponse.json({ error: 'session_id is required for answer action' }, { status: 400 });
      }
      url = `${PYTHON_API_URL}/api/v1/session/${session_id}/answer`;
      // re-assign payload to exclude session_id from the body itself
      Object.keys(payload).forEach(key => delete payload[key]);
      Object.assign(payload, answerPayload);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.detail || 'Python API Error' }, { status: res.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Proxy Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
