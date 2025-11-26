import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { 
  Shield, 
  Clock, 
  User, 
  Calendar, 
  ExternalLink, 
  Share2, 
  Bookmark,
  X
} from 'lucide-react';
import { NewsItem } from './NewsCard';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface NewsDetailModalProps {
  news: NewsItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function NewsDetailModal({ news, isOpen, onClose }: NewsDetailModalProps) {
  if (!news) return null;

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
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReliabilityBg = (score: number) => {
    if (score >= 7) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 5) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const getReliabilityLabel = (score: number) => {
    if (score >= 8) return 'Highly Reliable';
    if (score >= 7) return 'Reliable';
    if (score >= 5) return 'Moderately Reliable';
    return 'Low Reliability';
  };

  // Extended content for the modal
  const fullContent = `${news.excerpt}

India's remarkable achievements in 2025 have garnered international recognition across multiple sectors. The country's space program reached new heights with successful missions that demonstrated advanced technological capabilities, while economic indicators showed robust growth patterns that exceeded global expectations.

The National Space Day celebrations highlighted ISRO's contributions to both civilian and scientific applications of space technology. From satellite communications to earth observation systems, India's space infrastructure has become integral to the nation's development strategy.

Economic milestones included significant improvements in GDP growth, manufacturing output, and digital infrastructure development. The youth demographic has been particularly active in driving innovation across technology sectors, contributing to India's reputation as a global hub for digital solutions.

International observers have noted the country's balanced approach to technological advancement while maintaining focus on sustainable development goals. This comprehensive progress across multiple domains has positioned India as a key player in addressing global challenges while fostering domestic growth.

The achievements span various sectors including renewable energy adoption, digital governance initiatives, educational technology integration, and startup ecosystem development. These developments have created a foundation for continued growth and international collaboration in the coming years.`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-3 flex-shrink-0 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold leading-tight pr-2">
                {news.title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Read the full article details including content, verification information, and metadata.
              </DialogDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="p-2 h-8 w-8 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center">
              <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span>{news.author}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">{formatDate(news.publishedAt)}</span>
              <span className="sm:hidden">{new Date(news.publishedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Category and Reliability */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                {news.category}
              </Badge>
              <div className={`px-2 sm:px-3 py-1 rounded-lg ${getReliabilityBg(news.reliabilityScore)}`}>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Shield className={`h-3 w-3 sm:h-4 sm:w-4 ${getReliabilityColor(news.reliabilityScore)}`} />
                  <span className={`font-medium text-xs sm:text-sm ${getReliabilityColor(news.reliabilityScore)}`}>
                    {news.reliabilityScore.toFixed(1)}/10
                  </span>
                  <span className={`text-xs hidden sm:inline ${getReliabilityColor(news.reliabilityScore)}`}>
                    {getReliabilityLabel(news.reliabilityScore)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
              <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-8">
                <Bookmark className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline">Save</span>
              </Button>
              <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-8">
                <Share2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-8">
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline">Source</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Separator className="flex-shrink-0" />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0 py-4">
          <div className="space-y-6">
            {/* Featured Image */}
            <div className="relative w-full h-48 sm:h-64 lg:h-80 rounded-lg overflow-hidden">
              <ImageWithFallback
                src={news.thumbnail}
                alt={news.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Article Content */}
            <div className="prose prose-sm sm:prose-base prose-gray dark:prose-invert max-w-none">
              <div className="space-y-4 leading-relaxed">
                {fullContent.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Reliability Details */}
            <div className="p-3 sm:p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center text-sm sm:text-base">
                <Shield className="h-4 w-4 mr-2" />
                Verification Details
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="font-medium">Sources Verified:</span>
                  <p className="text-muted-foreground">4 independent sources</p>
                </div>
                <div>
                  <span className="font-medium">Fact-Check Status:</span>
                  <p className="text-muted-foreground">Verified by AI system</p>
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <p className="text-muted-foreground">{formatDate(news.publishedAt)}</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {['india', 'space', 'economy', 'technology', 'development'].map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}