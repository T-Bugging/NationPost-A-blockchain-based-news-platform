import React from 'react';
import { Shield, Clock, User, Info, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  thumbnail: string;
  reliabilityScore: number;
  category: string;
  author: string;
  publishedAt: string;
  blockHash?: string;
}

interface NewsCardProps {
  news: NewsItem;
  onClick?: (newsId: string) => void;
}

export function NewsCard({ news, onClick }: NewsCardProps) {
  const [copied, setCopied] = React.useState(false);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getReliabilityColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReliabilityBg = (score: number) => {
    if (score >= 7) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 5) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
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
    <Card 
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col"
      onClick={() => onClick?.(news.id)}
    >
      <div className="relative overflow-hidden rounded-t-lg">
        <ImageWithFallback
          src={news.thumbnail}
          alt={news.title}
          className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
        />
        
        {/* Reliability Score Badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-lg ${getReliabilityBg(news.reliabilityScore)}`}>
          <div className="flex items-center space-x-1">
            <span className={`font-medium ${getReliabilityColor(news.reliabilityScore)}`}>
              {news.reliabilityScore.toFixed(1)}/10
            </span>
            <Shield className={`h-3 w-3 fill-current ${getReliabilityColor(news.reliabilityScore)}`} />
          </div>
        </div>

        {/* Category Badge */}
        <Badge 
          variant="secondary" 
          className="absolute top-3 right-3 bg-amber-100 text-amber-800 border-amber-200"
        >
          {news.category}
        </Badge>
        
        {/* Blockchain Hash Info Icon */}
        {news.blockHash && (
          <Popover>
            <PopoverTrigger asChild onClick={handleInfoClick}>
              <Button
                variant="outline"
                size="icon"
                className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 border-amber-200 dark:border-amber-800"
              >
                <Info className="h-4 w-4 text-amber-800 dark:text-amber-200" />
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

      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold leading-snug mb-2 group-hover:text-primary transition-colors">
          {news.title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed flex-1">
          {news.excerpt}
        </p>
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0 mt-auto">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span>{news.author}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{formatDate(news.publishedAt)}</span>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}