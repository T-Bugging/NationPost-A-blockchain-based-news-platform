import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Shield, 
  Globe, 
  Users, 
  Zap, 
  Database, 
  Brain,
  Github,
  Mail,
  ExternalLink
} from 'lucide-react';
import { Button } from './ui/button';

export function AboutPage() {
  const features = [
    {
      icon: Shield,
      title: 'AI-Powered Verification',
      description: 'Advanced AI algorithms verify news reliability and detect misinformation in real-time.'
    },
    {
      icon: Globe,
      title: 'Global Coverage',
      description: 'Comprehensive news coverage across multiple categories including geopolitics, business, and technology.'
    },
    {
      icon: Users,
      title: 'Community-Driven',
      description: 'Users can upload, verify, and collaborate on news content to maintain information quality.'
    },
    {
      icon: Zap,
      title: 'Real-Time Updates',
      description: 'Get instant notifications about breaking news and trending stories as they happen.'
    },
    {
      icon: Database,
      title: 'Decentralized Storage',
      description: 'Content stored on IPFS and MongoDB for reliability, transparency, and data integrity.'
    },
    {
      icon: Brain,
      title: 'Smart Categorization',
      description: 'Automatic content categorization and tagging using machine learning algorithms.'
    }
  ];

  const techStack = [
    { name: 'Frontend', tech: 'React + TypeScript + Tailwind CSS' },
    { name: 'Backend', tech: 'Node.js + Express' },
    { name: 'Database', tech: 'MongoDB' },
    { name: 'Storage', tech: 'IPFS (InterPlanetary File System)' },
    { name: 'AI/ML', tech: 'Custom Verification Agents' },
    { name: 'Authentication', tech: 'JWT + OAuth' }
  ];

  const teamMembers = [
    {
      name: 'Uday Pandey & Aniket Thakur',
      role: 'Lead Developer',
      specialization: 'Backend, Blockchain & Integration'
    },
    {
      name: 'Sanskar Pandey',
      role: 'AI/ML Engineer',
      specialization: 'News Verification'
    },
    {
      name: 'Yash Kanhere',
      role: 'Frontend Engineer',
      specialization: 'UI/UX Desgin'
    },
    {
      name: 'Nishant Parashar & Vrundita Jamkar',
      role: 'Database Engineer',
      specialization: 'MongoDB, Pinata IPFS'
    }
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">About Nation Post</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A revolutionary news platform combining AI-powered verification, decentralized storage, 
            and community collaboration to combat misinformation and promote reliable journalism.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Nation Post is dedicated to creating a trustworthy, transparent, and accessible news ecosystem. 
              We leverage cutting-edge technology including artificial intelligence, blockchain principles, 
              and community verification to ensure that accurate information reaches everyone while 
              combating the spread of misinformation.
            </p>
          </CardContent>
        </Card>

        {/* Key Features */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-center mb-8">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Icon className="h-6 w-6 mr-3 text-primary" />
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Technology Stack */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-center mb-8">Technology Stack</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {techStack.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <span className="font-medium">{item.name}</span>
                    <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                      {item.tech}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">1. Content Submission</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Users submit news articles, headlines, or URLs for verification. 
                  Content is automatically processed and categorized.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-center">2. AI Verification</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Our AI agents analyze the content against multiple sources, 
                  fact-checking databases, and reliability indicators.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-center">3. Community Review</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Verified content is published with reliability scores. 
                  The community can further validate and discuss the information.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Development Team */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-center mb-8">Development Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamMembers.map((member, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-primary font-medium">{member.role}</p>
                    <p className="text-sm text-muted-foreground mt-2">{member.specialization}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Backend Integration Details */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-center mb-8">Backend Architecture</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="text-center">
                  <Database className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="font-semibold mb-2">MongoDB Database</h3>
                  <p className="text-sm text-muted-foreground">
                    Stores user profiles, news metadata, verification history, 
                    and application settings with flexible schema design.
                  </p>
                </div>
                
                <div className="text-center">
                  <Globe className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <h3 className="font-semibold mb-2">IPFS Storage</h3>
                  <p className="text-sm text-muted-foreground">
                    Decentralized storage for news images, documents, and content 
                    ensuring permanence and censorship resistance.
                  </p>
                </div>
                
                <div className="text-center">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                  <h3 className="font-semibold mb-2">AI Verification</h3>
                  <p className="text-sm text-muted-foreground">
                    Machine learning agents that analyze content authenticity, 
                    cross-reference sources, and generate reliability scores.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact & Links */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Get Involved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Button variant="outline" className="flex items-center">
                  <Github className="h-4 w-4 mr-2" />
                  View on GitHub
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
                <Button variant="outline" className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Team
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Nation Post is an open-source project. Contributions and feedback are welcome!
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Footer Note */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Built with ❤️ for a more informed world</p>
          <p className="mt-1">© 2024 Nation Post. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}