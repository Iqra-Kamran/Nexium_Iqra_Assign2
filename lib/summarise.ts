import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function summarizeWithGemini(content: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro-002" });

  const prompt = `Summarize the following blog content in 3-5 sentences:\n\n${content.slice(0, 8000)}`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
}

