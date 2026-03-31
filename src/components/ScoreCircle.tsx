import { cn } from '@/lib/utils';

interface ScoreCircleProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

function getScoreColor(score: number, max: number) {
  const pct = (score / max) * 100;
  if (pct >= 80) return 'text-success';
  if (pct >= 60) return 'text-warning';
  if (pct >= 40) return 'text-orange-500';
  return 'text-destructive';
}

function getScoreRingColor(score: number, max: number) {
  const pct = (score / max) * 100;
  if (pct >= 80) return 'stroke-success';
  if (pct >= 60) return 'stroke-warning';
  if (pct >= 40) return 'stroke-orange-500';
  return 'stroke-destructive';
}

export function ScoreCircle({ score, maxScore = 100, size = 'md', showLabel = false }: ScoreCircleProps) {
  const pct = (score / maxScore) * 100;
  const sizeMap = { sm: 48, md: 80, lg: 120 };
  const strokeMap = { sm: 4, md: 6, lg: 8 };
  const fontSizeMap = { sm: 'text-sm', md: 'text-xl', lg: 'text-3xl' };
  const dim = sizeMap[size];
  const strokeWidth = strokeMap[size];
  const radius = (dim - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            className={getScoreRingColor(score, maxScore)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-bold', fontSizeMap[size], getScoreColor(score, maxScore))}>
            {score}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground font-medium">/ {maxScore}</span>
      )}
    </div>
  );
}

export function ScoreBar({ score, maxScore = 10 }: { score: number; maxScore?: number }) {
  const pct = (score / maxScore) * 100;
  const color = pct >= 80 ? 'bg-success' : pct >= 60 ? 'bg-warning' : pct >= 40 ? 'bg-orange-500' : 'bg-destructive';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-foreground w-8 text-right">{score}/{maxScore}</span>
    </div>
  );
}
