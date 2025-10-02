import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: post, isLoading, error } = useQuery(
    ['blog-post', slug],
    () => api.get(`/blog/${slug}`).then(res => res.data),
    { enabled: !!slug }
  );

  if (isLoading) return <LoadingSpinner />;
  
  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h2>
          <p className="text-gray-600 mb-4">The blog post you're looking for doesn't exist.</p>
          <Link to="/blog" className="btn-primary">
            <ArrowLeft className="inline mr-2" size={16} />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to="/blog" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
            <ArrowLeft className="mr-2" size={16} />
            Back to Blog
          </Link>
        </div>

        <article className="bg-white rounded-xl shadow-lg overflow-hidden">
          {post.featuredImage && (
            <div className="aspect-video overflow-hidden">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>
            
            <div className="flex items-center space-x-6 text-gray-600 mb-8">
              <div className="flex items-center space-x-2">
                <User size={20} />
                <span>{post.author.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={20} />
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogPost;
