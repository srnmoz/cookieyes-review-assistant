import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScoreCircle, ScoreBar } from '@/components/ScoreCircle';
import { SeverityBadge, ReadinessBadge, StatusBadge } from '@/components/SeverityBadge';
import { sampleReviews } from '@/lib/sample-data';
import { fetchReview, mapRowToReviewResult, triggerReview, deleteReview, rerunReview } from '@/lib/api';
import type { ReviewResult, Severity, LegalFlag } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, Copy, ChevronDown, ChevronRight,
  CheckCircle2, XCircle, Lightbulb, Target, Search, BarChart3,
  Brain, Eye, BookOpen, Shield, Type, Swords, Zap, FileText, Loader2, AlertTriangle, ExternalLink,
} from 'lucide-react';
import { Download, Share2, Printer, FileJson, Trash2, RefreshCw } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { downloadMarkdown, downloadJson, downloadPdf, copyShareLink } from '@/lib/report-export';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SECTION_IDS = [
  'summary', 'inferred', 'priorities', 'scores', 'issues',
  'style-guide', 'legal', 'rewrites', 'seo', 'geo', 'competitors', 'action-plan',
] as const;

const SECTION_LABELS: Record<string, string> = {
  summary: 'Summary',
  inferred: 'Inferred Inputs',
  priorities: 'Top Priorities',
  scores: 'Scorecards',
  issues: 'Issues',
  'style-guide': 'Style Guide',
  legal: 'Legal Flags',
  rewrites: 'Rewrites',
  seo: 'SEO',
  geo: 'GEO',
  competitors: 'Competitors',
  'action-plan': 'Action Plan',
};

const CATEGORY_ICONS: Record<string, typeof Target> = {
  icp: Target, audience: Target, intent: Search, seo: BarChart3,
  structure: FileText, geo: Brain, ai_visibility: Eye, topical: BookOpen,
  eeat: Shield, readability: Type, style_guide: BookOpen,
  differentiation: Swords, conversion: Zap,
};

