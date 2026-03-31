export type IcpGroup = 'digital_agencies' | 'regular_users';
export type RegularUserSubtype = 'marketers' | 'developers' | 'ceos_founders' | 'privacy_officers' | 'website_owners';

export interface IcpSelection {
  digitalAgencies: boolean;
  allRegularUsers: boolean;
  regularUserSubtypes: RegularUserSubtype[];
  excludedSubtypes: RegularUserSubtype[];
}

export type ReviewStatus = 'draft_review' | 'in_revision' | 'approved';
export type PublishReadiness = 'not_ready' | 'needs_revision' | 'nearly_ready' | 'ready_to_publish';
export type Severity = 'critical' | 'important' | 'optional';
export type SearchIntent = 'informational' | 'navigational' | 'commercial' | 'transactional';
export type FunnelStage = 'awareness' | 'consideration' | 'decision' | 'retention';

export interface ArticleInput {
  title: string;
  content: string;
  contentSource: 'upload' | 'paste';
  fileName?: string;
  icpSelection: IcpSelection;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  searchIntent?: SearchIntent;
  funnelStage?: FunnelStage;
  ctaGoal?: string;
  competitorUrls?: string[];
  competitorNotes?: string;
  reviewerNotes?: string;
}

export interface CategoryScore {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  working: string[];
  missing: string[];
  whyItMatters: string;
  nextSteps: string[];
}

export interface ReviewIssue {
  id: string;
  severity: Severity;
  category: string;
  title: string;
  description: string;
  suggestion?: string;
  originalExcerpt?: string;
  improvedVersion?: string;
  rationale?: string;
}

export interface InferredInputs {
  primaryKeyword?: string;
  searchIntent?: string;
  audienceAssumptions?: string;
  articleType?: string;
}

export interface CompetitorAnalysis {
  overallComparison: 'weaker' | 'comparable' | 'stronger';
  competitorStrengths: string[];
  articleStrengths: string[];
  opportunities: string[];
  explanation: string;
}

export interface SeoRecommendation {
  titleSuggestions: string[];
  h1Suggestion?: string;
  metaDescription?: string;
  faqIdeas: string[];
  schemaOpportunities: string[];
  internalLinkingSuggestions: string[];
}

export interface GeoRecommendation {
  missingSummaryBlocks: string[];
  missingFaqs: string[];
  missingDefinitions: string[];
  missingComparisons: string[];
  missingAnswerFirst: string[];
  missingQuoteFriendly: string[];
}

export interface ReviewResult {
  id: string;
  articleTitle: string;
  overallScore: number;
  publishReadiness: PublishReadiness;
  editorialVerdict: string;
  strengths: string[];
  weaknesses: string[];
  inferredInputs: InferredInputs;
  categoryScores: CategoryScore[];
  issues: ReviewIssue[];
  styleGuideViolations: ReviewIssue[];
  seoRecommendations: SeoRecommendation;
  geoRecommendations: GeoRecommendation;
  competitorAnalysis?: CompetitorAnalysis;
  actionPlan: string[];
  rewriteSuggestions: ReviewIssue[];
  status: ReviewStatus;
  createdAt: string;
  icpSelection: IcpSelection;
}

export const REGULAR_USER_SUBTYPES: { value: RegularUserSubtype; label: string }[] = [
  { value: 'marketers', label: 'Marketers' },
  { value: 'developers', label: 'Developers' },
  { value: 'ceos_founders', label: 'CEOs / Founders' },
  { value: 'privacy_officers', label: 'Privacy Officers' },
  { value: 'website_owners', label: 'Website Owners' },
];

export const PUBLISH_READINESS_CONFIG: Record<PublishReadiness, { label: string; className: string }> = {
  not_ready: { label: 'Not Ready', className: 'severity-critical' },
  needs_revision: { label: 'Needs Revision', className: 'severity-important' },
  nearly_ready: { label: 'Nearly Ready', className: 'severity-optional' },
  ready_to_publish: { label: 'Ready to Publish', className: 'bg-success/10 text-success border-success/20' },
};

export const SEVERITY_CONFIG: Record<Severity, { label: string; className: string }> = {
  critical: { label: 'Critical', className: 'severity-critical' },
  important: { label: 'Important', className: 'severity-important' },
  optional: { label: 'Optional', className: 'severity-optional' },
};

export const REVIEW_STATUS_CONFIG: Record<ReviewStatus, { label: string; className: string }> = {
  draft_review: { label: 'Draft Review', className: 'bg-muted text-muted-foreground' },
  in_revision: { label: 'In Revision', className: 'severity-important' },
  approved: { label: 'Approved', className: 'bg-success/10 text-success' },
};
