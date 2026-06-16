'use client';

import { Building2, CalendarCheck, Home, Video } from 'lucide-react';
import Badge from '@/components/ui/badge';

const TYPE_MAP: Record<string, { icon: React.ReactNode; variant: 'primary' | 'success' | 'info' | 'secondary' }> = {
  'Clinic Visit': { icon: <Building2 size={12} />, variant: 'primary' },
  'Hospital Visit': { icon: <Home size={12} />, variant: 'success' },
  'Video Consultation': { icon: <Video size={12} />, variant: 'info' },
};

export function AppointmentTypeBadge({ type }: { type: string }) {
  const s = TYPE_MAP[type] ?? { icon: <CalendarCheck size={12} />, variant: 'secondary' as const };
  return (
    <Badge variant={s.variant} className="gap-1.5">
      {s.icon}
      {type}
    </Badge>
  );
}

export default AppointmentTypeBadge;
