import React, { useState, useMemo } from 'react';
import { NewsCard, NewsItem } from './NewsCard';
import { CategoryFilter } from './CategoryFilter';
import { mockNewsData } from '../data/mockData';
import { TrendingUp } from 'lucide-react';

interface HomePageProps {
  searchQuery: string;
  onNewsClick: (newsId: string) => void;
}

export function HomePage({ searchQuery, onNewsClick }: HomePageProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'geopolitics', 'business', 'sports', 'entertainment', 'technology', 'war', 'nearby'];

  const filteredNews = useMemo(() => {
    let filtered = mockNewsData;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(news => news.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(news => 
        news.title.toLowerCase().includes(query) ||
        news.excerpt.toLowerCase().includes(query) ||
        news.author.toLowerCase().includes(query) ||
        news.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const trendingNews = useMemo(() => {
    return [...mockNewsData]
      .sort((a, b) => b.reliabilityScore - a.reliabilityScore)
      .slice(0, 3);
  }, []);



  return (
    <div className="min-h-screen bg-background">
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trending Section */}
        {!searchQuery && selectedCategory === 'all' && (
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <TrendingUp className="h-6 w-6 mr-2 text-amber-600" />
              <h2 className="text-2xl font-semibold text-foreground">Trending News</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {trendingNews.map((news) => (
                <NewsCard
                  key={news.id}
                  news={news}
                  onClick={onNewsClick}
                />
              ))}
            </div>
          </section>
        )}

        {/* Search Results Header */}
        {searchQuery && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground">
              Search Results for "{searchQuery}"
            </h2>
            <p className="text-muted-foreground mt-2">
              Found {filteredNews.length} article{filteredNews.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Category Header */}
        {!searchQuery && selectedCategory !== 'all' && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground capitalize">
              {selectedCategory} News
            </h2>
          </div>
        )}

        {/* News Grid */}
        <section>
          {filteredNews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredNews.map((news) => (
                <NewsCard
                  key={news.id}
                  news={news}
                  onClick={onNewsClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No news found
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? `No articles match your search for "${searchQuery}"`
                    : `No articles available in the ${selectedCategory} category`
                  }
                </p>
              </div>
            </div>
          )}
        </section>
      </main>


    </div>
  );
}