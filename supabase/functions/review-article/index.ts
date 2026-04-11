import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

declare const EdgeRuntime: {
  waitUntil: (promise: Promise<unknown>) => void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const AI_MODEL = "google/gemini-3-flash-preview";

interface ReviewRow {
  id: string;
  title: string;
  article_content: string;
  icp_selection: Record<string, unknown>;
  primary_keyword: string | null;
  secondary_keywords: string[] | null;
  search_intent: string | null;
  funnel_stage: string | null;
  cta_goal: string | null;
  competitor_notes: string | null;
  reviewer_notes: string | null;
  status: string;
}

const STYLE_GUIDE = `CookieYes Content Style Guide — Blog Content Guidelines

VOICE AND TONE
- Empathetic, knowledgeable guide that demystifies privacy and cookie consent
- Formal tone, sometimes conversational — clarity is highest priority
- Use British English
- Be: Clear, Correct, Authentic, Simplified

GRAMMAR BASICS
- Write for all readers (skimmers and deep readers)
- Focus on message hierarchy
- Be concise with short words and sentences
- Be specific, avoid vague language

NUMBERS
- Spell out 1-10, use numerals for 11+
- Spell out numbers at start of sentence
- Use commas for 1,000+
- Use % symbol (64%)
- Date format: Day Month Year (1 January 2025)

CAPITALISATION
- Capitalise brand names, privacy law names, regions, frameworks
- Use MLA style for titles
- Sentence case for subheadings (H2, H3+)

PUNCTUATION
- Use serial comma (Oxford comma)
- En dash for ranges, em dashes for asides
- Semicolons sparingly
- Single quotes for quotes within quotes

LISTS
- Capitalise first word after bullet
- Periods for complete sentences, no period for short phrases

ACTIVE VOICE
- Use active voice for clear, direct statements
- Correct: "The website collects data via cookies"
- Incorrect: "Data is collected by the website"

CONTRACTIONS
- Acceptable ("You'll need consent before using tracking cookies")

PERSONAL PRONOUNS
- Use "you" to address reader directly
- Use "they/them/their" for unknown genders

WRITING ABOUT COOKIEYES
- Refer to company as "we" not "it"
- Capitalise branded terms: "CookieYes Consent Solution"
- Don't capitalise descriptive product names

TEXT FORMATTING
- Bold for emphasis
- Italics for titles, book names, legal cases
- Never underline, never all caps
- Left-align text, one space between sentences

WORD CHOICE
- Positive language over negative phrasing
- Plain English, avoid jargon
- File types in all caps without periods (PDF, JPG)

LINKS
- Link relevant keywords, never "click here"
- Don't link punctuation

HEADINGS
- H1 = main page title
- Sentence case for H2, H3+
- Title case for main navigation

SEO GUIDELINES
- One topic per page
- Clear section headings with target keywords
- Keyword-optimised alt text
- Minimum 2 internal links, maximum 2 external links
- URLs: short, simple, hyphens over underscores

PAGE FORMATTING
- Paragraphs: 3-5 sentences
- Subheadings every 200-300 words
- Descriptive alt text for all images
- 16:9 video aspect ratio
- Code snippets in markdown blocks

WORD LIST
- CookieYes (cap Y)
- GDPR, CCPA, etc. (all caps)
- Geo-targeting (hyphenated)
- Pageviews (one word)`;

function buildSystemPrompt() {
  return `You are the CookieYes Article Review Assistant — an expert editorial AI for B2B SaaS content review.

Your job is to review article drafts before publishing and produce a structured JSON editorial report.

STYLE GUIDE (apply to every review):
${STYLE_GUIDE}

SCORING: Rate each of the 13 categories from 0-10. Overall score = average of all categories × 10 (rounded).

CATEGORIES (use these exact IDs):
icp, audience, intent, seo, structure, geo, ai_visibility, topical, eeat, readability, style_guide, differentiation, conversion

CATEGORY RUBRICS (score each 0-10 with these exact criteria):

- icp: Does the article speak to the ICP's specific pain points and role? Penalise generic 'any business' framing. Reward ICP-specific examples and language.
- audience: Is the tone, vocabulary, and depth right for the reader's expertise level?
- intent: Does the content fully satisfy the search intent? Penalise intent mismatch heavily.
- seo: Keyword placement in H1/H2s, meta signals, internal linking opportunities, FAQ coverage.
- structure: Logical flow, subheadings every 200-300 words, scannable for skimmers AND deep readers.
- geo: Answer-first paragraphs, quotable standalone sentences, defined key terms, extractable FAQ answers. Would an AI summariser find clear answers here?
- ai_visibility: Is the article structured so LLMs can cite it? Clear claims, definitions, comparisons.
- topical: Does it cover the topic comprehensively? Are there obvious gaps a competitor would cover?
- eeat: Are claims sourced or backed by CookieYes data/expertise? Original insight beyond a Wikipedia summary?
- readability: Flesch score equivalent, sentence length, active voice, paragraph length (max 5 sentences).
- style_guide: British English, Oxford comma, sentence-case H2s, no passive voice, correct number formatting.
- differentiation: Does this article say something competitors don't? Is there a unique angle or original data?
- conversion: Is there a clear CTA matching the stated ctaGoal? Is it placed contextually, not just appended?

ICP SCORING RULES:
- Digital Agencies ICP: penalise content that ignores multi-client management, white-labelling, or agency compliance workflows.
- SMB/Regular Users ICP: penalise jargon. Reward plain-English step-by-step guidance.

ISSUE RULES: Surface 6-12 issues. Every critical and important issue MUST include an originalExcerpt (verbatim from the article) and an improvedVersion. Never flag an issue without evidence from the article text. Be brutal and specific — vague feedback like 'improve the introduction' is not acceptable.

CONTENT STRATEGY AUDIT (check every article for these — they are as important as style violations):

1. HOOK QUALITY: Does the opening paragraph create urgency and emotional stakes? A definition or generic context sentence is not a strong hook. Flag if the article opens without immediately communicating what the reader stands to lose or gain.

2. SEARCH INTENT SPLIT: Is the article trying to target more than one primary keyword intent? (e.g. GDPR + CCPA + agency guide all at once.) Flag this as a critical SEO issue if present. One article, one primary intent.

3. FEATURED SNIPPET READINESS: Are key definitions written as tight, self-contained 1-2 sentence answers that Google could extract? Verbose definitions that bury the answer fail this check.

4. MISSING CONTENT FORMATS: For how-to and guide articles, flag as important if any of these are missing:
   - TL;DR or summary checklist at the top
   - Downloadable template or checklist (flag as opportunity)
   - 'Mistakes to avoid' or 'Common pitfalls' section
   - FAQ section with question-based H2s or H3s

5. PRODUCT-LED INTEGRATION: CookieYes should appear naturally within the workflow being described, not appended at the end. Flag as important if the product is introduced only in the final 20% of the article. Identify the specific step or section where a natural product mention belongs.

6. UNVERIFIED STATISTICS: Flag any specific figures (fines, percentages, deadlines) that are not attributed to a source. These are legal and credibility risks, especially for GDPR/CCPA content where penalty amounts change.

7. READABILITY REALITY CHECK: Dense paragraphs are a real problem even if individual sentences are well-written. Flag if more than 3 consecutive paragraphs exceed 4 sentences. Do not give readability above 7/10 if this pattern exists.

SCORE DISCIPLINE:
- Overall score above 75 means the article is genuinely strong across content strategy AND style. Do not award this if the article has: a weak hook, missing content formats, poor product integration, or intent targeting issues.
- Audience depth above 8/10 requires the article to speak to the reader's emotional state and role-specific pressures, not just their technical needs.
- Readability above 8/10 requires short paragraphs, bold highlights, and visual breaks — not just grammatically correct sentences.
- An article can have perfect style guide compliance and still score 55 overall if the content strategy is weak. Style is not a substitute for editorial quality.

TONE: You are a brutally honest senior editor. Do not soften feedback. If the article is mediocre, say so. Score honestly — a score above 75 should be rare and earned.

SEVERITY LEVELS: critical, important, optional

PUBLISH READINESS:
- not_ready: score < 50
- needs_revision: score 50-69
- nearly_ready: score 70-84
- ready_to_publish: score >= 85

LEGAL SENSITIVITY: Flag any risky legal claims. CookieYes content touches GDPR/privacy law — flag statements that could be interpreted as legal advice.

Be direct, editorial, specific. Give exact examples. Prioritise practical fixes. No generic feedback.`;
}

function createAdminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function fetchReview(
  supabase: SupabaseClient,
  reviewId: string,
): Promise<ReviewRow | null> {
  const { data, error } = await supabase
    .from("article_reviews")
    .select("*")
    .eq("id", reviewId)
    .single();

  if (error || !data) {
    console.error("Failed to fetch review", reviewId, error);
    return null;
  }

  return data as ReviewRow;
}

async function updateReviewRecord(
  supabase: SupabaseClient,
  reviewId: string,
  updates: Record<string, unknown>,
) {
  const { error } = await supabase
    .from("article_reviews")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", reviewId);

  if (error) {
    console.error("Failed to update review", reviewId, error);
    throw error;
  }
}

function buildUserPrompt(input: {
  title: string;
  articleContent: string;
  icpSelection: Record<string, unknown>;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  searchIntent?: string;
  funnelStage?: string;
  ctaGoal?: string;
  competitorNotes?: string;
  reviewerNotes?: string;
}) {
  const wordCount = input.articleContent.split(/\s+/).length;
  let prompt = `Review this article:\n\nTITLE: ${input.title}\nARTICLE LENGTH: ~${wordCount} words. Review depth should match — for articles over 2000 words, surface issues across the full article, not just the introduction.\n\n`;

  const icp = input.icpSelection;
  const icpParts: string[] = [];
  if (icp.digitalAgencies) icpParts.push("Digital Agencies");
  if (icp.allRegularUsers) {
    const excluded = (icp.excludedSubtypes as string[]) || [];
    icpParts.push(excluded.length > 0 ? `All Regular Users except ${excluded.join(", ")}` : "All Regular Users");
  } else if ((icp.regularUserSubtypes as string[])?.length > 0) {
    icpParts.push(`Regular Users: ${(icp.regularUserSubtypes as string[]).join(", ")}`);
  }
  prompt += `TARGET ICP: ${icpParts.join(" + ") || "Not specified"}\n\n`;

  if (input.primaryKeyword) prompt += `PRIMARY KEYWORD: ${input.primaryKeyword}\n`;
  if (input.secondaryKeywords?.length) prompt += `SECONDARY KEYWORDS: ${input.secondaryKeywords.join(", ")}\n`;
  if (input.searchIntent) prompt += `SEARCH INTENT: ${input.searchIntent}\n`;
  if (input.funnelStage) prompt += `FUNNEL STAGE: ${input.funnelStage}\n`;
  if (input.ctaGoal) prompt += `CTA GOAL: ${input.ctaGoal}\n`;
  if (input.competitorNotes) prompt += `COMPETITOR NOTES: ${input.competitorNotes}\n`;
  if (input.reviewerNotes) prompt += `REVIEWER NOTES: ${input.reviewerNotes}\n`;

  prompt += `\nARTICLE CONTENT:\n${input.articleContent}`;
  return prompt;
}

async function runStructuredReview(review: ReviewRow) {
  const wordCount = review.article_content.split(/\s+/).length;
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  const aiResponse = await fetch(AI_GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        {
          role: "user",
          content: buildUserPrompt({
            title: review.title,
            articleContent: review.article_content,
            icpSelection: review.icp_selection,
            primaryKeyword: review.primary_keyword ?? undefined,
            secondaryKeywords: review.secondary_keywords ?? undefined,
            searchIntent: review.search_intent ?? undefined,
            funnelStage: review.funnel_stage ?? undefined,
            ctaGoal: review.cta_goal ?? undefined,
            competitorNotes: review.competitor_notes ?? undefined,
            reviewerNotes: review.reviewer_notes ?? undefined,
          }),
        },
      ],
      tools: [REVIEW_TOOL],
      tool_choice: { type: "function", function: { name: "submit_review" } },
    }),
  });

  if (!aiResponse.ok) {
    const errText = await aiResponse.text();
    console.error("AI gateway error:", aiResponse.status, errText);

    if (aiResponse.status === 429) {
      throw new Error("Rate limited — please try again in a moment.");
    }

    if (aiResponse.status === 402) {
      throw new Error("AI credits exhausted — please add funds.");
    }

    throw new Error(`AI error (${aiResponse.status})`);
  }

  const aiData = await aiResponse.json();
  const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

  if (!toolCall?.function?.arguments) {
    throw new Error("AI returned unexpected format");
  }

  try {
    return JSON.parse(toolCall.function.arguments);
  } catch (error) {
    console.error("Failed to parse AI tool response", error, toolCall.function.arguments);
    throw new Error("AI returned invalid review data");
  }
}

