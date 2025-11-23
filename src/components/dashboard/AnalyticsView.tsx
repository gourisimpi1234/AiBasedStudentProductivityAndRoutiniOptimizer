import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Clock, Target, Zap } from "lucide-react";

export function AnalyticsView() {
  const studyData = [
    { day: "Mon", hours: 5, productivity: 75 },
    { day: "Tue", hours: 6, productivity: 82 },
    { day: "Wed", hours: 4, productivity: 68 },
    { day: "Thu", hours: 7, productivity: 88 },
    { day: "Fri", hours: 5, productivity: 79 },
    { day: "Sat", hours: 8, productivity: 92 },
    { day: "Sun", hours: 6, productivity: 85 },
  ];

  const productiveHours = [
    { time: "6 AM", score: 45 },
    { time: "8 AM", score: 75 },
    { time: "10 AM", score: 92 },
    { time: "12 PM", score: 68 },
    { time: "2 PM", score: 55 },
    { time: "4 PM", score: 78 },
    { time: "6 PM", score: 85 },
    { time: "8 PM", score: 88 },
    { time: "10 PM", score: 62 },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-slate-900 mb-2">Analytics Dashboard</h1>
          <p className="text-slate-600">Track your progress and optimize your study routine</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Clock className="size-8 text-indigo-600" />
              <span className="text-green-600">+12%</span>
            </div>
            <p className="text-slate-600 mb-1">Total Study Hours</p>
            <p className="text-slate-900">41 hrs</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="size-8 text-purple-600" />
              <span className="text-green-600">+8%</span>
            </div>
            <p className="text-slate-600 mb-1">Avg Productivity</p>
            <p className="text-slate-900">81%</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Target className="size-8 text-pink-600" />
              <span className="text-green-600">15/18</span>
            </div>
            <p className="text-slate-600 mb-1">Tasks Completed</p>
            <p className="text-slate-900">83%</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Zap className="size-8 text-yellow-600" />
              <span className="text-indigo-600">10 AM</span>
            </div>
            <p className="text-slate-600 mb-1">Peak Productivity</p>
            <p className="text-slate-900">92% Score</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h2 className="text-slate-900 mb-6">Weekly Study Hours</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="hours" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h2 className="text-slate-900 mb-6">Productivity Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={studyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="productivity"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: "#8b5cf6", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Productive Time */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 mt-6">
          <div className="mb-6">
            <h2 className="text-slate-900 mb-2">Most Productive Time</h2>
            <p className="text-slate-600">Analysis based on your previous work patterns</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productiveHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="score" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
            <p className="text-indigo-900">
              💡 Your peak productivity is between 10 AM - 12 PM. Consider scheduling your most important tasks
              during this time!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
