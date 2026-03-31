import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { STYLE_GUIDE_CONTENT } from '@/lib/sample-data';
import { CheckCircle2, FileText, Upload, BookOpen } from 'lucide-react';

export default function StyleGuideSettings() {
  const [guideLoaded] = useState(true);

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Style Guide Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage the CookieYes editorial style guide used for all reviews</p>
        </div>

        {/* Status */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
              {guideLoaded ? (
                <CheckCircle2 className="w-6 h-6 text-success" />
              ) : (
                <Upload className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {guideLoaded ? 'Style Guide Active' : 'No Style Guide Uploaded'}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {guideLoaded
                  ? 'CookieYes Content Style Guide — Blog Content Guidelines v1.0'
                  : 'Upload a style guide to enable compliance checks'}
              </p>
            </div>
          </div>
        </Card>

        {/* Guide Preview */}
        {guideLoaded && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Style Guide Preview</h3>
            </div>
            <div className="max-h-[500px] overflow-y-auto rounded-lg bg-muted/30 p-5 border border-border">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                {STYLE_GUIDE_CONTENT}
              </pre>
            </div>
          </Card>
        )}

        {/* Key Rules Summary */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Key Rules Enforced</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { rule: 'British English', desc: 'Spelling and terminology' },
              { rule: 'Active Voice', desc: 'Direct, clear statements' },
              { rule: 'Serial Comma', desc: 'Oxford comma required' },
              { rule: 'Date Format', desc: 'Day Month Year (1 January 2025)' },
              { rule: 'Link Text', desc: 'No "click here" links' },
              { rule: 'Heading Case', desc: 'Sentence case for H2+' },
              { rule: 'Internal Links', desc: 'Minimum 2 per article' },
              { rule: 'Paragraph Length', desc: '3-5 sentences max' },
              { rule: 'Subheading Frequency', desc: 'Every 200-300 words' },
              { rule: 'No Underlines', desc: 'Use bold or italics only' },
            ].map(({ rule, desc }) => (
              <div key={rule} className="flex items-start gap-2 p-2.5 rounded-md bg-muted/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-foreground">{rule}</p>
                  <p className="text-[10px] text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
