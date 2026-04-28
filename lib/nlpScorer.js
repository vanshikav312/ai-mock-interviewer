import natural from 'natural';

const FILLER_WORDS = ['um', 'uh', 'like', 'basically', 'so', 'you know', 'right', 'literally'];

export function countFillerWords(text) {
  const lower = text.toLowerCase();
  const found = [];
  let count = 0;

  FILLER_WORDS.forEach((filler) => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches) {
      count += matches.length;
      found.push({ word: filler, count: matches.length });
    }
  });

  return { count, words: found };
}

export function extractKeywords(text) {
  const tfidf = new natural.TfIdf();
  tfidf.addDocument(text);

  const keywords = [];
  tfidf.listTerms(0).slice(0, 10).forEach((item) => {
    if (item.term.length > 3) {
      keywords.push(item.term);
    }
  });

  return keywords;
}

const ROLE_KEYWORDS = {
  'Software Engineer': ['algorithm', 'data structure', 'complexity', 'scalable', 'api', 'database', 'code', 'design', 'pattern', 'performance'],
  'Data Analyst': ['data', 'analysis', 'sql', 'visualization', 'insight', 'metrics', 'dashboard', 'report', 'trend', 'statistical'],
  'Product Manager': ['user', 'stakeholder', 'roadmap', 'prioritize', 'metric', 'feedback', 'strategy', 'feature', 'customer', 'launch'],
  'Frontend Developer': ['component', 'react', 'css', 'responsive', 'performance', 'ui', 'ux', 'accessibility', 'browser', 'render'],
};

export function scoreAnswerLocally(answer, role) {
  if (!answer || answer.trim().length === 0) return 0;

  const words = answer.trim().split(/\s+/);
  const wordCount = words.length;

  // Word count scoring (0-40 points)
  let wordScore = 0;
  if (wordCount < 20) wordScore = 5;
  else if (wordCount < 50) wordScore = 15;
  else if (wordCount < 100) wordScore = 25;
  else if (wordCount < 200) wordScore = 35;
  else wordScore = 40;

  // Keyword richness (0-40 points)
  const roleKeywords = ROLE_KEYWORDS[role] || [];
  const lowerAnswer = answer.toLowerCase();
  const matchedKeywords = roleKeywords.filter((kw) => lowerAnswer.includes(kw));
  const keywordScore = Math.min(40, (matchedKeywords.length / Math.max(roleKeywords.length, 1)) * 40);

  // Filler word penalty (0 to -20 points)
  const { count: fillerCount } = countFillerWords(answer);
  const fillerPenalty = Math.min(20, fillerCount * 4);

  const total = Math.max(0, Math.round(wordScore + keywordScore - fillerPenalty));
  return Math.min(100, total);
}
