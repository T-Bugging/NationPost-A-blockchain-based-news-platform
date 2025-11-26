import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Clock, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VerificationResult {
  score: number;
  confidence: number;
  summary: string;
  sources: string[];
  flags: string[];
}

export function VerificationDashboard() {
  const [headline, setHeadline] = useState('');
  const [subtext, setSubtext] = useState('');
  const [url, setUrl] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verificationHistory, setVerificationHistory] = useState([
    {
      id: '1',
      headline: 'Global Climate Summit Reaches Agreement',
      score: 8.4,
      date: '2024-12-20',
      status: 'verified'
    },
    {
      id: '2',
      headline: 'Tech Stocks Rise 15% After Earnings',
      score: 7.6,
      date: '2024-12-19',
      status: 'verified'
    },
    {
      id: '3',
      headline: 'Unconfirmed Reports of Market Crash',
      score: 3.0,
      date: '2024-12-18',
      status: 'flagged'
    }
  ]);

  const truncateSummary = (text: string, maxWords: number = 150): string => {
    const words = text.split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  const handleVerification = async () => {
    if (!headline.trim()) return;

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          headline,
          description: subtext,
          url: url || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Verification failed: ${response.status}`);
      }

      const data = await response.json();

      // Map backend response to frontend format
      // Backend returns: prediction, confidence, score, reason, sources
      const prediction = data.prediction || 'UNKNOWN';
      const sourceTitles = Array.isArray(data.sources) 
        ? data.sources.map((s: any) => s.title || 'Unknown source')
        : [];

      // Generate flags based on prediction and score
      const flags: string[] = [];
      if (prediction.includes('FAKE')) {
        flags.push('Potentially misleading information detected');
      }
      if (prediction.includes('NO EVIDENCE')) {
        flags.push('No corroborating sources found');
      }
      if (data.score < 5) {
        flags.push('Low credibility score');
      }

      const mappedResult: VerificationResult = {
        score: Number(data.score) || 0,
        confidence: Number(data.confidence) || 0,
        summary: truncateSummary(data.reason || 'No analysis available', 150),
        sources: sourceTitles,
        flags: flags
      };

      setResult(mappedResult);

      // Add to history
      const newEntry = {
        id: Date.now().toString(),
        headline,
        score: mappedResult.score,
        date: new Date().toISOString().split('T')[0],
        status: mappedResult.score >= 6 ? 'verified' : 'flagged'
      };
      setVerificationHistory(prev => [newEntry, ...prev]);
    } catch (error) {
      console.error('Error verifying news:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during verification');
      setResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 7) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 5) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">News Verification Dashboard</h1>
          <p className="text-muted-foreground">
            Verify the reliability of news headlines using our AI-powered verification system
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Verification Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Verify News
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="headline">Headline *</Label>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Enter the news headline to verify..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="subtext">Additional Context (Optional)</Label>
                <Textarea
                  id="subtext"
                  value={subtext}
                  onChange={(e) => setSubtext(e.target.value)}
                  placeholder="Add any additional details or context..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="url">Source URL (Optional)</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/news-article"
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleVerification}
                disabled={!headline.trim() || isVerifying}
                className="w-full"
              >
                {isVerifying ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Verify News
                  </>
                )}
              </Button>

              {error && (
                <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Verification Result */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {result.score >= 6 ? (
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                  )}
                  Verification Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`p-4 rounded-lg ${getScoreBg(result.score)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Reliability Score</span>
                    <span className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                      {result.score.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        result.score >= 7 ? 'bg-green-600' :
                        result.score >= 5 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${(result.score / 10) * 100}%` }}
                    />
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Confidence: {result.confidence.toFixed(0)}%
                  </div>
                </div>

                {result.flags.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Warning:</strong> {result.flags.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}

                <div>
                  <h4 className="font-medium mb-2">Analysis</h4>
                  <p className="text-sm text-muted-foreground">{result.summary}</p>
                </div>

                {result.sources.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Sources Checked</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {result.sources.map((source, index) => (
                        <li key={index} className="break-words">
                          • {source}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Verification History */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {verificationHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{item.headline}</h4>
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`font-medium ${getScoreColor(item.score)}`}>
                      {item.score.toFixed(1)}/10
                    </span>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      item.status === 'verified' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {item.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}