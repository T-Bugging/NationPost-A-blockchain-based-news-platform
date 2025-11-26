# Nation Post - AI-Powered News Verification Platform

Nation Post is a revolutionary news platform that combines AI-powered verification, decentralized storage, and community collaboration to combat misinformation and promote reliable journalism.

## 🚀 Features

- **AI-Powered Verification**: Advanced algorithms verify news reliability in real-time
- **Community-Driven**: Users can upload, verify, and collaborate on news content
- **Decentralized Storage**: Content stored on IPFS for transparency and permanence
- **Real-Time Updates**: Instant notifications for breaking news and trending stories
- **Smart Categorization**: Automatic content categorization using machine learning
- **Dark/Light Mode**: Responsive design with theme switching capability

## 📁 Project Structure

```
nation-post/
├── components/                 # React components
│   ├── ui/                    # Shadcn/ui components
│   ├── figma/                 # Figma-specific components
│   ├── Header.tsx             # Main navigation header
│   ├── HomePage.tsx           # Homepage with news feed
│   ├── NewsCard.tsx           # Individual news article card
│   ├── CategoryFilter.tsx     # Category filtering component
│   ├── VerificationDashboard.tsx # News verification interface
│   ├── NewsUpload.tsx         # News article upload form
│   ├── UserProfile.tsx        # User profile and settings
│   ├── AboutPage.tsx          # About page with platform info
│   └── Footer.tsx             # Footer with links and info
├── contexts/                  # React contexts
│   └── ThemeContext.tsx       # Theme management (light/dark mode)
├── data/                      # Mock data and types
│   └── mockData.ts            # Sample news data for development
├── styles/                    # Styling files
│   └── globals.css            # Global CSS with theme variables
├── App.tsx                    # Main application component
└── README.md                  # This file
```

## 🛠️ Frontend Technologies

### Core Technologies
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS v4** - Utility-first CSS framework with custom theme
- **Lucide React** - Beautiful icon library

### UI Components
- **Shadcn/ui** - High-quality, accessible component library
- **Custom Components** - Purpose-built components for news platform features
- **Responsive Design** - Mobile-first approach with breakpoint optimization

### State Management
- **React Context** - Theme management and global state
- **Local State** - Component-level state with React hooks
- **Mock Data** - Development-ready sample data structure

## 🔧 Backend Integration Guide

### MongoDB Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  profileImage: String,
  bio: String,
  location: String,
  joinDate: Date,
  trustScore: Number,
  articlesUploaded: Number,
  verificationsCompleted: Number,
  settings: {
    theme: String,
    emailNotifications: Boolean,
    verificationAlerts: Boolean
  }
}
```

#### News Collection
```javascript
{
  _id: ObjectId,
  title: String,
  excerpt: String,
  content: String,
  category: String,
  author: ObjectId, // Reference to Users collection
  thumbnail: String, // IPFS hash
  sourceUrl: String,
  tags: [String],
  reliabilityScore: Number,
  verificationStatus: String,
  ipfsHash: String, // Content stored on IPFS
  publishedAt: Date,
  lastModified: Date,
  viewCount: Number,
  readTime: Number
}
```

#### Verifications Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to Users collection
  headline: String,
  subtext: String,
  sourceUrl: String,
  aiResult: {
    score: Number,
    confidence: Number,
    sources: [String],
    flags: [String],
    summary: String
  },
  createdAt: Date,
  status: String // 'verified', 'flagged', 'pending'
}
```

### IPFS Integration

#### Storing News Content
```javascript
// Example: Storing news article and images
const ipfs = create({ url: 'YOUR_IPFS_NODE_URL' });

// Store article content
const contentResult = await ipfs.add(JSON.stringify({
  title: newsData.title,
  content: newsData.content,
  metadata: newsData.metadata
}));

// Store images
const imageResult = await ipfs.add(imageFile);

// Save IPFS hashes to MongoDB
await newsCollection.insertOne({
  ...newsData,
  contentHash: contentResult.path,
  imageHash: imageResult.path
});
```

#### Retrieving Content
```javascript
// Retrieve content from IPFS
const contentStream = ipfs.cat(contentHash);
const chunks = [];
for await (const chunk of contentStream) {
  chunks.push(chunk);
}
const content = Buffer.concat(chunks).toString();
```

### AI Agent API Integration

