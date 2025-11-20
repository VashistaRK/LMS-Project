/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import axios from "axios";
/* dnd-kit imports */
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* shadcn/ui components - adjust import paths to your project */
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

/* types */
type SectionType = "mcq" | "coding";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const COMPANY_BASE = `${BASE}/api/companies`;

type QuizQuestion = {
  _id: string;
  questionText: string;
  genre?: string;
};

type CodingQuestion = {
  _id: string;
  title: string;
  genre?: string;
};

type Section = {
  id: string; // local uuid for ordering
  title: string;
  type: SectionType;
  genre?: string;
  questions: string[]; // array of question IDs
};

interface AdminCompanyTestsProps {
  companySlug: string;
}

/* ---------- Sortable wrappers ---------- */

function SortableSectionCard(props: {
  section: Section;
  index: number;
  onChange: (s: Section) => void;
  onRemove: (id: string) => void;
  children?: React.ReactNode;
}) {
  const { section, index, onRemove, children } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  } as React.CSSProperties;

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <Card className="shadow-sm">
        <CardHeader className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div {...attributes} {...listeners} className="cursor-grab p-2 rounded bg-gray-100">
              {/* Drag handle icon */}
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="currentColor" d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
              </svg>
            </div>

            <div>
              <CardTitle className="text-sm font-semibold">{section.title || `Section ${index + 1}`}</CardTitle>
              <div className="text-xs text-muted-foreground">{section.type.toUpperCase()} section</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onRemove(section.id)} className="text-red-500">
              Remove
            </Button>
          </div>
        </CardHeader>

        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}

function SortableQuestionItem(props: {
  qId: string;
  label: string;
  checked: boolean;
  onToggle: (id: string) => void;
  dragId: string; // id of containing section to create unique id
  index: number;
}) {
  const { qId, label, checked, onToggle } = props;
  // useSortable for questions inside each section (id must be unique globally)
  const sortableId = `${props.dragId}-q-${qId}`;
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: sortableId });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 border rounded mb-2 bg-white">
      <div {...attributes} {...listeners} className="cursor-grab p-1 rounded bg-gray-100">
        <svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" /></svg>
      </div>
      <input type="checkbox" checked={checked} onChange={() => onToggle(qId)} />
      <div className="text-sm">{label}</div>
    </div>
  );
}

/* ---------- Utilities ---------- */

const uid = () => (typeof crypto !== "undefined" && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `${Date.now()}-${Math.random()}`);

const normalizeArrayResponse = <T,>(res: any): T[] => {
  if (!res) return [];
  if (Array.isArray(res)) return res as T[];
  if (Array.isArray(res.data)) return res.data as T[];
  if (Array.isArray(res?.data?.data)) return res.data.data as T[];
  return [];
};

/* ---------- Main Component ---------- */

