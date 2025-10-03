import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import GalleryAddModal from '../../components/admin/GalleryAddModal';
import toast from 'react-hot-toast';
import { 
  Plus, 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  Image, 
  Calendar,
  Settings,
  CheckSquare,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Tag,
  Folder
} from 'lucide-react';

interface GalleryImage {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: 'Nature' | 'Animals' | 'Products' | 'Events' | 'Other';
  tags: string[];
  altText: string;
  isActive: boolean;
  fileSize: number;
  dimensions: {
    width: number;
    height: number;
  };
  createdAt: string;
  updatedAt: string;
}

const AdminGallery: React.FC = () => {
  const { user } = useAuth();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [stats, setStats] = useState({
    totalImages: 0,
    activeImages: 0,
    totalSize: 0,
    categories: []
  });

  const imagesPerPage = 20;

  useEffect(() => {
    fetchImages();
  }, [currentPage, categoryFilter, statusFilter, searchTerm]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
      
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', imagesPerPage.toString());
      
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`${baseUrl}/api/gallery/admin?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setImages(data.images);
        setTotalPages(data.totalPages);
        setStats(data.stats);
      } else if (response.status === 401) {
        toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        window.location.href = '/login';
      } else {
        toast.error('Resimler yüklenemedi');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Resimler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchImages();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedImages([]);
    } else {
      setSelectedImages(images.map(image => image._id));
    }
    setSelectAll(!selectAll);
  };

  const handleImageSelect = (imageId: string) => {
    if (selectedImages.includes(imageId)) {
      setSelectedImages(selectedImages.filter(id => id !== imageId));
    } else {
      setSelectedImages([...selectedImages, imageId]);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Nature':
        return 'bg-green-100 text-green-800';
      case 'Animals':
        return 'bg-blue-100 text-blue-800';
      case 'Products':
        return 'bg-purple-100 text-purple-800';
      case 'Events':
        return 'bg-orange-100 text-orange-800';
      case 'Other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'Nature':
        return 'Doğa';
      case 'Animals':
        return 'Hayvanlar';
      case 'Products':
        return 'Ürünler';
      case 'Events':
        return 'Etkinlikler';
      case 'Other':
        return 'Diğer';
      default:
        return category;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleImageAdded = (newImage: GalleryImage) => {
    setImages(prev => [newImage, ...prev]);
    setShowAddModal(false);
  };

  if (!user?.isAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Bu sayfaya erişim yetkiniz yok.</p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/admin"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Admin Paneline Dön
          </Link>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Image className="w-8 h-8 mr-3 text-blue-600" />
              Galeri Yönetimi
            </h1>
            <p className="text-gray-600 mt-2">
              Tüm resimleri görüntüleyin, yönetin ve düzenleyin.
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="inline mr-2" size={20} />
            Resim Yükle
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <Image className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Resim</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalImages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <CheckSquare className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktif Resim</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeImages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-100">
                <Folder className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Boyut</p>
                <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <Tag className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Kategoriler</p>
                <p className="text-2xl font-bold text-gray-900">{stats.categories.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="md:col-span-2">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Resim başlığı, açıklama veya etiket ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </form>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Kategoriler</option>
                <option value="Nature">Doğa</option>
                <option value="Animals">Hayvanlar</option>
                <option value="Products">Ürünler</option>
                <option value="Events">Etkinlikler</option>
                <option value="Other">Diğer</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={clearFilters}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtreleri Temizle
              </button>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => {/* TODO: Export functionality */}}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                CSV İndir
              </button>

              {selectedImages.length > 0 && (
                <button
                  onClick={() => {/* TODO: Bulk operations */}}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Toplu İşlemler ({selectedImages.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Images List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="mr-3"
              />
              <span className="text-sm font-medium text-gray-700">
                {selectedImages.length} resim seçildi
              </span>
            </div>
          </div>

          {/* Images Grid/List */}
          {images.length === 0 ? (
            <div className="text-center py-12">
              <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Resim bulunamadı</h3>
              <p className="text-gray-600">Arama kriterlerinizi değiştirmeyi deneyin.</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'divide-y divide-gray-200'}>
              {images.map((image) => (
                <div
                  key={image._id}
                  className={viewMode === 'grid' 
                    ? 'bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow' 
                    : 'flex items-center p-6 hover:bg-gray-50'
                  }
                >
                  {viewMode === 'grid' ? (
                    // Grid View
                    <>
                      <div className="relative">
                        <img
                          src={image.imageUrl}
                          alt={image.altText || image.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(image.category)}`}>
                            {getCategoryText(image.category)}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <input
                            type="checkbox"
                            checked={selectedImages.includes(image._id)}
                            onChange={() => handleImageSelect(image._id)}
                            className="w-4 h-4"
                          />
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{image.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{image.description}</p>
                        
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-gray-500">{formatFileSize(image.fileSize)}</span>
                          <span className={`text-sm font-medium ${getCategoryColor(image.category)}`}>
                            {image.dimensions.width}x{image.dimensions.height}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            image.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {image.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                          
                          <div className="flex space-x-2">
                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    // List View
                    <>
                      <div className="flex-shrink-0 mr-4">
                        <input
                          type="checkbox"
                          checked={selectedImages.includes(image._id)}
                          onChange={() => handleImageSelect(image._id)}
                          className="w-4 h-4"
                        />
                      </div>
                      
                      <div className="flex-shrink-0 mr-4">
                        <img
                          src={image.imageUrl}
                          alt={image.altText || image.title}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">{image.title}</h3>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">{formatFileSize(image.fileSize)}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(image.category)}`}>
                              {getCategoryText(image.category)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              image.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {image.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{image.description}</p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">
                              {image.dimensions.width}x{image.dimensions.height}
                            </span>
                            {image.tags.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <Tag className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {image.tags.slice(0, 3).join(', ')}
                                  {image.tags.length > 3 && ` +${image.tags.length - 3}`}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Sayfa {currentPage} / {totalPages}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gallery Add Modal */}
        <GalleryAddModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onImageAdded={handleImageAdded}
        />
      </div>
    </div>
  );
};

export default AdminGallery;