#### Verification Endpoint
```javascript
// POST /api/verify-news
app.post('/api/verify-news', async (req, res) => {
  const { headline, subtext, sourceUrl } = req.body;
  
  try {
    // Call AI verification service
    const aiResponse = await fetch('YOUR_AI_AGENT_URL/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`
      },
      body: JSON.stringify({
        headline,
        subtext,
        sourceUrl,
        checkSources: true,
        analyzeContent: true
      })
    });
    
    const result = await aiResponse.json();
    
    // Store verification result in MongoDB
    await verificationsCollection.insertOne({
      userId: req.user.id,
      headline,
      subtext,
      sourceUrl,
      aiResult: result,
      createdAt: new Date(),
      status: result.score >= 3 ? 'verified' : 'flagged'
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});
```

### API Endpoints

```javascript
// News endpoints
GET    /api/news              - Get all news with pagination
GET    /api/news/:id          - Get specific news article
POST   /api/news              - Create new news article
PUT    /api/news/:id          - Update news article
DELETE /api/news/:id          - Delete news article
GET    /api/news/category/:cat - Get news by category
GET    /api/news/search?q=    - Search news articles

// Verification endpoints
POST   /api/verify            - Verify news headline/content
GET    /api/verifications     - Get user's verification history
GET    /api/verifications/:id - Get specific verification

// User endpoints
POST   /api/auth/register     - User registration
POST   /api/auth/login        - User login
GET    /api/user/profile      - Get user profile
PUT    /api/user/profile      - Update user profile
GET    /api/user/articles     - Get user's articles
GET    /api/user/saved        - Get user's saved articles
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- MongoDB instance (local or cloud)
- IPFS node (optional for development)
- AI verification service API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/nation-post.git
   cd nation-post
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env.local` file:
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/nation-post
   
   # IPFS Configuration
   IPFS_API_URL=http://localhost:5001
   IPFS_GATEWAY_URL=http://localhost:8080
   
   # AI Verification Service
   AI_AGENT_API_URL=https://your-ai-service.com/api
   AI_AGENT_API_KEY=your_api_key_here
   
   # Authentication
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=7d
   
   # Application
   NODE_ENV=development
   PORT=3000
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if local)
   mongod
   
   # Create database and collections
   node scripts/setup-database.js
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001 (if separate)

### Docker Setup (Optional)

```bash
# Build and run with Docker Compose
docker-compose up -d

# This will start:
# - React frontend (port 3000)
# - Node.js backend (port 3001)
# - MongoDB (port 27017)
# - IPFS node (ports 4001, 5001, 8080)
```

## 🌐 Deployment Guide

### Frontend Deployment (Vercel/Netlify)

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Environment Variables**
   Set the following in your deployment platform:
   ```
   REACT_APP_API_URL=https://your-backend-api.com
   REACT_APP_IPFS_GATEWAY=https://your-ipfs-gateway.com
   ```

### Backend Deployment

#### Option 1: Cloud Platform (Railway/Render)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

#### Option 2: VPS/Docker
```bash
# Build Docker image
docker build -t nation-post-backend .

# Run with environment variables
docker run -d \
  -p 3001:3001 \
  -e MONGODB_URI=your_mongodb_uri \
  -e AI_AGENT_API_KEY=your_api_key \
  nation-post-backend
```

### Database Deployment (MongoDB Atlas)

1. **Create MongoDB Atlas Cluster**
   - Visit https://cloud.mongodb.com
   - Create a new cluster
   - Set up database user and network access

2. **Update Connection String**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nation-post
   ```

### IPFS Deployment

#### Option 1: Pinata (Managed IPFS)
```javascript
// Install Pinata SDK
npm install @pinata/sdk

// Configure in your backend
const pinata = pinataSDK(apiKey, secretApiKey);
```

#### Option 2: Self-hosted IPFS Node
```bash
# Install IPFS
curl -sSL https://dist.ipfs.io/go-ipfs/v0.14.0/go-ipfs_v0.14.0_linux-amd64.tar.gz | tar -xz
sudo mv go-ipfs/ipfs /usr/local/bin/

# Initialize and start
ipfs init
ipfs daemon
```

## 📋 Production Checklist

### Security
- [ ] Environment variables secured
- [ ] API rate limiting implemented
- [ ] Input validation and sanitization
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] JWT token expiration handling

### Performance
- [ ] Database indexes created
- [ ] Image optimization implemented
- [ ] CDN configured for static assets
- [ ] Caching strategy implemented
- [ ] Bundle size optimized

### Monitoring
- [ ] Error tracking (Sentry/Bugsnag)
- [ ] Performance monitoring (New Relic/DataDog)
- [ ] Log aggregation (LogRocket/Loggly)
- [ ] Uptime monitoring (Pingdom/UptimeRobot)

### Backup & Recovery
- [ ] Database backup automation
- [ ] IPFS content pinning strategy
- [ ] Disaster recovery plan
- [ ] Data export functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Shadcn/ui** for the beautiful component library
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide React** for the comprehensive icon set
- **IPFS** for decentralized storage capabilities
- **MongoDB** for flexible document storage

## 📞 Support

- 📧 Email: support@nationpost.com
- 💬 Discord: [Nation Post Community](https://discord.gg/nationpost)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/nation-post/issues)
- 📖 Documentation: [docs.nationpost.com](https://docs.nationpost.com)

---

**Built with ❤️ for a more informed world**