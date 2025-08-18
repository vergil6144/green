"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { submissionsDB, statsDB, SubmissionRecord, authDB, actionsDB, ActionDef } from "@/lib/db";
import { useEffect, useMemo, useState } from "react";

const ADMIN_EMAILS = ["nabhay.khanna@gmail.com"]; // update with your admin emails

export default function AdminPage() {
  const { user } = useAuth();
  const [subs, setSubs] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | SubmissionRecord["status"]>("pending");
  const [creditEmail, setCreditEmail] = useState("");
  const [creditDelta, setCreditDelta] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const [actions, setActions] = useState<ActionDef[]>([]);
  const [newAction, setNewAction] = useState<{title: string; description: string; points: number; category: ActionDef['category']; icon: string; proofRequired: boolean}>(
    { title: "", description: "", points: 10, category: 'environmental', icon: '🌿', proofRequired: true }
  );

  const authorized = useMemo(() => !!user && (ADMIN_EMAILS.includes(user.email) || user.email.toLowerCase().includes("admin")), [user]);

  useEffect(() => {
    (async () => {
      try {
        await submissionsDB.initIfNeeded();
        const list = await submissionsDB.listAll();
        setSubs(list.sort((a,b) => b.submittedAt.getTime() - a.submittedAt.getTime()));
  await actionsDB.initIfNeeded();
  setActions(await actionsDB.listAll());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const visibleSubs = subs.filter(s => filter === "all" ? true : s.status === filter);

  const changeStatus = async (sub: SubmissionRecord, status: SubmissionRecord["status"]) => {
    setBusy(true);
    try {
      await submissionsDB.updateStatus(sub.id, status);
      if (status === "approved") {
        await statsDB.initIfNeeded();
        await statsDB.incrementTasks(sub.userId, 1);
        await statsDB.addCredits(sub.userId, sub.points);
      }
      setSubs(prev => prev.map(s => s.id === sub.id ? { ...s, status } : s));
    } finally {
      setBusy(false);
    }
  };

  const adjustCredits = async () => {
    if (!creditEmail || !Number.isFinite(creditDelta)) return;
    setBusy(true);
    try {
      await authDB.init();
      const target = await authDB.getUserByEmail(creditEmail);
      if (!target) {
        alert("User not found");
        return;
      }
      await statsDB.initIfNeeded();
      await statsDB.addCredits(target.id, creditDelta);
      alert("Credits updated");
    } finally {
      setBusy(false);
    }
  };

  const createAction = async () => {
    if (!newAction.title.trim() || !Number.isFinite(newAction.points)) return;
    setBusy(true);
    try {
      await actionsDB.initIfNeeded();
      const action: ActionDef = { id: crypto.randomUUID(), ...newAction };
      await actionsDB.add(action);
      setActions(prev => [action, ...prev]);
      setNewAction({ title: "", description: "", points: 10, category: 'environmental', icon: '🌿', proofRequired: true });
    } finally {
      setBusy(false);
    }
  };

  const deleteAction = async (id: string) => {
    setBusy(true);
    try {
      await actionsDB.initIfNeeded();
      await actionsDB.remove(id);
      setActions(prev => prev.filter(a => a.id !== id));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Admin</h1>
          {!authorized ? (
            <div className="text-red-400">Not authorized. Update ADMIN_EMAILS in admin page.</div>
          ) : (
            <>
              {/* Manage Actions */}
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Manage Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white" placeholder="Title" value={newAction.title} onChange={(e)=>setNewAction({...newAction, title:e.target.value})} />
                  <input className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white" placeholder="Icon (emoji)" value={newAction.icon} onChange={(e)=>setNewAction({...newAction, icon:e.target.value})} />
                  <input className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white md:col-span-2" placeholder="Description" value={newAction.description} onChange={(e)=>setNewAction({...newAction, description:e.target.value})} />
                  <div className="flex gap-3 items-center">
                    <input type="number" className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white w-32" placeholder="Points" value={newAction.points} onChange={(e)=>setNewAction({...newAction, points: parseInt(e.target.value||'0',10)})} />
                    <select className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white" value={newAction.category} onChange={(e)=>setNewAction({...newAction, category: e.target.value as any})}>
                      <option value="environmental">Environmental</option>
                      <option value="social">Social</option>
                      <option value="economic">Economic</option>
                      <option value="health">Health</option>
                    </select>
                    <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                      <input type="checkbox" checked={newAction.proofRequired} onChange={(e)=>setNewAction({...newAction, proofRequired: e.target.checked})} />
                      Proof required
                    </label>
                  </div>
                </div>
                <button onClick={createAction} disabled={busy} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white disabled:opacity-50">Add Action</button>

                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Existing Actions</h3>
                  {actions.length === 0 ? (
                    <div className="text-gray-400">No actions yet</div>
                  ) : (
                    <div className="space-y-2">
                      {actions.map(a => (
                        <div key={a.id} className="flex items-center justify-between bg-gray-800 rounded-xl p-3">
                          <div>
                            <div className="font-medium">{a.icon} {a.title}</div>
                            <div className="text-xs text-gray-400">{a.category} • {a.points} pts</div>
                          </div>
                          <button onClick={()=>deleteAction(a.id)} disabled={busy} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white">Delete</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Adjust Credits</h2>
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    placeholder="User email"
                    value={creditEmail}
                    onChange={(e) => setCreditEmail(e.target.value)}
                  />
                  <input
                    type="number"
                    className="w-40 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    placeholder="Delta (e.g., 50 or -25)"
                    value={creditDelta}
                    onChange={(e) => setCreditDelta(parseInt(e.target.value || "0", 10))}
                  />
                  <button
                    onClick={adjustCredits}
                    disabled={busy}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white disabled:opacity-50"
                  >
                    Update
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">Task Submissions</h2>
                <select
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="all">All</option>
                </select>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="text-gray-400">Loading submissions...</div>
                ) : visibleSubs.length === 0 ? (
                  <div className="text-gray-400">No submissions</div>
                ) : (
                  visibleSubs.map((s) => (
                    <div key={s.id} className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm text-gray-400">UserID: {s.userId}</div>
                          <div className="font-semibold text-white">{s.actionTitle}</div>
                          <div className="text-gray-300 text-sm">{s.description}</div>
                          <div className="text-xs text-gray-500">{s.submittedAt.toLocaleString()}</div>
                          <div className="text-green-400 font-bold mt-1">+{s.points} pts</div>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${s.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-600' : s.status === 'approved' ? 'bg-green-900/30 text-green-400 border-green-600' : 'bg-red-900/30 text-red-400 border-red-600'}`}>
                            {s.status}
                          </span>
                          {s.status === 'pending' && (
                            <div className="mt-3 flex gap-2">
                              <button onClick={() => changeStatus(s, 'approved')} disabled={busy} className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white">Approve</button>
                              <button onClick={() => changeStatus(s, 'rejected')} disabled={busy} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white">Reject</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
