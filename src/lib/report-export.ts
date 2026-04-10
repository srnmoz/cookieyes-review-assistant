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

export async function downloadPdf(review: ReviewResult) {
  const { jsPDF } = await import("jspdf");

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addPage = () => { pdf.addPage(); y = margin; };
  const checkSpace = (needed: number) => { if (y + needed > pageHeight - margin) addPage(); };

  const heading = (text: string, size: number, spacing = 4) => {
    checkSpace(size + spacing + 4);
    pdf.setFontSize(size);
    pdf.setFont("helvetica", "bold");
    pdf.text(text, margin, y);
    y += size * 0.4 + spacing;
  };

  const body = (text: string, indent = 0) => {
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    const lines = pdf.splitTextToSize(text, contentWidth - indent);
    for (const line of lines) {
      checkSpace(5);
      pdf.text(line, margin + indent, y);
      y += 4.2;
    }
  };

  const bullet = (text: string, symbol = "•", indent = 4) => {
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    const lines = pdf.splitTextToSize(text, contentWidth - indent - 4);
    checkSpace(5);
    pdf.text(symbol, margin + indent, y);
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) checkSpace(5);
      pdf.text(lines[i], margin + indent + 4, y);
      y += 4.2;
    }
  };

  // Title
  heading(`Article Review: ${review.articleTitle}`, 16, 6);

  // Score & readiness
  body(`Overall Score: ${review.overallScore}/100  ·  Publish Readiness: ${readinessLabel(review.publishReadiness)}`);
  y += 2;
  body(review.editorialVerdict);
  y += 4;

  // Strengths
  heading("Strengths", 12);
  review.strengths.forEach((s) => bullet(s, "✓"));
  y += 3;

  // Weaknesses
  heading("Weaknesses", 12);
  review.weaknesses.forEach((w) => bullet(w, "✗"));
  y += 3;

  // Inferred Inputs
  if (review.inferredInputs) {
    const ii = review.inferredInputs;
    heading("Inferred Inputs", 12);
    if (ii.primaryKeyword) bullet(`Primary Keyword: ${ii.primaryKeyword}`);
    if (ii.searchIntent) bullet(`Search Intent: ${ii.searchIntent}`);
    if (ii.audienceAssumptions) bullet(`Audience: ${ii.audienceAssumptions}`);
    if (ii.articleType) bullet(`Article Type: ${ii.articleType}`);
    y += 3;
  }

  // Category Scores
  heading("Category Scores", 12);
  review.categoryScores.forEach((c) => {
    bullet(`${c.name}: ${c.score}/${c.maxScore}`);
  });
  y += 3;

  // Issues
  if (review.issues.length > 0) {
    heading("Issues", 12);
    (["critical", "important", "optional"] as Severity[]).forEach((sev) => {
      const items = review.issues.filter((i) => i.severity === sev);
      if (items.length === 0) return;
      heading(`${severityLabel(sev)} (${items.length})`, 10, 2);
      items.forEach((i) => {
        bullet(`[${severityLabel(i.severity)}] ${i.title} (${i.category}): ${i.description}`, "•", 6);
        if (i.originalExcerpt) { body(`Original: "${i.originalExcerpt}"`, 12); }
        if (i.improvedVersion) { body(`Suggested: "${i.improvedVersion}"`, 12); }
      });
    });
    y += 3;
  }

  // Style guide violations
  if (review.styleGuideViolations.length > 0) {
    heading("Style Guide Violations", 12);
    review.styleGuideViolations.forEach((v) => bullet(`${v.title}: ${v.description}`));
    y += 3;
  }

  // Rewrite suggestions
  if (review.rewriteSuggestions.length > 0) {
    heading("Rewrite Suggestions", 12);
    review.rewriteSuggestions.forEach((r) => {
      bullet(`${r.title}: ${r.description}`);
      if (r.originalExcerpt) body(`Original: "${r.originalExcerpt}"`, 12);
      if (r.improvedVersion) body(`Suggested: "${r.improvedVersion}"`, 12);
    });
    y += 3;
  }

  // SEO
  const seo = review.seoRecommendations;
  if (seo.titleSuggestions.length > 0 || seo.metaDescription || seo.faqIdeas.length > 0) {
    heading("SEO Recommendations", 12);
    if (seo.titleSuggestions.length > 0) {
      heading("Title Suggestions", 10, 2);
      seo.titleSuggestions.forEach((t) => bullet(t));
    }
    if (seo.metaDescription) { body(`Meta Description: ${seo.metaDescription}`); y += 2; }
    if (seo.faqIdeas.length > 0) {
      heading("FAQ Ideas", 10, 2);
      seo.faqIdeas.forEach((f) => bullet(f));
    }
    if (seo.internalLinkingSuggestions.length > 0) {
      heading("Internal Linking", 10, 2);
      seo.internalLinkingSuggestions.forEach((l) => bullet(l));
    }
    y += 3;
  }

  // Action Plan
  if (review.actionPlan.length > 0) {
    heading("Action Plan", 12);
    review.actionPlan.forEach((a, i) => bullet(a, `${i + 1}.`));
  }

  const filename = `review-${review.articleTitle.replace(/[^a-zA-Z0-9]/g, "-").substring(0, 50)}.pdf`;
  pdf.save(filename);
}

export function copyShareLink() {
  navigator.clipboard.writeText(window.location.href);
}