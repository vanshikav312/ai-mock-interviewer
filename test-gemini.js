require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('No GEMINI_API_KEY found in .env.local');
  process.exit(1);
}

console.log('Testing Gemini API Key:', apiKey.substring(0, 8) + '...');

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

async function run() {
  try {
    const result = await model.generateContent('Say hello');
    console.log('\nSuccess! Response:', result.response.text());
  } catch(e) {
    console.error('\nAPI Error Encountered:');
    console.error(e.message || e);
  }
}
run();
