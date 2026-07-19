"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type RevenueData = {
  date: string;
  revenue: number;
};

type CategoryData = {
  name: string;
  value: number;
};

interface SalesChartsProps {
  revenueData: RevenueData[];
  categoryData: CategoryData[];
}

const COLORS = ["#3b82f6", "#ec4899", "#8b5cf6", "#10b981", "#f59e0b", "#6366f1", "#14b8a6"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: 'var(--card-bg)', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backdropFilter: 'blur(10px)' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{label}</p>
        <p style={{ color: 'var(--primary)' }}>
          Revenue: ₱{payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export function SalesCharts({ revenueData, categoryData }: SalesChartsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
      
      {/* Revenue Over Time */}
      <div className="glass-card" style={{ padding: '1.5rem', height: '400px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--foreground)' }}>Revenue (Last 30 Days)</h3>
        <div style={{ flex: 1, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--foreground-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis 
                stroke="var(--foreground-muted)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `₱${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="var(--primary)" 
                strokeWidth={3}
                dot={{ r: 4, fill: 'var(--background)', stroke: 'var(--primary)', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: 'var(--primary)', stroke: 'var(--background)', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sales by Category */}
      <div className="glass-card" style={{ padding: '1.5rem', height: '400px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--foreground)' }}>Sales by Category</h3>
        <div style={{ flex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.1)" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderRadius: 'var(--radius-md)' }}
                itemStyle={{ color: 'var(--foreground)' }}
                formatter={(value: any) => [`₱${Number(value).toFixed(2)}`, 'Revenue']}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
