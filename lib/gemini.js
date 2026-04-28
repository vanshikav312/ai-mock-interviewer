import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function generateQuestion(role, difficulty, previousQuestions = []) {
  const prevList = previousQuestions.length
    ? `Previously asked questions (do NOT repeat these):\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
    : 'No previous questions yet.';

  const prompt = `You are a senior technical interviewer at a top tech company.
Generate ONE interview question for a ${role} position at ${difficulty} difficulty level.
${prevList}

Rules:
- Return ONLY the question text, nothing else
- No numbering, no preamble, no explanation
- Make it specific, realistic, and appropriate for ${difficulty} level
- For Hard: ask about system design or advanced concepts
- For Medium: ask about practical problem-solving
- For Easy: ask about fundamentals and basic concepts`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

export async function evaluateAnswer(role, question, answer) {
  const prompt = `You are an expert technical interviewer evaluating a candidate's answer.

Role: ${role}
Question: ${question}
Candidate's Answer: ${answer}

Evaluate the answer and return ONLY a valid JSON object with this exact structure:
{
  "score": <number 0-100>,
  "clarity": <number 0-100>,
  "technical": <number 0-100>,
  "relevance": <number 0-100>,
  "strengths": "<what the candidate did well>",
  "improvements": "<specific areas to improve>",
  "idealAnswer": "<a comprehensive ideal answer>",
  "verdict": "<one of: Excellent, Good, Average, Needs Work>"
}

Scoring guide:
- score: overall quality of the answer
- clarity: how clearly the candidate communicated
- technical: accuracy and depth of technical content
- relevance: how well the answer addressed the question

Return ONLY the JSON, no markdown, no explanation.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

export async function generateInterviewPlan(role, level) {
  const prompt = `Create a structured interview preparation plan for a ${role} position at ${level} level.
Return ONLY a valid JSON object with this structure:
{
  "sections": [
    { "title": "<topic>", "description": "<what to study>", "resources": ["<resource1>", "<resource2>"] }
  ],
  "tips": ["<tip1>", "<tip2>", "<tip3>", "<tip4>", "<tip5>"]
}
Return ONLY the JSON, no markdown, no explanation.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

export async function streamHint(role, question, partialAnswer) {
  const prompt = `You are a helpful interview coach.
Role: ${role}
Question: ${question}
Candidate's partial answer so far: ${partialAnswer || '(nothing typed yet)'}

Give ONE short, helpful hint (1 sentence max) to guide the candidate without giving away the full answer.
Be encouraging and specific. Do not repeat the question.`;

  const streamResult = await model.generateContentStream(prompt);

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamResult.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return readableStream;
}

export async function generateFinalReport(role, allQAs) {
  const qaText = allQAs
    .map((qa, i) => `Q${i + 1}: ${qa.question}\nAnswer: ${qa.answer}\nScore: ${qa.score}/100\nVerdict: ${qa.verdict}`)
    .join('\n\n');

  const avgScore = Math.round(allQAs.reduce((sum, qa) => sum + qa.score, 0) / allQAs.length);

  const prompt = `You are a senior hiring manager reviewing a mock interview for a ${role} position.

Interview Summary:
${qaText}

Average Score: ${avgScore}/100

Generate a comprehensive final report as ONLY a valid JSON object with this structure:
{
  "overallScore": <number 0-100>,
  "grade": "<A, B, C, or D>",
  "summary": "<2-3 sentence overall assessment paragraph>",
  "topStrengths": ["<strength1>", "<strength2>", "<strength3>"],
  "criticalGaps": ["<gap1>", "<gap2>", "<gap3>"],
  "studyTopics": ["<topic1>", "<topic2>", "<topic3>", "<topic4>"],
  "hiringVerdict": "<one of: Strong Hire, Hire, Maybe, No Hire>",
  "nextSteps": "<what to do in the next 2 weeks to improve, 3-4 sentences>"
}

Grade scale: A=85-100, B=70-84, C=50-69, D=below 50
Return ONLY the JSON, no markdown, no explanation.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}
