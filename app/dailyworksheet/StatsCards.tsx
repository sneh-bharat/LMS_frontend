'use client';

import { Card } from '@/components/ui';
import { Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface StatsCardsProps {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  approved: number;
}

export default function StatsCards({ total, pending, inProgress, completed, approved }: StatsCardsProps) {
  const stats = [
    {
      title: 'Total Samples',
      value: total,
      icon: Activity,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100'
    },
    {
      title: 'Pending',
      value: pending,
      icon: AlertCircle,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100'
    },
    {
      title: 'In Progress',
      value: inProgress,
      icon: Clock,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100'
    },
    {
      title: 'Completed',
      value: completed,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100'
    },
    {
      title: 'Approved',
      value: approved,
      icon: CheckCircle,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className={`${stat.bgColor} ${stat.borderColor} rounded-2xl p-5 hover:shadow-lg transition-all duration-300 border`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </p>
                <p className="text-3xl font-black text-slate-900">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-md`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
