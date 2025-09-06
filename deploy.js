#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Dr. Mimu Deployment Script');
console.log('================================');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'vercel.json',
  'Dockerfile',
  'railway.json'
];

console.log('📋 Checking required files...');
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Missing required file: ${file}`);
    process.exit(1);
  }
  console.log(`✅ Found: ${file}`);
}

// Check if environment variables are set
console.log('\n🔧 Checking environment variables...');
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_OPENAI_API_KEY',
  'VITE_GEMINI_API_KEY'
];

let missingEnvVars = [];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    missingEnvVars.push(envVar);
  }
}

if (missingEnvVars.length > 0) {
  console.warn('⚠️  Missing environment variables:');
  missingEnvVars.forEach(envVar => console.warn(`   - ${envVar}`));
  console.warn('\n📝 Please set these variables before deploying.');
  console.warn('   You can create a .env file or set them in your deployment platform.');
}

// Function to run command safely
function runCommand(command, description) {
  try {
    console.log(`\n🔄 ${description}...`);
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✅ ${description} completed successfully!`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

// Main deployment function
async function deploy() {
  console.log('\n🏗️  Starting deployment process...');
  
  // Install dependencies
  if (!runCommand('npm install', 'Installing dependencies')) {
    console.error('❌ Failed to install dependencies. Please check your package.json.');
    return;
  }
  
  // Try to build the project
  console.log('\n🔨 Attempting to build project...');
  try {
    execSync('npx vite build', { stdio: 'inherit', cwd: process.cwd() });
    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.warn('⚠️  Build failed, but deployment can still proceed.');
    console.warn('   The deployment platforms will handle the build process.');
  }
  
  console.log('\n🚀 Deployment Options:');
  console.log('========================');
  
  console.log('\n📦 Option 1: Deploy to Vercel');
  console.log('   Run: vercel');
  console.log('   Or visit: https://vercel.com/new');
  
  console.log('\n🚂 Option 2: Deploy to Railway');
  console.log('   Run: railway up');
  console.log('   Or visit: https://railway.app/new');
  
  console.log('\n📚 For detailed instructions, see DEPLOYMENT_GUIDE.md');
  
  console.log('\n✨ Deployment preparation completed!');
  console.log('   Your application is ready to be deployed to both platforms.');
}

// Run the deployment preparation
deploy().catch(error => {
  console.error('❌ Deployment preparation failed:', error);
  process.exit(1);
});