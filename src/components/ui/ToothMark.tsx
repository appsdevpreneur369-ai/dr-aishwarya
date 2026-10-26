/**
 * Line drawing of a tooth crown on an implant screw: the clinic's signature motif (from its logo). Decorative only;
 * inherits currentColor so it works on light and dark bands.
 */
export function ToothMark({ className = 'h-24 w-24', strokeWidth = 2 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 64 96" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">
      <path d="M14 8c-6 3-8 10-7 17 1 8 4 13 5 20 1 5 3 8 6 8s4-4 5-9c1-4 3-7 6-7s5 3 6 7c1 5 2 9 5 9s5-3 6-8c1-7 4-12 5-20 1-7-1-14-7-17-5-2-9 0-14 2-5-2-11-4-16-2z" />
      <path d="M22 58h20M24 64h16M25 70h14M26 76h12M27 82h10M29 88h6" />
      <path d="M24 26l8-12 8 12M27 22h10" opacity=".55" />
    </svg>
  );
}
