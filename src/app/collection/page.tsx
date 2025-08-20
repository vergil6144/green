'use client'
import React, { useState, useEffect } from 'react';
import { MapPin, Truck, Clock, CheckCircle, Phone, User, Star, ArrowLeft } from 'lucide-react';
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { statsDB } from "@/lib/db";


const TrashCollectionApp = () => {
  const [currentStep, setCurrentStep] = useState('request'); // request, searching, found, confirmed, completed
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
  const [collectorInfo, setCollectorInfo] = useState<Collector | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);

  // Mock collectors data
  const mockCollectors = [
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

  const trashTypes = [
    { value: 'general', label: 'General Waste', price: 150 },
    { value: 'recyclables', label: 'Recyclables', price: 75 },
    { value: 'organic', label: 'Organic/Compost', price: 60 },
    { value: 'electronics', label: 'Electronics', price: 275 },
    { value: 'furniture', label: 'Large Items/Furniture', price: 1700 },
    { value: 'medi', label: 'Medicinal Waste', price: 1500 }

  ];

  const handleRequestPickup = () => {
    if (!location) return;
    
    setCurrentStep('searching');
    
    // Simulate searching for collectors
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
    
    // Start countdown timer
    const interval = setInterval(() => {
      setEstimatedTime(prev => {
        if (prev == null || prev <= 1) {
          clearInterval(interval);
          setCurrentStep('completed');
          return 0;
        }
        return prev - 1;
      });
  }, 1000); // For demo, using 1 second = 1 minute
  };

  const resetApp = () => {
    setCurrentStep('request');
    setLocation('');
    setTrashType('general');
    setCollectorInfo(null);
    setEstimatedTime(null);
  };

  const selectedTrashInfo = trashTypes.find(type => type.value === trashType);

  return (
  <div>
  <Navigation/>
  <div className="min-h-screen bg-transparent text-white">
      <div className="p-4">
        <div className="max-w-md mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg flex items-center justify-center gap-2">
              <Truck size={40} />
              🗑️ TrashPickup
            </h1>
            <p className="text-lg text-gray-300">
              On-demand waste collection service
            </p>
          </div>

          {/* Request Form */}
          {currentStep === 'request' && (
            <div className="space-y-6">
              <div className="bg-gray-900 border border-green-500 rounded-2xl shadow-lg p-6">
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
                          {type.label} -₹{type.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <p className="text-gray-300">
                      Estimated cost: <span className="font-semibold text-green-400">₹{selectedTrashInfo?.price}</span>
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

          {/* Searching */}
          {currentStep === 'searching' && (
            <div className="bg-gray-900 border border-green-500 rounded-2xl shadow-lg p-6 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
              <h2 className="text-2xl font-semibold text-white mb-2">Finding nearby collectors...</h2>
              <p className="text-gray-300">Searching for available waste collection services in your area</p>
            </div>
          )}

          {/* Found Collector */}
          {currentStep === 'found' && collectorInfo && (
            <div className="space-y-6">
              <div className="bg-gray-900 border border-green-500 rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-green-400 mb-4 text-center">Collector Found!</h2>
                
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-white">{collectorInfo.name}</h3>
                      <p className="text-gray-300 flex items-center gap-1">
                        <User size={16} />
                        {collectorInfo.driver}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-400 fill-current" size={16} />
                      <span className="font-semibold text-white">{collectorInfo.rating}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-300">
                    <p className="flex items-center gap-2">
                      <Truck size={16} />
                      Truck: {collectorInfo.truckNumber}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone size={16} />
                      {collectorInfo.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock size={16} />
                      Estimated arrival: {collectorInfo.estimatedArrival} minutes
                    </p>
                  </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-300">
                    <span className="font-medium text-white">Pickup Details:</span><br />
                    Location: {location}<br />
                    Type: {selectedTrashInfo?.label}<br />
                    Cost: <span className="text-green-400">₹{selectedTrashInfo?.price}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={handleConfirmPickup}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
              >
                Confirm Pickup
              </button>
            </div>
          )}

          {/* Confirmed - Waiting */}
          {currentStep === 'confirmed' && (
            <div className="bg-gray-900 border border-green-500 rounded-2xl shadow-lg p-6 text-center space-y-4">
              <div className="bg-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <CheckCircle className="text-white" size={32} />
              </div>
              
              <h2 className="text-2xl font-semibold text-green-400">Pickup Confirmed!</h2>
              
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <p className="text-lg font-semibold text-white">
                  {collectorInfo?.driver} is on the way
                </p>
                <p className="text-green-400">
                  Arriving in approximately <span className="font-bold">{estimatedTime} minutes</span>
                </p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-left">
                <h4 className="font-semibold text-white mb-2">Collector Details:</h4>
                <p className="text-sm text-gray-300">
                  {collectorInfo?.name}<br />
                  Truck: {collectorInfo?.truckNumber}<br />
                  Phone: {collectorInfo?.phone}
                </p>
              </div>

              <p className="text-gray-400 text-sm">
                You'll receive a notification when the collector arrives
              </p>
            </div>
          )}

          {/* Completed */}
          {currentStep === 'completed' && (
            <div className="bg-gray-900 border border-green-500 rounded-2xl shadow-lg p-6 text-center space-y-4">
              <div className="bg-green-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                <CheckCircle className="text-white" size={40} />
              </div>
              
              <h2 className="text-2xl font-semibold text-green-400">Pickup Complete!</h2>
              <p className="text-gray-300">
                {collectorInfo?.driver} has collected your {selectedTrashInfo?.label.toLowerCase()}
              </p>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Service Summary:</h4>
                <div className="space-y-1 text-gray-300">
                  <p><span className="font-medium text-white">Collector:</span> {collectorInfo?.name}</p>
                  <p><span className="font-medium text-white">Cost:</span> <span className="text-green-400">₹{selectedTrashInfo?.price}</span></p>
                  <p><span className="font-medium text-white">Type:</span> {selectedTrashInfo?.label}</p>
                </div>
              </div>

              <button
                onClick={resetApp}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
              >
                Schedule Another Pickup
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
    </div>
  );
};

export default TrashCollectionApp;
