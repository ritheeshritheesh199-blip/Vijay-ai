# Vijay AI — Full Project

A complete ChatGPT-style starter with:
- Real AI chat through a server-side OpenAI Responses API call
- Local chat history
- New chat
- Dark mode
- Tamil / Tanglish-ready UI
- Voice input (browser Speech Recognition when supported)
- File upload endpoint for text/PDF/image demo analysis
- Responsive mobile layout
- Settings modal
- No API key exposed in the browser

## Run

1. Install Node.js 18+.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Put your API key in `.env` as `OPENAI_API_KEY=...`.
6. Run `npm start`.
7. Open `http://localhost:3000`.

Do NOT put your API key inside `public/index.html`.

The backend uses the official OpenAI JavaScript SDK and Responses API.
