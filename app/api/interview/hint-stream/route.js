import { streamHint } from '@/lib/gemini';

export async function POST(request) {
  try {
    const { role, question, partialAnswer } = await request.json();

    if (!role || !question) {
      return new Response(JSON.stringify({ error: 'Role and question are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stream = await streamHint(role, question, partialAnswer || '');

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Hint stream error:', error);
    return new Response(JSON.stringify({ error: 'Failed to stream hint' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
