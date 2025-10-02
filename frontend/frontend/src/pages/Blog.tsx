import React from 'react';
import { useQuery } from 'react-query';
import { api } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BlogPreview from '../components/blog/BlogPreview';

const Blog: React.FC = () => {
  const { t } = useLanguage();
  const { data, isLoading } = useQuery('blog-posts', () =>
    api.get('/blog').then(res => res.data)
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('blog.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('blog.subtitle')}
          </p>
        </div>
        
        <BlogPreview posts={data?.posts || []} />
      </div>
    </div>
  );
};

export default Blog;
