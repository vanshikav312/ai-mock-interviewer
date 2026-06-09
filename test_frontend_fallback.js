const http = require('http');

async function run() {
  console.log("=== Testing Proxy Fallback (Python Down) ===");
  try {
    const startRes = await fetch('http://localhost:3000/api/interview/rag-session', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ action: 'start', role: 'Software Engineer', difficulty: 'Medium', num_questions: 2, jd_text: '' })
    });
    
    console.log("Start Session Status:", startRes.status);
    const startData = await startRes.json();
    console.log("Start Session Data:", startData);
  } catch (err) {
    console.error("Error calling nextjs proxy:", err);
  }
}

run();
