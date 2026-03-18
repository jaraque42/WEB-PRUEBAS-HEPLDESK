"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#2563EB", "#22C55E", "#F59E0B", "#EF4444", "#A855F7"];

export function StatsCharts({
  byAdmin,
  byCategory,
}: {
  byAdmin: { name: string; value: number }[];
  byCategory: { name: string; value: number }[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="h-72 rounded-xl border bg-card p-4">
        <p className="text-sm font-medium pb-3">Tickets por admin</p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byAdmin}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#2563EB" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="h-72 rounded-xl border bg-card p-4">
        <p className="text-sm font-medium pb-3">Tickets por categoría</p>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={90}>
              {byCategory.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

