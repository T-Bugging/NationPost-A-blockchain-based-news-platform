import React from 'react';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { Mail, Github, Twitter, Shield, FileText } from 'lucide-react';

interface FooterProps {
  onPageChange: (page: string) => void;
}

export function Footer({ onPageChange }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Platform',
      links: [
        { label: 'About Us', action: () => onPageChange('about') },
        { label: 'How It Works', action: () => onPageChange('about') },
        { label: 'Verification Process', action: () => onPageChange('dashboard') },
        { label: 'Upload News', action: () => onPageChange('upload') }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', action: () => console.log('Privacy Policy') },
        { label: 'Terms of Service', action: () => console.log('Terms of Service') },
        { label: 'Content Guidelines', action: () => console.log('Content Guidelines') },
        { label: 'Cookie Policy', action: () => console.log('Cookie Policy') }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', action: () => console.log('Help Center') },
        { label: 'Contact Us', action: () => console.log('Contact Us') },
        { label: 'Report Issue', action: () => console.log('Report Issue') },
        { label: 'API Documentation', action: () => console.log('API Docs') }
      ]
    }
  ];

  return (
    <footer className="bg-muted/30 border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-lg text-foreground mb-4">Nation Post</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              A revolutionary news platform combining AI-powered verification, 
              decentralized storage, and community collaboration to combat 
              misinformation and promote reliable journalism.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="sm" className="p-2">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold text-foreground mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <button
                      onClick={link.action}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>© {currentYear} Nation Post. All rights reserved.</span>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center">
              <Shield className="h-3 w-3 mr-1" />
              <span>Verified by AI</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <FileText className="h-3 w-3 mr-1" />
              <span>Open Source</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <span>Built with ❤️ for truth</span>
          </div>
        </div>

        {/* Technology Credits */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Powered by MongoDB • IPFS • AI Verification • React • Tailwind CSS
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Dedicated to transparency, accuracy, and community-driven journalism
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}