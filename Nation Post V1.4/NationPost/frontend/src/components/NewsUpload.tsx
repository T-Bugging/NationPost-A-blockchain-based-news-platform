import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Upload, Image as ImageIcon, FileText, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export function NewsUpload() {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '', // CHANGED: from 'content' to match backend expectation
    imageFile: null as File | null,
    source: '' // CHANGED: from 'sourceUrl' to match backend expectation
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [reliabilityScore, setReliabilityScore] = useState<number | null>(null);

  const categories = [
    { value: 'geopolitics', label: 'Geopolitics' },
    { value: 'politics', label: 'Politics' },
    { value: 'business', label: 'Business' },
    { value: 'sports', label: 'Sports' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'technology', label: 'Technology' },
    { value: 'war', label: 'War' },
    { value: 'nearby', label: 'Nearby' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('title', formData.title);
      uploadFormData.append('category', formData.category);
      
      // CHANGED: Backend expects 'description' not 'content'
      uploadFormData.append('description', formData.description);
      
      // CHANGED: Backend expects 'source' not 'sourceUrl'
      uploadFormData.append('source', formData.source);
      
      // CHANGED: Backend expects 'files' key (supports multiple files)
      if (formData.imageFile) {
        uploadFormData.append('files', formData.imageFile);
      }

      // DEBUG: Log what we're sending
      console.log('=== SENDING TO BACKEND ===');
      console.log('Title:', formData.title);
      console.log('Category:', formData.category);
      console.log('Description:', formData.description);
      console.log('Source:', formData.source);
      console.log('Image File:', formData.imageFile?.name);

      // Attach JWT from storage (localStorage preferred, fallback to sessionStorage)
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // DEBUG: show whether token is present
      console.log('Upload token present:', !!token);

      // If token exists, try to decode payload client-side and append userID/name
      if (token) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join('')
          );
          const payload = JSON.parse(jsonPayload);
          console.log('Decoded JWT payload for upload:', payload);
          if (payload.userID) {
            uploadFormData.append('userID', String(payload.userID));
          }
          if (payload.name) {
            uploadFormData.append('name', String(payload.name));
          }
        } catch (err) {
          console.warn('Failed to decode JWT on client side:', err);
        }
      }

      const response = await fetch('http://localhost:5000/upload/', {
        method: 'POST',
        headers,
        body: uploadFormData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      
      // DEBUG: Log response
      console.log('=== BACKEND RESPONSE ===', data);
      
      // CHANGED: Backend returns verification.score (0-10 scale), not reliabilityScore
      const score = data.verification?.score || 5.0;
      setReliabilityScore(score);
      setIsUploading(false);
      setUploadSuccess(true);
      
      // Reset form after successful upload
      setTimeout(() => {
        setFormData({
          title: '',
          category: '',
          description: '',
          imageFile: null,
          source: ''
        });
        setUploadSuccess(false);
        setReliabilityScore(null);
      }, 3000);
    } catch (error) {
      console.error('Error uploading article:', error);
      setIsUploading(false);
      alert('Upload failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Upload News Article</h1>
          <p className="text-muted-foreground">
            Share news with the community. All submissions are verified by our AI system.
          </p>
        </div>

        {/* Removed success alert per request; published badge remains near the Publish button */}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Article Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Article Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter a compelling headline..."
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="source">Source URL (Optional)</Label>
                  <Input
                    id="source"
                    value={formData.source}
                    onChange={(e) => handleInputChange('source', e.target.value)}
                    placeholder="https://source.com/article"
                    className="mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Article Content *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Write your article content here..."
                    className="mt-1 min-h-[200px]"
                    required
                  />
                  {/* DEBUG: Show character count */}
                  <p className="text-xs text-muted-foreground mt-1">
                    Characters: {formData.description.length}
                  </p>
                </div>

                <div>
                  <Label htmlFor="image">Featured Image</Label>
                  <div className="mt-1">
                    <label
                      htmlFor="image"
                      className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="text-center">
                        <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {formData.imageFile ? formData.imageFile.name : 'Click to upload image'}
                        </p>
                      </div>
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  <p>* Required fields</p>
                  <p>Articles are automatically verified by our AI system</p>
                </div>

                <div className="flex items-center space-x-4">
                  {uploadSuccess ? (
                    <div
                      role="status"
                      className="flex items-center space-x-2 bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-4 py-2 rounded-md"
                    >
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Published</span>
                    </div>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={!formData.title || !formData.category || !formData.description || isUploading}
                      className="min-w-[120px]"
                    >
                      {isUploading ? (
                        <>
                          <FileText className="h-4 w-4 mr-2 animate-pulse" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Publish Article
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Publishing Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium mb-2">Content Requirements</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Original content or properly attributed sources</li>
                  <li>• Factual and well-researched information</li>
                  <li>• Clear and engaging headlines</li>
                  <li>• Appropriate category selection</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Technical Details</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Images stored on IPFS for decentralization</li>
                  <li>• AI verification for reliability scoring</li>
                  <li>• Blockchain immutable storage</li>
                  <li>• Automatic content verification</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}