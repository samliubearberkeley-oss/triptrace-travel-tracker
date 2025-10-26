// Direct test of InsForge OAuth API
import { createClient } from '@insforge/sdk';

const INSFORGE_URL = 'https://r7qhf8dm.us-east.insforge.app';

console.log('Testing InsForge OAuth Configuration...\n');
console.log('Backend URL:', INSFORGE_URL);
console.log('---\n');

const client = createClient({
  baseUrl: INSFORGE_URL
});

console.log('Client created successfully');
console.log('Available methods:', Object.keys(client.auth));
console.log('---\n');

async function testGoogleOAuth() {
  console.log('Test 1: Google OAuth with skipBrowserRedirect');
  try {
    const result = await client.auth.signInWithOAuth({
      provider: 'google',
      redirectTo: 'http://localhost:5173',
      skipBrowserRedirect: true
    });
    
    console.log('✓ Success!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.data?.url) {
      console.log('\nOAuth URL generated:');
      console.log(result.data.url);
    }
  } catch (error) {
    console.log('✗ Error!');
    console.log('Error message:', error.message);
    console.log('Error stack:', error.stack);
    console.log('Full error:', JSON.stringify(error, null, 2));
  }
  console.log('---\n');
}

async function testGithubOAuth() {
  console.log('Test 2: GitHub OAuth with skipBrowserRedirect');
  try {
    const result = await client.auth.signInWithOAuth({
      provider: 'github',
      redirectTo: 'http://localhost:5173',
      skipBrowserRedirect: true
    });
    
    console.log('✓ Success!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.data?.url) {
      console.log('\nOAuth URL generated:');
      console.log(result.data.url);
    }
  } catch (error) {
    console.log('✗ Error!');
    console.log('Error message:', error.message);
    console.log('Full error:', JSON.stringify(error, null, 2));
  }
  console.log('---\n');
}

async function testWithOptions() {
  console.log('Test 3: Google OAuth with options object');
  try {
    const result = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5173',
        skipBrowserRedirect: true
      }
    });
    
    console.log('✓ Success!');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('✗ Error!');
    console.log('Error message:', error.message);
  }
  console.log('---\n');
}

async function testMinimal() {
  console.log('Test 4: Minimal OAuth call');
  try {
    const result = await client.auth.signInWithOAuth({
      provider: 'google'
    });
    
    console.log('✓ Success!');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('✗ Error!');
    console.log('Error message:', error.message);
  }
  console.log('---\n');
}

// Run all tests
(async () => {
  await testGoogleOAuth();
  await testGithubOAuth();
  await testWithOptions();
  await testMinimal();
  
  console.log('All tests completed!');
  process.exit(0);
})();

