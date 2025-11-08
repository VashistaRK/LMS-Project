/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import api from "../services/api";

type Track = { slug: string; title: string };
type TestItem = { testId: string; title: string };

const baseURL= import.meta.env.VITE_API_URL;

export default function AdminAttemptsAnalytics() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [tests, setTests] = useState<TestItem[]>([]);
  const [selectedTest, setSelectedTest] = useState<string>("");
  const [stats, setStats] = useState<{ total: number; submitted: number; avgScore: number; attempts: any[] } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<Track[]>(`${baseURL}/api/assessments/tracks`);
        setTracks(res.data || []);
      } catch {
        console.error("Failed to fetch tracks");
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!selectedTrack) return;
      setSelectedTest("");
      setStats(null);
      const res = await api.get<TestItem[]>(`${baseURL}/api/assessments/tracks/${selectedTrack}/tests`);
      setTests(res.data || []);
    })();
  }, [selectedTrack]);

  const loadStats = async () => {
    if (!selectedTrack || !selectedTest) return;
    const res = await api.get(`${baseURL}/api/assessments/admin/tests/${selectedTrack}/${selectedTest}/attempts`);
    setStats(res.data);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Assessment Analytics</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <select className="border rounded p-2" value={selectedTrack} onChange={(e) => setSelectedTrack(e.target.value)}>
          <option value="">Select Track</option>
          {tracks.map(t => (<option key={t.slug} value={t.slug}>{t.title}</option>))}
        </select>
        <select className="border rounded p-2" value={selectedTest} onChange={(e) => setSelectedTest(e.target.value)} disabled={!tests.length}>
          <option value="">Select Test</option>
          {tests.map(t => (<option key={t.testId} value={t.testId}>{t.title}</option>))}
        </select>
        <button className="bg-gray-900 text-white rounded px-4" onClick={loadStats} disabled={!selectedTrack || !selectedTest}>Load</button>
      </div>

      {stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded border p-4"><div className="text-sm text-gray-500">Total Attempts</div><div className="text-2xl font-semibold">{stats.total}</div></div>
            <div className="bg-white rounded border p-4"><div className="text-sm text-gray-500">Submitted</div><div className="text-2xl font-semibold">{stats.submitted}</div></div>
            <div className="bg-white rounded border p-4"><div className="text-sm text-gray-500">Avg Score</div><div className="text-2xl font-semibold">{stats.avgScore.toFixed(2)}</div></div>
          </div>

          <div className="bg-white rounded border p-4 overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Score</th>
                  <th className="py-2 pr-4">Started</th>
                  <th className="py-2 pr-4">Ended</th>
                </tr>
              </thead>
              <tbody>
                {stats.attempts.map((a, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2 pr-4">{a.userId || "—"}</td>
                    <td className="py-2 pr-4 capitalize">{a.status}</td>
                    <td className="py-2 pr-4">{a.score ?? 0}</td>
                    <td className="py-2 pr-4">{a.startedAt ? new Date(a.startedAt).toLocaleString() : "—"}</td>
                    <td className="py-2 pr-4">{a.endedAt ? new Date(a.endedAt).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


