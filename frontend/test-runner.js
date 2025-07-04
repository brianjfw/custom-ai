#!/usr/bin/env node

/**
 * Test Runner Utility for AI-Powered SMB Platform
 * 
 * Provides easy commands to run tests with different configurations
 * Usage: node test-runner.js [command]
 */

const { execSync } = require('child_process');
const fs = require('fs');

const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n🚀 ${description}`, 'blue');
  log(`Running: ${command}`, 'yellow');
  
  try {
    const output = execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    log(`✅ ${description} completed successfully!`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed!`, 'red');
    return false;
  }
}

function showHelp() {
  log('\n🧪 Test Runner for AI-Powered SMB Platform', 'bold');
  log('\nAvailable commands:', 'blue');
  log('  test          - Run all tests');
  log('  watch         - Run tests in watch mode');
  log('  coverage      - Run tests with coverage report');
  log('  ci            - Run tests for CI environment');
  log('  type-check    - Run TypeScript type checking');
  log('  lint          - Run ESLint');
  log('  all           - Run type-check, lint, and tests');
  log('  help          - Show this help message');
  
  log('\nExamples:', 'yellow');
  log('  node test-runner.js test');
  log('  node test-runner.js coverage');
  log('  node test-runner.js all');
}

function getTestStats() {
  try {
    // Try to get basic test count from package.json test files
    const testFiles = [
      'src/__tests__/lib/test-utils.test.ts',
      'src/__tests__/lib/heroui-theme.test.ts', 
      'src/__tests__/integration/trpc.test.ts'
    ];
    
    const existingTests = testFiles.filter(file => fs.existsSync(file));
    
    log('\n📊 Test Statistics:', 'blue');
    log(`  Test Files: ${existingTests.length}`);
    log(`  Test Categories: Utilities, Theme, Integration`);
    log(`  Coverage Target: 70%`);
    
  } catch (error) {
    log('Could not fetch test statistics', 'yellow');
  }
}

function main() {
  const command = process.argv[2];
  
  if (!command || command === 'help') {
    showHelp();
    return;
  }
  
  log('🧪 AI-Powered SMB Platform Test Runner', 'bold');
  getTestStats();
  
  let success = true;
  
  switch (command) {
    case 'test':
      success = runCommand('npm test', 'Running all tests');
      break;
      
    case 'watch':
      success = runCommand('npm run test:watch', 'Running tests in watch mode');
      break;
      
    case 'coverage':
      success = runCommand('npm run test:coverage', 'Running tests with coverage');
      break;
      
    case 'ci':
      success = runCommand('npm run test:ci', 'Running tests for CI');
      break;
      
    case 'type-check':
      success = runCommand('npm run type-check', 'Running TypeScript type checking');
      break;
      
    case 'lint':
      success = runCommand('npm run lint', 'Running ESLint');
      break;
      
    case 'all':
      log('\n🔄 Running complete test suite...', 'bold');
      success = runCommand('npm run type-check', 'TypeScript type checking');
      if (success) success = runCommand('npm run lint', 'ESLint');
      if (success) success = runCommand('npm test', 'Jest tests');
      
      if (success) {
        log('\n🎉 All checks passed! Your code is ready for deployment.', 'green');
      } else {
        log('\n⚠️  Some checks failed. Please fix the issues before deploying.', 'red');
      }
      break;
      
    default:
      log(`❌ Unknown command: ${command}`, 'red');
      showHelp();
      process.exit(1);
  }
  
  if (success) {
    log('\n✨ Test runner completed successfully!', 'green');
  } else {
    log('\n💥 Test runner encountered errors!', 'red');
    process.exit(1);
  }
}

main();