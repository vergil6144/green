import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

type ChatMsg = { role: "user" | "bot"; text: string };

export const runtime = 'nodejs';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY || "AIzaSyASUiMPmUBDhilOTS1oNVyODASJo7Wkskg";
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GOOGLE_API_KEY" }, { status: 500 });
    }

    // Accept either JSON { message, history } or raw text body
    const raw = await req.text();
    let message = "";
    let history: ChatMsg[] | undefined;
    try {
      const parsed = JSON.parse(raw);
      message = parsed?.message ?? "";
      history = Array.isArray(parsed?.history) ? parsed.history : undefined;
    } catch {
      message = raw;
      history = undefined;
    }

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const genAI = new GoogleGenAI({ apiKey });

    const turns = (history || []).slice(-10);
    const convo = turns
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
      .join("\n");
    const prompt = `You are a helpful assistant for green initiatives, sustainability, recycling, and eco-friendly living.
Answer clearly and concisely.

Conversation so far:
${convo}

User: ${message}
Assistant:`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const reply = typeof (response as any).text === "function" ? await (response as any).text() : (response as any).text;
    const text = typeof reply === "string" ? reply : "";

    return new NextResponse(text, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err) {
    console.error("/api/chat error:", err);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