export default function AdminCompanyTests({ companySlug }: AdminCompanyTestsProps) {
  const [testId, setTestId] = useState("");
  const [title, setTitle] = useState("");
  const [sections, setSections] = useState<Section[]>([]);

  const [allQuiz, setAllQuiz] = useState<QuizQuestion[]>([]);
  const [allCoding, setAllCoding] = useState<CodingQuestion[]>([]);

  const [testsList, setTestsList] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  /* dnd-kit sensors */
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [mcqRes, codingRes, companyRes] = await Promise.all([
          axios.get(`${BASE}/api/questions`), // MCQ questions
          axios.get(`${BASE}/api/code`), // Coding questions
          fetch(`${COMPANY_BASE}/${encodeURIComponent(companySlug)}`, { credentials: "include" }).then(r => r.json()).catch(() => ({ tests: [] })), // Company tests
        ]);

        const quizData = normalizeArrayResponse<QuizQuestion>(mcqRes.data ?? mcqRes);
        const codingData = normalizeArrayResponse<CodingQuestion>(codingRes.data ?? codingRes);
        const companyData = companyRes as any;

        // normalize shape: ensure _id and expected fields exist
        setAllQuiz(quizData.map((q) => ({ _id: String((q as any)._id || (q as any).id || ""), questionText: (q as any).questionText || (q as any).question || "", genre: (q as any).genre })));
        setAllCoding(codingData.map((c) => ({ _id: String((c as any)._id || (c as any).id || ""), title: (c as any).title || "", genre: (c as any).genre })));
        setTestsList((companyData && companyData.tests) || []);
      } catch (err) {
        console.error("Fetching error:", err);
        setAllQuiz([]);
        setAllCoding([]);
        setTestsList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [companySlug]);

  /* ---------- Section operations ---------- */
  const addSection = (type: SectionType) => {
    const newSection: Section = { id: uid(), title: "", type, genre: "", questions: [] };
    setSections((s) => [...s, newSection]);
  };

  const removeSection = (id: string) => setSections((s) => s.filter((x) => x.id !== id));

  const updateSection = (id: string, patch: Partial<Section>) => setSections((s) => s.map((sec) => (sec.id === id ? { ...sec, ...patch } : sec)));

  /* ---------- Drag & drop handlers ---------- */

  // reorder sections
  const handleDragEndSections = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === String(active.id));
    const newIndex = sections.findIndex((s) => s.id === String(over.id));
    if (oldIndex !== -1 && newIndex !== -1) setSections((s) => arrayMove(s, oldIndex, newIndex));
  };

  // reorder questions within a section
  const handleQuestionsDragEnd = (sectionId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const parse = (id: any) => String(id).toString();
    const activeStr = parse(active.id);
    const overStr = parse(over.id);

    if (!activeStr.startsWith(`${sectionId}-q-`) || !overStr.startsWith(`${sectionId}-q-`)) return;

    const activeQId = activeStr.replace(`${sectionId}-q-`, "");
    const overQId = overStr.replace(`${sectionId}-q-`, "");

    const sec = sections.find((s) => s.id === sectionId);
    if (!sec) return;
    const oldIndex = sec.questions.indexOf(activeQId);
    const newIndex = sec.questions.indexOf(overQId);
    if (oldIndex === -1 || newIndex === -1) return;

    const newQuestions = arrayMove(sec.questions, oldIndex, newIndex);
    updateSection(sectionId, { questions: newQuestions });
  };

  /* ---------- Question toggle ---------- */
  // Always work with valid string IDs
  const toggleQuestionInSection = (sectionId: string, qId: string | null | undefined) => {
    if (!qId) return;
    const sec = sections.find((s) => s.id === sectionId);
    if (!sec) return;
    const exists = sec.questions.includes(qId);
    updateSection(sectionId, {
      questions: exists ? sec.questions.filter((x) => x !== qId) : [...sec.questions, qId],
    });
  };

  /* ---------- Helper to get question label by id ---------- */
  const findQuestionLabel = (type: SectionType, qId: string) => {
    if (!qId) return "Unknown";
    if (type === "mcq") {
      const found = allQuiz.find((q) => q._id === qId);
      return found ? (found.questionText || qId) : qId;
    } else {
      const found = allCoding.find((q) => q._id === qId);
      return found ? (found.title || qId) : qId;
    }
  };

  /* ---------- Load test to edit ---------- */
  const loadTestToEdit = (test: any) => {
    setTestId(test.testId || "");
    setTitle(test.title || "");
    
    // Transform company sections format to internal format
    const transformedSections: Section[] = (test.sections || []).map((s: any) => ({
      id: uid(),
      title: s.title || "",
      type: (s.key === "mcq" ? "mcq" : "coding") as SectionType,
      genre: s.genre || "",
      questions: (s.questionIds || []).map((id: any) => String(id)),
    }));
    
    setSections(transformedSections);
  };

  /* ---------- Clear form ---------- */
  const clearForm = () => {
    setTestId("");
    setTitle("");
    setSections([]);
  };

  /* ---------- Save test ---------- */
  const handleSave = async () => {
    if (!testId.trim() || !title.trim()) {
      alert("Please provide test ID and title");
      return;
    }

    // Validate sections: ensure title, type and that questions are valid strings
    for (const [i, sec] of sections.entries()) {
      if (!sec.title || !sec.title.trim()) {
        alert(`Section ${i + 1} requires a title.`);
        return;
      }
      if (!["mcq", "coding"].includes(sec.type)) {
        alert(`Section ${i + 1} has invalid type.`);
        return;
      }
    }

    // build safe payload: filter out falsy/invalid ids and transform to company format
    const companySections = sections.map((s) => ({
      key: s.type as "mcq" | "coding",
      title: s.title || "",
      questionIds: (s.questions || []).filter((q) => typeof q === "string" && q.trim() !== ""),
      pointsPerQuestion: s.type === "mcq" ? 1 : undefined,
    }));

    setSaving(true);
    try {
      const payload = {
        testId,
        title,
        sections: companySections,
      };

      const res = await fetch(`${COMPANY_BASE}/admin/${encodeURIComponent(companySlug)}/tests`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }

      alert("Test saved successfully");
      
      // Refresh tests list
      const r2 = await fetch(`${COMPANY_BASE}/${encodeURIComponent(companySlug)}`, { credentials: "include" });
      const d2 = await r2.json();
      setTestsList((d2 && d2.tests) || []);
      
      clearForm();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save test. See console for details.");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Delete test ---------- */
  const deleteTest = async (testIdToDelete: string) => {
    if (!confirm("Delete test?")) return;
    try {
      const res = await fetch(`${COMPANY_BASE}/admin/${encodeURIComponent(companySlug)}/tests/${encodeURIComponent(testIdToDelete)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      
      // Refresh tests list
      const r2 = await fetch(`${COMPANY_BASE}/${encodeURIComponent(companySlug)}`, { credentials: "include" });
      const d2 = await r2.json();
      setTestsList((d2 && d2.tests) || []);
    } catch (e) {
      console.error(e);
      alert("Failed to delete");
    }
  };

  /* ---------- Render question list inside section with its own SortableContext ---------- */
  const SectionQuestionList: React.FC<{ section: Section }> = ({ section }) => {
    // safe arrays
    const safeQuiz = Array.isArray(allQuiz) ? allQuiz : [];
    const safeCoding = Array.isArray(allCoding) ? allCoding : [];

    // Apply genre filter only if a genre is provided
    const list =
      section.type === "mcq"
        ? safeQuiz.filter((q) => {
          if (!section.genre) return true;
          return !!q.genre && q.genre === section.genre;
        })
        : safeCoding.filter((q) => {
          if (!section.genre) return true;
          return !!q.genre && q.genre === section.genre;
        });

    return (
      <div className="mt-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Available ({list.length})</Label>
            <div className="mt-2 p-3 border rounded bg-gray-50 max-h-56 overflow-y-auto">
              {list.length === 0 && <div className="text-sm text-muted-foreground">No available questions</div>}
              {list.map((q) => {
                const id = (section.type === "mcq" ? (q as QuizQuestion)._id : (q as CodingQuestion)._id) || "";
                const label = section.type === "mcq" ? (q as QuizQuestion).questionText : (q as CodingQuestion).title;
                return (
                  <div key={id || Math.random()} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={section.questions.includes(id)}
                      onChange={() => toggleQuestionInSection(section.id, id)}
                    />
                    <div className="text-sm">{label || "<no title>"}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <Label>Selected (order matters)</Label>
            <div className="mt-2 p-3 border rounded bg-white">
              {/* Dnd context specifically for this section's questions */}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleQuestionsDragEnd(section.id, e)}>
                <SortableContext items={section.questions.map((qid) => `${section.id}-q-${qid}`)} strategy={verticalListSortingStrategy}>
                  <div>
                    {section.questions.length === 0 && <div className="text-sm text-muted-foreground">No questions selected</div>}
                    {section.questions.map((qid, qi) => (
                      <SortableQuestionItem
                        key={`${section.id}-q-${qid}`}
                        qId={qid}
                        label={findQuestionLabel(section.type, qid)}
                        checked={true}
                        onToggle={() => toggleQuestionInSection(section.id, qid)}
                        dragId={section.id}
                        index={qi}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ---------- UI ---------- */
  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Create / Edit Company Test</h3>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={clearForm}>New</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Test"}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border rounded-lg bg-white">
        <div className="flex flex-col gap-1">
          <Label>Test ID</Label>
          <Input placeholder="Test ID (e.g. Acct0101)" value={testId} onChange={(e) => setTestId(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1">
          <Label>Test Title</Label>
          <Input placeholder="Test title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1">
          <Label>Actions</Label>
          <div className="flex gap-2">
            <Button onClick={() => addSection("mcq")} variant="outline" size="sm">
              + MCQ Section
            </Button>
            <Button onClick={() => addSection("coding")} variant="outline" size="sm">
              + Coding Section
            </Button>
          </div>
        </div>
      </div>

      {/* Existing Tests List */}
      <div className="bg-white p-4 rounded shadow">
        <h4 className="text-sm font-medium mb-2">Existing Tests</h4>
        <div className="space-y-2 max-h-40 overflow-auto">
          {testsList.length === 0 && <div className="text-sm text-gray-500">No tests</div>}
          {testsList.map((t) => (
            <div key={t.testId} className="flex items-center justify-between border p-2 rounded">
              <div>
                <div className="font-medium text-sm">{t.title}</div>
                <div className="text-xs text-gray-500">{t.testId}</div>
              </div>
              <div className="flex gap-1">
                <Button onClick={() => loadTestToEdit(t)} variant="outline" size="sm">Edit</Button>
                <Button onClick={() => deleteTest(t.testId)} variant="destructive" size="sm">Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sections DndContext */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndSections}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div>
            {sections.length === 0 && <div className="p-4 text-sm text-gray-500">No sections — add one above</div>}

            {sections.map((section, idx) => (
              <SortableSectionCard key={section.id} section={section} index={idx} onChange={(s) => updateSection(section.id, s)} onRemove={(id) => removeSection(id)}>
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <Label>Section Title</Label>
                      <Input value={section.title} placeholder="Section Title" onChange={(e) => updateSection(section.id, { title: e.target.value })} />
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label>Type</Label>
                      <Select value={section.type} onValueChange={(val) => updateSection(section.id, { type: val as SectionType, questions: [] })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mcq">MCQ</SelectItem>
                          <SelectItem value="coding">Coding</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label>Genre filter (optional)</Label>
                      <Input value={section.genre} placeholder="Genre filter (optional)" onChange={(e) => updateSection(section.id, { genre: e.target.value })} />
                    </div>
                  </div>

                  <SectionQuestionList section={section} />
                </div>
              </SortableSectionCard>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
