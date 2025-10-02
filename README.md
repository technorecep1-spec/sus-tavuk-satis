# Wyandotte Chickens E-commerce Platform

A full-stack e-commerce and content platform for selling Wyandotte ornamental chickens and supplies. Built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and styled with Tailwind CSS.

## Features

### Public Features
- **Home Page**: Beautiful landing page with hero section, featured products, and company information
- **Products Page**: Browse and filter products by category (Live Birds, Feed, Equipment)
- **Product Details**: Detailed product pages with image galleries and add-to-cart functionality
- **Gallery**: Photo gallery showcasing different varieties of Wyandotte chickens
- **Blog**: Educational content about chicken care, health, and lifecycle
- **Contact**: Contact form and company information

### E-commerce Features
- **Shopping Cart**: Add/remove products, update quantities
- **User Authentication**: Registration and login system
- **Order Management**: Place orders and track order status
- **Checkout Process**: Multi-step checkout with shipping information

### Admin Panel
- **Dashboard**: Overview of orders, users, and key metrics
- **Product Management**: CRUD operations for products
- **Order Management**: View and update order status
- **Blog Management**: Create and manage blog posts
- **Gallery Management**: Upload and manage gallery images
- **User Management**: View registered users

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **multer** for file uploads
- **nodemailer** for email functionality

### Frontend
- **React 19** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **React Query** for data fetching
- **React Hook Form** for form handling
- **React Hot Toast** for notifications
- **Lucide React** for icons

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
MONGO_URI=mongodb://localhost:27017/wyandotte-chickens

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Admin Configuration
ADMIN_EMAIL=admin@wyandottechickens.com

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### Backend Setup

1. Install backend dependencies:
```bash
npm install
```

2. Start the backend server:
```bash
npm run server
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend/frontend
```

2. Install frontend dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

### Running Both Together

From the root directory, you can run both backend and frontend simultaneously:

```bash
npm run dev
```

## Project Structure

```
wyandotte-chickens-ecommerce/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── BlogPost.js
│   │   └── GalleryImage.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── blog.js
│   │   ├── gallery.js
│   │   └── admin.js
│   └── server.js
├── frontend/frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── common/
│   │   │   ├── gallery/
│   │   │   ├── layout/
│   │   │   ├── products/
│   │   │   └── blog/
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx
│   │   │   └── CartContext.tsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── Home.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── Gallery.tsx
│   │   │   ├── Blog.tsx
│   │   │   ├── BlogPost.tsx
│   │   │   ├── Contact.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── MyOrders.tsx
│   │   │   └── OrderDetail.tsx
│   │   ├── utils/
│   │   │   └── api.ts
│   │   └── App.tsx
│   ├── tailwind.config.js
│   └── package.json
├── package.json
└── README.md
```

## Database Schema

### User
- name (String, required)
- email (String, required, unique)
- password (String, required, hashed)
- isAdmin (Boolean, default: false)
- createdAt (Date)

### Product
- name (String, required)
- description (String, required)
- price (Number, required)
- category (String, enum: ['Live Bird', 'Feed', 'Equipment'])
- imageUrls (Array of Strings, required)
- stock (Number, default: 0)
- isActive (Boolean, default: true)
- createdAt (Date)
- updatedAt (Date)

### Order
- user (ObjectId, ref: 'User')
- orderItems (Array of objects with name, qty, price, product)
- shippingAddress (Object with address, city, postalCode, country)
- totalPrice (Number, required)
- status (String, enum: ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'])
- paymentMethod (String, required)
- isPaid (Boolean, default: false)
- paidAt (Date)
- isDelivered (Boolean, default: false)
- deliveredAt (Date)
- createdAt (Date)

### BlogPost
- title (String, required)
- content (String, required)
- slug (String, required, unique)
- excerpt (String)
- featuredImage (String)
- author (ObjectId, ref: 'User')
- tags (Array of Strings)
- isPublished (Boolean, default: true)
- viewCount (Number, default: 0)
- createdAt (Date)
- updatedAt (Date)

### GalleryImage
- imageUrl (String, required)
- caption (String)
- category (String, enum: ['Chicks', 'Hens', 'Roosters', 'Varieties', 'Farm', 'Equipment'])
- isFeatured (Boolean, default: false)
- uploadedAt (Date)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `GET /api/orders/admin/all` - Get all orders (Admin)

### Blog
- `GET /api/blog` - Get all blog posts
- `GET /api/blog/:slug` - Get single blog post
- `POST /api/blog` - Create blog post (Admin)
- `PUT /api/blog/:id` - Update blog post (Admin)
- `DELETE /api/blog/:id` - Delete blog post (Admin)
- `GET /api/blog/tags/all` - Get all tags

### Gallery
- `GET /api/gallery` - Get all gallery images
- `GET /api/gallery/featured` - Get featured images
- `POST /api/gallery` - Add gallery image (Admin)
- `PUT /api/gallery/:id` - Update gallery image (Admin)
- `DELETE /api/gallery/:id` - Delete gallery image (Admin)

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/products` - Get all products (including inactive)
- `GET /api/admin/blog` - Get all blog posts (including unpublished)
- `GET /api/admin/gallery` - Get all gallery images

## Design Features

- **Mobile-First**: Fully responsive design optimized for mobile devices
- **Color Scheme**: Black and orange gradient theme throughout
- **Modern UI**: Clean, professional design with smooth animations
- **Accessibility**: Proper semantic HTML and keyboard navigation
- **Performance**: Optimized images and lazy loading

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet.js for security headers

## Future Enhancements

- Payment gateway integration (Stripe, PayPal)
- Email notifications
- Advanced search and filtering
- Product reviews and ratings
- Wishlist functionality
- Multi-language support
- Advanced admin analytics
- Mobile app (React Native)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact us at info@wyandottechickens.com
