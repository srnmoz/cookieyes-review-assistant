import type { ReviewResult } from './types';

export const sampleReviews: ReviewResult[] = [
  {
    id: '1',
    articleTitle: 'How to Implement Cookie Consent for Multiple Client Websites',
    overallScore: 72,
    publishReadiness: 'needs_revision',
    editorialVerdict: 'Strong foundational article for agency audience but needs better ICP targeting, more concrete implementation examples, and tighter alignment with CookieYes style guide conventions.',
    strengths: [
      'Clear structure with logical progression from problem to solution',
      'Good keyword targeting for "cookie consent multiple websites"',
      'Practical angle that speaks to real agency pain points',
    ],
    weaknesses: [
      'Lacks specific CookieYes feature references for bulk deployment',
      'Passive voice used in 8 instances — violates style guide',
      'Missing FAQ section reduces AI Overview visibility',
      'No competitor differentiation angle',
    ],
    inferredInputs: {
      primaryKeyword: 'cookie consent multiple websites',
      searchIntent: 'Informational with commercial undertone',
      audienceAssumptions: 'Digital agencies managing 10+ client sites',
      articleType: 'How-to guide',
    },
    categoryScores: [
      { id: 'icp', name: 'ICP Fit', score: 7, maxScore: 10, working: ['Addresses multi-site management challenges', 'Uses agency-relevant terminology'], missing: ['No mention of agency program benefits', 'Missing client-facing language examples'], whyItMatters: 'Agency readers need to see themselves in the content to trust recommendations.', nextSteps: ['Add a section on CookieYes agency program', 'Include client onboarding language'] },
      { id: 'audience', name: 'Audience Clarity', score: 7, maxScore: 10, working: ['Clear target audience', 'Appropriate technical depth'], missing: ['Could better segment junior vs senior agency staff'], whyItMatters: 'Different agency roles need different takeaways.', nextSteps: ['Add role-specific callouts'] },
      { id: 'intent', name: 'Search Intent Alignment', score: 8, maxScore: 10, working: ['Matches informational intent well', 'Provides step-by-step guidance'], missing: ['Could add more commercial CTAs for conversion'], whyItMatters: 'Matching intent keeps bounce rates low and engagement high.', nextSteps: ['Add contextual CTAs after key sections'] },
      { id: 'seo', name: 'SEO Basics', score: 7, maxScore: 10, working: ['Good keyword placement in H1 and intro', 'Decent heading hierarchy'], missing: ['Missing meta description optimisation', 'Only 1 internal link (style guide requires minimum 2)'], whyItMatters: 'Basic SEO elements drive discoverability.', nextSteps: ['Add 2+ internal links', 'Optimise meta description'] },
      { id: 'structure', name: 'On-page Structure', score: 8, maxScore: 10, working: ['Clean heading hierarchy', 'Good paragraph length'], missing: ['Some sections exceed 300 words between subheadings'], whyItMatters: 'Scannable structure keeps readers engaged.', nextSteps: ['Break long sections with additional H3s'] },
      { id: 'geo', name: 'GEO / Generative Engine Optimisation', score: 5, maxScore: 10, working: ['Some definition sections present'], missing: ['No FAQ section', 'No comparison tables', 'No concise summary blocks', 'No answer-first paragraphs'], whyItMatters: 'GEO-optimised content is more likely to appear in AI Overviews and LLM responses.', nextSteps: ['Add FAQ section', 'Add comparison table', 'Add TL;DR summary'] },
      { id: 'ai_visibility', name: 'AI Overview Visibility', score: 5, maxScore: 10, working: ['Clear definitions present'], missing: ['Content not structured for extraction', 'No concise quotable statements'], whyItMatters: 'AI Overviews pull from well-structured, concise content.', nextSteps: ['Add bold key takeaways', 'Create extractable summary sentences'] },
      { id: 'topical', name: 'Topical Completeness', score: 7, maxScore: 10, working: ['Covers main implementation steps'], missing: ['Missing GDPR-specific considerations', 'No mention of consent mode v2'], whyItMatters: 'Comprehensive coverage builds authority.', nextSteps: ['Add GDPR section', 'Cover Google Consent Mode v2'] },
      { id: 'eeat', name: 'E-E-A-T / Credibility', score: 6, maxScore: 10, working: ['Practical experience evident'], missing: ['No author credentials', 'No data or statistics cited', 'No external authority references'], whyItMatters: 'E-E-A-T signals directly impact ranking potential.', nextSteps: ['Add author bio', 'Include industry statistics', 'Reference official documentation'] },
      { id: 'readability', name: 'Readability / Scannability', score: 7, maxScore: 10, working: ['Short paragraphs', 'Clear language'], missing: ['8 instances of passive voice', 'Some jargon without explanation'], whyItMatters: 'Readability directly affects time on page and comprehension.', nextSteps: ['Convert passive voice to active', 'Add glossary or inline definitions'] },
      { id: 'style_guide', name: 'Style Guide Compliance', score: 6, maxScore: 10, working: ['Correct CookieYes capitalisation', 'Appropriate tone'], missing: ['Uses "click here" links (violates guide)', 'Passive voice in multiple instances', 'Missing serial comma in 3 places'], whyItMatters: 'Brand consistency builds trust and professionalism.', nextSteps: ['Fix link text', 'Address passive voice', 'Add serial commas'] },
      { id: 'differentiation', name: 'Competitor Differentiation', score: 5, maxScore: 10, working: ['Mentions unique CookieYes features'], missing: ['No explicit comparison with alternatives', 'No unique value proposition section'], whyItMatters: 'Differentiation converts readers into customers.', nextSteps: ['Add comparison section', 'Highlight unique agency features'] },
      { id: 'conversion', name: 'Conversion Readiness', score: 6, maxScore: 10, working: ['CTA present at end'], missing: ['No mid-article CTAs', 'No agency program signup prompt', 'No free trial mention'], whyItMatters: 'Strategic CTAs convert organic traffic into leads.', nextSteps: ['Add contextual CTAs', 'Mention free trial', 'Link to agency program'] },
    ],
    issues: [
      { id: 'i1', severity: 'critical', category: 'GEO', title: 'Missing FAQ Section', description: 'No FAQ section present. This significantly reduces AI Overview visibility and GEO performance.', suggestion: 'Add a 5-7 question FAQ section covering common agency concerns about multi-site cookie consent.' },
      { id: 'i2', severity: 'critical', category: 'Style Guide', title: '"Click here" Link Text', description: 'Three instances of "click here" links found. The CookieYes style guide explicitly prohibits this pattern.', originalExcerpt: 'Click here to learn about consent management.', improvedVersion: 'Learn more about consent management for agencies.', rationale: 'Descriptive link text improves accessibility and SEO.' },
      { id: 'i3', severity: 'important', category: 'SEO', title: 'Insufficient Internal Links', description: 'Only 1 internal link found. Style guide requires minimum 2 internal links per article.', suggestion: 'Add links to the CookieYes agency program page and the cookie scanning guide.' },
      { id: 'i4', severity: 'important', category: 'Writing Quality', title: 'Passive Voice Overuse', description: '8 instances of passive voice detected. Style guide recommends active voice for clear, direct statements.', originalExcerpt: 'Cookies are collected by the website and shared with third parties.', improvedVersion: 'The website collects cookies and shares them with third parties.', rationale: 'Active voice is more direct and easier to read.' },
      { id: 'i5', severity: 'important', category: 'E-E-A-T', title: 'No Author Credentials', description: 'Article lacks author bio or credentials. This weakens E-E-A-T signals.', suggestion: 'Add author bio with relevant privacy/compliance experience.' },
      { id: 'i6', severity: 'optional', category: 'Conversion', title: 'Missing Mid-Article CTAs', description: 'Only one CTA at the article end. Adding contextual CTAs after key sections would improve conversion.', suggestion: 'Add a CTA after the implementation steps section and another after the benefits section.' },
    ],
    styleGuideViolations: [
      { id: 'sg1', severity: 'critical', category: 'Style Guide', title: '"Click here" Link Text', description: 'Style guide rule: "Link relevant keywords rather than click here."', originalExcerpt: 'Click here to learn about consent management.', improvedVersion: 'Learn more about consent management for agencies.' },
      { id: 'sg2', severity: 'important', category: 'Style Guide', title: 'Passive Voice Usage', description: 'Style guide rule: "Use active voice for clear, direct statements."', originalExcerpt: 'Data is collected by cookies and shared with ad networks.', improvedVersion: 'The website collects data via cookies and shares it with ad networks.' },
      { id: 'sg3', severity: 'important', category: 'Style Guide', title: 'Missing Serial Comma', description: 'Style guide rule: "Use the serial comma." Found 3 instances of missing serial commas.', originalExcerpt: 'consent management, geo-location compliance and analytics', improvedVersion: 'consent management, geo-location compliance, and analytics' },
      { id: 'sg4', severity: 'optional', category: 'Style Guide', title: 'Informal Tone in Technical Section', description: 'Section 3 uses overly casual language ("super easy to set up") which undermines expertise per style guide.' },
    ],
    seoRecommendations: {
      titleSuggestions: [
        'How to Manage Cookie Consent Across Multiple Client Websites (Agency Guide)',
        'Multi-Site Cookie Consent: A Complete Implementation Guide for Agencies',
      ],
      h1Suggestion: 'How to Implement Cookie Consent for Multiple Client Websites',
      metaDescription: 'Learn how digital agencies can efficiently manage cookie consent across multiple client websites. Step-by-step guide with CookieYes bulk deployment features.',
      faqIdeas: [
        'How many websites can I manage with one CookieYes account?',
        'Does cookie consent need to be customised per client?',
        'How do I handle different privacy laws across client websites?',
        'Can I white-label the cookie banner for agency clients?',
        'What is Google Consent Mode and how does it work with multi-site setups?',
      ],
      schemaOpportunities: ['HowTo schema', 'FAQ schema', 'Article schema with author'],
      internalLinkingSuggestions: [
        'Link to CookieYes Agency Program page',
        'Link to Cookie Scanning documentation',
        'Link to GDPR Compliance Checklist article',
      ],
    },
    geoRecommendations: {
      missingSummaryBlocks: ['Add a TL;DR at the top of the article', 'Add key takeaways box before the conclusion'],
      missingFaqs: ['Add FAQ section with 5-7 agency-specific questions'],
      missingDefinitions: ['Define "cookie consent" in a clear, extractable format', 'Define "consent management platform"'],
      missingComparisons: ['Add comparison table: manual vs automated consent management'],
      missingAnswerFirst: ['Lead section 2 with the direct answer before explanation'],
      missingQuoteFriendly: ['Add a bold one-liner summarising each section\'s main point'],
    },
    competitorAnalysis: {
      overallComparison: 'comparable',
      competitorStrengths: ['Competitor A has a more detailed implementation walkthrough', 'Competitor B includes video tutorials'],
      articleStrengths: ['More focused on agency use case', 'Better structured for scanning'],
      opportunities: ['Add video or visual walkthrough', 'Include pricing comparison for agencies', 'Add case study from a real agency client'],
      explanation: 'The article matches competitors on depth but misses opportunities in visual content and social proof.',
    },
    actionPlan: [
      'Add FAQ section with 5-7 agency-specific questions (GEO + SEO impact)',
      'Fix all 3 "click here" link instances (Style Guide compliance)',
      'Convert 8 passive voice instances to active voice (Readability + Style Guide)',
      'Add 2+ internal links to agency program and cookie scanning pages (SEO)',
      'Add TL;DR summary and key takeaways box (GEO + AI Visibility)',
      'Include author bio with privacy/compliance credentials (E-E-A-T)',
      'Add comparison table: manual vs automated consent management (GEO)',
      'Insert mid-article CTAs after implementation and benefits sections (Conversion)',
      'Add serial commas in 3 identified locations (Style Guide)',
      'Reference GDPR and Google Consent Mode v2 (Topical Completeness)',
    ],
    rewriteSuggestions: [
      { id: 'rw1', severity: 'important', category: 'Writing Quality', title: 'Weak Introduction', description: 'The introduction is too generic and doesn\'t hook agency readers.', originalExcerpt: 'Cookie consent is important for websites. In this article, we will discuss how to implement it across multiple sites.', improvedVersion: 'Managing cookie consent across 50+ client websites shouldn\'t mean 50 separate setups. Here\'s how digital agencies can deploy compliant consent banners at scale — without the manual overhead.', rationale: 'The rewrite immediately addresses the agency pain point and promises a specific solution.' },
      { id: 'rw2', severity: 'important', category: 'ICP', title: 'Generic Benefits Section', description: 'Benefits section doesn\'t speak specifically to agency needs.', originalExcerpt: 'CookieYes helps you comply with privacy laws easily.', improvedVersion: 'CookieYes lets agencies manage consent across all client sites from a single dashboard — deploy once, customise per client, and maintain compliance without the repetitive setup.', rationale: 'Agency-specific language resonates more than generic compliance messaging.' },
    ],
    status: 'in_revision',
    createdAt: '2026-03-28T10:30:00Z',
    icpSelection: {
      digitalAgencies: true,
      allRegularUsers: false,
      regularUserSubtypes: [],
      excludedSubtypes: [],
    },
  },
  {
    id: '2',
    articleTitle: 'What Is a Cookie Banner? Everything Website Owners Need to Know',
    overallScore: 84,
    publishReadiness: 'nearly_ready',
    editorialVerdict: 'Well-structured educational article with strong readability. Minor fixes needed for GEO optimisation and style guide alignment before publishing.',
    strengths: [
      'Excellent readability — clear, concise language throughout',
      'Strong SEO fundamentals with good keyword placement',
      'Well-targeted to website owners and non-technical users',
      'Good use of examples and visual descriptions',
    ],
    weaknesses: [
      'Missing comparison table for GEO visibility',
      'Two style guide violations (date format, underlined text)',
      'Could strengthen E-E-A-T with external references',
    ],
    inferredInputs: {
      primaryKeyword: 'cookie banner',
      searchIntent: 'Informational',
      audienceAssumptions: 'Website owners new to privacy compliance',
      articleType: 'Explainer / Educational',
    },
    categoryScores: [
      { id: 'icp', name: 'ICP Fit', score: 9, maxScore: 10, working: ['Perfectly targeted to website owners', 'Appropriate simplicity level'], missing: ['Could mention enterprise scaling'], whyItMatters: 'Strong ICP fit ensures the right audience engages.', nextSteps: ['Add brief enterprise mention'] },
      { id: 'audience', name: 'Audience Clarity', score: 9, maxScore: 10, working: ['Clear non-technical language', 'Relatable examples'], missing: [], whyItMatters: 'Clarity prevents reader drop-off.', nextSteps: [] },
      { id: 'intent', name: 'Search Intent Alignment', score: 9, maxScore: 10, working: ['Directly answers "what is" query', 'Good format for informational intent'], missing: [], whyItMatters: 'Intent match is the #1 ranking factor.', nextSteps: [] },
      { id: 'seo', name: 'SEO Basics', score: 8, maxScore: 10, working: ['Strong title and H1', 'Good heading hierarchy', '3 internal links'], missing: ['Meta description could be more compelling'], whyItMatters: 'SEO basics drive organic traffic.', nextSteps: ['Improve meta description'] },
      { id: 'structure', name: 'On-page Structure', score: 9, maxScore: 10, working: ['Perfect heading hierarchy', 'Short paragraphs', 'Good use of lists'], missing: [], whyItMatters: 'Structure aids both readers and crawlers.', nextSteps: [] },
      { id: 'geo', name: 'GEO / Generative Engine Optimisation', score: 7, maxScore: 10, working: ['Clear definitions', 'FAQ section present'], missing: ['No comparison table', 'Summary block could be stronger'], whyItMatters: 'GEO determines AI retrieval likelihood.', nextSteps: ['Add comparison table', 'Strengthen TL;DR'] },
      { id: 'ai_visibility', name: 'AI Overview Visibility', score: 7, maxScore: 10, working: ['Answer-first structure', 'Clean definitions'], missing: ['Could add more quotable statements'], whyItMatters: 'AI Overviews drive zero-click visibility.', nextSteps: ['Add bold key statements'] },
      { id: 'topical', name: 'Topical Completeness', score: 8, maxScore: 10, working: ['Covers fundamentals thoroughly'], missing: ['Missing consent mode integration section'], whyItMatters: 'Completeness prevents content gaps competitors can fill.', nextSteps: ['Add consent mode section'] },
      { id: 'eeat', name: 'E-E-A-T / Credibility', score: 7, maxScore: 10, working: ['Practical experience shown'], missing: ['No external authority citations'], whyItMatters: 'Credibility drives trust and rankings.', nextSteps: ['Add 1-2 authoritative external links'] },
      { id: 'readability', name: 'Readability / Scannability', score: 9, maxScore: 10, working: ['Excellent readability score', 'Short sentences', 'Clear language'], missing: [], whyItMatters: 'Readability retains visitors.', nextSteps: [] },
      { id: 'style_guide', name: 'Style Guide Compliance', score: 8, maxScore: 10, working: ['Good tone', 'Correct capitalisation', 'Serial commas used'], missing: ['Date format violation', 'One instance of underlined text'], whyItMatters: 'Style compliance maintains brand standards.', nextSteps: ['Fix date format to Day Month Year', 'Remove underlined text'] },
      { id: 'differentiation', name: 'Competitor Differentiation', score: 7, maxScore: 10, working: ['Clear CookieYes positioning'], missing: ['No explicit comparison with alternatives'], whyItMatters: 'Differentiation captures undecided readers.', nextSteps: ['Add brief comparison'] },
      { id: 'conversion', name: 'Conversion Readiness', score: 8, maxScore: 10, working: ['Good CTA placement', 'Free trial mention'], missing: ['Could add inline product screenshots'], whyItMatters: 'Conversion readiness turns traffic into leads.', nextSteps: ['Add product screenshots'] },
    ],
    issues: [
      { id: 'i1', severity: 'important', category: 'GEO', title: 'Missing Comparison Table', description: 'No comparison table present. Tables are highly extractable by AI systems.', suggestion: 'Add a table comparing cookie banner requirements across GDPR, CCPA, and other major privacy laws.' },
      { id: 'i2', severity: 'important', category: 'Style Guide', title: 'Date Format Violation', description: 'Date "January 1, 2025" should be "1 January 2025" per style guide.', originalExcerpt: 'January 1, 2025', improvedVersion: '1 January 2025' },
      { id: 'i3', severity: 'optional', category: 'Style Guide', title: 'Underlined Text', description: 'One instance of underlined text found. Style guide states: "Do not underline."' },
    ],
    styleGuideViolations: [
      { id: 'sg1', severity: 'important', category: 'Style Guide', title: 'Incorrect Date Format', description: 'Used "January 1, 2025" instead of "1 January 2025"' },
      { id: 'sg2', severity: 'optional', category: 'Style Guide', title: 'Underlined Text Found', description: 'Style guide prohibits underlined text. Use bold or italics instead.' },
    ],
    seoRecommendations: {
      titleSuggestions: ['What Is a Cookie Banner? A Complete Guide for Website Owners (2026)'],
      h1Suggestion: 'What Is a Cookie Banner? Everything Website Owners Need to Know',
      metaDescription: 'Understand what cookie banners are, why your website needs one, and how to implement a compliant consent banner in minutes. Plain-language guide for website owners.',
      faqIdeas: ['Do all websites need a cookie banner?', 'How do I make my cookie banner GDPR-compliant?'],
      schemaOpportunities: ['FAQ schema', 'Article schema'],
      internalLinkingSuggestions: ['Link to CCPA compliance guide'],
    },
    geoRecommendations: {
      missingSummaryBlocks: ['Strengthen the TL;DR section'],
      missingFaqs: [],
      missingDefinitions: [],
      missingComparisons: ['Add comparison table for privacy law requirements'],
      missingAnswerFirst: [],
      missingQuoteFriendly: ['Add 2-3 bold quotable statements'],
    },
    actionPlan: [
      'Add comparison table for privacy law cookie banner requirements (GEO)',
      'Fix date format: "January 1, 2025" → "1 January 2025" (Style Guide)',
      'Remove underlined text instance (Style Guide)',
      'Add 1-2 authoritative external references (E-E-A-T)',
      'Strengthen TL;DR summary block (GEO)',
      'Add bold quotable key statements (AI Visibility)',
      'Add consent mode integration section (Topical Completeness)',
      'Improve meta description (SEO)',
    ],
    rewriteSuggestions: [],
    status: 'draft_review',
    createdAt: '2026-03-30T14:15:00Z',
    icpSelection: {
      digitalAgencies: false,
      allRegularUsers: false,
      regularUserSubtypes: ['website_owners'],
      excludedSubtypes: [],
    },
  },
];

export const STYLE_GUIDE_CONTENT = `CookieYes Content Style Guide — Blog Content Guidelines

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
