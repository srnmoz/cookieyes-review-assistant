import type { ReviewResult, Severity } from "./types";

function readinessLabel(r: string) {
  const map: Record<string, string> = {
    not_ready: "Not Ready",
    needs_revision: "Needs Revision",
    nearly_ready: "Nearly Ready",
    ready_to_publish: "Ready to Publish",
  };
  return map[r] ?? r;
}

function severityLabel(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function issueBlock(issue: { severity: string; category: string; title: string; description: string; originalExcerpt?: string; improvedVersion?: string; suggestion?: string }) {
  let block = `- **[${severityLabel(issue.severity)}]** ${issue.title} _(${issue.category})_\n  ${issue.description}\n`;
  if (issue.originalExcerpt) block += `  > Original: "${issue.originalExcerpt}"\n`;
  if (issue.improvedVersion) block += `  > Suggested: "${issue.improvedVersion}"\n`;
  if (issue.suggestion && !issue.improvedVersion) block += `  > 💡 ${issue.suggestion}\n`;
  return block;
}

export function reviewToMarkdown(review: ReviewResult): string {
  const lines: string[] = [];

  lines.push(`# Article Review: ${review.articleTitle}`);
  lines.push("");
  lines.push(`**Overall Score:** ${review.overallScore}/100 · **Publish Readiness:** ${readinessLabel(review.publishReadiness)}`);
  lines.push("");
  lines.push(`> ${review.editorialVerdict}`);
  lines.push("");

  // Strengths & Weaknesses
  lines.push("## Strengths");
  review.strengths.forEach((s) => lines.push(`- ✅ ${s}`));
  lines.push("");
  lines.push("## Weaknesses");
  review.weaknesses.forEach((w) => lines.push(`- ❌ ${w}`));
  lines.push("");

  // Inferred inputs
  if (review.inferredInputs) {
    const ii = review.inferredInputs;
    lines.push("## Inferred Inputs");
    if (ii.primaryKeyword) lines.push(`- **Primary Keyword:** ${ii.primaryKeyword}`);
    if (ii.searchIntent) lines.push(`- **Search Intent:** ${ii.searchIntent}`);
    if (ii.audienceAssumptions) lines.push(`- **Audience:** ${ii.audienceAssumptions}`);
    if (ii.articleType) lines.push(`- **Article Type:** ${ii.articleType}`);
    lines.push("");
  }

  // Category scores
  lines.push("## Category Scores");
  lines.push("| Category | Score |");
  lines.push("|----------|-------|");
  review.categoryScores.forEach((c) => lines.push(`| ${c.name} | ${c.score}/${c.maxScore} |`));
  lines.push("");

  // Issues
  if (review.issues.length > 0) {
    lines.push("## Issues");
    (["critical", "important", "optional"] as Severity[]).forEach((sev) => {
      const items = review.issues.filter((i) => i.severity === sev);
      if (items.length === 0) return;
      lines.push(`### ${severityLabel(sev)} (${items.length})`);
      items.forEach((i) => lines.push(issueBlock(i)));
    });
    lines.push("");
  }

  // Style guide violations
  if (review.styleGuideViolations.length > 0) {
    lines.push("## Style Guide Violations");
    review.styleGuideViolations.forEach((v) => lines.push(issueBlock(v)));
    lines.push("");
  }

  // Rewrite suggestions
  if (review.rewriteSuggestions.length > 0) {
    lines.push("## Rewrite Suggestions");
    review.rewriteSuggestions.forEach((r) => lines.push(issueBlock(r)));
    lines.push("");
  }

  // SEO
  const seo = review.seoRecommendations;
  if (seo.titleSuggestions.length > 0 || seo.metaDescription || seo.faqIdeas.length > 0) {
    lines.push("## SEO Recommendations");
    if (seo.titleSuggestions.length > 0) {
      lines.push("### Title Suggestions");
      seo.titleSuggestions.forEach((t) => lines.push(`- ${t}`));
    }
    if (seo.metaDescription) lines.push(`\n**Meta Description:** ${seo.metaDescription}`);
    if (seo.faqIdeas.length > 0) {
      lines.push("### FAQ Ideas");
      seo.faqIdeas.forEach((f) => lines.push(`- ${f}`));
    }
    if (seo.internalLinkingSuggestions.length > 0) {
      lines.push("### Internal Linking");
      seo.internalLinkingSuggestions.forEach((l) => lines.push(`- ${l}`));
    }
    lines.push("");
  }

  // Action plan
  if (review.actionPlan.length > 0) {
    lines.push("## Action Plan");
    review.actionPlan.forEach((a, i) => lines.push(`${i + 1}. ${a}`));
    lines.push("");
  }

  return lines.join("\n");
}

export function downloadMarkdown(review: ReviewResult) {
  const md = reviewToMarkdown(review);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `review-${review.articleTitle.replace(/[^a-zA-Z0-9]/g, "-").substring(0, 50)}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadJson(review: ReviewResult) {
  const blob = new Blob([JSON.stringify(review, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `review-${review.articleTitle.replace(/[^a-zA-Z0-9]/g, "-").substring(0, 50)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function copyShareLink() {
  navigator.clipboard.writeText(window.location.href);
}