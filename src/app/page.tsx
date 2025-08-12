// app/page.tsx
"use client";

import { useState, useRef } from "react";

export default function Home() {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [photo, setPhoto] = useState<string | null>(null);
	const [result, setResult] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const trashData = {
		type: "Plastic Bottle",
		recyclable: true,
		biodegradable: false,
		tip: "Rinse and place in plastics recycling bin.",
	};
	async function sendImage(imageBase64: string) {
		const res = await fetch("/api/classify", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ image: imageBase64 }),
		});

		if (!res.ok) throw new Error("Request failed");
		const data = await res.json();
		console.log("Server response:", data);
	}

	const startCamera = async () => {
		const stream = await navigator.mediaDevices.getUserMedia({ video: true });
		if (videoRef.current) {
			videoRef.current.srcObject = stream;
		}
	};

	const capturePhoto = () => {
		if (!canvasRef.current || !videoRef.current) return;
		const ctx = canvasRef.current.getContext("2d");
		if (!ctx) return;
		canvasRef.current.width = videoRef.current.videoWidth;
		canvasRef.current.height = videoRef.current.videoHeight;
		ctx.drawImage(videoRef.current, 0, 0);
		const dataUrl = canvasRef.current.toDataURL("image/png");
		setPhoto(dataUrl);
	};

	const classifyPhoto = async () => {
		if (!photo) return;
		setLoading(true);
		try {
			const res = await fetch("classify", {
				method: "POST",
				body: JSON.stringify({ image: photo }),
				headers: { "Content-Type": "application/json" },
			});
			const data = await res.json();
			setResult(data);
		} catch (err) {
			console.error(err);
		}
		setLoading(false);
	};

	return (
		<main className="flex flex-col items-center p-6 gap-6 min-h-screen bg-black text-white">
			<h1 className="text-4xl font-[500] text-white drop-shadow-lg self-start max-w-screen mb-[45]">
				♻️ Go Green
			</h1>

			{!photo ? (
				<div className="flex flex-col items-center gap-4">
					<video
						ref={videoRef}
						autoPlay
						className="rounded-lg shadow-lg border border-green-500"
					/>
					<button
						onClick={startCamera}
						className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition"
					>
						Start Camera
					</button>
					<button
						onClick={capturePhoto}
						className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-500 transition"
					>
						Capture Photo
					</button>
				</div>
			) : (
				<div className="flex flex-col items-center gap-4">
					<img
						src={photo}
						alt="Captured"
						className="rounded-lg shadow-lg w-64 border border-green-500"
					/>
					<div className="flex gap-3">
						<button
							onClick={() => {
								setResult(
									sendImage(
										"data:image/png;base64,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",
									),
								);
							}}
							className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition"
						>
							{loading ? "Classifying..." : "Classify"}
						</button>
						<button
							onClick={() => {
								setPhoto(null);
								setResult(null);
							}}
							className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
						>
							Retake
						</button>
					</div>
				</div>
			)}

			{result && (
				<div className="bg-gray-900 border border-green-500 shadow-lg p-4 rounded-lg w-full max-w-md text-center">
					<h2 className="text-xl font-bold text-green-400">
						Classification Result
					</h2>
					<p className="mt-2">Type: {result.type}</p>
					<p>Recyclable: {result.recyclable ? "Yes" : "No"}</p>
					<p>Biodegradable: {result.biodegradable ? "Yes" : "No"}</p>
					<p className="text-sm text-gray-400 mt-2">
						Disposal Tip: {result.tip}
					</p>
				</div>
			)}

			<canvas ref={canvasRef} className="hidden" />
		</main>
	);
}
