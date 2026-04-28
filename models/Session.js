import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, default: '' },
  score: { type: Number, default: 0 },
  clarity: { type: Number, default: 0 },
  technical: { type: Number, default: 0 },
  relevance: { type: Number, default: 0 },
  verdict: { type: String, default: '' },
  fillerWords: { type: Number, default: 0 },
  idealAnswer: { type: String, default: '' },
  strengths: { type: String, default: '' },
  improvements: { type: String, default: '' },
});

const SessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: { type: String, required: true },
    difficulty: { type: String, required: true },
    questions: [QuestionSchema],
    overallScore: { type: Number, default: 0 },
    grade: { type: String, default: '' },
    hiringVerdict: { type: String, default: '' },
    finalReport: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema);
export default Session;
