import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProductAddModal from '../../components/admin/ProductAddModal';
import ProductEditModal from '../../components/admin/ProductEditModal';
import ProductDeleteModal from '../../components/admin/ProductDeleteModal';
import ProductImageGallery from '../../components/admin/ProductImageGallery';
import ProductBulkOperationsModal from '../../components/admin/ProductBulkOperationsModal';
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
  Package, 
  DollarSign, 
  Calendar,
  Settings,
  CheckSquare,
  Square,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'Live Bird' | 'Feed' | 'Equipment';
  imageUrls: string[];
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminProducts: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [galleryProduct, setGalleryProduct] = useState<Product | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const productsPerPage = 12;

  useEffect(() => {
    fetchProducts();
  }, [currentPage, categoryFilter, statusFilter, searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
      
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', productsPerPage.toString());
      
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`${baseUrl}/api/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
        setTotalPages(data.totalPages);
      } else if (response.status === 401) {
        toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        window.location.href = '/login';
      } else {
        toast.error('Ürünler yüklenemedi');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Ürünler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(product => product._id));
    }
    setSelectAll(!selectAll);
  };

  const handleProductSelect = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Live Bird':
        return 'bg-green-100 text-green-800';
      case 'Feed':
        return 'bg-blue-100 text-blue-800';
      case 'Equipment':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'Live Bird':
        return 'Canlı Kuş';
      case 'Feed':
        return 'Yem';
      case 'Equipment':
        return 'Ekipman';
      default:
        return category;
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Stokta Yok', color: 'text-red-600' };
    if (stock < 10) return { text: 'Düşük Stok', color: 'text-yellow-600' };
    return { text: 'Stokta', color: 'text-green-600' };
  };

  const handleProductAdded = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
    setShowAddModal(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleProductUpdated = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
    setShowEditModal(false);
    setEditingProduct(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
      
      const response = await fetch(`${baseUrl}/api/products/${deletingProduct._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Ürün başarıyla silindi');
        setProducts(prev => prev.filter(p => p._id !== deletingProduct._id));
        setShowDeleteModal(false);
        setDeletingProduct(null);
      } else if (response.status === 401) {
        toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        window.location.href = '/login';
      } else {
        const error = await response.json();
        toast.error(error.message || 'Ürün silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Ürün silinirken hata oluştu');
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingProduct(null);
  };

  const handleViewImages = (product: Product) => {
    setGalleryProduct(product);
    setShowImageGallery(true);
  };

  const handleImagesUpdate = (updatedImages: string[]) => {
    if (galleryProduct) {
      const updatedProduct = { ...galleryProduct, imageUrls: updatedImages };
      setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
      setGalleryProduct(updatedProduct);
    }
  };

  const handleCloseImageGallery = () => {
    setShowImageGallery(false);
    setGalleryProduct(null);
  };

  const handleBulkOperations = () => {
    if (selectedProducts.length === 0) {
      toast.error('Lütfen en az bir ürün seçin');
      return;
    }
    setShowBulkModal(true);
  };

  const handleBulkUpdate = async (action: string, data: any) => {
    setBulkLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
      
      const response = await fetch(`${baseUrl}/api/products/bulk-update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productIds: selectedProducts,
          action,
          data
        })
      });

      if (response.ok) {
        toast.success(`${selectedProducts.length} ürün güncellendi`);
        fetchProducts(); // Refresh the list
        setSelectedProducts([]);
        setSelectAll(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Toplu güncelleme başarısız');
      }
    } catch (error) {
      console.error('Bulk update error:', error);
      toast.error('Toplu güncelleme sırasında hata oluştu');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setBulkLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
      
      const response = await fetch(`${baseUrl}/api/products/bulk-delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productIds: selectedProducts
        })
      });

      if (response.ok) {
        toast.success(`${selectedProducts.length} ürün silindi`);
        setProducts(prev => prev.filter(p => !selectedProducts.includes(p._id)));
        setSelectedProducts([]);
        setSelectAll(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Toplu silme başarısız');
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Toplu silme sırasında hata oluştu');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkExport = () => {
    const selectedProductsData = products.filter(p => selectedProducts.includes(p._id));
    const csvContent = [
      ['Ürün Adı', 'Açıklama', 'Fiyat', 'Kategori', 'Stok', 'Durum', 'Oluşturma Tarihi'],
      ...selectedProductsData.map(product => [
        product.name,
        product.description,
        product.price.toString(),
        product.category,
        product.stock.toString(),
        product.isActive ? 'Aktif' : 'Pasif',
        new Date(product.createdAt).toLocaleDateString('tr-TR')
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `urunler_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV dosyası indirildi');
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
              <Package className="w-8 h-8 mr-3 text-blue-600" />
              Ürünleri Yönet
            </h1>
            <p className="text-gray-600 mt-2">
              Tüm ürünleri görüntüleyin, yönetin ve düzenleyin.
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="inline mr-2" size={20} />
            Ürün Ekle
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Ürün</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <CheckSquare className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktif Ürün</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-100">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ortalama Fiyat</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₺{products.length > 0 ? (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(0) : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-100">
                <Package className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Düşük Stok</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.stock < 10).length}
                </p>
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
                  placeholder="Ürün adı veya açıklama ile ara..."
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
                <option value="Live Bird">Canlı Kuş</option>
                <option value="Feed">Yem</option>
                <option value="Equipment">Ekipman</option>
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
                  <Grid3X3 className="w-4 h-4" />
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

              {selectedProducts.length > 0 && (
                <button
                  onClick={handleBulkOperations}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Toplu İşlemler ({selectedProducts.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products List */}
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
                {selectedProducts.length} ürün seçildi
              </span>
            </div>
          </div>

          {/* Products Grid/List */}
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ürün bulunamadı</h3>
              <p className="text-gray-600">Arama kriterlerinizi değiştirmeyi deneyin.</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'divide-y divide-gray-200'}>
              {products.map((product) => (
                <div
                  key={product._id}
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
                          src={product.imageUrls[0] || '/placeholder-product.jpg'}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(product.category)}`}>
                            {getCategoryText(product.category)}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product._id)}
                            onChange={() => handleProductSelect(product._id)}
                            className="w-4 h-4"
                          />
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                        
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-lg font-bold text-gray-900">₺{product.price}</span>
                          <span className={`text-sm font-medium ${getStockStatus(product.stock).color}`}>
                            {getStockStatus(product.stock).text}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {product.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                          
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleViewImages(product)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Resimleri Görüntüle"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEditProduct(product)}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
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
                          checked={selectedProducts.includes(product._id)}
                          onChange={() => handleProductSelect(product._id)}
                          className="w-4 h-4"
                        />
                      </div>
                      
                      <div className="flex-shrink-0 mr-4">
                        <img
                          src={product.imageUrls[0] || '/placeholder-product.jpg'}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
                          <div className="flex items-center space-x-4">
                            <span className="text-lg font-bold text-gray-900">₺{product.price}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(product.category)}`}>
                              {getCategoryText(product.category)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {product.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-sm font-medium ${getStockStatus(product.stock).color}`}>
                            Stok: {product.stock} - {getStockStatus(product.stock).text}
                          </span>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleViewImages(product)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Resimleri Görüntüle"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEditProduct(product)}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
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

        {/* Product Add Modal */}
        <ProductAddModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onProductAdded={handleProductAdded}
        />

        {/* Product Edit Modal */}
        <ProductEditModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onProductUpdated={handleProductUpdated}
          product={editingProduct}
        />

        {/* Product Delete Modal */}
        <ProductDeleteModal
          isOpen={showDeleteModal}
          onClose={handleCloseDeleteModal}
          onConfirm={confirmDeleteProduct}
          product={deletingProduct}
          loading={deleting}
        />

        {/* Product Image Gallery */}
        <ProductImageGallery
          isOpen={showImageGallery}
          onClose={handleCloseImageGallery}
          images={galleryProduct?.imageUrls || []}
          onImagesUpdate={handleImagesUpdate}
          productName={galleryProduct?.name || ''}
        />

        {/* Bulk Operations Modal */}
        <ProductBulkOperationsModal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          selectedProducts={products.filter(p => selectedProducts.includes(p._id))}
          onBulkUpdate={handleBulkUpdate}
          onBulkDelete={handleBulkDelete}
          onBulkExport={handleBulkExport}
        />
      </div>
    </div>
  );
};

export default AdminProducts;
