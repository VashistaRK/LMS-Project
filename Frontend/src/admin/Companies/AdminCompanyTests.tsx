/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { getGenres, getQuestions } from "../../services/questionApi";

const Base_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const BASE = `${Base_URL}/api/companies`;

type SectionBuilder = { key: 'mcq'|'coding'|'essay'; title: string; questionIds: string[]; pointsPerQuestion?: number };

export default function AdminCompanyTests({ companySlug }: { companySlug: string }) {
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [bankQuestions, setBankQuestions] = useState<any[]>([]);
  const [query, setQuery] = useState<string>('');
  const [activeSection, setActiveSection] = useState<'mcq'|'coding'|'essay'>('mcq');

  const [sections, setSections] = useState<SectionBuilder[]>([
    { key: 'mcq', title: 'MCQ Section', questionIds: [], pointsPerQuestion: 1 },
    { key: 'coding', title: 'Coding Section', questionIds: [] },
    { key: 'essay', title: 'Essay Section', questionIds: [] },
  ]);
  const [testForm, setTestForm] = useState({ testId: '', title: '' });
  const [testsList, setTestsList] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingBank, setLoadingBank] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const g = await getGenres();
        setGenres(Array.isArray(g) ? g : []);
      } catch (e) { console.error(e); }
      // fetch company tests
      try {
        const res = await fetch(`${BASE}/${encodeURIComponent(companySlug)}`, { credentials: 'include' });
        const data = await res.json();
        const tests = (data && data.tests) || [];
        setTestsList(tests);
      } catch (e) { console.error(e); }
    })();
  }, [companySlug]);

  useEffect(() => {
    let cancelled = false;
    if (!selectedGenre) {
      setBankQuestions([]);
      return;
    }
    (async () => {
      setLoadingBank(true);
      try {
        const qs = await getQuestions(selectedGenre);
        if (cancelled) return;
        setBankQuestions(Array.isArray(qs) ? qs : []);
      } catch (e) { console.error(e); setBankQuestions([]); }
      finally { if (!cancelled) setLoadingBank(false); }
    })();
    return () => { cancelled = true; };
  }, [selectedGenre]);

  const filteredBank = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return bankQuestions;
    return bankQuestions.filter((b:any) =>
      String(b.questionText || b.title || '').toLowerCase().includes(q) ||
      String(b.genre || '').toLowerCase().includes(q)
    );
  }, [bankQuestions, query]);

  const currentSection = useMemo(() => sections.find(s => s.key === activeSection)!, [sections, activeSection]);

  const toggleSelectQuestion = (qid: string) => {
    setSections(prev => {
      const copy = prev.map(s => ({ ...s }));
      const sec = copy.find(s => s.key === activeSection)!;
      sec.questionIds = sec.questionIds || [];
      if (sec.questionIds.includes(qid)) sec.questionIds = sec.questionIds.filter(x => x !== qid);
      else sec.questionIds.push(qid);
      return copy;
    });
  };

  const removeSelected = (qid: string) => {
    setSections(prev => prev.map(s => s.key === activeSection ? { ...s, questionIds: (s.questionIds||[]).filter(x=>x!==qid) } : s));
  };

  const loadTestToEdit = (test: any) => {
    setTestForm({ testId: test.testId, title: test.title });
    const m: SectionBuilder[] = [
      { key: 'mcq', title: 'MCQ Section', questionIds: [], pointsPerQuestion: 1 },
      { key: 'coding', title: 'Coding Section', questionIds: [] },
      { key: 'essay', title: 'Essay Section', questionIds: [] },
    ];
    (test.sections || []).forEach((s: any) => {
      const idx = m.findIndex(x => x.key === s.key);
      if (idx !== -1) {
        m[idx] = { key: s.key, title: s.title || m[idx].title, questionIds: (s.questionIds || []).map((id: any) => String(id)), pointsPerQuestion: s.pointsPerQuestion || m[idx].pointsPerQuestion };
      }
    });
    setSections(m);
    // focus first section
    setActiveSection('mcq');
  };

  const clearForm = () => {
    setTestForm({ testId: '', title: '' });
    setSections([
      { key: 'mcq', title: 'MCQ Section', questionIds: [], pointsPerQuestion: 1 },
      { key: 'coding', title: 'Coding Section', questionIds: [] },
      { key: 'essay', title: 'Essay Section', questionIds: [] },
    ]);
    setQuery('');
    setSelectedGenre('');
  };

  const saveTest = async () => {
    if (!testForm.testId || !testForm.title) return alert('testId and title required');
    setSaving(true);
    try {
      const payload = { testId: testForm.testId, title: testForm.title, sections };
      const res = await fetch(`${BASE}/admin/${encodeURIComponent(companySlug)}/tests`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      alert('Test saved');
      const r2 = await fetch(`${BASE}/${encodeURIComponent(companySlug)}`, { credentials: 'include' });
      const d2 = await r2.json();
      setTestsList((d2 && d2.tests) || []);
      clearForm();
    } catch (err) {
      console.error(err);
      alert('Failed to save test: ' + (err as any).message);
    } finally {
      setSaving(false);
    }
  };

  const deleteTest = async (testId: string) => {
    if (!confirm('Delete test?')) return;
    try {
      const res = await fetch(`${BASE}/admin/${encodeURIComponent(companySlug)}/tests/${encodeURIComponent(testId)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Delete failed');
      const r2 = await fetch(`${BASE}/${encodeURIComponent(companySlug)}`, { credentials: 'include' });
      const d2 = await r2.json();
      setTestsList((d2 && d2.tests) || []);
    } catch (e) {
      console.error(e);
      alert('Failed to delete');
    }
  };

  const selectAllVisible = () => {
    const ids = filteredBank.map((b:any) => String(b._id));
    setSections(prev => prev.map(s => s.key === activeSection ? { ...s, questionIds: Array.from(new Set([...(s.questionIds||[]), ...ids])) } : s));
  };

  const clearSelectionForActive = () => {
    setSections(prev => prev.map(s => s.key === activeSection ? { ...s, questionIds: [] } : s));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Create / Edit Company Test</h3>
        <div className="flex gap-2">
          <button onClick={clearForm} className="px-3 py-1 border rounded bg-white">New</button>
          <button onClick={saveTest} disabled={saving} className="px-3 py-1 bg-blue-600 text-white rounded">{saving ? 'Saving...' : 'Save Test'}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: test meta & sections */}
        <div className="col-span-1 bg-white p-4 rounded shadow">
          <label className="text-xs text-gray-600">Test ID</label>
          <input className="w-full border p-2 rounded mt-1 mb-3" value={testForm.testId} onChange={e=>setTestForm(f=>({...f,testId:e.target.value}))} placeholder="e.g. Acct0101" />
          <label className="text-xs text-gray-600">Title</label>
          <input className="w-full border p-2 rounded mt-1 mb-3" value={testForm.title} onChange={e=>setTestForm(f=>({...f,title:e.target.value}))} placeholder="Test title" />

          <div className="mt-2">
            <div className="flex gap-2">
              {sections.map(s => (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className={`px-3 py-1 rounded ${activeSection === s.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  {s.title} <span className="ml-2 text-xs bg-white rounded px-1 text-gray-600">{(s.questionIds||[]).length}</span>
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="text-xs text-gray-600">Points per question (MCQ)</label>
              <div className="mt-1">
                <input
                  type="number"
                  value={currentSection.pointsPerQuestion ?? 1}
                  onChange={e => {
                    const val = Number(e.target.value) || 1;
                    setSections(prev => prev.map(s => s.key === activeSection ? { ...s, pointsPerQuestion: val } : s));
                  }}
                  className="w-28 border p-1 rounded"
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium">Existing Tests</h4>
            <div className="mt-2 space-y-2 max-h-40 overflow-auto">
              {testsList.length === 0 && <div className="text-sm text-gray-500">No tests</div>}
              {testsList.map(t => (
                <div key={t.testId} className="flex items-center justify-between border p-2 rounded">
                  <div>
                    <div className="font-medium text-sm">{t.title}</div>
                    <div className="text-xs text-gray-500">{t.testId}</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => loadTestToEdit(t)} className="text-xs px-2 py-1 border rounded">Edit</button>
                    <button onClick={() => deleteTest(t.testId)} className="text-xs px-2 py-1 border rounded text-red-600">Del</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle: question bank filter + list */}
        <div className="col-span-1 lg:col-span-1 bg-white p-4 rounded shadow flex flex-col">
          <div className="flex items-center gap-2">
            <select value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)} className="border p-2 rounded w-48">
              <option value="">Filter by genre</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <input className="flex-1 border p-2 rounded" placeholder="Search question text or genre" value={query} onChange={e=>setQuery(e.target.value)} />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button onClick={selectAllVisible} className="px-2 py-1 border rounded text-sm">Select all</button>
            <button onClick={clearSelectionForActive} className="px-2 py-1 border rounded text-sm">Clear selection (section)</button>
            <div className="text-sm text-gray-500 ml-auto">{loadingBank ? 'Loading...' : `${filteredBank.length} questions`}</div>
          </div>

          <div className="mt-3 overflow-auto" style={{ maxHeight: 520 }}>
            {filteredBank.map((q:any) => {
              const id = String(q._id);
              const checked = currentSection.questionIds.includes(id);
              return (
                <div key={id} className="p-2 border-b flex items-start gap-3">
                  <input type="checkbox" checked={checked} onChange={() => toggleSelectQuestion(id)} className="mt-1" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{q.questionText}</div>
                    <div className="text-xs text-gray-500">{q.type} • {q.genre}</div>
                    {q.options && q.options.length > 0 && activeSection === 'mcq' && (
                      <div className="mt-2 text-xs grid grid-cols-1 gap-1">
                        {q.options.slice(0,4).map((opt:string, i:number) => <div key={i} className="text-gray-600">• {opt}</div>)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredBank.length === 0 && <div className="p-4 text-sm text-gray-500">No questions — pick a genre or adjust search</div>}
          </div>
        </div>

        {/* Right: selected questions for active section */}
        <div className="col-span-1 bg-white p-4 rounded shadow">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{currentSection.title} — Selected ({currentSection.questionIds.length})</h4>
            <div className="text-xs text-gray-500">Section: {currentSection.key.toUpperCase()}</div>
          </div>

          <div className="mt-3 space-y-2 max-h-96 overflow-auto">
            {currentSection.questionIds.length === 0 && <div className="text-sm text-gray-500">No questions selected for this section</div>}
            {currentSection.questionIds.map(qid => {
              const q = bankQuestions.find((b:any) => String(b._id) === qid) || { questionText: qid };
              return (
                <div key={qid} className="flex items-start gap-3 border p-2 rounded">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{q.questionText}</div>
                    <div className="text-xs text-gray-500">{q.type || ''} • {q.genre || ''}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => removeSelected(qid)} className="text-xs px-2 py-1 border rounded text-red-600">Remove</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4">
            <label className="text-xs text-gray-600">Quick actions</label>
            <div className="flex gap-2 mt-2">
              <button onClick={() => {
                // move all selected to top (no-op visual) — placeholder for reorder
                alert('Reorder feature can be added later');
              }} className="px-3 py-1 border rounded text-sm">Reorder</button>
              <button onClick={() => {
                // remove duplicates across sections (optional)
                const used = new Set(currentSection.questionIds);
                setSections(prev => prev.map(s => s.key === activeSection ? s : { ...s, questionIds: (s.questionIds||[]).filter(id => !used.has(id)) }));
                alert('Duplicates removed from other sections');
              }} className="px-3 py-1 border rounded text-sm">Remove duplicates</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}