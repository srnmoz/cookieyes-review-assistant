
CREATE TABLE public.article_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  article_content text NOT NULL,
  content_source text NOT NULL DEFAULT 'paste',
  file_name text,
  icp_selection jsonb NOT NULL DEFAULT '{}'::jsonb,
  primary_keyword text,
  secondary_keywords text[],
  search_intent text,
  funnel_stage text,
  cta_goal text,
  competitor_urls text[],
  competitor_notes text,
  reviewer_notes text,
  status text NOT NULL DEFAULT 'processing',
  review_result jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.article_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to article_reviews" ON public.article_reviews
  FOR ALL USING (true) WITH CHECK (true);
