/* ---------- AdminAnalysisPage.tsx ---------- */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface StatsResponse {
  users?: {
    total: number;
    byRole: Record<string, number>;
    recentSignups: { displayName?: string; email: string }[];
    growth: { date: string; count: number }[];
    courseActivity: { user: string; courseCount: number }[];
  };
  courses?: {
    total: number;
    enrollments: { course: string; count: number }[];
    trends: { date: string; count: number }[];
  };
}

const api = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function fetchAnalysis(): Promise<StatsResponse> {
  const res = await axios.get(`${api}/api/admin/analysis`, {
    withCredentials: true,
  });
  return res.data;
}

export default function AdminAnalysisPage() {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery<StatsResponse>({
    queryKey: ["admin-analysis", api],
    queryFn: fetchAnalysis,
  });

  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7f50",
    "#a4de6c",
    "#d0ed57",
  ];

  const rolePieData = useMemo(() => {
    if (!stats?.users?.byRole) return [];
    return Object.entries(stats.users.byRole).map(([role, count]) => ({
      role,
      count,
    }));
  }, [stats]);

  if (isLoading) return <div className="p-6">Loading analysis…</div>;
  if (error)
    return (
      <div className="p-6 text-red-600">
        Failed to load analysis.
        <button
          onClick={() => refetch()}
          className="ml-2 underline text-blue-600"
        >
          Retry
        </button>
      </div>
    );
  if (!stats) return <div className="p-6">No analysis available</div>;

  return (
    <div className="p-6 space-y-10 min-h-screen max-w-7xl mx-auto">
      {/* ===== Top Summary Cards ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="Total Users" value={stats.users?.total ?? "—"} />
        <SummaryCard
          title="Total Courses"
          value={stats.courses?.total ?? "—"}
        />
        <SummaryCard
          title="Recent Signups"
          value={
            (stats.users?.recentSignups || [])
              .slice(0, 3)
              .map((u) => u.displayName || u.email)
              .join(", ") || "—"
          }
        />
        <SummaryCard
          title="Active Courses"
          value={stats.courses?.enrollments?.length ?? "—"}
        />
      </div>

      {/* ===== Users by Role ===== */}
      <ChartCard title="Users by Role" height={260}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rolePieData}
              dataKey="count"
              nameKey="role"
              outerRadius={100}
              label
            >
              {rolePieData.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ===== User Growth ===== */}
      <ChartCard title="User Growth (daily)" height={300}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stats.users?.growth || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" angle={-30} textAnchor="end" height={60} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ===== Course Enrollments ===== */}
      <ChartCard
        title="Enrollments per Course"
        height={Math.max(350, (stats.courses?.enrollments?.length || 0) * 25)}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={stats.courses?.enrollments || []}
            margin={{ top: 20, right: 20, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="course"
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ===== Enrollment Trends ===== */}
      <ChartCard title="Enrollment Trends (daily)" height={300}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stats.courses?.trends || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" angle={-30} textAnchor="end" height={60} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#ff7f50" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ===== Courses per User ===== */}
      <ChartCard
        title="Courses per User (top 20)"
        height={Math.max(350, (stats.users?.courseActivity?.length || 0) * 25)}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={(stats.users?.courseActivity || []).slice(0, 20)}
            margin={{ top: 20, right: 20, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="user"
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="courseCount" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

/* ---------- Helper Components ---------- */
function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="p-5 bg-white rounded-xl shadow-md border border-gray-200">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="text-2xl font-bold mt-1 break-words truncate">
        {value}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  height,
  children,
}: {
  title: string;
  height: number;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
      <h3 className="font-semibold text-gray-700 mb-4">{title}</h3>
      <div style={{ height }}>{children}</div>
    </div>
  );
}
