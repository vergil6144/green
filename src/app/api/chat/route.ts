import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: "AIzaSyASUiMPmUBDhilOTS1oNVyODASJo7Wkskg" });

async function main() {
  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "You are",
  });
  console.log(response.text);
}

await main();
