const payload = {
  skill: "beginner",
  difficulty: "easy",
  interests: ["web development", "javascript"],
  projectType: "tutorial",
  languages: ["javascript", "html", "css"]
};

fetch('http://localhost:5001/recommend', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
})
.then(response => {
  console.log('Status:', response.status);
  return response.json().catch(() => ({}));
})
.then(data => {
  console.log('Response:', JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('Error:', error.message);
});