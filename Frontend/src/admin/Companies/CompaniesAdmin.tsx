/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import AdminCompanyTests from "./AdminCompanyTests";

const Base_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const BASE = `${Base_URL}/api/companies`;

export default function CompaniesAdmin() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCompany, setNewCompany] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [addingPaperFor, setAddingPaperFor] = useState<string | null>(null);
  const [paperForm, setPaperForm] = useState<{
    title: string;
    year: number | "";
    file: File | null;
  }>({ title: "", year: "", file: null });
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const papers = selectedCompany?.papers || [];

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
        const list = Array.isArray(data)
          ? data
          : data && Array.isArray(data.data)
          ? data.data
          : [];
        setCompanies(list.filter(Boolean));
      } catch (err) {
        console.error("Failed to fetch companies", err);
        setCompanies([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const createCompany = async () => {
    try {
      if (!newCompany.name || !newCompany.slug)
        return alert("Name and slug required");
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
      const list = Array.isArray(d2)
        ? d2
        : d2 && Array.isArray(d2.data)
        ? d2.data
        : [];
      setCompanies(list.filter(Boolean));
      setNewCompany({ name: "", slug: "", description: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to create company");
    }
  };

  const deleteCompany = async (slug: string) => {
    if (!confirm(`Are you sure you want to delete "${slug}"?`)) return;

    try {
      const res = await fetch(`${BASE}/admin/${encodeURIComponent(slug)}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const body = await res.text();
        let msg = res.statusText;
        try {
          const parsed = JSON.parse(body);
          msg = parsed?.error || JSON.stringify(parsed);
        } catch {
          //no code-op
        }
        throw new Error(msg);
      }

      // Refresh list after delete
      const r2 = await fetch(`${BASE}`, { credentials: "include" });
      const d2 = await r2.json().catch(() => null);
      const list = Array.isArray(d2) ? d2 : d2?.data || [];
      setCompanies(list.filter(Boolean));

      alert("Company deleted");
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete company: " + err.message);
    }
  };

  // const startAddPaper = (slug: string) => {
  //   setAddingPaperFor(slug);
  //   setPaperForm({ title: "", year: "", file: null });
  // };

  const cancelAddPaper = () => {
    setAddingPaperFor(null);
    setPaperForm({ title: "", year: "", file: null });
  };

  const handleFileChange = (f?: FileList | null) => {
    if (!f || f.length === 0)
      return setPaperForm((prev) => ({ ...prev, file: null }));
    const file = f[0];
    setPaperForm((prev) => ({ ...prev, file }));
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

      const res = await fetch(
        `${BASE}/admin/${encodeURIComponent(companySlug)}/papers`,
        {
          method: "POST",
          credentials: "include",
          body: fd,
        }
      );

      if (!res.ok) {
        const body = await res.text();
        let msg = res.statusText;
        try {
          const parsed = JSON.parse(body);
          msg = parsed?.error || parsed?.details || JSON.stringify(parsed);
        } catch {
          msg = body || msg;
        }
        throw new Error(msg);
      }

      // refresh list
      const r2 = await fetch(`${BASE}`, { credentials: "include" });
      const d2 = await r2.json().catch(() => null);
      const list = Array.isArray(d2)
        ? d2
        : d2 && Array.isArray(d2.data)
        ? d2.data
        : [];
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* LEFT PANEL */}
        <div className="col-span-1 bg-white p-4 rounded shadow h-fit sticky top-4">
          <h2 className="font-semibold mb-3">Create Company</h2>

          {/* Create Company Form */}
          <div className="space-y-2 mb-4">
            <input
              placeholder="Name"
              value={newCompany.name}
              onChange={(e) =>
                setNewCompany((s) => ({ ...s, name: e.target.value }))
              }
              className="border p-2 w-full"
            />
            <input
              placeholder="Slug"
              value={newCompany.slug}
              onChange={(e) =>
                setNewCompany((s) => ({ ...s, slug: e.target.value }))
              }
              className="border p-2 w-full"
            />
            <input
              placeholder="Description"
              value={newCompany.description}
              onChange={(e) =>
                setNewCompany((s) => ({ ...s, description: e.target.value }))
              }
              className="border p-2 w-full"
            />

            <button
              onClick={createCompany}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            >
              Create Company
            </button>
          </div>

          {/* List of Companies */}
          <h2 className="font-semibold mb-2">Companies</h2>

          {loading && <div>Loading...</div>}
          {!loading && companies.length === 0 && (
            <div className="text-gray-500">No companies found.</div>
          )}

          <div className="space-y-2">
            {companies.map((c, idx) => {
              const slug = c?.slug ?? `company-${idx}`;
              const name = c?.name ?? "Unnamed";

              return (
                <div
                  key={slug}
                  className={`p-2 border rounded cursor-pointer ${
                    selectedCompany?.slug === slug
                      ? "bg-blue-50 border-blue-400"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={async () => {
                    try {
                      const res = await fetch(`${BASE}/${c.slug}`, {
                        credentials: "include",
                      });
                      const full = await res.json();
                      setSelectedCompany(full);
                    } catch (err) {
                      console.error("Failed to fetch full company", err);
                      setSelectedCompany(c); // fallback
                    }

                    setAddingPaperFor(null);
                    setManageTestsFor(null);
                  }}
                >
                  <div className="font-medium">{name}</div>
                  <div className="text-xs text-gray-600">{slug}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="col-span-3 bg-white p-4 rounded shadow min-h-[400px]">
          {!selectedCompany ? (
            <div className="text-gray-500 text-center py-20">
              Select a company to manage
            </div>
          ) : (
            <>
              {/* Company Header */}
              <div className="flex justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {selectedCompany.name}
                  </h2>
                  <p className="text-gray-600">{selectedCompany.slug}</p>
                  <p className="text-sm mt-1">{selectedCompany.description}</p>
                </div>

                <button
                  onClick={() => deleteCompany(selectedCompany.slug)}
                  className="text-red-600 text-sm"
                >
                  Delete
                </button>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => {
                    setAddingPaperFor(selectedCompany.slug);
                    setManageTestsFor(null);
                  }}
                  className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded"
                >
                  Manage Papers
                </button>

                <button
                  onClick={() => {
                    setManageTestsFor(selectedCompany.slug);
                    setAddingPaperFor(null);
                  }}
                  className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded"
                >
                  Manage Tests
                </button>
              </div>

              {/* ADD PAPER UI */}
              {addingPaperFor && addingPaperFor === selectedCompany.slug && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Add Paper</h3>

                  <div className="grid grid-cols-3 gap-2">
                    <input
                      placeholder="Paper title"
                      value={paperForm.title}
                      onChange={(e) =>
                        setPaperForm((p) => ({ ...p, title: e.target.value }))
                      }
                      className="border p-2"
                    />

                    <input
                      placeholder="Year"
                      type="number"
                      value={paperForm.year as any}
                      onChange={(e) =>
                        setPaperForm((p) => ({
                          ...p,
                          year: Number(e.target.value),
                        }))
                      }
                      className="border p-2"
                    />

                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e.target.files)}
                      className="border p-2"
                    />
                  </div>

                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => submitAddPaper(selectedCompany.slug)}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Upload
                    </button>

                    <button
                      onClick={() => {
                        setAddingPaperFor(null);
                        setPaperForm({ title: "", year: "", file: null });
                      }}
                      className="px-3 py-1 border rounded"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* EXISTING PAPERS LIST */}
                  {papers.length > 0 ? (
                    <div className="mb-4 mt-4">
                      <h4 className="font-semibold mb-2">Existing Papers</h4>

                      <div className="space-y-2">
                        {papers.map((p: any) => (
                          <div
                            key={p._id}
                            className="p-2 border rounded flex justify-between items-center"
                          >
                            <div>
                              <div className="font-medium">{p.title}</div>
                              <div className="text-sm text-gray-600">
                                Year: {p.year}
                              </div>
                            </div>

                            {/* Download button */}
                            <a
                              href={`data:${
                                p.file?.contentType
                              };base64,${p.file?.data?.toString("base64")}`}
                              download={p.file?.filename || "paper.pdf"}
                              className="text-blue-600 text-sm underline"
                            >
                              Download
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 mb-4">
                      No papers uploaded yet.
                    </div>
                  )}
                </div>
              )}

              {/* MANAGE TESTS UI */}
              {manageTestsFor === selectedCompany.slug && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Manage Tests</h3>
                  <AdminCompanyTests companySlug={selectedCompany.slug} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
