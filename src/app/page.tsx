// app/page.tsx
"use client";

import { useState, useRef } from "react";

export default function Home() {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [photo, setPhoto] = useState<string | null>(null);
	const [result, setResult] = useState<any>(null);
	const [loading, setLoading] = useState(false);

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
			const res = await fetch("/api/classify", {
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
		<main className="flex flex-col items-center p-6 gap-6">
			<h1 className="text-3xl font-bold">♻️ Trash Classifier</h1>

			{!photo ? (
				<div className="flex flex-col items-center gap-4">
					<video ref={videoRef} autoPlay className="rounded-lg shadow-md" />
					<button
						onClick={startCamera}
						className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
					>
						Start Camera
					</button>
					<button
						onClick={capturePhoto}
						className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Capture Photo
					</button>
				</div>
			) : (
				<div className="flex flex-col items-center gap-4">
					<img
						src={photo}
						alt="Captured"
						className="rounded-lg shadow-md w-64"
					/>
					<div className="flex gap-3">
						<button
							onClick={classifyPhoto}
							className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
						>
							{loading ? "Classifying..." : "Classify"}
						</button>
						<button
							onClick={() => setPhoto(null)}
							className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
						>
							Retake
						</button>
					</div>
				</div>
			)}

			{result && (
				<div className="bg-white shadow-md p-4 rounded-lg w-full max-w-md text-center">
					<h2 className="text-xl font-bold">Classification Result</h2>
					<p className="mt-2">Type: {result.type}</p>
					<p>Recyclable: {result.recyclable ? "Yes" : "No"}</p>
					<p>Biodegradable: {result.biodegradable ? "Yes" : "No"}</p>
					<p className="text-sm text-gray-600 mt-2">
						Disposal Tip: {result.tip}
					</p>
				</div>
			)}

			<canvas ref={canvasRef} className="hidden" />
		</main>
	);
}
