import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
export async function POST(req: Request) {
const ai = new GoogleGenAI({ apiKey: "AIzaSyASUiMPmUBDhilOTS1oNVyODASJo7Wkskg" });

	const base64ImageFile = fs.readFileSync("/Users/Aditya/Desktop/green/public/song1.jpg", {
		encoding: "base64",
	});

	const contents = [
		{
			inlineData: {
				mimeType: "image/jpeg",
				data: base64ImageFile,
			},
		},
		{ text: "Caption this image." },
	];

	const response = await ai.models.generateContent({
		model: "gemini-2.5-flash",
		contents: contents,
	});

	console.log(response.text);

	const { image } = await req.json();

	return NextResponse.json(response.text);
}