const REVIEW_TOOL = {
  type: "function" as const,
  function: {
    name: "submit_review",
    description: "Submit the structured editorial review of the article.",
    parameters: {
      type: "object",
      properties: {
        overallScore: { type: "number", description: "Overall score out of 100" },
        publishReadiness: { type: "string", enum: ["not_ready", "needs_revision", "nearly_ready", "ready_to_publish"] },
        editorialVerdict: { type: "string", description: "2-3 sentence editorial summary" },
        strengths: { type: "array", items: { type: "string" }, description: "3-5 key strengths" },
        weaknesses: { type: "array", items: { type: "string" }, description: "3-5 key weaknesses" },
        inferredInputs: {
          type: "object",
          properties: {
            primaryKeyword: { type: "string" },
            searchIntent: { type: "string" },
            audienceAssumptions: { type: "string" },
            articleType: { type: "string" },
          },
        },
        categoryScores: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              score: { type: "number" },
              maxScore: { type: "number", description: "Always 10" },
              working: { type: "array", items: { type: "string" } },
              missing: { type: "array", items: { type: "string" } },
              whyItMatters: { type: "string" },
              nextSteps: { type: "array", items: { type: "string" } },
            },
            required: ["id", "name", "score", "maxScore", "working", "missing", "whyItMatters", "nextSteps"],
          },
        },
        issues: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              severity: { type: "string", enum: ["critical", "important", "optional"] },
              category: { type: "string" },
              title: { type: "string" },
              description: { type: "string" },
              suggestion: { type: "string" },
              originalExcerpt: { type: "string" },
              improvedVersion: { type: "string" },
              rationale: { type: "string" },
            },
            required: ["id", "severity", "category", "title", "description"],
          },
        },
        styleGuideViolations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              severity: { type: "string", enum: ["critical", "important", "optional"] },
              category: { type: "string" },
              title: { type: "string" },
              description: { type: "string" },
              originalExcerpt: { type: "string" },
              improvedVersion: { type: "string" },
            },
            required: ["id", "severity", "category", "title", "description"],
          },
        },
        rewriteSuggestions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              severity: { type: "string", enum: ["critical", "important", "optional"] },
              category: { type: "string" },
              title: { type: "string" },
              description: { type: "string" },
              originalExcerpt: { type: "string" },
              improvedVersion: { type: "string" },
              rationale: { type: "string" },
            },
            required: ["id", "severity", "category", "title", "description"],
          },
        },
        seoRecommendations: {
          type: "object",
          properties: {
            titleSuggestions: { type: "array", items: { type: "string" } },
            h1Suggestion: { type: "string" },
            metaDescription: { type: "string" },
            faqIdeas: { type: "array", items: { type: "string" } },
            schemaOpportunities: { type: "array", items: { type: "string" } },
            internalLinkingSuggestions: { type: "array", items: { type: "string" } },
          },
        },
        geoRecommendations: {
          type: "object",
          properties: {
            missingSummaryBlocks: { type: "array", items: { type: "string" } },
            missingFaqs: { type: "array", items: { type: "string" } },
            missingDefinitions: { type: "array", items: { type: "string" } },
            missingComparisons: { type: "array", items: { type: "string" } },
            missingAnswerFirst: { type: "array", items: { type: "string" } },
            missingQuoteFriendly: { type: "array", items: { type: "string" } },
          },
        },
        competitorAnalysis: {
          type: "object",
          properties: {
            overallComparison: { type: "string", enum: ["weaker", "comparable", "stronger"] },
            competitorStrengths: { type: "array", items: { type: "string" } },
            articleStrengths: { type: "array", items: { type: "string" } },
            opportunities: { type: "array", items: { type: "string" } },
            explanation: { type: "string" },
          },
        },
        actionPlan: { type: "array", items: { type: "string" }, description: "Top 10 edits in priority order" },
        legalFlags: {
          type: "array",
          items: {
            type: "object",
            properties: {
              excerpt: { type: "string" },
              risk: { type: "string" },
              suggestion: { type: "string" },
            },
            required: ["excerpt", "risk", "suggestion"],
          },
          description: "Any statements that could be interpreted as legal advice or make unqualified legal claims. CookieYes content touches GDPR/privacy law — flag aggressively.",
        },
      },
      required: [
        "overallScore", "publishReadiness", "editorialVerdict", "strengths", "weaknesses",
        "inferredInputs", "categoryScores", "issues", "styleGuideViolations", "rewriteSuggestions",
        "seoRecommendations", "geoRecommendations", "actionPlan",
      ],
    },
  },
};

