import { Activity, CheckCircle2, Clock, Package, Truck } from 'lucide-react';

/** Icon + tone for each sample status. */
export const STATUS_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  Collected: { icon: <CheckCircle2 size={12} />, color: 'emerald' },
  Pending: { icon: <Clock size={12} />, color: 'amber' },
  Processing: { icon: <Activity size={12} />, color: 'blue' },
  Dispatched: { icon: <Truck size={12} />, color: 'purple' },
  Received: { icon: <Package size={12} />, color: 'cyan' },
};
