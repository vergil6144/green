// app/page.tsx
/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [photo, setPhoto] = useState<string | null>(null);
	const [result, setResult] = useState<any | null>(null);
	const [loading, setLoading] = useState(false);
	const [mapUrl, setMapUrl] = useState<string | null>(null); // NEW

	async function sendImage(imageBase64: string) {
		setLoading(true);
		try {
			const res = await fetch("/api/classify", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ image: imageBase64 }),
			});

			if (!res.ok) throw new Error("Request failed");

			const data = await res.json();
			console.log("Server response:", data);
			setResult(data);
		} catch (err) {
			console.error(err);
			setResult("Error: Could not classify image.");
		}
		setLoading(false);
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

	// Get user location for map when classification is done
	useEffect(() => {
		if (result) {
			if ("geolocation" in navigator) {
				navigator.geolocation.getCurrentPosition(
					(position) => {
						const lat = position.coords.latitude;
						const lng = position.coords.longitude;
						const mapsEmbed = `https://www.google.com/maps?q=trash%20disposal%20site%20near%20${lat},${lng}&z=14&output=embed`;
						setMapUrl(mapsEmbed);
					},
					(error) => {
						console.error("Error getting location:", error);
						// Fallback map if location denied/unavailable
						setMapUrl(
							"https://www.google.com/maps?q=trash%20disposal%20site%20near%20me&output=embed",
						);
					},
				);
			} else {
				console.error("Geolocation not supported in this browser.");
				setMapUrl(
					"https://www.google.com/maps?q=trash%20disposal%20site%20near%20me&output=embed",
				);
			}
		}
	}, [result]);

	return (
		<main className="flex flex-col items-center p-6 gap-6 min-h-screen bg-black text-white">
			<h1 className="text-4xl font-[500] text-white drop-shadow-lg self-start max-w-screen mb-[45]">
				♻️ Go Green
			</h1>

			{!photo ? (
				<div className="flex flex-col items-center gap-4">
					{/** biome-ignore lint/a11y/useMediaCaption: <explanation> */}
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
							onClick={() => sendImage(photo)}
							className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition"
							disabled={loading}
						>
							{loading ? "Classifying..." : "Classify"}
						</button>
						<button
							onClick={() => {
								setPhoto(null);
								setResult(null);
								setMapUrl(null);
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
					<div>
						<p>Type: {result.type}</p>
						<p>Biodegradable: {result.biodegradable ? "Yes" : "No"}</p>
						<p>Recyclable: {result.recyclable ? "Yes" : "No"}</p>
						<p>Tip: {result.tip}</p>
					</div>
				</div>
			)}

			{/* Map Section */}
			{mapUrl && (
				<div className="mt-6 w-full max-w-3xl">
					<iframe
						allow="geolocation"
						src={mapUrl}
						width="100%"
						height="400"
						style={{ border: 0 }}
						allowFullScreen
						loading="lazy"
					></iframe>
				</div>
			)}

			<canvas ref={canvasRef} className="hidden" />
		</main>
	);
}
