import React from 'react';
import { Link } from 'react-router-dom';

interface GalleryPreviewProps {
  images: Array<{
    _id: string;
    imageUrl: string;
    caption?: string;
    category: string;
  }>;
}

const GalleryPreview: React.FC<GalleryPreviewProps> = ({ images }) => {
  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No images available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.slice(0, 6).map((image) => (
        <div key={image._id} className="group relative overflow-hidden rounded-xl bg-white shadow-lg">
          <img
            src={image.imageUrl}
            alt={image.caption || 'Gallery image'}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Link
                to="/gallery"
                className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-primary-500 hover:text-white transition-colors"
              >
                View Gallery
              </Link>
            </div>
          </div>
          {image.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              <p className="text-white text-sm font-medium">{image.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GalleryPreview;
