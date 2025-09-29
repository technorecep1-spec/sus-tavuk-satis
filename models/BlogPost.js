const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Lütfen bir başlık girin.'],
        trim: true,
        maxlength: [200, 'Başlık en fazla 200 karakter olabilir.']
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Lütfen içerik girin.'],
        minlength: [100, 'İçerik en az 100 karakter olmalıdır.']
    },
    excerpt: {
        type: String,
        required: [true, 'Lütfen özet girin.'],
        maxlength: [300, 'Özet en fazla 300 karakter olabilir.']
    },
    featuredImage: {
        type: String,
        required: [true, 'Lütfen öne çıkan resim URL\'si girin.']
    },
    category: {
        type: String,
        required: [true, 'Lütfen kategori seçin.'],
        enum: ['genel', 'bakim', 'beslenme', 'uretim', 'haberler', 'ipuclari'],
        default: 'genel'
    },
    tags: [{
        type: String,
        trim: true
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    viewCount: {
        type: Number,
        default: 0
    },
    likeCount: {
        type: Number,
        default: 0
    },
    commentCount: {
        type: Number,
        default: 0
    },
    publishedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Slug oluşturma middleware
BlogPostSchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }
    this.updatedAt = new Date();
    next();
});

// Yayınlanma tarihini ayarlama
BlogPostSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});

module.exports = mongoose.model('BlogPost', BlogPostSchema);
