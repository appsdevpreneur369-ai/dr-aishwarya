'use client';
import { useEffect, useState } from 'react';
import { useBooking } from '@/components/booking/BookingProvider';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

/**
 * "Next free slot: Tue 28 Oct, 10:15 AM", read live from ClinicFlow. Loads the booking code only after the page is
 * idle (no effect on first paint), and renders nothing unless live ClinicFlow booking is available and returns a slot.
 */
export function NextSlotChip({ className }: { className?: string }) {
  const { config, open } = useBooking();
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const { resolveBookingService } = await import('@/lib/booking/services');
        const { service } = await resolveBookingService(config);
        if (!service || service.mode !== 'clinicflow' || !service.liveSlots) return;
        const [branch] = await service.getBranches();
        if (!branch) return;
        const next = await service.getNextAvailable(config.doctors.map((d) => d.slug), branch.id);
        if (!next || cancelled) return;
        const day = new Date(`${next.date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
        const [h, m] = next.time.split(':').map(Number);
        setLabel(`${day}, ${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`);
      } catch {
        /* no live slot: show nothing */
      }
    };
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const id = idle ? idle(() => void run()) : window.setTimeout(() => void run(), 1500);
    return () => {
      cancelled = true;
      if (!idle) window.clearTimeout(id);
    };
  }, [config]);

  if (!label) return null;
  return (
    <button type="button" onClick={() => open()} className={cn('inline-flex min-h-[48px] items-center gap-3 rounded-[10px] bg-surface/95 px-3.5 py-2 text-left text-text shadow-lift', className)}>
      <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
      </span>
      <span className="leading-tight">
        <span className="block text-xs font-semibold text-textSecondary">Next free slot</span>
        <span className="block font-heading text-[0.95rem] font-bold">{label}</span>
      </span>
      <Icon name="arrow-right" className="h-4 w-4 text-primary" />
    </button>
  );
}
