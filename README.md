# 🎓 GlobCoders - Modern Learning Management Platform

<p align="center">
  <img src="globcoders-spark-ui/public/lovable-uploads/LOGO Globcoders.png" alt="GlobCoders Logo" width="200"/>
</p>

<p align="center">
  <strong>A comprehensive learning management system built with modern web technologies</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#api-documentation">API</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## 🌟 Features

### 👥 **Multi-Role System**
- **Students**: Enroll in courses, attend sessions, take quizzes, track progress
- **Teachers**: Create courses, manage sessions, conduct live classes, create assessments
- **Administrators**: Platform oversight, user management, analytics, payment tracking

### 📚 **Course Management**
- **Interactive Courses**: Rich content creation with multimedia support
- **Live Sessions**: Real-time video sessions with booking system
- **Session Recording**: Access to recorded sessions for review
- **Progress Tracking**: Comprehensive learning analytics

### 🎯 **Assessment System**
- **Interactive Quizzes**: Multiple question types with instant feedback
- **Conditional Access**: Quiz availability based on session completion
- **Attempt History**: Track student performance over time
- **Teacher Controls**: Enable/disable quiz access per session

### 💳 **Payment Integration**
- **Stripe Integration**: Secure payment processing
- **Session Booking**: Pay-per-session model
- **Course Enrollment**: Full course purchase options
- **Revenue Analytics**: Detailed financial reporting

### 📊 **Analytics & Reporting**
- **Student Dashboard**: Personal progress and achievements
- **Teacher Dashboard**: Student performance and revenue tracking
- **Admin Dashboard**: Platform-wide statistics and user management
- **Real-time Metrics**: Live updates on platform activity

### 💬 **Communication**
- **Real-time Chat**: WebSocket-powered messaging system
- **Notifications**: In-app and email notifications
- **Session Management**: Calendar integration for scheduling

---

## 🚀 Tech Stack

### **Frontend**
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context + Custom hooks
- **Routing**: React Router v6
- **Charts**: Recharts for analytics
- **Forms**: React Hook Form with Zod validation
- **Payments**: Stripe React components

### **Backend**
- **Runtime**: Node.js (≥16.0.0)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **File Storage**: Cloudinary integration
- **Real-time**: Socket.IO
- **Payment Processing**: Stripe API
- **Email**: Nodemailer

### **DevOps & Tools**
- **Build Tool**: Vite
- **Linting**: ESLint with TypeScript
- **Mobile**: Capacitor for native apps
- **Environment**: Docker ready
- **Version Control**: Git with conventional commits

---

## ⚡ Quick Start

### Prerequisites
- Node.js (≥16.0.0)
- npm or yarn
- MongoDB (local or Atlas)
- Stripe account (for payments)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/globcoders.git
cd globcoders/globcoders-spark-ui
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### 3. Environment Setup

**Backend Environment** (`.env` in `/backend` folder):
```env
# Database
MONGODB_URI=mongodb://localhost:27017/globcoders
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/globcoders

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cloudinary (optional for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server Configuration
PORT=5000
NODE_ENV=development
```

**Frontend Environment** (`.env` in root folder):
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 4. Start Development Servers

**Option A: Manual Start**
```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend
cd ..
npm run dev
```

**Option B: Using Batch Script (Windows)**
```bash
# Starts both frontend and backend
start-local-dev.bat
```

### 5. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs (if available)

---

## 🔧 Configuration

### Database Setup
1. **Local MongoDB**: Install MongoDB locally or use Docker
2. **MongoDB Atlas**: Create a free cluster and update `MONGODB_URI`
3. **Initial Data**: The application will create default collections on first run

### Stripe Setup
1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Set up webhooks for payment processing
4. Configure webhook endpoint: `https://yourdomain.com/api/stripe/webhook`

### Email Configuration
1. Use Gmail SMTP or your preferred email service
2. For Gmail: Enable 2FA and create an App Password
3. Update SMTP configuration in environment variables

---

## 📦 Deployment

### Production Environment Variables

**Required for Production:**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://production-connection-string
JWT_SECRET=super-secure-production-jwt-secret
STRIPE_SECRET_KEY=sk_live_your_production_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_production_webhook_secret
```

### Deployment Options

#### **1. Hostinger VPS**
```bash
# Build the application
npm run build:prod

