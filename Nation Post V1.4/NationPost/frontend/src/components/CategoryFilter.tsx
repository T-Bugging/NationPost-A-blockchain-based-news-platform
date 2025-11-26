import React from 'react';
import { Badge } from './ui/badge';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categoryMap = {
  'all': 'All',
  'geopolitics': 'Geopolitics',
  'business': 'Business',
  'sports': 'Sports',
  'entertainment': 'Entertainment',
  'technology': 'Technology',
  'war': 'War',
  'nearby': 'Nearby'
};

export function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="bg-muted/30 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`cursor-pointer transition-colors px-4 py-2 ${
                selectedCategory === category
                  ? 'bg-amber-200 hover:bg-amber-300 text-amber-900 border-amber-300'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:hover:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800'
              }`}
              onClick={() => onCategoryChange(category)}
            >
              {categoryMap[category as keyof typeof categoryMap] || category}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}