import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnalysisTab, CoursesTab, UsersTab } from "./CoursesTab";

interface College {
  id: string;
  name: string;
  apiBase: string;
  logo: string;
}

interface User {
  email: string;
  name: string;
  role: string;
  picture: string;
  provider: string;
}
const baseURL= import.meta.env.VITE_API_URL;

export default function CollegeAdminPage() {
  const { collegeId } = useParams<{ collegeId: string }>();
  const [college, setCollege] = useState<College | null>(null);
  const [me, setMe] = useState<User>();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("courses");

  // ✅ Step 1: Get college info
  useEffect(() => {
    fetch(`${baseURL}/api/colleges/${collegeId}`, {
      credentials: "include",
    })
      .then((r) => {
        if (!r.ok) throw new Error("College not found");
        return r.json();
      })
      .then((data) => setCollege(data))
      .catch(() => setCollege(null));
  }, [collegeId]);

  // Step 2: Get user from central auth
  useEffect(() => {
    fetch(`${baseURL}/auth/me`, {
      credentials: "include",
    })
      .then((r) => {
        if (r.status === 401) throw new Error("Not authenticated");
        return r.json();
      })
      .then((data) => {
        setMe(data.user); // ✅ fix here
        console.log(data.user);
        console.log(data.user.role);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!college) return <div className="p-6">College not found.</div>;
  if (!me)
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2">Not authenticated</h2>
        <a
          href={`http://localhost:3000/auth/google`}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Sign in with Google
        </a>
      </div>
    );

  const allowed = me?.role === "Master_ADMIN";
  if (!allowed) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2">Forbidden</h2>
        <p>Your account ({me.email}) does not have admin privileges.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src={college.logo} alt={college.name} className="w-10 h-10" />
          <div>
            <h1 className="text-2xl font-bold">{college.name} Dashboard</h1>
            <div className="text-sm text-gray-600">
              Signed in as {me.name} • {me.email} • role: {me.role}
            </div>
          </div>
        </div>
        <a
          href={`http://localhost:3000/auth/logout`}
          className="px-3 py-2 border rounded"
        >
          Logout
        </a>
      </header>

      {/* Tabs */}
      <nav className="mb-6 flex gap-2">
        <TabButton active={tab === "courses"} onClick={() => setTab("courses")}>
          Courses
        </TabButton>
        <TabButton active={tab === "users"} onClick={() => setTab("users")}>
          Users
        </TabButton>
        <TabButton
          active={tab === "analysis"}
          onClick={() => setTab("analysis")}
        >
          Analysis
        </TabButton>
      </nav>

      <main>
        {tab === "courses" && <CoursesTab apiBase={college.apiBase} me={me} />}
        {tab === "users" && <UsersTab apiBase={college.apiBase} me={me} />}
        {tab === "analysis" && (
          <AnalysisTab apiBase={college.apiBase} me={me} />
        )}
      </main>
    </div>
  );
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded ${
        active ? "bg-blue-600 text-white" : "border"
      }`}
    >
      {children}
    </button>
  );
}

/* Placeholder Components */
// function CoursesTab({ apiBase, me }: { apiBase: string; me: User }) {
//   return (
//     <div>
//       📚 Courses will be fetched from {apiBase}/courses (as {me.role})
//     </div>
//   );
// }
// function UsersTab({ apiBase, me }: { apiBase: string; me: User }) {
//   return (
//     <div>
//       👤 Users will be fetched from {apiBase}/auth/users (as {me.role})
//     </div>
//   );
// }
// function AnalysisTab({ apiBase, me }: { apiBase: string; me: User }) {
//   return (
//     <div>
//       📊 Analytics will be fetched from {apiBase}/admin/analysis (as {me.email})
//     </div>
//   );
// }