# Deploy to VPS
scp -r dist/ user@your-server:/var/www/globcoders/
scp -r backend/ user@your-server:/var/www/globcoders/
```

#### **2. Railway/Heroku**
```bash
# Add Procfile for backend
echo "web: cd backend && npm start" > Procfile

# Deploy
git push railway main
```

#### **3. Docker Deployment**
```dockerfile
# Dockerfile example available in repository
docker build -t globcoders .
docker run -p 3000:5000 globcoders
```

### **Important Security Notes**
- Always use HTTPS in production
- Set strong JWT secrets
- Configure CORS properly
- Use production Stripe keys
- Enable webhook signature verification

---

## 📚 API Documentation

### Authentication Endpoints
```
POST   /api/auth/login          # User login
POST   /api/auth/register       # User registration
GET    /api/auth/me            # Get current user
POST   /api/auth/logout        # User logout
```

### Course Management
```
GET    /api/courses            # Get all courses
POST   /api/courses            # Create course (teacher)
GET    /api/courses/:id        # Get course details
PUT    /api/courses/:id        # Update course (teacher)
POST   /api/courses/:id/enroll # Enroll in course
```

### Session Management
```
GET    /api/sessions           # Get sessions
POST   /api/sessions           # Create session (teacher)
POST   /api/sessions/:id/enroll # Book session
PATCH  /api/sessions/:id/status # Update session status
```

### Payment Processing
```
POST   /api/stripe/create-payment-intent  # Create payment
POST   /api/stripe/webhook               # Stripe webhook
GET    /api/admin/payments               # Get payments (admin)
```

### Quiz System
```
GET    /api/quizzes                    # Get quizzes
POST   /api/quizzes/:id/attempts       # Start quiz attempt
PUT    /api/quizzes/attempts/:id       # Submit quiz
GET    /api/quizzes/attempts/history   # Quiz history
```

**Complete API documentation available at `/docs` when running the server.**

---

## 🛠️ Development

### Project Structure
```
globcoders-spark-ui/
├── src/                    # Frontend source code
│   ├── components/         # Reusable UI components
│   ├── pages/             # Route components
│   ├── services/          # API services
│   ├── contexts/          # React contexts
│   └── hooks/             # Custom hooks
├── backend/               # Backend source code
│   ├── routes/           # API routes
│   ├── models/           # MongoDB models
│   ├── middleware/       # Express middleware
│   └── utils/            # Utility functions
├── public/               # Static assets
└── docs/                 # Documentation
```

### Available Scripts

**Frontend:**
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

**Backend:**
```bash
npm start           # Start production server
npm run dev         # Start with nodemon
```

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React and TypeScript
- **Prettier**: Code formatting (recommended)
- **Conventional Commits**: For consistent commit messages

---

## 🧪 Testing

### Running Tests
```bash
# Frontend tests
npm run test

# Backend tests
cd backend && npm run test

# E2E tests
npm run test:e2e
```

### Test Payment Flow
Use Stripe test cards for development:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

---

## 📋 Contributing

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Contribution Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Use conventional commit messages
- Ensure all tests pass

### Development Setup
```bash
# Install pre-commit hooks
npm run prepare

# Run full test suite
npm run test:all

# Check code quality
npm run lint:fix
```

---

## 🔍 Troubleshooting

### Common Issues

**Backend Connection Errors**
```bash
# Check if backend is running
curl http://localhost:5000/health

# Check MongoDB connection
npm run db:check
```

**Payment Issues**
- Verify Stripe keys in environment variables
- Check webhook endpoint configuration
- Ensure webhook secret is correct

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Getting Help
- Check the [Issues](https://github.com/yourusername/globcoders/issues) page
- Review the [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Join our [Discord Community](https://discord.gg/globcoders)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Stripe** for payment processing infrastructure
- **MongoDB** for the robust database solution
- **Vercel** for inspiration on modern web development

---

## 📞 Support & Contact

- **Email**: support@globcoders.com
- **Website**: https://globcoders.com
- **Documentation**: https://docs.globcoders.com
- **Status Page**: https://status.globcoders.com

---

<p align="center">
  <strong>Developed with ❤️ by Ayari Mohamed Ghassen</strong>
</p>

<p align="center">
  <a href="https://github.com/yourusername/globcoders/stargazers">⭐ Star us on GitHub</a> |
  <a href="https://twitter.com/globcoders">🐦 Follow on Twitter</a> |
  <a href="https://linkedin.com/company/globcoders">💼 LinkedIn</a>
</p>
