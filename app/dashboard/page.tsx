'use client';

import { useState, useEffect } from 'react';

/* ─── Sub-stat item ─────────────────────────────── */
function SubStat({
    label,
    value,
    valueColor = '#1e88e5',
}: {
    label: string;
    value: string;
    valueColor?: string;
}) {
    return (
        <div className="text-center">
            <div
                className="text-[22px] font-bold leading-tight"
                style={{ color: valueColor }}
            >
                {value}
            </div>
            <div className="text-[11.5px] text-gray-600 mt-1">{label}</div>
        </div>
    );
}

/* ─── Stat Card ─────────────────────────────────── */
interface StatCardProps {
    title: string;
    mainValue: string;
    mainColor?: string;
    bg: string;
    borderColor: string;
    subs: { label: string; value: string; valueColor?: string }[];
}

function StatCard({
    title,
    mainValue,
    mainColor = '#1e88e5',
    bg,
    borderColor,
    subs,
}: StatCardProps) {
    return (
        <div
            className="flex-1 min-w-[280px] rounded-xl p-6 bg-white border border-slate-200 shadow-sm"
        >
            {/* Main value */}
            <div className="text-center mb-6">
                <div
                    className="text-4xl font-bold leading-none tracking-tight text-slate-900"
                >
                    {mainValue}
                </div>
                <div className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-2">
                    {title}
                </div>
            </div>

            {/* Sub stats grid */}
            <div className="grid grid-cols-2 gap-3">
                {subs.map((s) => (
                    <SubStat
                        key={s.label}
                        label={s.label}
                        value={s.value}
                        valueColor={s.valueColor}
                    />
                ))}
            </div>
        </div>
    );
}

/* ─── Mini bar chart (no library needed) ────────── */
const WEEK_DATA = [
    { day: 'Mon', value: 0 },
    { day: 'Tue', value: 0 },
    { day: 'Wed', value: 0 },
    { day: 'Thu', value: 0 },
    { day: 'Fri', value: 0 },
    { day: 'Sat', value: 0 },
    { day: 'Sun', value: 0 },
];

function BarChart() {
    const max = Math.max(...WEEK_DATA.map((d) => d.value), 1);
    return (
        <div className="flex items-end justify-around gap-2 h-full px-2">
            {WEEK_DATA.map((d) => (
                <div
                    key={d.day}
                    className="flex flex-col items-center gap-2 flex-1"
                >
                    <div
                        className="w-full bg-emerald-50 rounded-t border border-emerald-100 transition-all duration-300 ease-in-out"
                        style={{
                            height: `${(d.value / max) * 140 + 4}px`,
                            minHeight: '4px',
                        }}
                    />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{d.day}</span>
                </div>
            ))}
        </div>
    );
}

/* ─── Dashboard page ─────────────────────────────── */
export default function DashboardPage() {
    const [chartPeriod, setChartPeriod] = useState('Past 1 Week');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <div className="flex flex-col gap-3.5 max-w-full p-4">

            {/* ── Greeting card ── */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    {/* Green play triangle */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#10b981">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                    <span className="text-emerald-700 font-bold text-sm tracking-tight">
                        Hello, Administrator Good Morning.
                    </span>
                </div>
            </div>

            {/* ── Stat cards row ── */}
            <div className="flex gap-3.5 flex-wrap">
                <StatCard
                    title="Total Invoices"
                    mainValue="0"
                    bg="#f1f8e9"
                    borderColor="#c8e6c9"
                    subs={[
                        { label: 'Advance Booking', value: '0' },
                        { label: 'Estimation', value: '0' },
                        { label: 'Home Collection', value: '0' },
                        { label: 'Investigation', value: '0' },
                    ]}
                />
                <StatCard
                    title="Total Sale"
                    mainValue="--"
                    bg="#ede7f6"
                    borderColor="#d1c4e9"
                    subs={[
                        { label: 'Collection Charges', value: '0' },
                        { label: 'Refund', value: '0' },
                        { label: 'Other Charges', value: 'NaN' },
                        { label: 'Discount', value: '0' },
                    ]}
                />
                <StatCard
                    title="Urgent Processing"
                    mainValue="0"
                    bg="#fce4ec"
                    borderColor="#f8bbd0"
                    subs={[
                        {
                            label: 'Deleted Invoice',
                            value: '0',
                            valueColor: '#e53935',
                        },
                        {
                            label: 'Deleted Investigation',
                            value: '0',
                            valueColor: '#e53935',
                        },
                    ]}
                />
            </div>

            {/* ── Financial banner ── */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3 shadow-sm">
                <span className="text-xs font-medium text-slate-500">
                    Manage your financial data more effectively to run your operations in a better way
                </span>
                <a
                    href="/accounts"
                    className="text-emerald-600 font-bold text-xs whitespace-nowrap hover:underline"
                >
                    Financial View
                </a>
            </div>

            {/* ── Sale Graphical View ── */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div
                    className="flex justify-between items-center mb-8"
                >
                    <span className="text-base font-bold text-slate-900 tracking-tight">
                        Sale Graphical View
                    </span>
                    <select
                        value={isMounted ? chartPeriod : ''}
                        onChange={(e) => setChartPeriod(e.target.value)}
                        className="input-refined w-auto py-1.5 px-4 font-bold text-xs"
                    >
                        <option>Past 1 Week</option>
                        <option>Past 1 Month</option>
                        <option>Past 3 Months</option>
                        <option>Past 6 Months</option>
                        <option>Past 1 Year</option>
                    </select>
                </div>

                {/* Chart area */}
                <div className="h-40">
                    <BarChart />
                </div>

                {/* X-axis border */}
                <div className="border-t border-gray-200 mt-1 pt-2 flex justify-center">
                    <span className="text-xs text-gray-400">
                        No sales data for selected period
                    </span>
                </div>
            </div>
        </div>
    );
}