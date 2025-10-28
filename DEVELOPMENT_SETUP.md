# Local Development Setup Guide

This document provides instructions for setting up Shieldmaiden for local development, including requirements for testing the Vue 2 → Vue 3 migration.

## Prerequisites

- **Node.js**: Version 16+ (project specifies >=16.0.0)
  - Current testing done with Node 22.20.0
  - Recommended: Use `nvm` to manage Node versions
- **npm**: Version 6.13.4+ or **yarn**: Version 1.21.1+
- **Firebase Project**: Personal Firebase project for testing (optional for basic dev)
- **Git**: For version control

## Installation

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/HarmlessKey/Shieldmaiden.git
cd Shieldmaiden
npm install
```

### 2. Environment Configuration

The application requires environment variables for Firebase and other services. There are two options:

#### Option A: Using .env.vault (Recommended for Contributors)

If you have access to the dotenv vault key:

```bash
# The .env.vault file is already in the repository
# It will automatically decrypt when you have the proper DOTENV_KEY
```

#### Option B: Manual Environment Setup (For Local Testing)

Create a `.env.development.local` file in the project root:

```bash
cp .env.dist .env.development.local
```

Edit `.env.development.local` and configure the following variables:

##### Required Variables

```env
NODE_ENV=development
VUE_APP_ENV_NAME=develop

# HK API
VUE_APP_HK_API_ROOT=https://api.harmlesskey.com

# Firebase Configuration (from your Firebase project)
VUE_APP_FIREBASE_API_KEY=your-api-key
VUE_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VUE_APP_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
VUE_APP_FIREBASE_PROJECT_ID=your-project-id
VUE_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VUE_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
```

##### Optional Variables

```env
# Patreon Integration (optional for basic testing)
VUE_APP_PATREON_CLIENT_ID=your-patreon-client-id
VUE_APP_PATREON_CLIENT_SECRET=your-patreon-secret

# AI Monster Generator (optional)
MONSTER_GENERATOR_URL=http://localhost:8000/api
MONSTER_GENERATOR_API_KEY=insecure

# Character Sync Extension (optional)
LOCAL_CHARACTER_SYNC_ID=your-extension-id
```

### 3. Firebase Service Account Key (SSR Only)

For SSR (Server-Side Rendering) mode, you need a Firebase Admin SDK service account key.

#### For Real Firebase Project:

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file as `firebaseServiceAccountKey.json` in the project root
4. **⚠️ NEVER commit this file to Git** (already in .gitignore)

#### For Testing Without Firebase:

Create a placeholder file (app will start but Firebase features won't work):

```bash
# A placeholder file is created automatically for testing
# Real Firebase features will not work with placeholder credentials
```

## Running the Application

### Development Server (SSR Mode - Recommended)

```bash
npm run ssr
```

This starts the SSR development server at:
- **URL**: http://localhost:8080
- **Mode**: Server-Side Rendering + PWA
- **Hot Reload**: Enabled

Expected output:
```
Dev mode.......... ssr
Pkg quasar........ v1.22.10
Pkg @quasar/app... v2.4.3

App · Compiling Server...
App · Compiling Client...
App · Compiled Server done in ~60s
App · Compiled Client done in ~80s

Project is running at http://0.0.0.0:8080/
```

### Standard Development Server (SPA Mode)

```bash
npm run serve
```

This starts the SPA development server (faster compilation, no SSR).

### Other Commands

```bash
# Build for production
npm run build

# Run linter
npm run lint

# Run tests
npm run test
```

## Verification

### Check if Server is Running

```bash
curl http://localhost:8080/
```

Expected: HTML content with the Shieldmaiden app

### Check for Compilation Errors

Look for these messages in the terminal:
- ✅ `Compiled Server done in XXXXXms`
- ✅ `Compiled Client done in XXXXXms`
- ✅ `Project is running at http://0.0.0.0:8080/`

### Common Warnings (Can be Ignored)

- **Firebase credential errors**: Expected if using placeholder credentials
- **CSS warnings**: PostCSS compatibility warnings (non-critical)
- **Browserslist outdated**: Can run `npx update-browserslist-db@latest` to fix

## During Migration Testing

When testing the Vue 2 → Vue 3 migration, you should be able to:

1. **Start the app** before migration to establish baseline
2. **Compare behavior** after each migration phase
3. **Test component functionality** to catch breaking changes early
4. **Verify SSR functionality** continues to work
5. **Check PWA features** remain functional

### Key Areas to Test

- ✅ Application starts without errors
- ✅ Components render correctly
- ✅ Routing works (navigate between pages)
- ✅ Vuex store functions (check state management)
- ✅ Hot reload works during development
- ⚠️ Firebase features (if real credentials provided)
- ⚠️ Patreon integration (if credentials provided)

## Troubleshooting

### Port Already in Use

If port 8080 is already in use:

```bash
# Find and kill the process
lsof -ti:8080 | xargs kill -9
# Or change port in quasar.conf.js devServer.port
```

### Compilation Errors

```bash
# Clean and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Quasar cache
rm -rf .quasar
```

### Firebase Errors

If you see Firebase initialization errors:
- Check your Firebase configuration in `.env.development.local`
- Verify `firebaseServiceAccountKey.json` exists and is valid
- For testing without Firebase, the app will start but auth/database features won't work

### Node Version Issues

The project was built for Node 16. If using Node 22+:

```bash
# Switch to Node 16 using nvm
nvm install 16
nvm use 16
npm install
```

## File Structure

```
Shieldmaiden/
├── .env.development.local       # Your local environment variables (not committed)
├── .env.dist                    # Environment template
├── .env.vault                   # Encrypted environment vault
├── firebaseServiceAccountKey.json  # Firebase Admin SDK key (not committed)
├── quasar.conf.js              # Quasar v1 configuration
├── package.json                # Dependencies and scripts
├── src/                        # Application source code
│   ├── App.vue                # Root component
│   ├── boot/                  # Boot files (plugins, etc.)
│   ├── components/            # Vue components
│   ├── router/                # Vue Router configuration
│   ├── store/                 # Vuex store modules
│   └── views/                 # Page views
├── src-ssr/                    # SSR-specific code
│   ├── index.js              # SSR server entry
│   ├── extension.js          # SSR extensions
│   └── api/                  # SSR API routes
└── src-pwa/                    # PWA-specific code
```

## Getting Help

- **Discord**: https://discord.gg/fhmKBM7
- **GitHub Discussions**: https://github.com/HarmlessKey/Shieldmaiden/discussions
- **Contributors Guide**: Contact via Discord for access

## Security Notes

**⚠️ NEVER commit these files:**
- `.env.*.local`
- `firebaseServiceAccountKey.json`
- Any file containing real credentials

These are already in `.gitignore`, but double-check before committing!

## Next Steps

Once your development environment is set up:

1. Familiarize yourself with the application structure
2. Review the migration documentation:
   - `MIGRATION_PLAN.md` - Overall migration strategy
   - `BREAKING_CHANGES.md` - Detailed breaking changes
   - `MIGRATION_STATE.json` - Current migration progress
3. Run the app and test basic functionality
4. Begin migration following the phase-by-phase plan
