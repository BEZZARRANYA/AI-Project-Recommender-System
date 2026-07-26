# AI Project Recommender Backend

This backend powers the AI Project Recommender thesis demo. It handles project retrieval, recommendation generation, Gemini-assisted personalization, deterministic fallback recommendations, recommendation run persistence, feedback collection, run-based analytics, and developer-lab authentication.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Gemini API
- dotenv
- CORS

## Backend Responsibilities

The backend provides:

1. Project dataset retrieval
2. Recommendation generation
3. Deterministic project scoring
4. Gemini personalization/reranking
5. Fallback recommendation handling
6. Recommendation run persistence
7. Feedback collection
8. Run-specific feedback analytics
9. Developer lab authentication
10. Backend smoke testing

## Environment Setup

Create a `.env` file in the project root.

Use `.env.example` as the template.

Required variables:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/project_recommender
GEMINI_API_KEY=replace_with_your_gemini_api_key
GEMINI_MODEL=gemini-3.1-flash-lite-preview
DEV_LAB_PASSWORD=replace_with_a_private_dev_password
DEV_LAB_TOKEN_SECRET=replace_with_a_long_random_secret
SMOKE_TEST_API_URL=http://127.0.0.1:5001