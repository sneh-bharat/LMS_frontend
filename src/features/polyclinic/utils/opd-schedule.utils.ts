/** Generates display slot strings between `start` and `end` at `duration`-minute steps. */
export function generateSlots(start: string, end: string, duration: number): string[] {
  if (!start || !end || !duration) return [];
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const endTotal = eh * 60 + em;
  const slots: string[] = [];
  let cur = sh * 60 + sm;
  const fmt = (hh: number, mm: number) => {
    const ampm = hh >= 12 ? 'PM' : 'AM';
    return `${hh % 12 || 12}:${String(mm).padStart(2, '0')} ${ampm}`;
  };
  while (cur + duration <= endTotal) {
    const h = Math.floor(cur / 60);
    const m = cur % 60;
    const nh = Math.floor((cur + duration) / 60);
    const nm = (cur + duration) % 60;
    slots.push(`${fmt(h, m)} – ${fmt(nh, nm)}`);
    cur += duration;
  }
  return slots;
}