async function processReviewInBackground(reviewId: string) {
  const supabase = createAdminClient();

  try {
    const review = await fetchReview(supabase, reviewId);

    if (!review) {
      throw new Error("Review not found");
    }

    const reviewResult = await runStructuredReview(review);

    await updateReviewRecord(supabase, reviewId, {
      status: "completed",
      review_result: reviewResult,
      error_message: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("review-article background error:", reviewId, error);

    await updateReviewRecord(supabase, reviewId, {
      status: "failed",
      error_message: message,
    });
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    const body = await req.json().catch(() => null);
    const reviewId = typeof body?.reviewId === "string" ? body.reviewId.trim() : "";

    if (!reviewId) {
      return jsonResponse({ error: "reviewId is required" }, 400);
    }

    const supabase = createAdminClient();
    const review = await fetchReview(supabase, reviewId);

    if (!review) {
      return jsonResponse({ error: "Review not found" }, 404);
    }

    if (review.status === "completed") {
      return jsonResponse({ success: true, reviewId, status: "completed", message: "Review already completed" });
    }

    if (review.status === "processing") {
      return jsonResponse({ success: true, reviewId, status: "processing", message: "Review is already processing" }, 202);
    }

    await updateReviewRecord(supabase, reviewId, {
      status: "processing",
      error_message: null,
    });

    EdgeRuntime.waitUntil(processReviewInBackground(reviewId));

    return jsonResponse(
      { success: true, reviewId, status: "processing", message: "Review processing started" },
      202,
    );
  } catch (e) {
    console.error("review-article request error:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
