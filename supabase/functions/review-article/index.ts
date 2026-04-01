import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

SEVERITY LEVELS: critical, important, optional

PUBLISH READINESS:
- not_ready: score < 50
- needs_revision: score 50-69
- nearly_ready: score 70-84
- ready_to_publish: score >= 85

LEGAL SENSITIVITY: Flag any risky legal claims. CookieYes content touches GDPR/privacy law — flag statements that could be interpreted as legal advice.

Be direct, editorial, specific. Give exact examples. Prioritise practical fixes. No generic feedback.`;
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
  let prompt = `Review this article:\n\nTITLE: ${input.title}\n\n`;

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
      },
      required: [
        "overallScore", "publishReadiness", "editorialVerdict", "strengths", "weaknesses",
        "inferredInputs", "categoryScores", "issues", "styleGuideViolations", "rewriteSuggestions",
        "seoRecommendations", "geoRecommendations", "actionPlan",
      ],
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reviewId } = await req.json();
    if (!reviewId) {
      return new Response(JSON.stringify({ error: "reviewId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch the review record
    const { data: review, error: fetchErr } = await supabase
      .from("article_reviews")
      .select("*")
      .eq("id", reviewId)
      .single();

    if (fetchErr || !review) {
      return new Response(JSON.stringify({ error: "Review not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark as processing
    await supabase
      .from("article_reviews")
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", reviewId);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      await supabase
        .from("article_reviews")
        .update({ status: "failed", error_message: "LOVABLE_API_KEY not configured", updated_at: new Date().toISOString() })
        .eq("id", reviewId);
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: buildSystemPrompt() },
          {
            role: "user",
            content: buildUserPrompt({
              title: review.title,
              articleContent: review.article_content,
              icpSelection: review.icp_selection,
              primaryKeyword: review.primary_keyword,
              secondaryKeywords: review.secondary_keywords,
              searchIntent: review.search_intent,
              funnelStage: review.funnel_stage,
              ctaGoal: review.cta_goal,
              competitorNotes: review.competitor_notes,
              reviewerNotes: review.reviewer_notes,
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

      const errorMsg = aiResponse.status === 429
        ? "Rate limited — please try again in a moment."
        : aiResponse.status === 402
          ? "AI credits exhausted — please add funds."
          : `AI error (${aiResponse.status})`;

      await supabase
        .from("article_reviews")
        .update({ status: "failed", error_message: errorMsg, updated_at: new Date().toISOString() })
        .eq("id", reviewId);

      return new Response(JSON.stringify({ error: errorMsg }), {
        status: aiResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      await supabase
        .from("article_reviews")
        .update({ status: "failed", error_message: "AI returned unexpected format", updated_at: new Date().toISOString() })
        .eq("id", reviewId);
      return new Response(JSON.stringify({ error: "AI returned unexpected format" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reviewResult = JSON.parse(toolCall.function.arguments);

    // Save result
    await supabase
      .from("article_reviews")
      .update({
        status: "completed",
        review_result: reviewResult,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reviewId);

    return new Response(JSON.stringify({ success: true, reviewId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("review-article error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