function IssueCard({ issue }: { issue: ReviewResult['issues'][0] }) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-muted/30 cursor-pointer transition-colors">
          <div className="mt-0.5">
            {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <SeverityBadge severity={issue.severity} />
              <span className="text-xs text-muted-foreground">{issue.category}</span>
            </div>
            <p className="text-sm font-medium text-foreground">{issue.title}</p>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-7 pl-4 border-l-2 border-border mt-2 mb-4 space-y-3">
          <p className="text-sm text-muted-foreground">{issue.description}</p>
          {issue.originalExcerpt && (
            <div className="p-3 rounded bg-destructive/5 border border-destructive/10">
              <p className="text-xs font-medium text-destructive mb-1">Original</p>
              <p className="text-sm text-foreground italic">"{issue.originalExcerpt}"</p>
            </div>
          )}
          {issue.improvedVersion && (
            <div className="p-3 rounded bg-success/5 border border-success/10">
              <p className="text-xs font-medium text-success mb-1">Suggested</p>
              <p className="text-sm text-foreground">"{issue.improvedVersion}"</p>
            </div>
          )}
          {issue.rationale && (
            <p className="text-xs text-muted-foreground"><strong>Why:</strong> {issue.rationale}</p>
          )}
          {issue.suggestion && !issue.improvedVersion && (
            <p className="text-sm text-muted-foreground"><Lightbulb className="w-3.5 h-3.5 inline mr-1 text-warning" />{issue.suggestion}</p>
          )}
          <Button variant="ghost" size="sm" className="text-xs" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(issue.improvedVersion || issue.suggestion || issue.description); }}>
            <Copy className="w-3 h-3 mr-1" /> Copy suggestion
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function ReviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('summary');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasTriggeredQueuedReviewRef = useRef(false);
  const { toast } = useToast();

  const isSample = sampleReviews.some((s) => s.id === id);

  const handleDelete = async () => {
    if (!id || isSample) return;
    try {
      await deleteReview(id);
      toast({ title: 'Deleted', description: 'Review has been removed.' });
      navigate('/reviews');
    } catch {
      toast({ title: 'Error', description: 'Failed to delete review.', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (!id) return;

    // First check sample data
    const sample = sampleReviews.find((r) => r.id === id);
    if (sample) {
      setReview(sample);
      setStatus('completed');
      setLoading(false);
      return;
    }

    // Otherwise poll the database
    const poll = async () => {
      const row = await fetchReview(id);
      if (!row) {
        setStatus('not_found');
        setLoading(false);
        return;
      }

      setStatus(row.status);

      if (row.status === 'queued' && !hasTriggeredQueuedReviewRef.current) {
        hasTriggeredQueuedReviewRef.current = true;
        triggerReview(id).catch((err) => {
          console.error('Review trigger error:', err);
        });
      }

      if (row.status === 'completed') {
        const mapped = mapRowToReviewResult(row);
        if (mapped) setReview(mapped);
        setLoading(false);
        if (pollRef.current) clearInterval(pollRef.current);
      } else if (row.status === 'failed') {
        setErrorMessage(row.error_message);
        setLoading(false);
        if (pollRef.current) clearInterval(pollRef.current);
      }
    };

    poll();
    pollRef.current = setInterval(poll, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [id]);

  if (loading || status === 'queued' || status === 'processing') {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">Analyzing your article...</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {status === 'queued' ? 'Queued for review' : 'AI is reviewing your content'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Large articles can take several minutes. This page refreshes automatically.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (status === 'failed') {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <XCircle className="w-10 h-10 text-destructive" />
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">Review Failed</h2>
            <p className="text-sm text-muted-foreground mt-1">{errorMessage || 'An unexpected error occurred.'}</p>
          </div>
          <Button asChild><Link to="/new-review">Try Again</Link></Button>
        </div>
      </AppLayout>
    );
  }

  if (!review) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Review not found.</p>
          <Button asChild className="mt-4"><Link to="/">Back to Dashboard</Link></Button>
        </div>
      </AppLayout>
    );
  }

  const issuesBySeverity = (severity: Severity) => review.issues.filter((i) => i.severity === severity);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <AppLayout>
      <div className="flex">
        {/* Sticky sidebar nav */}
        <div className="w-48 flex-shrink-0 border-r border-border p-4 sticky top-0 h-screen overflow-y-auto">
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
            <Link to="/"><ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back</Link>
          </Button>

          {review && (
            <div className="mb-4 space-y-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                    <Download className="w-3.5 h-3.5" /> Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => { downloadMarkdown(review); toast({ title: 'Downloaded', description: 'Markdown report saved' }); }}>
                    <FileText className="w-3.5 h-3.5 mr-2" /> Markdown (.md)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { downloadJson(review); toast({ title: 'Downloaded', description: 'JSON report saved' }); }}>
                    <FileJson className="w-3.5 h-3.5 mr-2" /> JSON (.json)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { downloadPdf(review); toast({ title: 'Downloaded', description: 'PDF report saved' }); }}>
                    <FileText className="w-3.5 h-3.5 mr-2" /> PDF (.pdf)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-xs"
                onClick={() => { copyShareLink(); toast({ title: 'Link copied', description: 'Share link copied to clipboard' }); }}
              >
                <Share2 className="w-3.5 h-3.5" /> Copy Link
              </Button>

              {!isSample && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                      <RefreshCw className="w-3.5 h-3.5" /> Re-review
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Re-review article?</AlertDialogTitle>
                      <AlertDialogDescription>This will overwrite the current review result. Continue?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={async () => {
                        try {
                          await rerunReview(id!);
                          setReview(null);
                          setStatus('queued');
                          setLoading(true);
                          hasTriggeredQueuedReviewRef.current = false;
                          toast({ title: 'Re-review started', description: 'The article is being re-analysed.' });
                        } catch {
                          toast({ title: 'Error', description: 'Failed to start re-review.', variant: 'destructive' });
                        }
                      }}>Re-review</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {!isSample && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs text-destructive hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" /> Delete Review
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete review?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently delete this review. This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}

          <nav className="space-y-0.5">
            {SECTION_IDS.map((sid) => (
              <button
                key={sid}
                onClick={() => scrollToSection(sid)}
                className={cn(
                  'block w-full text-left px-3 py-1.5 rounded text-xs font-medium transition-colors',
                  activeSection === sid ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {SECTION_LABELS[sid]}
              </button>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8 max-w-4xl space-y-8">
          {/* Executive Summary */}
          <section id="summary">
            <Card className="p-6">
              <div className="flex items-start gap-6">
                <ScoreCircle score={review.overallScore} size="lg" showLabel />
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-foreground">{review.articleTitle}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <ReadinessBadge readiness={review.publishReadiness} />
                    <StatusBadge status={review.status} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">{review.editorialVerdict}</p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-xs font-semibold text-success mb-1.5">Strengths</p>
                      <ul className="space-y-1">
                        {review.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-destructive mb-1.5">Weaknesses</p>
                      <ul className="space-y-1">
                        {review.weaknesses.map((w, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                            <XCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Inferred Inputs */}
          <section id="inferred">
            <h2 className="text-lg font-semibold text-foreground mb-3">Inferred Inputs</h2>
            <Card className="p-5">
              <div className="grid grid-cols-2 gap-4">
                {review.inferredInputs.primaryKeyword && (
                  <div><p className="text-xs text-muted-foreground">Primary Keyword</p><p className="text-sm font-medium text-foreground mt-0.5">{review.inferredInputs.primaryKeyword}</p></div>
                )}
                {review.inferredInputs.searchIntent && (
                  <div><p className="text-xs text-muted-foreground">Search Intent</p><p className="text-sm font-medium text-foreground mt-0.5">{review.inferredInputs.searchIntent}</p></div>
                )}
                {review.inferredInputs.audienceAssumptions && (
                  <div><p className="text-xs text-muted-foreground">Audience</p><p className="text-sm font-medium text-foreground mt-0.5">{review.inferredInputs.audienceAssumptions}</p></div>
                )}
                {review.inferredInputs.articleType && (
                  <div><p className="text-xs text-muted-foreground">Article Type</p><p className="text-sm font-medium text-foreground mt-0.5">{review.inferredInputs.articleType}</p></div>
                )}
              </div>
            </Card>
          </section>

          {/* Top Priorities */}
          <section id="priorities">
            <h2 className="text-lg font-semibold text-foreground mb-3">Top Priorities</h2>
            <div className="space-y-2">
              {review.actionPlan.slice(0, 3).map((action, i) => (
                <Card key={i} className="p-4 flex items-center gap-3 border-l-4 border-l-primary">
                  <span className="text-sm font-bold text-primary w-6">{i + 1}</span>
                  <p className="text-sm text-foreground">{action}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* Category Scorecards */}
          <section id="scores">
            <h2 className="text-lg font-semibold text-foreground mb-3">Category Scorecards</h2>
            <div className="grid grid-cols-1 gap-3">
              {review.categoryScores.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.id] || Target;
                return (
                  <Collapsible key={cat.id}>
                    <CollapsibleTrigger asChild>
                      <Card className="p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground flex-1">{cat.name}</span>
                          <div className="w-40">
                            <ScoreBar score={cat.score} maxScore={cat.maxScore} />
                          </div>
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </Card>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-4 pl-4 border-l-2 border-border py-3 space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-success mb-1">Working</p>
                          <ul className="space-y-0.5">{cat.working.map((w, i) => <li key={i} className="text-xs text-muted-foreground">• {w}</li>)}</ul>
                        </div>
                        {cat.missing.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-destructive mb-1">Missing</p>
                            <ul className="space-y-0.5">{cat.missing.map((m, i) => <li key={i} className="text-xs text-muted-foreground">• {m}</li>)}</ul>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Why it matters</p>
                          <p className="text-xs text-muted-foreground">{cat.whyItMatters}</p>
                        </div>
                        {cat.nextSteps.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-primary mb-1">Next steps</p>
                            <ul className="space-y-0.5">{cat.nextSteps.map((n, i) => <li key={i} className="text-xs text-muted-foreground">→ {n}</li>)}</ul>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </section>

          {/* Issues by Severity */}
          <section id="issues">
            <h2 className="text-lg font-semibold text-foreground mb-3">Issues</h2>
            {(['critical', 'important', 'optional'] as Severity[]).map((sev) => {
              const items = issuesBySeverity(sev);
              if (items.length === 0) return null;
              return (
                <div key={sev} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <SeverityBadge severity={sev} />
                    <span className="text-xs text-muted-foreground">({items.length})</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
                  </div>
                </div>
              );
            })}
          </section>

          {/* Style Guide Violations */}
          <section id="style-guide">
            <h2 className="text-lg font-semibold text-foreground mb-3">Style Guide Compliance</h2>
            <div className="space-y-2">
              {review.styleGuideViolations.map((v) => <IssueCard key={v.id} issue={v} />)}
              {review.styleGuideViolations.length === 0 && (
                <Card className="p-4 text-center">
                  <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No style guide violations found</p>
                </Card>
              )}
            </div>
          </section>

          {/* Legal Flags */}
          <section id="legal">
            <h2 className="text-lg font-semibold text-foreground mb-3">Legal Flags</h2>
            <div className="space-y-2">
              {(review.legalFlags ?? []).map((flag, i) => (
                <Card key={i} className="p-4 border-destructive/40 border-2">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="space-y-2 flex-1">
                      <div className="p-3 rounded bg-destructive/5">
                        <p className="text-xs font-medium text-destructive mb-1">Excerpt</p>
                        <p className="text-sm text-foreground italic">"{flag.excerpt}"</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-destructive mb-0.5">Risk</p>
                        <p className="text-sm text-muted-foreground">{flag.risk}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-primary mb-0.5">Suggestion</p>
                        <p className="text-sm text-muted-foreground">{flag.suggestion}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {(!review.legalFlags || review.legalFlags.length === 0) && (
                <Card className="p-4 text-center">
                  <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No legal flags found</p>
                </Card>
              )}
            </div>
          </section>

          {/* Rewrite Suggestions */}
          <section id="rewrites">
            <h2 className="text-lg font-semibold text-foreground mb-3">Rewrite Suggestions</h2>
            <div className="space-y-2">
              {review.rewriteSuggestions.map((rw) => <IssueCard key={rw.id} issue={rw} />)}
              {review.rewriteSuggestions.length === 0 && (
                <Card className="p-4 text-center text-sm text-muted-foreground">No major rewrite suggestions.</Card>
              )}
            </div>
          </section>

          {/* SEO Recommendations */}
          <section id="seo">
            <h2 className="text-lg font-semibold text-foreground mb-3">SEO Recommendations</h2>
            <Card className="p-5 space-y-4">
              {review.seoRecommendations.titleSuggestions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Title Suggestions</p>
                  {review.seoRecommendations.titleSuggestions.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-foreground flex-1">{t}</p>
                      <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigator.clipboard.writeText(t)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {review.seoRecommendations.h1Suggestion && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">H1 Suggestion</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-foreground flex-1">{review.seoRecommendations.h1Suggestion}</p>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigator.clipboard.writeText(review.seoRecommendations.h1Suggestion!)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
              {review.seoRecommendations.metaDescription && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Meta Description</p>
                  <div className="flex items-start gap-2">
                    <p className="text-sm text-foreground flex-1">{review.seoRecommendations.metaDescription}</p>
                    <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(review.seoRecommendations.metaDescription!)} >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
              {review.seoRecommendations.faqIdeas.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">FAQ Ideas</p>
                  <ul className="space-y-0.5">{review.seoRecommendations.faqIdeas.map((f, i) => <li key={i} className="text-sm text-muted-foreground">• {f}</li>)}</ul>
                </div>
              )}
              {review.seoRecommendations.internalLinkingSuggestions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Internal Linking</p>
                  <ul className="space-y-0.5">{review.seoRecommendations.internalLinkingSuggestions.map((l, i) => <li key={i} className="text-sm text-muted-foreground">→ {l}</li>)}</ul>
                </div>
              )}
            </Card>
          </section>

          {/* GEO Recommendations */}
          <section id="geo">
            <h2 className="text-lg font-semibold text-foreground mb-3">GEO Recommendations</h2>
            <Card className="p-5 space-y-4">
              {Object.entries({
                'Missing Summary Blocks': review.geoRecommendations.missingSummaryBlocks,
                'Missing FAQs': review.geoRecommendations.missingFaqs,
                'Missing Definitions': review.geoRecommendations.missingDefinitions,
                'Missing Comparisons': review.geoRecommendations.missingComparisons,
                'Missing Answer-First Sections': review.geoRecommendations.missingAnswerFirst,
                'Missing Quote-Friendly Lines': review.geoRecommendations.missingQuoteFriendly,
              }).map(([label, items]) => items.length > 0 ? (
                <div key={label}>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
                  <ul className="space-y-0.5">{items.map((item, i) => <li key={i} className="text-sm text-muted-foreground">• {item}</li>)}</ul>
                </div>
              ) : null)}
            </Card>
          </section>

          {/* Competitor Analysis */}
          {review.competitorAnalysis && (
            <section id="competitors">
              <h2 className="text-lg font-semibold text-foreground mb-3">Competitor Gap Analysis</h2>
              {review.competitorUrls && review.competitorUrls.length > 0 && (
                <Card className="p-4 mb-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Compared Against</p>
                  <div className="flex flex-wrap gap-2">
                    {review.competitorUrls.map((url, i) => (
                      <a
                        key={i}
                        href={url.startsWith('http') ? url : `https://${url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline truncate max-w-[260px]"
                        title={url}
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        {url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </a>
                    ))}
                  </div>
                </Card>
              )}
              <Card className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Overall:</span>
                  <span className={cn('text-sm font-semibold capitalize',
                    review.competitorAnalysis.overallComparison === 'stronger' ? 'text-success' :
                    review.competitorAnalysis.overallComparison === 'weaker' ? 'text-destructive' : 'text-warning'
                  )}>
                    {review.competitorAnalysis.overallComparison}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{review.competitorAnalysis.explanation}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-destructive mb-1">Competitor Does Better</p>
                    <ul className="space-y-0.5">{review.competitorAnalysis.competitorStrengths.map((s, i) => <li key={i} className="text-xs text-muted-foreground">• {s}</li>)}</ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-success mb-1">This Article Does Better</p>
                    <ul className="space-y-0.5">{review.competitorAnalysis.articleStrengths.map((s, i) => <li key={i} className="text-xs text-muted-foreground">• {s}</li>)}</ul>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary mb-1">Opportunities</p>
                  <ul className="space-y-0.5">{review.competitorAnalysis.opportunities.map((o, i) => <li key={i} className="text-sm text-muted-foreground">→ {o}</li>)}</ul>
                </div>
              </Card>
            </section>
          )}

          {/* Action Plan */}
          <section id="action-plan">
            <h2 className="text-lg font-semibold text-foreground mb-3">Final Action Plan</h2>
            <Card className="p-5">
              <ol className="space-y-2">
                {review.actionPlan.map((action, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                      i < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    )}>
                      {i + 1}
                    </span>
                    <p className="text-sm text-foreground pt-0.5">{action}</p>
                  </li>
                ))}
              </ol>
            </Card>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
