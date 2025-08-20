"use client";

import { useState, useRef, useEffect } from "react";
import Navigation from "@/components/Navigation";

const events = [
  { date: "2025-08-24", title: "Park Cleanup", location: "Greenfield Park" },
  { date: "2025-09-05", title: "Beach Waste Drive", location: "Sunny Shore Beach" },
  { date: "2025-09-15", title: "Neighborhood Recycling Day", location: "Community Center" },
  { date: "2025-09-30", title: "Riverbank Cleanup", location: "Riverside Walk" },
  { date: "2025-10-24", title: "New Year Cleanup", location: "Central Square" },
  { date: "2026-01-12", title: "New Year Cleanup", location: "Central Square" },
  
];

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  // close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setSelectedEvent(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function generateMonth(month: number) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const days: { day: number | null; dateStr: string | null; event?: any }[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, dateStr: null });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        d
      ).padStart(2, "0")}`;
      const event = events.find((e) => e.date === dateStr);
      days.push({ day: d, dateStr, event });
    }

    return days;
  }

  return (
    <div className="min-h-screen bg-transparent text-white">
      <Navigation />

      <div className="p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            📅 Community Cleanup Calendar
          </h1>
          <p className="text-lg text-gray-300">
            Explore upcoming cleanups across the year
          </p>
        </div>

        {/* Year Controls */}
        <div className="flex justify-center gap-6 items-center mb-8">
          <button
            onClick={() => setYear(year - 1)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            ◀ {year - 1}
          </button>
          <h2 className="text-2xl font-semibold text-green-400">{year}</h2>
          <button
            onClick={() => setYear(year + 1)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            {year + 1} ▶
          </button>
        </div>

        {/* Yearly Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 12 }, (_, m) => {
            const monthName = new Date(year, m).toLocaleString("default", {
              month: "long",
            });
            const days = generateMonth(m);

            return (
              <div
                key={m}
                className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all duration-200"
              >
                <h3 className="text-xl font-semibold text-white mb-4 text-center">
                  {monthName}
                </h3>
                <div className="grid grid-cols-7 text-xs text-center relative">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                    <div
                      key={d}
                      className="text-green-400 font-medium border-b border-gray-700 pb-1"
                    >
                      {d}
                    </div>
                  ))}
                  {days.map(({ day, dateStr, event }, idx) => (
                    <div key={idx} className="relative group">
                      <button
                        className={`p-2 m-[2px] w-full rounded-md transition-all duration-200 ${
                          !day
                            ? ""
                            : event
                            ? "bg-green-700 hover:bg-green-600 border border-green-500"
                            : "bg-gray-800 hover:bg-gray-700 border border-gray-600"
                        }`}
                        onClick={() =>
                          setSelectedEvent(
                            selectedEvent === dateStr ? null : dateStr
                          )
                        }
                      >
                        {day || ""}
                      </button>

                      {/* Hover Tooltip */}
                      {event && selectedEvent !== dateStr && (
                        <div className="absolute z-10 left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-3 bg-gray-800 border border-green-500 text-left rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                          <p className="text-sm text-green-400 font-semibold">
                            {event.title}
                          </p>
                          <p className="text-xs text-gray-300">
                            📍 {event.location}
                          </p>
                          <p className="text-xs text-gray-400">{event.date}</p>
                        </div>
                      )}

                      {/* Clicked Persistent Popup */}
                      {event && selectedEvent === dateStr && (
                        <div
                          ref={popupRef}
                          className="absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-4 bg-gray-900 border-2 border-green-500 text-left rounded-lg shadow-xl"
                        >
                          <p className="text-base text-green-400 font-bold">
                            {event.title}
                          </p>
                          <p className="text-sm text-gray-300">
                            📍 {event.location}
                          </p>
                          <p className="text-sm text-gray-400">{event.date}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
