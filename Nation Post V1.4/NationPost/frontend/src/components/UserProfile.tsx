import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { 
  User, 
  Edit, 
  Save, 
  Upload, 
  Shield, 
  Bookmark, 
  Settings,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { NewsCard } from './NewsCard';

export function UserProfile() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Nishant Prashar',
    email: user?.email || 'nishant1@gmail.com',
    bio: 'Passionate about technology and global news. Committed to sharing accurate information.',
    location: 'Nagpur, India',
    joinDate: user?.joinDate || '06/10/2025'
  });

  const userStats = {
    articlesUploaded: 12,
    verificationsCompleted: 45,
    savedArticles: 23,
    trustScore: 8.4
  };

  const userArticles = [
    {
      id: '1',
      title: 'Understanding Climate Change Impact on Global Economy',
      excerpt: 'A comprehensive analysis of how climate change affects worldwide economic systems...',
      thumbnail: 'https://images.unsplash.com/photo-1712512162392-d523620fbaa2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGFjZSUyMHNhdGVsbGl0ZSUyMGVhcnRoJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NTg1NTU1MTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      reliabilityScore: 8.2,
      category: 'business',
      author: 'John Doe',
      publishedAt: '2024-12-15'
    },
    {
      id: '2',
      title: 'Breakthrough in Renewable Energy Technology',
      excerpt: 'Scientists develop new solar panel technology that increases efficiency by 40%...',
      thumbnail: 'https://images.unsplash.com/photo-1710492341412-8b3aee7e70a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGZpbmFuY2UlMjBlY29ub215fGVufDF8fHx8MTc1ODU0NjExMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      reliabilityScore: 9.0,
      category: 'technology',
      author: 'John Doe',
      publishedAt: '2024-12-10'
    }
  ];

  const savedArticles = [
    {
      id: '3',
      title: 'Global Trade Relations in 2024',
      excerpt: 'Analysis of international trade patterns and their economic implications...',
      thumbnail: 'https://images.unsplash.com/photo-1645994432686-f061051fd5b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2xpdGljcyUyMGdvdmVybm1lbnQlMjB3b3JsZHxlbnwxfHx8fDE3NTg1NTU1MjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      reliabilityScore: 7.8,
      category: 'geopolitics',
      author: 'Sarah Chen',
      publishedAt: '2024-12-18'
    }
  ];

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to the backend
    console.log('Profile updated:', profileData);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatar} alt={profileData.name} />
                <AvatarFallback className="text-lg bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                  {profileData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-semibold text-foreground">{profileData.name}</h1>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
                <p className="text-muted-foreground">{profileData.email}</p>
                <p className="text-sm">{profileData.bio}</p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>📍 {profileData.location}</span>
                  <span>📅 Joined {new Date(profileData.joinDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Trust Score */}
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{userStats.trustScore}/10</div>
                <div className="text-xs text-muted-foreground">Trust Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{userStats.articlesUploaded}</div>
              <div className="text-xs text-muted-foreground">Articles</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{userStats.verificationsCompleted}</div>
              <div className="text-xs text-muted-foreground">Verifications</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Bookmark className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{userStats.savedArticles}</div>
              <div className="text-xs text-muted-foreground">Saved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <User className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">{userStats.trustScore}/10</div>
              <div className="text-xs text-muted-foreground">Trust Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="articles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="articles">
              <span className="hidden sm:inline">My </span>Articles
            </TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="verifications">
              <span className="hidden sm:inline">Verification</span>
              <span className="sm:hidden">Verify</span>
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Published Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {userArticles.map((article) => (
                    <NewsCard key={article.id} news={article} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Saved Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {savedArticles.map((article) => (
                    <NewsCard key={article.id} news={article} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Verification History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { headline: 'Climate Summit Agreement Reached', score: 8.4, date: '2024-12-20' },
                    { headline: 'Tech Stock Performance Update', score: 7.6, date: '2024-12-19' },
                    { headline: 'Global Trade Relations Analysis', score: 9.0, date: '2024-12-18' }
                  ].map((verification, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <h4 className="font-medium">{verification.headline}</h4>
                        <p className="text-sm text-muted-foreground">{verification.date}</p>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {verification.score}/10
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  {isEditing && (
                    <Button onClick={handleSave} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* App Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Settings className="h-5 w-5 mr-2 inline" />
                    Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Toggle between light and dark themes
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4" />
                      <Switch
                        checked={theme === 'dark'}
                        onCheckedChange={toggleTheme}
                      />
                      <Moon className="h-4 w-4" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about your articles
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Verification Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about verification results
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}