import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScoreCircle } from '@/components/ScoreCircle';
import { StatusBadge, ReadinessBadge } from '@/components/SeverityBadge';
import { sampleReviews } from '@/lib/sample-data';
import { FilePlus, FileText, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const reviews = sampleReviews;
  const avgScore = Math.round(reviews.reduce((a, r) => a + r.overallScore, 0) / reviews.length);
  const criticalIssues = reviews.reduce((a, r) => a + r.issues.filter((i) => i.severity === 'critical').length, 0);

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        {/* Header */}
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

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Reviews</p>
                <p className="text-2xl font-bold text-foreground mt-1">{reviews.length}</p>
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
                  {reviews.filter((r) => r.publishReadiness === 'ready_to_publish').length}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                <span className="text-success text-lg">✓</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Reviews */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Reviews</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/reviews">View all</Link>
            </Button>
          </div>

          <div className="space-y-3">
            {reviews.map((review) => (
              <Link key={review.id} to={`/review/${review.id}`}>
                <Card className="p-5 hover:border-primary/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-5">
                    <ScoreCircle score={review.overallScore} size="sm" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate">{review.articleTitle}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{review.editorialVerdict}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <ReadinessBadge readiness={review.publishReadiness} />
                        <StatusBadge status={review.status} />
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Issues</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs font-medium text-destructive">
                          {review.issues.filter((i) => i.severity === 'critical').length}
                        </span>
                        <span className="text-xs text-muted-foreground">/</span>
                        <span className="text-xs font-medium text-warning">
                          {review.issues.filter((i) => i.severity === 'important').length}
                        </span>
                        <span className="text-xs text-muted-foreground">/</span>
                        <span className="text-xs font-medium text-primary">
                          {review.issues.filter((i) => i.severity === 'optional').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
