# Deployment Guide - AI Fashion Website

This guide will walk you through deploying your AI Fashion Website to production.

## Prerequisites

- GitHub account
- Vercel account (free tier is sufficient)
- MongoDB Atlas account (free tier available)
- Cloudinary account
- Google Gemini API key

## Step 1: Prepare Your Repository

### 1.1 Ensure .gitignore is Correct

Make sure your `.gitignore` includes:
\`\`\`
.env*
.env.local*
node_modules/
.next/
\`\`\`

### 1.2 Remove Sensitive Data

**CRITICAL**: Before pushing to GitHub, ensure no sensitive data is committed:

\`\`\`bash
# Check for sensitive files
git status

# If .env.local is tracked, remove it
git rm --cached .env.local
git commit -m \"Remove sensitive environment file\"
\`\`\`

### 1.3 Push to GitHub

\`\`\`bash
git add .
git commit -m \"Prepare for deployment\"
git push origin main
\`\`\`

## Step 2: Set Up MongoDB Atlas

### 2.1 Create a Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new cluster (free M0 tier)
4. Choose a cloud provider and region
5. Click \"Create Cluster\"

### 2.2 Configure Network Access

1. Go to \"Network Access\" in the sidebar
2. Click \"Add IP Address\"
3. Click \"Allow Access from Anywhere\" (for Vercel)
4. Confirm

### 2.3 Create Database User

1. Go to \"Database Access\"
2. Click \"Add New Database User\"
3. Choose \"Password\" authentication
4. Create a username and strong password
5. Set user privileges to \"Read and write to any database\"
6. Add user

### 2.4 Get Connection String

1. Click \"Connect\" on your cluster
2. Choose \"Connect your application\"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `ai-fashion-website`

Example:
\`\`\`
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ai-fashion-website?retryWrites=true&w=majority
\`\`\`

## Step 3: Set Up Cloudinary

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up or log in
3. Go to Dashboard
4. Note down:
   - Cloud Name
   - API Key
   - API Secret

## Step 4: Get API Keys

### 4.1 Google Gemini AI

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key

### 4.2 GitHub OAuth (Optional)

1. Go to GitHub Settings → Developer Settings → OAuth Apps
2. Click \"New OAuth App\"
3. Fill in:
   - Application name: `AI Fashion Website`
   - Homepage URL: `https://your-domain.vercel.app`
   - Authorization callback URL: `https://your-domain.vercel.app/api/auth/callback/github`
4. Register application
5. Copy Client ID and generate Client Secret

### 4.3 Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Configure OAuth consent screen
6. Create OAuth client ID (Web application)
7. Add authorized redirect URI: `https://your-domain.vercel.app/api/auth/callback/google`
8. Copy Client ID and Client Secret

## Step 5: Deploy to Vercel

### 5.1 Import Repository

