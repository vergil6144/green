"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { statsDB, UserStats } from "@/lib/db";
import { useEffect, useState } from "react";

export default function UserPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return;
      await statsDB.initIfNeeded();
      const s = await statsDB.get(user.id);
      if (mounted) {
        setStats(s);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  return (
    <ProtectedRoute>
      <Navigation />
  <div className="min-h-screen bg-transparent text-white p-6">
        <div className="max-w-5xl mx-auto">
          <div className="pt-8 md:pt-12">
          <h1 className="text-4xl font-bold text-green-400 mb-2 drop-shadow-lg ml-0 ht">Your Stats</h1>
          </div>
          {loading || !stats ? (
            <div className="text-gray-400">Loading stats...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glass-card border border-green-500 p-6">
                <div className="text-sm text-gray-400">Tasks Completed</div>
                <div className="text-4xl font-bold text-green-400">{stats.tasksCompleted}</div>
              </div>
              <div className="glass-card border border-green-500 p-6">
                <div className="text-sm text-gray-400">Credits</div>
                <div className="text-4xl font-bold text-green-400">{stats.credits}</div>
              </div>
              <div className="glass-card border border-green-500 p-6">
                <div className="text-sm text-gray-400">Trash Pickups Requested</div>
                <div className="text-4xl font-bold text-green-400">{stats.trashCalls}</div>
              </div>

              <div className="glass-card border border-green-500 p-6 lg:col-span-3">
                <h2 className="text-xl font-semibold mb-4">Purchases</h2>
                {stats.purchases.length === 0 ? (
                  <div className="text-gray-400">No purchases yet</div>
                ) : (
                  <div className="space-y-3">
                    {stats.purchases.map((p) => (
                      <div key={p.id} className="flex items-center justify-between bg-gray-800 rounded-xl p-4">
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-gray-400">{p.purchasedAt.toLocaleString()}</div>
                        </div>
                        <div className="text-green-400 font-bold">-{p.price} cr</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
