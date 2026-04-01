import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScoreCircle } from '@/components/ScoreCircle';
import { StatusBadge, ReadinessBadge } from '@/components/SeverityBadge';
import { sampleReviews } from '@/lib/sample-data';
import { fetchAllReviews, type ReviewRow } from '@/lib/api';
import { FilePlus, FileText, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import type { ReviewResult } from '@/lib/types';

type ReviewSummary = {
  id: string;
  articleTitle: string;
  overallScore: number;
  publishReadiness: string;
  editorialVerdict: string;
  status: string;
  createdAt: string;
  criticalCount: number;
  importantCount: number;
  optionalCount: number;
};

function rowToSummary(row: ReviewRow): ReviewSummary | null {
  const r = row.review_result;
  if (!r || row.status !== 'completed') return null;
  return {
    id: row.id,
    articleTitle: row.title,
    overallScore: (r as any).overallScore ?? 0,
    publishReadiness: (r as any).publishReadiness ?? 'not_ready',
    editorialVerdict: (r as any).editorialVerdict ?? '',
    status: 'draft_review',
    createdAt: row.created_at,
    criticalCount: ((r as any).issues ?? []).filter((i: any) => i.severity === 'critical').length,
    importantCount: ((r as any).issues ?? []).filter((i: any) => i.severity === 'important').length,
    optionalCount: ((r as any).issues ?? []).filter((i: any) => i.severity === 'optional').length,
  };
}

function sampleToSummary(r: ReviewResult): ReviewSummary {
  return {
    id: r.id,
    articleTitle: r.articleTitle,
    overallScore: r.overallScore,
    publishReadiness: r.publishReadiness,
    editorialVerdict: r.editorialVerdict,
    status: r.status,
    createdAt: r.createdAt,
    criticalCount: r.issues.filter((i) => i.severity === 'critical').length,
    importantCount: r.issues.filter((i) => i.severity === 'important').length,
    optionalCount: r.issues.filter((i) => i.severity === 'optional').length,
  };
}

export default function Dashboard() {
  const [dbReviews, setDbReviews] = useState<ReviewSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllReviews().then((rows) => {
      const summaries = rows.map(rowToSummary).filter(Boolean) as ReviewSummary[];
      setDbReviews(summaries);
      setLoading(false);
    });
  }, []);

  const sampleSummaries = sampleReviews.map(sampleToSummary);
  const allReviews = [...dbReviews, ...sampleSummaries];

  const avgScore = allReviews.length ? Math.round(allReviews.reduce((a, r) => a + r.overallScore, 0) / allReviews.length) : 0;
  const criticalIssues = allReviews.reduce((a, r) => a + r.criticalCount, 0);

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">CookieYes Article Review Assistant</p>
          </div>
          <Button asChild>
            <Link to="/new-review">
              <FilePlus className="w-4 h-4 mr-2" />
              New Review
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Reviews</p>
                <p className="text-2xl font-bold text-foreground mt-1">{allReviews.length}</p>
              </div>
              <FileText className="w-8 h-8 text-primary/20" />
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Score</p>
                <p className="text-2xl font-bold text-foreground mt-1">{avgScore}/100</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success/20" />
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Critical Issues</p>
                <p className="text-2xl font-bold text-destructive mt-1">{criticalIssues}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive/20" />
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ready to Publish</p>
                <p className="text-2xl font-bold text-success mt-1">
                  {allReviews.filter((r) => r.publishReadiness === 'ready_to_publish').length}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                <span className="text-success text-lg">✓</span>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Reviews</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/reviews">View all</Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {allReviews.map((review) => (
                <Link key={review.id} to={`/review/${review.id}`}>
                  <Card className="p-5 hover:border-primary/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-5">
                      <ScoreCircle score={review.overallScore} size="sm" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground truncate">{review.articleTitle}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{review.editorialVerdict}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <ReadinessBadge readiness={review.publishReadiness as any} />
                          <StatusBadge status={review.status as any} />
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Issues</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs font-medium text-destructive">{review.criticalCount}</span>
                          <span className="text-xs text-muted-foreground">/</span>
                          <span className="text-xs font-medium text-warning">{review.importantCount}</span>
                          <span className="text-xs text-muted-foreground">/</span>
                          <span className="text-xs font-medium text-primary">{review.optionalCount}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
