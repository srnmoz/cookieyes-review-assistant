import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { IcpSelector } from '@/components/IcpSelector';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { IcpSelection, SearchIntent, FunnelStage } from '@/lib/types';
import { createReview, triggerReview } from '@/lib/api';
import { isSupportedArticleFile, parseArticleFile } from '@/lib/document-parser';
import { Upload, FileText, Type, X, Loader2 } from 'lucide-react';

export default function NewReview() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [articleText, setArticleText] = useState('');
  const [inputMethod, setInputMethod] = useState<'upload' | 'paste'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [icpSelection, setIcpSelection] = useState<IcpSelection>({
    digitalAgencies: false,
    allRegularUsers: false,
    regularUserSubtypes: [],
    excludedSubtypes: [],
  });
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  const [searchIntent, setSearchIntent] = useState<SearchIntent | ''>('');
  const [funnelStage, setFunnelStage] = useState<FunnelStage | ''>('');
  const [ctaGoal, setCtaGoal] = useState('');
  const [competitorUrls, setCompetitorUrls] = useState('');
  const [competitorNotes, setCompetitorNotes] = useState('');
  const [reviewerNotes, setReviewerNotes] = useState('');

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && isSupportedArticleFile(file)) {
      setUploadedFile(file);
    } else {
      toast({ title: 'Invalid file', description: 'Please upload a PDF, DOCX, or TXT file.', variant: 'destructive' });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isSupportedArticleFile(file)) {
      setUploadedFile(file);
      return;
    }

    e.target.value = '';
    toast({ title: 'Invalid file', description: 'Please upload a PDF, DOCX, or TXT file.', variant: 'destructive' });
  };

  const hasValidInput = title && (uploadedFile || articleText) && (icpSelection.digitalAgencies || icpSelection.allRegularUsers || icpSelection.regularUserSubtypes.length > 0);

  const handleSubmit = async () => {
    if (!hasValidInput) return;
    setIsSubmitting(true);

    try {
      let reviewId: string | null = null;
      let content = articleText;
      let fileName: string | undefined;

      if (inputMethod === 'upload' && uploadedFile) {
        content = await parseArticleFile(uploadedFile);
        fileName = uploadedFile.name;
      }

      if (!content.trim()) {
        toast({ title: 'Empty content', description: 'The article content is empty. Please paste text or upload a valid file.', variant: 'destructive' });
        setIsSubmitting(false);
        return;
      }

      const secondaryKws = secondaryKeywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);
      const compUrls = competitorUrls
        .split(/[,\n]/)
        .map((u) => u.trim())
        .filter(Boolean);

      reviewId = await createReview({
        title,
        articleContent: content,
        contentSource: inputMethod,
        fileName,
        icpSelection,
        primaryKeyword: primaryKeyword || undefined,
        secondaryKeywords: secondaryKws.length ? secondaryKws : undefined,
        searchIntent: searchIntent || undefined,
        funnelStage: funnelStage || undefined,
        ctaGoal: ctaGoal || undefined,
        competitorUrls: compUrls.length ? compUrls : undefined,
        competitorNotes: competitorNotes || undefined,
        reviewerNotes: reviewerNotes || undefined,
      });

      await triggerReview(reviewId);

      navigate(`/review/${reviewId}`);
      toast({ title: 'Review submitted', description: 'Analysis started. Large articles can take several minutes.' });
    } catch (err: any) {
      console.error("Submit error:", err, err?.message);
      toast({ title: 'Error', description: `Failed to submit review: ${err?.message || 'Unknown error'}`, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Article Review</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload an article and configure review parameters</p>
        </div>

        {/* Article Title */}
        <Card className="p-6">
          <Label htmlFor="title" className="text-sm font-semibold text-foreground">Article Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter the article title"
            className="mt-2"
          />
        </Card>

        {/* Article Input */}
        <Card className="p-6">
          <Label className="text-sm font-semibold text-foreground">Article Content *</Label>
          <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as 'upload' | 'paste')} className="mt-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload File
              </TabsTrigger>
              <TabsTrigger value="paste" className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                Paste Text
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
              {uploadedFile ? (
                <div className="mt-4 flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <FileText className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{uploadedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setUploadedFile(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors"
                >
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">Drop your article here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">Supports PDF, DOCX, and TXT files</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="paste">
              <Textarea
                value={articleText}
                onChange={(e) => setArticleText(e.target.value)}
                placeholder="Paste your article text here..."
                className="mt-4 min-h-[200px] font-mono text-sm"
              />
            </TabsContent>
          </Tabs>
        </Card>

        {/* ICP Selection */}
        <Card className="p-6">
          <IcpSelector value={icpSelection} onChange={setIcpSelection} />
        </Card>

        {/* Optional Fields */}
        <Card className="p-6 space-y-5">
          <h3 className="text-sm font-semibold text-foreground">Optional Parameters</h3>
          <p className="text-xs text-muted-foreground -mt-3">If left blank, these will be inferred from the article content.</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="keyword" className="text-xs font-medium text-muted-foreground">Primary Keyword</Label>
              <Input id="keyword" value={primaryKeyword} onChange={(e) => setPrimaryKeyword(e.target.value)} placeholder="e.g. cookie consent" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="secondary" className="text-xs font-medium text-muted-foreground">Secondary Keywords</Label>
              <Input id="secondary" value={secondaryKeywords} onChange={(e) => setSecondaryKeywords(e.target.value)} placeholder="Comma-separated" className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Search Intent</Label>
              <Select value={searchIntent} onValueChange={(v) => setSearchIntent(v as SearchIntent)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Auto-detect" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="informational">Informational</SelectItem>
                  <SelectItem value="navigational">Navigational</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="transactional">Transactional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Funnel Stage</Label>
              <Select value={funnelStage} onValueChange={(v) => setFunnelStage(v as FunnelStage)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Auto-detect" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="awareness">Awareness</SelectItem>
                  <SelectItem value="consideration">Consideration</SelectItem>
                  <SelectItem value="decision">Decision</SelectItem>
                  <SelectItem value="retention">Retention</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="cta" className="text-xs font-medium text-muted-foreground">CTA Goal</Label>
            <Input id="cta" value={ctaGoal} onChange={(e) => setCtaGoal(e.target.value)} placeholder="e.g. Start free trial, Sign up for agency program" className="mt-1" />
          </div>

          <div>
            <Label htmlFor="competitor-urls" className="text-xs font-medium text-muted-foreground">Competitor URLs</Label>
            <Textarea id="competitor-urls" value={competitorUrls} onChange={(e) => setCompetitorUrls(e.target.value)} placeholder="One URL per line or comma-separated" className="mt-1" rows={3} />
          </div>

          <div>
            <Label htmlFor="competitor-notes" className="text-xs font-medium text-muted-foreground">Competitor Notes</Label>
            <Textarea id="competitor-notes" value={competitorNotes} onChange={(e) => setCompetitorNotes(e.target.value)} placeholder="Key points about competitor content..." className="mt-1" rows={3} />
          </div>

          <div>
            <Label htmlFor="reviewer-notes" className="text-xs font-medium text-muted-foreground">Reviewer Notes</Label>
            <Textarea id="reviewer-notes" value={reviewerNotes} onChange={(e) => setReviewerNotes(e.target.value)} placeholder="Any specific areas to focus on..." className="mt-1" rows={3} />
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/')}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!hasValidInput || isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSubmitting ? 'Submitting...' : 'Start Review'}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
