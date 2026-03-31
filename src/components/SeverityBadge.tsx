import { cn } from '@/lib/utils';
import { SEVERITY_CONFIG, PUBLISH_READINESS_CONFIG, REVIEW_STATUS_CONFIG } from '@/lib/types';
import type { Severity, PublishReadiness, ReviewStatus } from '@/lib/types';

export function SeverityBadge({ severity }: { severity: Severity }) {
  const config = SEVERITY_CONFIG[severity];
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border', config.className)}>
      {config.label}
    </span>
  );
}

export function ReadinessBadge({ readiness }: { readiness: PublishReadiness }) {
  const config = PUBLISH_READINESS_CONFIG[readiness];
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border', config.className)}>
      {config.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: ReviewStatus }) {
  const config = REVIEW_STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', config.className)}>
      {config.label}
    </span>
  );
}
