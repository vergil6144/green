// app/page.tsx
/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";

export default function Home() {
	const { user, signOut, loading: authLoading } = useAuth();
	const [mounted, setMounted] = useState(false);
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
		const stream = videoRef.current.srcObject as MediaStream
		stream.getTracks().forEach(track => track.stop());
		videoRef.current.srcObject = null
	};

	// All hooks must be called before any conditional returns
	useEffect(() => {
		setMounted(true);
	}, []);

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

	// Show loading state while auth is initializing or not mounted
	if (!mounted || authLoading) {
		return (
			<div className="min-h-screen bg-black text-white p-4">
				<div className="max-w-6xl mx-auto">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
						<p className="text-gray-300">Loading...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black text-white">
			<Navigation />
			<div className="p-4">
				<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg ml-0 ht">
						♻️ Go Green
					</h1>
					<p className="text-lg text-gray-300">
						Your guide to sustainable living and waste classification
					</p>
				</div>

				{!photo ? (
					<div className="flex flex-col items-center gap-6">
						<div className="bg-gray-900 border border-green-500 rounded-2xl shadow-lg p-6 mb-8 my-0">
							{/** biome-ignore lint/a11y/useMediaCaption: <explanation> */}
							<video
								ref={videoRef}
								autoPlay
								className="rounded-lg shadow-lg border border-gray-700 w-full max-w-md"
							/>
						</div>
						<div className="flex gap-4">
							<button
								onClick={startCamera}
								className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
							>
								Start Camera
							</button>
							<button
								onClick={capturePhoto}
								className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
							>
								Capture Photo
							</button>
						</div>
					</div>
				) : (
					<div className="flex flex-col items-center gap-6">
						<div className="bg-gray-900 border border-green-500 rounded-2xl shadow-lg p-6">
							<img
								src={photo}
								alt="Captured"
								className="rounded-lg shadow-lg w-full max-w-md border border-gray-700"
							/>
						</div>
						<div className="flex gap-4">
							<button
								onClick={() => sendImage(photo)}
								className="px-6 py-3  my-[1rem] bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
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
								className="px-6 py-3 my-[1rem] bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
							>
								Retake
							</button>
						</div>
					</div>
				)}

				{result && (
					<div className="bg-gray-900 border border-green-500 rounded-2xl shadow-lg p-6 mb-8 max-w-md mx-auto">
						<div className="text-center">
							<h2 className="text-2xl font-semibold text-green-400 mb-4">
								Classification Result
							</h2>
							<div className="space-y-2 text-gray-300">
								<p><span className="font-medium text-white">Type:</span> {result.type}</p>
								<p><span className="font-medium text-white">Biodegradable:</span> {result.biodegradable ? "Yes" : "No"}</p>
								<p><span className="font-medium text-white">Recyclable:</span> {result.recyclable ? "Yes" : "No"}</p>
								<p><span className="font-medium text-white">Tip:</span> {result.tip}</p>
							</div>
						</div>
					</div>
				)}

				{/* Map Section */}
				{mapUrl && (
					<div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl hover:border-gray-600">
						<h3 className="text-2xl font-semibold text-white mb-4 text-center">Nearby Disposal Sites</h3>
						<iframe
							allow="geolocation"
							src={mapUrl}
							width="100%"
							height="400"
							style={{ border: 0 }}
							allowFullScreen
							loading="lazy"
							className="rounded-lg"
						></iframe>
					</div>
				)}

				<canvas ref={canvasRef} className="hidden" />
			</div>
		</div>
	</div>
	)
}
