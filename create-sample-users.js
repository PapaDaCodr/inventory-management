// Script to programmatically create sample users in Supabase
// Run this with Node.js after installing @supabase/supabase-js
// Usage: node create-sample-users.js

const { createClient } = require('@supabase/supabase-js')

// Replace with your Supabase project details
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
// Initialize Supabase client with service role key (has admin privileges)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Sample users data
const sampleUsers = [
  {
    email: 'admin@ghanamart.com.gh',
    password: 'Admin123!',
    profile: {
      full_name: 'Kwame Nkrumah',
      role: 'administrator',
      employee_id: 'EMP001',
      contact_phone: '+233-24-111-1111',
      department: 'Administration',
      assigned_areas: { areas: ['all'], permissions: ['full_access'] },
      shift_info: { 
        shift: 'day', 
        hours: '8:00-17:00', 
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] 
      },
      access_level: 5
    }
  },
  {
    email: 'manager@ghanamart.com.gh',
    password: 'Manager123!',
    profile: {
      full_name: 'Akosua Mensah',
      role: 'manager',
      employee_id: 'EMP002',
      contact_phone: '+233-20-222-2222',
      department: 'Operations',
      assigned_areas: { 
        areas: ['store_floor', 'warehouse', 'customer_service'], 
        permissions: ['manage_inventory', 'manage_staff', 'view_reports'] 
      },
      shift_info: { 
        shift: 'day', 
        hours: '7:00-16:00', 
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] 
      },
      access_level: 4
    }
  },
  {
    email: 'inventory@ghanamart.com.gh',
    password: 'Inventory123!',
    profile: {
      full_name: 'Kofi Asante',
      role: 'inventory_clerk',
      employee_id: 'EMP003',
      contact_phone: '+233-26-333-3333',
      department: 'Inventory',
      assigned_areas: { 
        areas: ['warehouse', 'receiving', 'stock_management'], 
        permissions: ['manage_inventory', 'receive_goods', 'stock_counts'] 
      },
      shift_info: { 
        shift: 'day', 
        hours: '6:00-15:00', 
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] 
      },
      access_level: 3
    }
  },
  {
    email: 'cashier1@ghanamart.com.gh',
    password: 'Cashier123!',
    profile: {
      full_name: 'Ama Serwaa',
      role: 'cashier',
      employee_id: 'EMP004',
      contact_phone: '+233-54-444-4444',
      department: 'Sales',
      assigned_areas: { 
        areas: ['checkout', 'customer_service'], 
        permissions: ['process_sales', 'handle_returns', 'customer_management'] 
      },
      shift_info: { 
        shift: 'morning', 
        hours: '7:00-15:00', 
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] 
      },
      access_level: 2
    }
  },
  {
    email: 'cashier2@ghanamart.com.gh',
    password: 'Cashier123!',
    profile: {
      full_name: 'Yaw Boateng',
      role: 'cashier',
      employee_id: 'EMP005',
      contact_phone: '+233-27-555-5555',
      department: 'Sales',
      assigned_areas: { 
        areas: ['checkout', 'customer_service'], 
        permissions: ['process_sales', 'handle_returns', 'customer_management'] 
      },
      shift_info: { 
        shift: 'evening', 
        hours: '15:00-23:00', 
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] 
      },
      access_level: 2
    }
  },
  {
    email: 'supplier@ghanamart.com.gh',
    password: 'Supplier123!',
    profile: {
      full_name: 'Abdul Rahman',
      role: 'supplier',
      employee_id: 'SUP001',
      contact_phone: '+233-30-666-6666',
      department: 'External',
      assigned_areas: { 
        areas: ['supplier_portal'], 
        permissions: ['view_orders', 'update_deliveries', 'view_payments'] 
      },
      shift_info: { 
        shift: 'flexible', 
        hours: 'flexible', 
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] 
      },
      access_level: 1
    }
  },
  {
    email: 'assistant.manager@ghanamart.com.gh',
    password: 'Assistant123!',
    profile: {
      full_name: 'Efua Adomako',
      role: 'manager',
      employee_id: 'EMP007',
      contact_phone: '+233-24-777-7777',
      department: 'Operations',
      assigned_areas: { 
        areas: ['store_floor', 'customer_service'], 
        permissions: ['manage_staff', 'handle_complaints', 'daily_operations'] 
      },
      shift_info: { 
        shift: 'day', 
        hours: '8:00-17:00', 
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] 
      },
      access_level: 4
    }
  },
  {
    email: 'inventory2@ghanamart.com.gh',
    password: 'Inventory123!',
    profile: {
      full_name: 'Kwaku Owusu',
      role: 'inventory_clerk',
      employee_id: 'EMP008',
      contact_phone: '+233-20-888-8888',
      department: 'Inventory',
      assigned_areas: { 
        areas: ['warehouse', 'stock_management'], 
        permissions: ['manage_inventory', 'stock_counts', 'reorder_management'] 
      },
      shift_info: { 
        shift: 'evening', 
        hours: '14:00-22:00', 
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] 
      },
      access_level: 3
    }
  },
  {
    email: 'night.cashier@ghanamart.com.gh',
    password: 'NightCash123!',
    profile: {
      full_name: 'Adwoa Nyong',
      role: 'cashier',
      employee_id: 'EMP009',
      contact_phone: '+233-26-999-9999',
      department: 'Sales',
      assigned_areas: { 
        areas: ['checkout', 'security'], 
        permissions: ['process_sales', 'night_operations', 'basic_security'] 
      },
      shift_info: { 
        shift: 'night', 
        hours: '22:00-06:00', 
        days: ['friday', 'saturday', 'sunday'] 
      },
      access_level: 2
    }
  },
  {
    email: 'warehouse@ghanamart.com.gh',
    password: 'Warehouse123!',
    profile: {
      full_name: 'Nana Osei',
      role: 'inventory_clerk',
      employee_id: 'EMP010',
      contact_phone: '+233-54-101-0101',
      department: 'Warehouse',
      assigned_areas: { 
        areas: ['warehouse', 'receiving', 'dispatch'], 
        permissions: ['warehouse_operations', 'goods_receiving', 'dispatch_management'] 
      },
      shift_info: { 
        shift: 'day', 
        hours: '5:00-14:00', 
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] 
      },
      access_level: 3
    }
  }
]

async function createSampleUsers() {
  console.log('🚀 Starting to create sample users...\n')

  for (const userData of sampleUsers) {
    try {
      console.log(`Creating user: ${userData.email}`)

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true // Auto-confirm email
      })

      if (authError) {
        console.error(`❌ Error creating auth user ${userData.email}:`, authError.message)
        continue
      }

      console.log(`✅ Auth user created with ID: ${authData.user.id}`)

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: userData.email,
          ...userData.profile,
          is_active: true
        })

      if (profileError) {
        console.error(`❌ Error creating profile for ${userData.email}:`, profileError.message)
        continue
      }

      console.log(`✅ Profile created for ${userData.profile.full_name} (${userData.profile.role})`)
      console.log('---')

    } catch (error) {
      console.error(`❌ Unexpected error creating user ${userData.email}:`, error.message)
    }
  }

  console.log('\n🎉 Sample user creation completed!')
  console.log('\n📋 Summary of created users:')
  sampleUsers.forEach(user => {
    console.log(`- ${user.email} (${user.profile.role}) - Password: ${user.password}`)
  })
}

// Run the script
if (require.main === module) {
  createSampleUsers().catch(console.error)
}

module.exports = { createSampleUsers, sampleUsers }
