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
								setResult(trashData);
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
