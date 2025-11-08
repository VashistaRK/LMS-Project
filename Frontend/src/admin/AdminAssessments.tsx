/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getGenres, getQuestions } from "../services/questionApi";
import { createTrack, createTest, listTracks, listTestsForTrack } from "../services/assessmentApi";

type Track = { title: string; description?: string; slug: string };
type BankQuestion = { _id: string; type: string; questionText: string; genre?: string };

export default function AdminAssessments() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [trackForm, setTrackForm] = useState<Track>({ title: "", description: "", slug: "" });

  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [bankQuestions, setBankQuestions] = useState<BankQuestion[]>([]);
  const [selectedQIds, setSelectedQIds] = useState<Set<string>>(new Set());

  const [testForm, setTestForm] = useState({ trackSlug: "", testId: "", title: "", type: "Mixed", durationSec: 900 });
  const [testsList, setTestsList] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const g = await getGenres();
        setGenres(Array.isArray(g) ? g : []);
        const t = await listTracks();
        setTracks(Array.isArray(t) ? t : []);
      } catch (e) { console.error(e); }
    })();
  }, []);

  useEffect(() => {
    if (!testForm.trackSlug) { setTestsList([]); return; }
    (async () => {
      try {
        const ts = await listTestsForTrack(testForm.trackSlug);
        setTestsList(Array.isArray(ts) ? ts : []);
      } catch (e) { console.error(e); }
    })();
  }, [testForm.trackSlug]);

  useEffect(() => {
    if (!selectedGenre) { setBankQuestions([]); return; }
    (async () => {
      try {
        const qs = await getQuestions(selectedGenre);
        // normalize returned shape
        setBankQuestions(Array.isArray(qs) ? qs.map((q: any) => ({ _id: q._id, type: q.type || q.Type || 'MCQ', questionText: q.questionText || q.title || q.question || '', genre: q.genre })) : []);
      } catch (e) { console.error(e); }
    })();
  }, [selectedGenre]);

  const toggleQuestion = (id: string) => {
    setSelectedQIds(s => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const saveTrack = async () => {
    if (!trackForm.title || !trackForm.slug) return alert('title and slug required');
    setSaving(true);
    try {
      await createTrack(trackForm);
      const t = await listTracks();
      setTracks(Array.isArray(t) ? t : []);
      setTrackForm({ title: "", description: "", slug: "" });
      alert('Track created');
    } catch (e) { console.error(e); alert('Failed to create track'); } finally { setSaving(false); }
  };

  const saveTest = async () => {
    if (!testForm.trackSlug || !testForm.testId || !testForm.title) return alert('trackSlug, testId and title are required');
    setSaving(true);
    try {
      const payload = {
        ...testForm,
        questionIds: Array.from(selectedQIds),
      };
      await createTest(payload);
      setTestForm({ trackSlug: "", testId: "", title: "", type: "Mixed", durationSec: 900 });
      setSelectedQIds(new Set());
      alert('Test created/updated');
    } catch (e) { console.error(e); alert('Failed to create test'); } finally { setSaving(false); }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Assessments Admin</h2>

      <section className="mb-6 border p-4 rounded bg-white">
        <h3 className="font-semibold mb-2">Create Track</h3>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Title" value={trackForm.title} onChange={e => setTrackForm(s => ({ ...s, title: e.target.value }))} className="border p-2" />
          <input placeholder="Slug (unique)" value={trackForm.slug} onChange={e => setTrackForm(s => ({ ...s, slug: e.target.value }))} className="border p-2" />
          <textarea placeholder="Description" value={trackForm.description} onChange={e => setTrackForm(s => ({ ...s, description: e.target.value }))} className="border p-2 col-span-2" />
        </div>
        <div className="mt-3">
          <button onClick={saveTrack} disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded">Save Track</button>
        </div>
      </section>

      <section className="mb-6 border p-4 rounded bg-white">
        <h3 className="font-semibold mb-2">Create Test from Question Bank</h3>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <select value={testForm.trackSlug} onChange={e => setTestForm(s => ({ ...s, trackSlug: e.target.value }))} className="border p-2">
            <option value="">-- select track --</option>
            {tracks.map(t => <option key={t.slug} value={t.slug}>{t.title} ({t.slug})</option>)}
          </select>

          <input placeholder="Test ID (unique per track)" value={testForm.testId} onChange={e => setTestForm(s => ({ ...s, testId: e.target.value }))} className="border p-2" />

          <input placeholder="Title" value={testForm.title} onChange={e => setTestForm(s => ({ ...s, title: e.target.value }))} className="border p-2 col-span-1" />
          <input placeholder="Duration (seconds)" type="number" value={testForm.durationSec} onChange={e => setTestForm(s => ({ ...s, durationSec: Number(e.target.value) }))} className="border p-2" />
        </div>

        <div className="mb-3">
          <label className="block mb-1">Filter question bank by genre</label>
          <select value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)} className="border p-2 w-full">
            <option value="">-- select genre --</option>
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="mb-3 border p-2 max-h-64 overflow-auto">
          {bankQuestions.length === 0 && <div className="text-gray-500">No questions in this genre</div>}
          {bankQuestions.map(q => (
            <div key={q._id} className="flex items-start gap-2 p-2 border-b">
              <input type="checkbox" checked={selectedQIds.has(q._id)} onChange={() => toggleQuestion(q._id)} />
              <div>
                <div className="font-medium">{q.questionText}</div>
                <div className="text-sm text-gray-600">{q.type} • {q.genre}</div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <button onClick={saveTest} disabled={saving} className="bg-green-600 text-white px-4 py-2 rounded">Create Test</button>
        </div>
      </section>

      <section className="border p-4 rounded bg-white">
        <h3 className="font-semibold mb-2">Tests for selected track</h3>
        <div className="mb-3">
          <select value={testForm.trackSlug} onChange={e => setTestForm(s => ({ ...s, trackSlug: e.target.value }))} className="border p-2">
            <option value="">-- select track --</option>
            {tracks.map(t => <option key={t.slug} value={t.slug}>{t.title} ({t.slug})</option>)}
          </select>
        </div>

        <div>
          {testsList.length === 0 && <div className="text-gray-500">No tests for this track</div>}
          {testsList.map(t => (
            <div key={t.testId} className="p-2 border-b flex justify-between">
              <div>
                <div className="font-medium">{t.title}</div>
                <div className="text-sm text-gray-600">{t.testId} • {t.questionsCount} questions • {t.durationSec}s</div>
              </div>
              <div>
                {/* further admin actions (view attempts etc) can be linked */}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


