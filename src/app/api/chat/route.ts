import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: "AIzaSyASUiMPmUBDhilOTS1oNVyODASJo7Wkskg" });

async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log(text)
        return new NextResponse(text, {
            status: 200,
            headers: { "Content-Type": "text/plain" }
        })
    }
}
