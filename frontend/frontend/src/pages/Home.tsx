import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowRight, Star, Shield, Truck, Heart } from 'lucide-react';
import { api } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';
import ProductCard from '../components/products/ProductCard';
import GalleryPreview from '../components/gallery/GalleryPreview';
import BlogPreview from '../components/blog/BlogPreview';

const Home: React.FC = () => {
  const { t } = useLanguage();
  
  const { data: featuredProducts } = useQuery('featured-products', () =>
    api.get('/products?limit=6').then(res => res.data)
  );

  const { data: featuredImages } = useQuery('featured-gallery', () =>
    api.get('/gallery/featured').then(res => res.data)
  );

  const { data: recentPosts } = useQuery('recent-blog-posts', () =>
    api.get('/blog?limit=3').then(res => res.data)
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero min-h-screen flex items-center">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {t('home.title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              {t('home.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="btn-primary text-lg px-8 py-4">
                {t('home.cta')}
                <ArrowRight className="inline ml-2" size={20} />
              </Link>
              <Link to="/gallery" className="btn-outline text-lg px-8 py-4 text-white border-white hover:bg-white hover:text-gray-900">
                {t('gallery.title')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Chickens?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the highest quality Wyandotte chickens with exceptional care and breeding standards.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-gray-600">
                Carefully selected breeding stock ensures healthy, beautiful birds with excellent temperament.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Health Guarantee</h3>
              <p className="text-gray-600">
                All our birds come with health guarantees and are vaccinated according to industry standards.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Safe Shipping</h3>
              <p className="text-gray-600">
                Professional packaging and shipping methods ensure your birds arrive safely and healthy.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Support</h3>
              <p className="text-gray-600">
                Our team provides ongoing support and advice for caring for your new chickens.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.featured')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('products.description')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts?.products?.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/products" className="btn-primary text-lg px-8 py-4">
              {t('products.title')}
              <ArrowRight className="inline ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('gallery.subtitle')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('gallery.title')}
            </p>
          </div>
          
          <GalleryPreview images={featuredImages || []} />
          
          <div className="text-center mt-12">
            <Link to="/gallery" className="btn-outline text-lg px-8 py-4">
              {t('gallery.viewAll')}
              <ArrowRight className="inline ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('blog.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('blog.subtitle')}
            </p>
          </div>
          
          <BlogPreview posts={recentPosts?.posts || []} />
          
          <div className="text-center mt-12">
            <Link to="/blog" className="btn-outline text-lg px-8 py-4">
              {t('blog.readMore')}
              <ArrowRight className="inline ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('home.cta')}
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            {t('home.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              {t('home.cta')}
            </Link>
            <Link to="/contact" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors">
              {t('nav.contact')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
