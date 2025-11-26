import React from 'react';
import { ArrowLeft, Shield, Clock, User, Calendar, Tag, Info, Copy, Check } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { NewsItem } from './NewsCard';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { toast } from 'sonner@2.0.3';

interface NewsDetailPageProps {
  news: NewsItem | null;
  onBack: () => void;
}

export function NewsDetailPage({ news, onBack }: NewsDetailPageProps) {
  const [copied, setCopied] = React.useState(false);
  
  if (!news) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Article Not Found</h2>
          <p className="text-muted-foreground mb-6">The requested article could not be found.</p>
          <Button onClick={onBack}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const getReliabilityColor = (score: number) => {
    if (score >= 7) return 'text-green-600 dark:text-green-400';
    if (score >= 5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getReliabilityBg = (score: number) => {
    if (score >= 7) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 5) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const getReliabilityLabel = (score: number) => {
    if (score >= 8.5) return 'Highly Reliable';
    if (score >= 7) return 'Reliable';
    if (score >= 5) return 'Moderately Reliable';
    if (score >= 3) return 'Low Reliability';
    return 'Unreliable';
  };

  const handleCopyHash = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (news.blockHash) {
      // Fallback copy method for when Clipboard API is blocked
      const copyToClipboard = (text: string) => {
        // Try modern clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text)
            .then(() => {
              setCopied(true);
              toast.success('Hash copied to clipboard!');
              setTimeout(() => setCopied(false), 2000);
            })
            .catch(() => {
              // Fallback to older method
              fallbackCopyTextToClipboard(text);
            });
        } else {
          // Use fallback method
          fallbackCopyTextToClipboard(text);
        }
      };

      const fallbackCopyTextToClipboard = (text: string) => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            setCopied(true);
            toast.success('Hash copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
          } else {
            toast.error('Failed to copy hash');
          }
        } catch (err) {
          toast.error('Failed to copy hash');
        }
        
        document.body.removeChild(textArea);
      };

      copyToClipboard(news.blockHash);
    }
  };

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to News</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article Header */}
        <div className="mb-8">
          {/* Category Badge */}
          <Badge 
            variant="secondary" 
            className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 mb-4 capitalize"
          >
            <Tag className="h-3 w-3 mr-1" />
            {news.category}
          </Badge>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-6">
            {news.title}
          </h1>

          {/* Excerpt */}
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            {news.excerpt}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="font-medium">{news.author}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(news.publishedAt)}</span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-lg">
            <ImageWithFallback
              src={news.thumbnail}
              alt={news.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>
        </div>

        {/* Reliability Score Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Reliability Assessment</h3>
                <p className="text-sm text-muted-foreground">
                  This article has been analyzed by our AI verification system
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`px-4 py-2 rounded-lg ${getReliabilityBg(news.reliabilityScore)}`}>
                  <div className="flex items-center space-x-2">
                    <Shield className={`h-5 w-5 ${getReliabilityColor(news.reliabilityScore)}`} />
                    <div className="text-right">
                      <div className={`font-bold text-lg ${getReliabilityColor(news.reliabilityScore)}`}>
                        {news.reliabilityScore.toFixed(1)}/10
                      </div>
                      <div className={`text-xs font-medium ${getReliabilityColor(news.reliabilityScore)}`}>
                        {getReliabilityLabel(news.reliabilityScore)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Blockchain Hash Info Icon */}
                {news.blockHash && (
                  <Popover>
                    <PopoverTrigger asChild onClick={handleInfoClick}>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full border-amber-200 dark:border-amber-800"
                      >
                        <Info className="h-5 w-5 text-amber-800 dark:text-amber-200" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-80 p-4" 
                      side="left"
                      onClick={handleInfoClick}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">Blockchain Hash</h4>
                          <Badge variant="outline" className="text-xs">Verified</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          This article is stored on our blockchain network. The hash below serves as a permanent record.
                        </p>
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-xs font-mono break-all text-muted-foreground">
                            {news.blockHash}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={handleCopyHash}
                        >
                          {copied ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Hash
                            </>
                          )}
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <div className="text-foreground leading-relaxed space-y-4">
            <p>
              This is where the full article content would be displayed. In a real implementation, 
              you would fetch the complete article content from your backend API using the article ID.
            </p>
            
            <p>
              The article would contain the detailed reporting, analysis, and information that 
              expands on the excerpt shown in the news card. This could include multiple paragraphs, 
              quotes, data, and comprehensive coverage of the topic.
            </p>

            <p>
              For the {news.category} category, this article provides in-depth coverage and has been 
              verified with a reliability score of {news.reliabilityScore.toFixed(1)} out of 10 by 
              our AI verification system.
            </p>

            <p>
              Additional content sections, embedded media, related articles, and social sharing 
              options would also be available in the full implementation of the news detail page.
            </p>
          </div>
        </div>

        {/* Related Articles Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-xl font-semibold text-foreground mb-4">Related Articles</h3>
          <p className="text-muted-foreground">
            Related articles from the {news.category} category would be displayed here.
          </p>
        </div>
      </div>
    </div>
  );
}