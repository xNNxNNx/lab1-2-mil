import { useRef, useCallback } from 'react';

interface RunawayButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
  maxRuns?: number;
}

export default function RunawayButton({
  children,
  className = '',
  onClick,
  maxRuns = 3,
}: RunawayButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const runsRef = useRef(0);

  const handleMouseEnter = useCallback(() => {
    if (runsRef.current >= maxRuns) return;
    runsRef.current += 1;

    const btn = ref.current;
    if (!btn) return;

    const parent = btn.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    const maxX = parentRect.width - btnRect.width - 20;

    const randomX = Math.max(10, Math.random() * Math.max(maxX, 200));
    const randomY = (Math.random() - 0.5) * 80;

    btn.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${(Math.random() - 0.5) * 15}deg)`;
    btn.style.transition = 'transform 0.2s ease-out';
  }, [maxRuns]);

  const handleClick = () => {
    runsRef.current = 0;
    const btn = ref.current;
    if (btn) {
      btn.style.transform = '';
    }
    onClick();
  };

  return (
    <button
      ref={ref}
      className={`btn-runaway ${className}`}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      style={{ position: 'relative' }}
    >
      {children}
    </button>
  );
}
