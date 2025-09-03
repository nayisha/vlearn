
# Deploying VLearn to Netlify

## Prerequisites
- A Netlify account
- Your code repository on GitHub, GitLab, or Bitbucket

## Step 1: Prepare Your Application
Your Next.js application is already configured for static export with these settings in `next.config.mjs`:
- `output: 'export'` - Enables static export
- `trailingSlash: true` - Required for Netlify
- `images: { unoptimized: true }` - Optimizes for static hosting

## Step 2: Build Settings
When setting up your Netlify site, use these build settings:

- **Build command**: `npm run build`
- **Publish directory**: `out`
- **Node version**: `20.x` (set in Environment Variables)

## Step 3: Environment Variables
If you're using Firebase or other services, add these environment variables in Netlify:

1. Go to Site settings → Environment variables
2. Add your Firebase configuration variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

## Step 4: Deploy
1. Connect your repository to Netlify
2. Configure the build settings above
3. Click "Deploy site"

## Step 5: Custom Domain (Optional)
1. Go to Site settings → Domain management
2. Add your custom domain
3. Configure DNS settings as instructed

## Troubleshooting

### Build Errors
- Ensure all dependencies are in `package.json`
- Check that `npm run build` works locally
- Verify Node.js version compatibility

### Firebase Integration
- Make sure all Firebase environment variables are set
- Update Firebase project settings to allow your Netlify domain

### 404 Errors
- Verify `trailingSlash: true` is set in `next.config.mjs`
- Check that the publish directory is set to `out`

## Notes
- Static export means no server-side features (API routes won't work)
- All data fetching must be client-side or at build time
- Consider using Replit's Static Deployments for easier deployment workflow
