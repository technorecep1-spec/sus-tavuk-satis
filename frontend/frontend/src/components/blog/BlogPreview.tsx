import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';

interface BlogPreviewProps {
  posts: Array<{
    _id: string;
    title: string;
    excerpt?: string;
    slug: string;
    author: {
      name: string;
    };
    createdAt: string;
    featuredImage?: string;
  }>;
}

const BlogPreview: React.FC<BlogPreviewProps> = ({ posts }) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No blog posts available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <article key={post._id} className="card group">
          <Link to={`/blog/${post.slug}`}>
            {post.featuredImage && (
              <div className="aspect-video overflow-hidden rounded-t-xl">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                {post.title}
              </h3>
              
              {post.excerpt && (
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <User size={16} />
                    <span>{post.author.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar size={16} />
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center text-primary-600 group-hover:text-primary-700">
                  <span className="mr-1">Read more</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
};

export default BlogPreview;
