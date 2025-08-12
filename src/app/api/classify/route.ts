import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
export async function POST(req: Request) {
const ai = new GoogleGenAI({ apiKey: "AIzaSyASUiMPmUBDhilOTS1oNVyODASJo7Wkskg" });
	const { image } = await req.json();
	const base64ImageFile = fs.readFileSync("/Users/Aditya/Desktop/green/public/song1.jpg", {
		encoding: "base64",
	});
	console.log(base64ImageFile.slice(0,100))
	console.log(image.slice(22,100))
	const thing = image.slice(22)

	const contents = [
		{
			inlineData: {
				mimeType: "image/jpeg",
				data: thing,
			},
		},
		{ text: "Return json data about this trash with the following properties - type, biodegradable (true or false), recyclable (true or false and if true with suggestions on how to recycle) and tip" },
	];

	const response = await ai.models.generateContent({
		model: "gemini-2.5-flash",
		contents: contents,
	});

	console.log(response.text);

	// const { image } = await req.json();
	// console.log('RAAAAAAA',image.slice(0,50))

	// return NextResponse.json(response.text);
return new NextResponse(response.text, {
  status: 200,
  headers: { "Content-Type": "text/plain" }
});}
