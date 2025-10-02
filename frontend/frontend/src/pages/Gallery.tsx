import React from 'react';
import { useQuery } from 'react-query';
import { api } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Gallery: React.FC = () => {
  const { t } = useLanguage();
  const { data, isLoading } = useQuery('gallery-images', () =>
    api.get('/gallery').then(res => res.data)
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('gallery.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('gallery.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.images?.map((image: any) => (
            <div key={image._id} className="card group">
              <div className="aspect-square overflow-hidden rounded-t-xl">
                <img
                  src={image.imageUrl}
                  alt={image.caption || t('gallery.imageAlt')}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              {image.caption && (
                <div className="p-4">
                  <p className="text-gray-700">{image.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
