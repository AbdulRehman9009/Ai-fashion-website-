# Style Genie

> **AI-Powered Fashion Marketplace** connecting customers with local tailors, shops, and delivery services for personalized outfit recommendations and custom clothing.

##  Project Overview

This is a comprehensive full-stack web application built as a Final Year Project (FYP) that demonstrates a complete e-commerce workflow with AI integration. The platform allows users to receive personalized outfit recommendations based on their image, event type, and preferences, while providing a full fulfillment workflow involving shops, tailors, and delivery personnel.

### Key Features

- 🤖 **AI-Powered Recommendations**: Gemini AI analyzes user photos and preferences to suggest perfect outfits
- 👥 **Multi-Role System**: Customer, Tailor, Delivery Person, Shopkeeper, and Admin dashboards
- 🛍️ **Shop Discovery**: Browse shops, view products, and place orders
- ✂️ **Tailor Integration**: Automatic tailor assignment for unstitched items
- 🚚 **Delivery Tracking**: Real-time order status updates
- 💳 **Payment Integration**: Paddle payment gateway (sandbox mode)
- 📊 **Analytics**: Comprehensive dashboards for all user roles
- 🔐 **Secure Authentication**: NextAuth.js with social login support

## 🛠️ Technology Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4 |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | NextAuth.js (GitHub, Google OAuth) |
| **AI** | Google Gemini AI API |
| **Payments** | Paddle SDK |
| **Image Storage** | Cloudinary |
| **UI Components** | Radix UI, Lucide Icons |
| **Forms** | React Hook Form, Zod validation |
| **Charts** | Recharts |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas account)
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

\`\`\`bash
git clone <your-repository-url>
cd Ai-fashion-website-
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Environment Setup

Create a \`.env.local\` file in the root directory by copying the example:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Then update the following required environment variables:

#### Required Variables

\`\`\`env
# Database
MONGODB_URI=mongodb://localhost:27017/ai-fashion-website
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-fashion-website

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Gemini AI (Required for outfit recommendations)
GEMINI_API_KEY=<your-gemini-api-key>

# Cloudinary (Required for image uploads)
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
\`\`\`

#### Optional Variables

\`\`\`env
# GitHub OAuth
GITHUB_ID=<your-github-oauth-app-id>
GITHUB_SECRET=<your-github-oauth-app-secret>

# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Paddle Payments
PADDLE_API_KEY=<your-paddle-api-key>
PADDLE_WEBHOOK_SECRET=<your-paddle-webhook-secret>
PADDLE_ENVIRONMENT=sandbox

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=<your-site-key>
RECAPTCHA_SECRET_KEY=<your-secret-key>
\`\`\`

### 4. Seed the Database

Populate the database with sample shops and products:

\`\`\`bash
npm run seed
\`\`\`

This will create:
- 3 sample shops (Elegant Threads, Royal Fabrics, Fashion Hub)
- 12 sample products across different categories
- 3 shopkeeper accounts

**Shopkeeper Login Credentials:**
- Email: \`shopkeeper1@example.com\` | Password: \`Password123!\`
- Email: \`shopkeeper2@example.com\` | Password: \`Password123!\`
- Email: \`shopkeeper3@example.com\` | Password: \`Password123!\`

### 5. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 User Roles & Features

### 👤 Customer
- AI-powered outfit recommendations
- Browse shops and products
- Place orders (stitched/unstitched)
- Track order status
- View order history
- Manage profile and measurements

### ✂️ Tailor
- View assigned orders
- Update stitching status
- Set estimated delivery days
- Track earnings
- Manage availability

### 🚚 Delivery Person
- View delivery assignments
- Update delivery status
- Mark deliveries as completed
- Track earnings

### 🏪 Shopkeeper
- Manage shop profile
- Add/edit/delete products
- View and confirm orders
- Track sales analytics
- Manage inventory

### 👨‍💼 Admin
- User management (CRUD)
- Shop management
- Order monitoring
- Payment oversight
- System analytics
- Audit logs

## 🗂️ Project Structure

\`\`\`
Ai-fashion-website-/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   ├── dashboard/            # Role-based dashboards
│   ├── shops/                # Shop pages
│   ├── products/             # Product pages
│   └── auth/                 # Authentication pages
├── components/               # Reusable React components
│   ├── ui/                   # UI components
│   ├── shop/                 # Shop-specific components
│   └── analytics/            # Analytics components
├── lib/                      # Utility functions
│   ├── db.js                 # Database connection
│   ├── auth.js               # NextAuth configuration
│   └── validation/           # Zod schemas
├── models/                   # Mongoose models
├── scripts/                  # Utility scripts
│   └── seed-shops.js         # Database seeding
└── public/                   # Static assets
\`\`\`

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| \`npm run dev\` | Start development server |
| \`npm run build\` | Build for production |
| \`npm start\` | Start production server |
| \`npm run seed\` | Seed database with sample data |
| \`npm run lint\` | Run ESLint |

## 🌐 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Deploy!

### Important Deployment Steps

1. **Set up MongoDB Atlas** (for production database)
2. **Update environment variables**:
   - \`MONGODB_URI\` → MongoDB Atlas connection string
   - \`NEXTAUTH_URL\` → Your production URL
   - \`NEXTAUTH_SECRET\` → Generate new secret for production
3. **Configure OAuth apps** for production URLs
4. **Set up Cloudinary** for image hosting
5. **Configure Paddle** for payment processing

## 🔐 Security Notes

- ⚠️ **Never commit \`.env.local\`** to version control
- 🔑 Generate a strong \`NEXTAUTH_SECRET\` for production
- 🔒 Use environment variables for all sensitive data
- 🛡️ Enable reCAPTCHA for production
- 📧 Set up email verification for user accounts

## 🐛 Troubleshooting

### MongoDB Connection Issues
\`\`\`bash
# Ensure MongoDB is running locally
mongod

# Or check your MongoDB Atlas connection string
\`\`\`

### Module Not Found Errors
\`\`\`bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Build Errors
\`\`\`bash
# Clear Next.js cache
rm -rf .next
npm run build
\`\`\`

## 📚 API Documentation

### Public Endpoints

- \`GET /api/shops\` - List all active shops
- \`GET /api/shops/[id]\` - Get shop details
- \`GET /api/products\` - List products with filters
- \`GET /api/products/[id]\` - Get product details

### Protected Endpoints

- \`POST /api/ai-stylist\` - Get AI outfit recommendations
- \`POST /api/orders\` - Create new order
- \`GET /api/orders\` - Get user orders
- \`PUT /api/orders/[id]\` - Update order status

## 🤝 Contributing

This is a Final Year Project. If you'd like to contribute or report issues:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is created for educational purposes as part of a Final Year Project.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Google Gemini AI for outfit recommendations
- Cloudinary for image hosting
- Paddle for payment processing
- Vercel for hosting platform
- All open-source contributors

---

**Built with ❤️ for FYP 2026**
