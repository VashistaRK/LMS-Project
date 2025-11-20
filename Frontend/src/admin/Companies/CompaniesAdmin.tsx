/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import AdminCompanyTests from "./AdminCompanyTests";

const Base_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const BASE = `${Base_URL}/api/companies`;

export default function CompaniesAdmin() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCompany, setNewCompany] = useState({ name: "", slug: "", description: "" });
  const [addingPaperFor, setAddingPaperFor] = useState<string | null>(null);
  const [paperForm, setPaperForm] = useState<{ title: string; year: number | ""; file: File | null }>({ title: "", year: "", file: null });

  // show inline tests UI for this company
  const [manageTestsFor, setManageTestsFor] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE}`, { credentials: "include" });
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        const list = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
        setCompanies(list.filter(Boolean));
      } catch (err) {
        console.error("Failed to fetch companies", err);
        setCompanies([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const createCompany = async () => {
    try {
      if (!newCompany.name || !newCompany.slug) return alert("Name and slug required");
      const res = await fetch(`${BASE}/admin`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCompany),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err?.error || res.statusText);
      }
      // refresh
      const r2 = await fetch(`${BASE}`, { credentials: "include" });
      const d2 = await r2.json().catch(() => null);
      const list = Array.isArray(d2) ? d2 : (d2 && Array.isArray(d2.data) ? d2.data : []);
      setCompanies(list.filter(Boolean));
      setNewCompany({ name: "", slug: "", description: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to create company");
    }
  };

  const startAddPaper = (slug: string) => {
    setAddingPaperFor(slug);
    setPaperForm({ title: "", year: "", file: null });
  };

  const cancelAddPaper = () => {
    setAddingPaperFor(null);
    setPaperForm({ title: "", year: "", file: null });
  };

  const handleFileChange = (f?: FileList | null) => {
    if (!f || f.length === 0) return setPaperForm(prev => ({ ...prev, file: null }));
    const file = f[0];
    setPaperForm(prev => ({ ...prev, file }));
  };

  const submitAddPaper = async (companySlug: string) => {
    try {
      if (!paperForm.title || !paperForm.year || !paperForm.file) {
        return alert("title, year and file required");
      }
      const fd = new FormData();
      fd.append("title", paperForm.title);
      fd.append("year", String(paperForm.year));
      fd.append("file", paperForm.file as File);

      const res = await fetch(`${BASE}/admin/${encodeURIComponent(companySlug)}/papers`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      if (!res.ok) {
        const body = await res.text();
        let msg = res.statusText;
        try {
          const parsed = JSON.parse(body);
          msg = parsed?.error || parsed?.details || JSON.stringify(parsed);
        } catch { msg = body || msg; }
        throw new Error(msg);
      }

      // refresh list
      const r2 = await fetch(`${BASE}`, { credentials: "include" });
      const d2 = await r2.json().catch(() => null);
      const list = Array.isArray(d2) ? d2 : (d2 && Array.isArray(d2.data) ? d2.data : []);
      setCompanies(list.filter(Boolean));
      cancelAddPaper();
    } catch (err: any) {
      console.error(err);
      alert("Failed to add paper: " + (err?.message || String(err)));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Companies Admin</h1>

      <section className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Create Company</h2>
        <div className="grid grid-cols-3 gap-2">
          <input placeholder="Name" value={newCompany.name} onChange={e => setNewCompany(s => ({ ...s, name: e.target.value }))} className="border p-2" />
          <input placeholder="Slug" value={newCompany.slug} onChange={e => setNewCompany(s => ({ ...s, slug: e.target.value }))} className="border p-2" />
          <input placeholder="Description" value={newCompany.description} onChange={e => setNewCompany(s => ({ ...s, description: e.target.value }))} className="border p-2" />
        </div>
        <div className="mt-3">
          <button onClick={createCompany} className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
        </div>
      </section>

      <section className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-3">Companies</h2>
        {loading && <div>Loading...</div>}
        {!loading && companies.length === 0 && <div className="text-gray-500">No companies found</div>}

        <div className="space-y-4">
          {companies.filter(Boolean).map((c: any, idx: number) => {
            const name = c?.name ?? "Unnamed";
            const slug = c?.slug ?? `company-${idx}`;
            const description = c?.description ?? "";
            return (
              <div key={slug + "-" + idx} className="border p-3 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{name}</div>
                    <div className="text-sm text-gray-600">{slug}</div>
                    <div className="text-sm mt-1">{description}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button onClick={() => startAddPaper(slug)} className="text-sm text-blue-600">Add Paper</button>
                    <button onClick={() => setManageTestsFor(slug)} className="text-sm text-green-600">Manage Tests</button>
                  </div>
                </div>

                {addingPaperFor === slug && (
                  <div className="mt-3 border-t pt-3">
                    <div className="grid grid-cols-3 gap-2">
                      <input placeholder="Paper title" value={paperForm.title} onChange={e => setPaperForm(p => ({ ...p, title: e.target.value }))} className="border p-2" />
                      <input placeholder="Year" type="number" value={paperForm.year as any} onChange={e => setPaperForm(p => ({ ...p, year: Number(e.target.value) }))} className="border p-2" />
                      <input type="file" onChange={e => handleFileChange(e.target.files)} className="border p-2" />
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => submitAddPaper(slug)} className="bg-blue-600 text-white px-3 py-1 rounded">Upload</button>
                      <button onClick={cancelAddPaper} className="px-3 py-1 border rounded">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Inline admin tests manager (avoid client route 404) */}
      {manageTestsFor && (
        <section className="mt-6 bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Manage Tests for: {manageTestsFor}</h2>
            <button onClick={() => setManageTestsFor(null)} className="text-sm px-3 py-1 border rounded">Close</button>
          </div>
          <AdminCompanyTests companySlug={manageTestsFor} />
        </section>
      )}
    </div>
  );
}
