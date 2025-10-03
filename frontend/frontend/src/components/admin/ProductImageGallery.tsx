import React, { useState } from 'react';
import { X, Upload, Trash2, ZoomIn, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductImageGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  onImagesUpdate: (images: string[]) => void;
  productName: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  isOpen,
  onClose,
  images,
  onImagesUpdate,
  productName
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      // Simulate image upload - in real app, upload to cloud storage
      const uploadedUrls = files.map(file => URL.createObjectURL(file));
      onImagesUpdate([...images, ...uploadedUrls]);
      toast.success(`${files.length} resim yüklendi`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Resim yüklenirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesUpdate(newImages);
    
    // Adjust current index if needed
    if (currentIndex >= newImages.length) {
      setCurrentIndex(Math.max(0, newImages.length - 1));
    }
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesUpdate(newImages);
    
    // Update current index
    if (currentIndex === fromIndex) {
      setCurrentIndex(toIndex);
    } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
      setCurrentIndex(currentIndex - 1);
    } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  const resetOrder = () => {
    // Reset to original order (this would need to be implemented based on your needs)
    toast.info('Resim sırası sıfırlandı');
  };

  return (
    <>
      {/* Main Gallery Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {productName} - Resim Galerisi
            </h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={resetOrder}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Sıfırla
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex h-[70vh]">
            {/* Main Image Display */}
            <div className="flex-1 flex items-center justify-center bg-gray-100 relative">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[currentIndex]}
                    alt={`${productName} - Resim ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />
                  
                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {/* Fullscreen Button */}
                  <button
                    onClick={openFullscreen}
                    className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {currentIndex + 1} / {images.length}
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Henüz resim yüklenmedi</p>
                  <p className="text-sm">Yeni resimler eklemek için sağdaki paneli kullanın</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="w-80 border-l border-gray-200 flex flex-col">
              {/* Upload Section */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Resim Ekle</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="gallery-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="gallery-upload"
                    className={`cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {uploading ? 'Yükleniyor...' : 'Resim yükle'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, JPEG desteklenir
                    </p>
                  </label>
                </div>
              </div>

              {/* Thumbnail List */}
              <div className="flex-1 overflow-y-auto p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Resimler ({images.length})
                </h3>
                <div className="space-y-2">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className={`relative group border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                        index === currentIndex
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setCurrentIndex(index)}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                      
                      {/* Image Number */}
                      <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                        {index + 1}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      {/* Move Buttons */}
                      <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-1">
                          {index > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveImage(index, index - 1);
                              }}
                              className="bg-black bg-opacity-50 text-white p-1 rounded"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                          )}
                          {index < images.length - 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveImage(index, index + 1);
                              }}
                              className="bg-black bg-opacity-50 text-white p-1 rounded"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && images.length > 0 && (
        <div className="fixed inset-0 bg-black z-60 flex items-center justify-center">
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>
          
          <img
            src={images[currentIndex]}
            alt={`${productName} - Fullscreen`}
            className="max-w-full max-h-full object-contain"
          />
          
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300 transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300 transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-lg">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductImageGallery;
