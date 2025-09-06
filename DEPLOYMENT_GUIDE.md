# Dr. Mimu Deployment Guide

## Prerequisites
- Node.js 18+ installed
- Git repository setup
- Vercel account
- Railway account

## Environment Variables Setup

Before deploying, you need to set up environment variables in both platforms:

### Required Environment Variables:
```
NODE_ENV=production
VITE_APP_ENV=production
VITE_API_BASE_URL=https://your-api-domain.com
VITE_APP_URL=https://your-app-domain.com
VITE_FIREBASE_API_KEY=your-production-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_OPENAI_API_KEY=your-production-openai-key
VITE_GEMINI_API_KEY=your-production-gemini-key
VITE_DEEPSEEK_API_KEY=your-production-deepseek-key
VITE_GOOGLE_CLIENT_ID=your-production-google-client-id
VITE_GOOGLE_CLIENT_SECRET=your-production-google-client-secret
DATABASE_URL=your-production-database-url
PRISMA_DATABASE_URL=your-production-prisma-database-url
JWT_SECRET=your-production-jwt-secret
ENCRYPTION_KEY=your-production-encryption-key
VITE_WHATSAPP_API_KEY=your-production-whatsapp-key
VITE_WHATSAPP_PHONE_NUMBER=your-production-whatsapp-number
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
VITE_ANALYTICS_ID=your-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_CHAT=true
VITE_ENABLE_TELEMEDICINE=true
```

## Deployment to Vercel

### Method 1: Using Vercel CLI
1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy the application:
   ```bash
   vercel
   ```

4. Follow the prompts to configure your deployment

### Method 2: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Configure environment variables in the dashboard
5. Deploy

### Vercel Configuration
The `vercel.json` file is already configured with:
- Static build setup
- API routes handling
- Security headers
- Environment variables

## Deployment to Railway

### Method 1: Using Railway CLI
1. Install Railway CLI globally:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Initialize Railway project:
   ```bash
   railway init
   ```

4. Deploy the application:
   ```bash
   railway up
   ```

### Method 2: Using Railway Dashboard
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Connect your Git repository
4. Configure environment variables
5. Deploy

### Railway Configuration
The following files are configured for Railway:
- `Dockerfile` - Container configuration
- `railway.json` - Railway-specific settings
- `.dockerignore` - Files to exclude from Docker build

## Post-Deployment Steps

### 1. Database Setup
If using a database, make sure to:
- Set up your production database
- Run migrations: `npm run db:migrate:deploy`
- Seed initial data if needed

### 2. Domain Configuration
- Configure custom domains in both platforms
- Set up SSL certificates (automatic in both platforms)
- Update CORS settings if needed

### 3. Monitoring Setup
- Configure error tracking (Sentry)
- Set up analytics
- Monitor performance metrics

### 4. Testing
- Test all features in production
- Verify API endpoints
- Check mobile responsiveness
- Test AI features
- Verify notifications

## Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check environment variables
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **API Issues**
   - Verify API keys are set correctly
   - Check CORS configuration
   - Ensure database connection

3. **Performance Issues**
   - Enable compression
   - Optimize images
   - Use CDN for static assets

## Security Checklist

- [ ] All API keys are set as environment variables
- [ ] No sensitive data in code
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] Error messages don't expose sensitive info

## Maintenance

### Regular Tasks:
- Monitor application performance
- Update dependencies regularly
- Backup database
- Review security logs
- Update API keys as needed

### Scaling:
- Monitor resource usage
- Scale based on traffic
- Optimize database queries
- Use caching where appropriate

## Support

For deployment issues:
1. Check platform-specific documentation
2. Review application logs
3. Contact platform support if needed

---

**Note**: Make sure to replace all placeholder values with your actual production credentials before