import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { VerificationDashboard } from './components/VerificationDashboard';
import { NewsUpload } from './components/NewsUpload';
import { UserProfile } from './components/UserProfile';
import { AboutPage } from './components/AboutPage';
import { NewsDetailPage } from './components/NewsDetailPage';
import { BlockVerification } from './components/BlockVerification';
import { Footer } from './components/Footer';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { NewsItem } from './components/NewsCard';
import { mockNewsData } from './data/mockData';

type Page = 'home' | 'dashboard' | 'upload' | 'profile' | 'about' | 'login' | 'signup' | 'forgot-password' | 'news-detail' | 'block-verify';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const { login, signup, resetPassword, isAuthenticated } = useAuth();

  // Handle protected routes when authentication state changes
  useEffect(() => {
    const protectedRoutes = ['dashboard', 'upload', 'profile'];
    if (protectedRoutes.includes(currentPage) && !isAuthenticated) {
      toast.error('Authentication required', {
        description: 'Please sign in to access this feature.',
      });
      setCurrentPage('login');
    }
  }, [isAuthenticated, currentPage]);

  const handlePageChange = (page: string) => {
    const protectedRoutes = ['dashboard', 'upload', 'profile'];
    
    // Check if trying to access protected route while not authenticated
    if (protectedRoutes.includes(page) && !isAuthenticated) {
      toast.error('Authentication required', {
        description: 'Please sign in to access this feature.',
      });
      setCurrentPage('login');
      return;
    }
    
    setCurrentPage(page as Page);
    // Clear search when navigating to different pages
    if (page !== 'home') {
      setSearchQuery('');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Navigate to home page when searching
    if (currentPage !== 'home') {
      setCurrentPage('home');
    }
  };

  const handleNewsClick = (newsId: string) => {
    const fetchAndOpen = async () => {
      try {
        // Try fetching full metadata from backend by CID
        const res = await fetch(`http://localhost:5000/dashboard/article/${newsId}`);
        if (!res.ok) throw new Error('Failed to fetch article');
        const metadata = await res.json();

        // Map backend metadata JSON to NewsItem
        const thumb = metadata.files && metadata.files.length > 0 ? (metadata.files[0].ipfsHash || '') : (metadata.metadata_hash || '');
        const thumbnail = thumb && !/^https?:\/\//i.test(String(thumb)) ? `https://gateway.pinata.cloud/ipfs/${thumb}` : String(thumb);

        const mapped: NewsItem = {
          id: String(metadata.metadata_hash || metadata.block_hash || newsId),
          title: metadata.title || '',
          excerpt: metadata.description ? (String(metadata.description).split(' ').slice(0,20).join(' ') + (String(metadata.description).split(' ').length>20 ? '...' : '')) : '',
          thumbnail: thumbnail,
          reliabilityScore: typeof metadata.verification?.score === 'number' ? metadata.verification.score : 5.0,
          category: metadata.category || 'general',
          author: (metadata.uploaded_by && metadata.uploaded_by.name) || 'Unknown',
          publishedAt: metadata.published_at || new Date().toISOString(),
          blockHash: metadata.block_hash || undefined
        };

        setSelectedNews(mapped);
        setCurrentPage('news-detail');
      } catch (err) {
        // Fallback to local mock data
        const news = mockNewsData.find(item => item.id === newsId);
        if (news) {
          setSelectedNews(news);
          setCurrentPage('news-detail');
        }
      }
    };

    fetchAndOpen();
  };

  const handleBackFromNewsDetail = () => {
    setSelectedNews(null);
    setCurrentPage('home');
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      toast.success('Welcome back!', {
        description: 'You have successfully signed in to Nation Post.',
      });
      setCurrentPage('home');
    } catch (error) {
      toast.error('Sign in failed', {
        description: 'Please check your credentials and try again.',
      });
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    try {
      await signup(email, password, name);
      toast.success('Account created!', {
        description: 'Welcome to Nation Post. Your account has been created successfully.',
      });
      setCurrentPage('home');
    } catch (error) {
      toast.error('Sign up failed', {
        description: 'Please check your information and try again.',
      });
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await resetPassword(email);
      toast.success('Reset email sent!', {
        description: 'Check your email for password reset instructions.',
      });
    } catch (error) {
      toast.error('Failed to send reset email', {
        description: 'Please try again later.',
      });
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage searchQuery={searchQuery} onNewsClick={handleNewsClick} />;
      case 'dashboard':
        return <VerificationDashboard />;
      case 'upload':
        return <NewsUpload />;
      case 'profile':
        return <UserProfile />;
      case 'about':
        return <AboutPage />;
      case 'news-detail':
        return <NewsDetailPage news={selectedNews} onBack={handleBackFromNewsDetail} />;
      case 'login':
        return (
          <LoginPage
            onLogin={handleLogin}
            onForgotPassword={() => setCurrentPage('forgot-password')}
            onSignUp={() => setCurrentPage('signup')}
          />
        );
      case 'signup':
        return (
          <SignUpPage
            onSignUp={handleSignUp}
            onSignIn={() => setCurrentPage('login')}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordPage
            onResetPassword={handleResetPassword}
            onBackToLogin={() => setCurrentPage('login')}
          />
        );
      case 'block-verify':
        return (
          <div className="min-h-screen bg-background py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <BlockVerification />
            </div>
          </div>
        );
      default:
        return <HomePage searchQuery={searchQuery} onNewsClick={handleNewsClick} />;
    }
  };

  // Don't show header and footer for auth pages and news detail page
  const isAuthPage = ['login', 'signup', 'forgot-password'].includes(currentPage);
  const isNewsDetailPage = currentPage === 'news-detail';

  if (isAuthPage || isNewsDetailPage) {
    return (
      <div className="min-h-screen bg-background">
        {renderCurrentPage()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
      />
      
      <main className="flex-1">
        {renderCurrentPage()}
      </main>
      
      <Footer onPageChange={handlePageChange} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}