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
// import test from "node:test";

/* types */
type SectionType = "mcq" | "coding";

const BASE = import.meta.env.VITE_API_URL || "";

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

interface TestBuilderProps {
  courseId?: string;
  sectionId: number;
  chapterId: number;
  onSave: (testId: string) => void;
  initial?: {
    title?: string;
    timeLimit?: number;
    totalMarks?: number;
    sections?: Section[];
  };
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
        <svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/></svg>
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

const TestBuilder: React.FC<TestBuilderProps> = ({ courseId, sectionId, chapterId, onSave, initial }) => {
  const [title, setTitle] = useState(initial?.title || "");
  const [timeLimit, setTimeLimit] = useState<number>(initial?.timeLimit ?? 0);
  const [totalMarks, setTotalMarks] = useState<number>(initial?.totalMarks ?? 0);
  const [sections, setSections] = useState<Section[]>(initial?.sections ?? []);

  const [allQuiz, setAllQuiz] = useState<QuizQuestion[]>([]);
  const [allCoding, setAllCoding] = useState<CodingQuestion[]>([]);
  const [genres, setGenres] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);

  /* dnd-kit sensors */
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [mcqRes, codingRes, genreRes] = await Promise.all([
          axios.get(`${BASE}/api/questions`), // MCQ questions
          axios.get(`${BASE}/api/code`), // Coding questions
          axios.get(`${BASE}/api/questions/genres`).catch(() => ({ data: [] })), // Genres
        ]);

        const quizData = normalizeArrayResponse<QuizQuestion>(mcqRes.data ?? mcqRes);
        const codingData = normalizeArrayResponse<CodingQuestion>(codingRes.data ?? codingRes);
        const genreData = normalizeArrayResponse<string>(genreRes.data ?? genreRes);

        // normalize shape: ensure _id and expected fields exist
        setAllQuiz(quizData.map((q) => ({ _id: String((q as any)._id || (q as any).id || ""), questionText: (q as any).questionText || (q as any).question || "" , genre: (q as any).genre })));
        setAllCoding(codingData.map((c) => ({ _id: String((c as any)._id || (c as any).id || ""), title: (c as any).title || "", genre: (c as any).genre })));
        setGenres(genreData as string[]);
        console.log("Fetched questions and genres",genres);
      } catch (err) {
        console.error("Fetching error:", err);
        setAllQuiz([]);
        setAllCoding([]);
        setGenres([]);
      }
    };

    fetchAll();
  }, []);

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

  /* ---------- Save test ---------- */
  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please provide a test title");
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

    // build safe payload: filter out falsy/invalid ids
    const safeSections = sections.map((s) => ({
      title: s.title || "",
      type: s.type,
      questions: (s.questions || []).filter((q) => typeof q === "string" && q.trim() !== ""),
    }));

    setSaving(true);
    try {
      const payload = {
        title,
        timeLimit,
        totalMarks,
        sections: safeSections,
        courseId,
        sectionId,
        chapterId,
        createdBy: "admin",
      };

      const res = await axios.post(`${BASE}/tests`, payload);
      const testId = res.data?.testId || res.data?.test?._id || null;
      if (!testId) throw new Error("No testId returned");
      onSave(testId);
      console.log("Test saved with ID:", testId, res.data.testData);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save test. See console for details.");
    } finally {
      setSaving(false);
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
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border rounded-lg bg-white">
        <div className="flex flex-col gap-1">
          <Label>Test Title</Label>
          <Input placeholder="Test title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1">
          <Label>Time Limit (minutes)</Label>
          <Input type="number" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} />
        </div>

        <div className="flex flex-col gap-1">
          <Label>Total Marks</Label>
          <Input type="number" value={totalMarks} onChange={(e) => setTotalMarks(Number(e.target.value))} />
        </div>

        <div className="col-span-1 sm:col-span-3 flex gap-3 mt-2">
          <Button onClick={() => addSection("mcq")} variant="outline">
            + Add MCQ Section
          </Button>
          <Button onClick={() => addSection("coding")} variant="outline">
            + Add Coding Section
          </Button>
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

      <div className="flex justify-end gap-2 mt-3">
        <Button variant="secondary" onClick={() => { setSections([]); setTitle(""); setTimeLimit(0); setTotalMarks(0); }}>Reset</Button>
        <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Test"}</Button>
      </div>
    </div>
  );
};

export default TestBuilder;
