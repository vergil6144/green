'use client'
import React, { useState } from 'react';
import { MapPin, Truck, Clock, CheckCircle, Phone, User, Star } from 'lucide-react';
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { statsDB } from "@/lib/db";

const TrashCollectionApp = () => {
  const [currentStep, setCurrentStep] = useState<'request' | 'searching' | 'found' | 'confirmed' | 'completed'>('request');
  type Collector = {
    id: number;
    name: string;
    driver: string;
    rating: number;
    phone: string;
    truckNumber: string;
    estimatedArrival: number;
  };
  const { user } = useAuth();
  const [location, setLocation] = useState('');
  const [trashType, setTrashType] = useState('general');
  const [weight, setWeight] = useState<number>(1); // kg input
  const [collectorInfo, setCollectorInfo] = useState<Collector | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);

  // Mock collectors data
  const mockCollectors: Collector[] = [
    {
      id: 1,
      name: "Nabhay's Waste Solutions",
      driver: "Nabhay Khanna",
      rating: 4.8,
      phone: "98134 12309",
      truckNumber: "WS-401",
      estimatedArrival: 15
    },
    {
      id: 2,
      name: "Green Earth Disposal",
      driver: "Aditya Das",
      rating: 4.9,
      phone: "98108 26969",
      truckNumber: "GE-203",
      estimatedArrival: 25
    },
    {
      id: 3,
      name: "City Clean Pickup",
      driver: "Anika Gupta",
      rating: 4.7,
      phone: "93118 66007",
      truckNumber: "CC-156",
      estimatedArrival: 20
    }
  ];

  // Pricing scheme
  const BASE_CHARGE = 100;
  const trashTypes = [
    { value: 'general', label: 'General Waste', ratePerKg: 15 },
    { value: 'recyclables', label: 'Recyclables', ratePerKg: 10 },
    { value: 'organic', label: 'Organic/Compost', ratePerKg: 8 },
    { value: 'electronics', label: 'Electronics', ratePerKg: 50 },
    { value: 'furniture', label: 'Large Items/Furniture', ratePerKg: 120 },
    { value: 'medi', label: 'Medicinal Waste', ratePerKg: 90 }
  ];

  const selectedTrashInfo = trashTypes.find(type => type.value === trashType);
  const estimatedCost = selectedTrashInfo
    ? BASE_CHARGE + weight * selectedTrashInfo.ratePerKg
    : 0;

  const handleRequestPickup = () => {
    if (!location) return;
    setCurrentStep('searching');
    setTimeout(() => {
      const randomCollector = mockCollectors[Math.floor(Math.random() * mockCollectors.length)];
      setCollectorInfo(randomCollector);
      setEstimatedTime(randomCollector.estimatedArrival);
      setCurrentStep('found');
    }, 2000);
  };

  const handleConfirmPickup = async () => {
    setCurrentStep('confirmed');
    try {
      if (user) {
        await statsDB.initIfNeeded();
        await statsDB.incrementTrashCalls(user.id, 1);
      }
    } catch (e) {
      console.error('Failed to update stats', e);
    }
    const interval = setInterval(() => {
      setEstimatedTime(prev => {
        if (prev == null || prev <= 1) {
          clearInterval(interval);
          setCurrentStep('completed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetApp = () => {
    setCurrentStep('request');
    setLocation('');
    setTrashType('general');
    setWeight(1);
    setCollectorInfo(null);
    setEstimatedTime(null);
  };

  return (
    <div>
      <Navigation/>
      <div className="min-h-screen bg-black text-white">
        <div className="p-4">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8 pt-8 md:pt-12">
              <h1 className="text-4xl font-bold text-green-400 mb-2 drop-shadow-lg flex items-center justify-center gap-2">
                <Truck size={40} />
                TrashPickup
              </h1>
              <p className="text-lg text-gray-300">On-demand waste collection service</p>
            </div>

            {/* Request Form */}
            {currentStep === 'request' && (
              <div className="space-y-6">
                <div className="glass-card border border-green-500 p-6 mb-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Pickup Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Enter your address"
                          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Trash Type
                      </label>
                      <select
                        value={trashType}
                        onChange={(e) => setTrashType(e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                      >
                        {trashTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label} (₹{type.ratePerKg}/kg)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="w-full p-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                      />
                    </div>

                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                      <p className="text-gray-300">
                        Estimated cost:{" "}
                        <span className="font-semibold text-green-400">₹{estimatedCost}</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        Includes ₹{BASE_CHARGE} base charge + ₹{selectedTrashInfo?.ratePerKg}/kg × {weight}kg
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRequestPickup}
                  disabled={!location}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Request Pickup
                </button>
              </div>
            )}

            {/* Other steps remain unchanged — reuse your Found, Confirmed, Completed sections */}
            {currentStep === 'searching' && (
              <div className="bg-gray-900 border border-green-500 rounded-2xl shadow-lg p-6 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
                <h2 className="text-2xl font-semibold text-white mb-2">Finding nearby collectors...</h2>
                <p className="text-gray-300">Searching for available waste collection services in your area</p>
              </div>
            )}
            {/* keep 'found', 'confirmed', and 'completed' screens same, just replace cost display with `estimatedCost` */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrashCollectionApp;
