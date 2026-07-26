const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

async function testGeminiAPI() {
  const endpoint = `${GEMINI_API_BASE}/${encodeURIComponent(model)}:generateContent`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: "Say hello" }]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 50
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} ${response.statusText}`);
      console.error('Error details:', errorText);
      return;
    }

    const data = await response.json();
    console.log('Success! Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Network error:', error.message);
  }
}

testGeminiAPI();