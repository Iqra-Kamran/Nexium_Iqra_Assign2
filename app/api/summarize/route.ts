import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
const cheerio = await import("cheerio");

const mongo = new MongoClient(process.env.MONGO_URI!);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    console.log("🌐 URL received:", url);

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    // Attempt to extract metadata from HTML
    let title = $('meta[property="og:title"]').attr('content') || $('title').text().trim();
    let author =
      $('meta[name="author"]').attr('content') ||
      $('[rel="author"]').first().text().trim() ||
      $('[class*="author"]').first().text().trim() ||
      "Unknown Author";

    // Extract main blog content
    const possibleSelectors = ["article", "[class*=content]", "[class*=article]", "[class*=post]", "[class*=blog]"];
    let text = "";
    for (const selector of possibleSelectors) {
      text = $(selector).text().replace(/\s+/g, " ").trim();
      if (text.length > 500) break;
    }

    if (!text || text.length < 200)
      throw new Error("Not enough readable content found in the blog.");

    // === Try Gemini summarization ===
    let summary = "";
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent(
        `Summarize the following blog in 3-5 concise sentences:\n\n${text.slice(0, 8000)}`
      );
      const response = await result.response;
      summary = response.text().trim();
      console.log("📌 Summary (Gemini):", summary);
    } catch (geminiErr: any) {
      console.warn("⚠️ Gemini failed. Trying Hugging Face...", geminiErr);

      // === Fallback: Hugging Face ===
      const hfRes = await fetch("https://api-inference.huggingface.co/models/facebook/bart-large-cnn", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY!}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text.slice(0, 3000) }),
      });
      const hfJson = await hfRes.json();
      summary =
        hfJson?.[0]?.summary_text ||
        hfJson?.summary_text ||
        "No summary returned by Hugging Face.";
      console.log("📌 Summary (Hugging Face):", summary);
    }

    // === Translate to Urdu ===
    const translated = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        summary
      )}&langpair=en|ur`
    );
    const translatedJson = await translated.json();
    const urduSummary =
      translatedJson.responseData?.translatedText || "ترجمہ دستیاب نہیں۔";

    // === Save to MongoDB
    await mongo.connect();
    await mongo.db("blogs").collection("summaries").insertOne({
      url,
      title,
      author,
      english_summary: summary,
      urdu_summary: urduSummary,
      created_at: new Date(),
    });

    // === Save to Supabase
    const { error } = await supabase.from("summaries").insert({
      url,
      title,
      author,
      summary,
      urdu_summary: urduSummary,
    });
    if (error) throw error;

    return NextResponse.json({
      title,
      author,
      english: summary,
      urdu: urduSummary,
    });
  } catch (err: any) {
    console.error("❌ Server Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
