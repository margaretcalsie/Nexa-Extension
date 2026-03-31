import { GoogleGenAI } from '@google/genai'

const MODEL = 'gemini-2.5-flash' // or 'gemini-3.1-flash-lite' for even higher limits

const SYSTEM_PROMPT = `You are a note-taking assistant. When given raw text (transcripts, articles, meeting notes, etc.), produce a structured output with:

- **Summary**: A concise 2-3 sentence overview
- **Key Points**: Bullet points of the main ideas
- **Action Items**: Any tasks or follow-ups mentioned (if applicable)

Use markdown formatting. Keep it clear and scannable.`;

const getApiKey = () => {
  return 'AIzaSyDYpbDgyt581BamKJnA2U5BKaqtEow8iHM';
};

export async function generateNotes(text: string): Promise<string> {
  const apiKey = await getApiKey()

  const ai = new GoogleGenAI({ apiKey })

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: 'user',
        parts: [{ text: `${SYSTEM_PROMPT}\n\n---\n\n${text}` }],
      },
    ],
  })

  return response.text ?? ''
}
