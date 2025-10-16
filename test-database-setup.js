// Database Setup Verification Script
// Run this in your browser console to verify database tables exist
// Usage: Copy and paste this entire script into browser console on your app

async function testDatabaseSetup() {
  console.log('🔍 Testing Database Setup...\n');
  
  // Import Supabase client (assuming it's available globally)
  const { supabase } = await import('./src/lib/supabase.js');
  
  const tables = [
    'profiles',
    'products', 
    'inventory',
    'customers',
    'transactions',
    'transaction_items',
    'stock_movements',
    'suppliers',
    'categories'
  ];
  
  const results = {};
  
  for (const table of tables) {
    try {
      console.log(`Testing table: ${table}`);
      
      // Test if table exists and is accessible
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        results[table] = {
          status: '❌ ERROR',
          message: error.message,
          accessible: false
        };
      } else {
        results[table] = {
          status: '✅ OK',
          message: `Table exists with ${count || 0} records`,
          accessible: true,
          recordCount: count || 0
        };
      }
    } catch (err) {
      results[table] = {
        status: '❌ EXCEPTION',
        message: err.message,
        accessible: false
      };
    }
  }
  
  // Display results
  console.log('\n📊 Database Setup Results:');
  console.log('================================');
  
  let allGood = true;
  for (const [table, result] of Object.entries(results)) {
    console.log(`${result.status} ${table}: ${result.message}`);
    if (!result.accessible) allGood = false;
  }
  
  console.log('\n🎯 Summary:');
  if (allGood) {
    console.log('✅ All tables are accessible! Database setup is correct.');
  } else {
    console.log('❌ Some tables have issues. Check Supabase dashboard and RLS policies.');
  }
  
  // Test authentication
  console.log('\n🔐 Testing Authentication...');
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    console.log(`✅ User authenticated: ${user.email}`);
    
    // Test profile access
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profile) {
      console.log(`✅ User profile found: ${profile.full_name} (${profile.role})`);
    } else {
      console.log(`❌ Profile not found: ${profileError?.message}`);
    }
  } else {
    console.log('❌ No user authenticated. Please login first.');
  }
  
  return results;
}

// Test API functions
async function testAPIFunctions() {
  console.log('\n🧪 Testing API Functions...\n');
  
  try {
    // Import API functions
    const { productsApi, usersApi, transactionsApi, customersApi } = await import('./src/lib/supabase-api.js');
    
    console.log('✅ API modules imported successfully');
    
    // Test products API
    console.log('Testing productsApi.getProducts()...');
    const products = await productsApi.getProducts({ limit: 5 });
    console.log(`✅ Products API: Retrieved ${products?.length || 0} products`);
    
    // Test users API
    console.log('Testing usersApi.getUsers()...');
    const users = await usersApi.getUsers();
    console.log(`✅ Users API: Retrieved ${users?.length || 0} users`);
    
    // Test customers API
    console.log('Testing customersApi.getCustomers()...');
    const customers = await customersApi.getCustomers();
    console.log(`✅ Customers API: Retrieved ${customers?.length || 0} customers`);
    
    console.log('\n✅ All API functions are working!');
    
  } catch (error) {
    console.log(`❌ API test failed: ${error.message}`);
    console.log('Make sure you\'re running this on a page where the APIs are available');
  }
}

// Run tests
console.log('🚀 Starting Database and API Tests...');
console.log('=====================================\n');

testDatabaseSetup()
  .then(() => testAPIFunctions())
  .then(() => {
    console.log('\n🎉 Testing Complete!');
    console.log('\nNext Steps:');
    console.log('1. If all tests pass, proceed with manual testing');
    console.log('2. If tests fail, check Supabase dashboard and RLS policies');
    console.log('3. Use the CRUD_TESTING_GUIDE.md for detailed testing steps');
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure you\'re logged into the application');
    console.log('2. Check browser console for additional errors');
    console.log('3. Verify Supabase connection in Network tab');
  });
