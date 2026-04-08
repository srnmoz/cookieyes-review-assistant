import { supabase } from "@/integrations/supabase/client";
import type { ReviewResult, IcpSelection } from "./types";

const sanitizeTextForDatabase = (value?: string | null) => value?.replace(/\u0000/g, "");

export interface CreateReviewInput {
  title: string;
  articleContent: string;
  contentSource: "upload" | "paste";
  fileName?: string;
  icpSelection: IcpSelection;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  searchIntent?: string;
  funnelStage?: string;
  ctaGoal?: string;
  competitorUrls?: string[];
  competitorNotes?: string;
  reviewerNotes?: string;
}

export async function createReview(input: CreateReviewInput): Promise<string> {
  const insertData: Record<string, unknown> = {
    title: sanitizeTextForDatabase(input.title) ?? input.title,
    article_content: sanitizeTextForDatabase(input.articleContent) ?? input.articleContent,
    content_source: input.contentSource,
    file_name: sanitizeTextForDatabase(input.fileName) || null,
    icp_selection: input.icpSelection,
    primary_keyword: sanitizeTextForDatabase(input.primaryKeyword) || null,
    secondary_keywords: input.secondaryKeywords?.length ? input.secondaryKeywords : null,
    search_intent: sanitizeTextForDatabase(input.searchIntent) || null,
    funnel_stage: sanitizeTextForDatabase(input.funnelStage) || null,
    cta_goal: sanitizeTextForDatabase(input.ctaGoal) || null,
    competitor_urls: input.competitorUrls?.length ? input.competitorUrls : null,
    competitor_notes: sanitizeTextForDatabase(input.competitorNotes) || null,
    reviewer_notes: sanitizeTextForDatabase(input.reviewerNotes) || null,
    status: "queued",
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase
    .from("article_reviews")
    .insert(insertData as any)
    .select("id")
    .single();

  if (error) {
    console.error("createReview error:", error);
    throw new Error(error.message);
  }
  return data.id;
}

export interface TriggerReviewResponse {
  success: boolean;
  reviewId: string;
  status: string;
  message?: string;
}

export async function triggerReview(reviewId: string): Promise<TriggerReviewResponse> {
  const { data, error } = await supabase.functions.invoke("review-article", {
    body: { reviewId },
  });
  if (error) throw new Error(error.message);
  return (data ?? { success: true, reviewId, status: "processing" }) as TriggerReviewResponse;
}

export interface ReviewRow {
  id: string;
  title: string;
  status: string;
  review_result: ReviewResult | null;
  icp_selection: IcpSelection;
  created_at: string;
  error_message: string | null;
}

export async function fetchReview(id: string): Promise<ReviewRow | null> {
  const { data, error } = await supabase
    .from("article_reviews")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as unknown as ReviewRow;
}

export async function fetchAllReviews(): Promise<ReviewRow[]> {
  const { data, error } = await supabase
    .from("article_reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data || []) as unknown as ReviewRow[];
}

export function mapRowToReviewResult(row: ReviewRow): ReviewResult | null {
  if (!row.review_result) return null;
  const r = row.review_result;
  return {
    id: row.id,
    articleTitle: row.title,
    overallScore: r.overallScore ?? 0,
    publishReadiness: r.publishReadiness ?? "not_ready",
    editorialVerdict: r.editorialVerdict ?? "",
    strengths: r.strengths ?? [],
    weaknesses: r.weaknesses ?? [],
    inferredInputs: r.inferredInputs ?? {},
    categoryScores: r.categoryScores ?? [],
    issues: r.issues ?? [],
    styleGuideViolations: r.styleGuideViolations ?? [],
    seoRecommendations: r.seoRecommendations ?? { titleSuggestions: [], faqIdeas: [], schemaOpportunities: [], internalLinkingSuggestions: [] },
    geoRecommendations: r.geoRecommendations ?? { missingSummaryBlocks: [], missingFaqs: [], missingDefinitions: [], missingComparisons: [], missingAnswerFirst: [], missingQuoteFriendly: [] },
    competitorAnalysis: r.competitorAnalysis,
    actionPlan: r.actionPlan ?? [],
    rewriteSuggestions: r.rewriteSuggestions ?? [],
    status: "draft_review",
    createdAt: row.created_at,
    icpSelection: row.icp_selection,
  };
}
