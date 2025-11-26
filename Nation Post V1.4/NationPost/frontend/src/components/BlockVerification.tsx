import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Shield, 
  Calendar,
  User,
  Hash,
  Copy,
  Check
} from 'lucide-react';
import { mockNewsData } from '../data/mockData';
import { toast } from 'sonner@2.0.3';

export function BlockVerification() {
  const [hashInput, setHashInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleVerify = () => {
    if (!hashInput.trim()) {
      toast.error('Please enter a hash to verify');
      return;
    }

    setIsSearching(true);

    // Simulate API call delay
    setTimeout(() => {
      // Search for the hash in mock data
      const foundArticle = mockNewsData.find(
        article => article.blockHash?.toLowerCase() === hashInput.toLowerCase().trim()
      );

      if (foundArticle) {
        setVerificationResult({
          valid: true,
          article: foundArticle,
          blockNumber: Math.floor(Math.random() * 100000) + 50000,
          timestamp: foundArticle.publishedAt,
          previousHash: generatePreviousHash(foundArticle.blockHash!),
          confirmations: Math.floor(Math.random() * 1000) + 500
        });
        toast.success('Hash verified successfully!');
      } else {
        setVerificationResult({
          valid: false,
          message: 'Hash not found in blockchain'
        });
        toast.error('Hash not found in our blockchain');
      }

      setIsSearching(false);
    }, 1000);
  };

  const generatePreviousHash = (currentHash: string) => {
    // Generate a mock previous hash
    return currentHash.split('').reverse().join('').substring(0, 64);
  };

  const handleCopyHash = () => {
    if (verificationResult?.article?.blockHash) {
      const text = verificationResult.article.blockHash;
      
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

      copyToClipboard(text);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-amber-600" />
            <span>Blockchain Hash Verification</span>
          </CardTitle>
          <CardDescription>
            Verify the authenticity of news articles by checking their blockchain hash. 
            Each article published on Nation Post is stored on our blockchain network with a unique hash.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hashInput">Enter Block Hash</Label>
            <div className="flex space-x-2">
              <Input
                id="hashInput"
                placeholder="Enter 64-character hash (e.g., a3f7b9c2d8e1f4a6...)"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                className="font-mono text-sm"
              />
              <Button 
                onClick={handleVerify}
                disabled={isSearching}
              >
                <Search className="h-4 w-4 mr-2" />
                {isSearching ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: Click the info icon on any news card to view and copy its blockchain hash
            </p>
          </div>
        </CardContent>
      </Card>

      {verificationResult && (
        <Card className={verificationResult.valid ? 'border-green-500' : 'border-red-500'}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {verificationResult.valid ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Verification Successful</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span>Verification Failed</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {verificationResult.valid ? (
              <div className="space-y-6">
                <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    This hash exists in our blockchain and corresponds to a valid article.
                  </AlertDescription>
                </Alert>

                {/* Article Information */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Article Title</h4>
                    <p className="font-semibold">{verificationResult.article.title}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Author</h4>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{verificationResult.article.author}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Category</h4>
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                        {verificationResult.article.category}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Reliability Score</h4>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="font-semibold">{verificationResult.article.reliabilityScore}/10</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Published Date</h4>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(verificationResult.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Blockchain Details */}
                  <div className="border-t pt-4 space-y-4">
                    <h4 className="font-semibold">Blockchain Details</h4>
                    
                    <div>
                      <h5 className="text-sm font-medium text-muted-foreground mb-1">Block Number</h5>
                      <p className="font-mono text-sm">#{verificationResult.blockNumber}</p>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-muted-foreground mb-1 flex items-center justify-between">
                        <span>Current Hash</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCopyHash}
                          className="h-6"
                        >
                          {copied ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </h5>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="font-mono text-xs break-all text-muted-foreground">
                          {verificationResult.article.blockHash}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-muted-foreground mb-1">Previous Hash</h5>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="font-mono text-xs break-all text-muted-foreground">
                          {verificationResult.previousHash}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-muted-foreground mb-1">Confirmations</h5>
                      <p className="font-semibold text-green-600">{verificationResult.confirmations} blocks</p>
                    </div>
                  </div>

                  {/* Article Excerpt */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Article Excerpt</h4>
                    <p className="text-sm text-muted-foreground">{verificationResult.article.excerpt}</p>
                  </div>
                </div>
              </div>
            ) : (
              <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {verificationResult.message || 'The hash you entered could not be found in our blockchain network. Please verify that you have entered the correct hash.'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Hash className="h-4 w-4" />
            <span>How Hash Verification Works</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>1. Immutable Record:</strong> When an article is published, it's stored on our blockchain with a unique hash that cannot be altered.
            </p>
            <p>
              <strong>2. Verification:</strong> By entering the hash, you can verify that an article exists in our blockchain and view its details.
            </p>
            <p>
              <strong>3. Transparency:</strong> This ensures transparency and authenticity of all content published on Nation Post.
            </p>
            <p>
              <strong>4. Chain of Trust:</strong> Each block references the previous block, creating an unbreakable chain of verified content.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}