1. Go to [Vercel](https://vercel.com/)
2. Click \"Add New\" → \"Project\"
3. Import your GitHub repository
4. Click \"Import\"

### 5.2 Configure Environment Variables

In the Vercel project settings, add these environment variables:

#### Required Variables

\`\`\`env
# Database
MONGODB_URI=<your-mongodb-atlas-connection-string>

# NextAuth
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=<generate-new-secret-with-openssl-rand-base64-32>

# Gemini AI
GEMINI_API_KEY=<your-gemini-api-key>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
\`\`\`

#### Optional Variables

\`\`\`env
# GitHub OAuth
GITHUB_ID=<your-github-client-id>
GITHUB_SECRET=<your-github-client-secret>

# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Paddle (if using)
PADDLE_API_KEY=<your-paddle-api-key>
PADDLE_WEBHOOK_SECRET=<your-paddle-webhook-secret>
PADDLE_ENVIRONMENT=production

# reCAPTCHA (recommended)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=<your-site-key>
RECAPTCHA_SECRET_KEY=<your-secret-key>
\`\`\`

### 5.3 Deploy

1. Click \"Deploy\"
2. Wait for the build to complete
3. Your site will be live at `https://your-project.vercel.app`

## Step 6: Post-Deployment

### 6.1 Seed the Database

You can seed the production database by running the seed script locally with production MongoDB URI:

\`\`\`bash
# Temporarily update .env.local with production MONGODB_URI
npm run seed
\`\`\`

Or create a Vercel serverless function to seed data.

### 6.2 Create Admin Account

1. Sign up through the website
2. Manually update the user's role in MongoDB Atlas:
   - Go to Collections
   - Find the `users` collection
   - Find your user document
   - Change `role` to `\"ADMIN\"`

### 6.3 Test All Features

- [ ] User registration and login
- [ ] OAuth login (GitHub/Google)
- [ ] Image uploads
- [ ] AI recommendations
- [ ] Product browsing
- [ ] Shop discovery
- [ ] Order creation
- [ ] Payment flow (if enabled)
- [ ] All dashboards (Customer, Tailor, Delivery, Shopkeeper, Admin)

## Step 7: Custom Domain (Optional)

### 7.1 Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

### 7.2 Update Environment Variables

Update `NEXTAUTH_URL` to your custom domain:
\`\`\`env
NEXTAUTH_URL=https://yourdomain.com
\`\`\`

### 7.3 Update OAuth Redirect URIs

Update redirect URIs in:
- GitHub OAuth app settings
- Google OAuth app settings

## Troubleshooting

### Build Fails

**Error**: Module not found
- **Solution**: Ensure all dependencies are in `package.json`
- Run `npm install` locally and commit `package-lock.json`

**Error**: Environment variable not defined
- **Solution**: Check all required env vars are set in Vercel

### Database Connection Issues

**Error**: MongoServerError: bad auth
- **Solution**: Check MongoDB Atlas username/password
- Ensure password doesn't contain special characters (URL encode if needed)

**Error**: Connection timeout
- **Solution**: Check Network Access in MongoDB Atlas
- Ensure \"0.0.0.0/0\" is allowed

### OAuth Not Working

**Error**: Redirect URI mismatch
- **Solution**: Update OAuth app redirect URIs to match production URL

### Images Not Uploading

**Error**: Cloudinary upload failed
- **Solution**: Verify Cloudinary credentials
- Check Cloudinary upload preset settings

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] New `NEXTAUTH_SECRET` generated for production
- [ ] MongoDB Atlas has network access configured
- [ ] Cloudinary API keys are correct
- [ ] OAuth redirect URIs match production URL
- [ ] reCAPTCHA is enabled (recommended)
- [ ] HTTPS is enabled (automatic with Vercel)

## Monitoring

### Vercel Analytics

Enable Vercel Analytics in project settings for:
- Page views
- Performance metrics
- Error tracking

### MongoDB Atlas Monitoring

Monitor your database:
- Go to Metrics in MongoDB Atlas
- Check connection count
- Monitor query performance

## Backup Strategy

### Database Backups

MongoDB Atlas provides automatic backups on paid tiers. For free tier:

1. Use `mongodump` to create manual backups:
\`\`\`bash
mongodump --uri=\"<your-mongodb-uri>\" --out=./backup
\`\`\`

2. Schedule regular backups using a cron job or GitHub Actions

### Code Backups

- Keep your GitHub repository up to date
- Use git tags for releases
- Consider using GitHub's backup features

## Scaling Considerations

As your application grows:

1. **Database**: Upgrade MongoDB Atlas tier for better performance
2. **Vercel**: Consider Pro plan for better performance and analytics
3. **Cloudinary**: Monitor storage and bandwidth usage
4. **CDN**: Vercel automatically provides CDN, but consider additional optimization

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check MongoDB Atlas logs
3. Review browser console for client-side errors
4. Check Next.js documentation
5. Review this deployment guide

---

**Congratulations! Your AI Fashion Website is now live! 🎉**
