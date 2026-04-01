import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScoreCircle } from '@/components/ScoreCircle';
import { StatusBadge, ReadinessBadge } from '@/components/SeverityBadge';
import { sampleReviews } from '@/lib/sample-data';
import { fetchAllReviews, mapRowToReviewResult } from '@/lib/api';
import type { ReviewResult } from '@/lib/types';
import { FilePlus, Loader2 } from 'lucide-react';

export default function SavedReviews() {
  const [dbReviews, setDbReviews] = useState<ReviewResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllReviews().then((rows) => {
      const mapped = rows
        .filter((r) => r.status === 'completed')
        .map(mapRowToReviewResult)
        .filter(Boolean) as ReviewResult[];
      setDbReviews(mapped);
      setLoading(false);
    });
  }, []);

  const allReviews = [...dbReviews, ...sampleReviews];

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Saved Reviews</h1>
            <p className="text-sm text-muted-foreground mt-1">{allReviews.length} reviews</p>
          </div>
          <Button asChild>
            <Link to="/new-review"><FilePlus className="w-4 h-4 mr-2" />New Review</Link>
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
                      <div className="flex items-center gap-2 mt-2">
                        <ReadinessBadge readiness={review.publishReadiness} />
                        <StatusBadge status={review.status} />
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
