import { supabase } from './supabase'

// Types for API responses
export interface Product {
  id: string
  sku: string
  barcode?: string
  name: string
  description?: string
  category_id?: string
  brand?: string
  unit_of_measure?: string
  base_price?: number
  cost_price?: number
  supplier_id?: string
  reorder_level: number
  max_stock_level?: number
  is_perishable: boolean
  shelf_life_days?: number
  storage_requirements?: any
  image_urls?: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  // Joined data
  category?: { name: string }
  supplier?: { name: string }
}

export interface Category {
  id: string
  name: string
  description?: string
  parent_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: any
  payment_terms?: string
  tax_id?: string
  rating?: number
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Inventory {
  id: string
  product_id: string
  location_id: string
  batch_number?: string
  lot_number?: string
  quantity_on_hand: number
  quantity_available: number
  quantity_reserved: number
  unit_cost?: number
  expiration_date?: string
  received_date?: string
  last_counted?: string
  created_at: string
  updated_at: string
  // Joined data
  product?: Product
  location?: { name: string }
}

export interface CompanySettings {
  id: string
  company_name: string
  currency?: string
  timezone?: string
  notification_settings?: any
  system_settings?: any
  created_at: string
  updated_at: string
}


export interface DashboardMetrics {
  totalProducts: number
  totalCategories: number
  totalSuppliers: number
  lowStockItems: number
  totalInventoryValue: number
  recentTransactions: number
}

// Products API
export const productsApi = {
  // Get all products with optional filters
  async getProducts(filters?: {
    category_id?: string
    supplier_id?: string
    is_active?: boolean
    search?: string
  }) {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(name),
        supplier:suppliers(name)
      `)
      .order('name')

    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id)
    }
    if (filters?.supplier_id) {
      query = query.eq('supplier_id', filters.supplier_id)
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,barcode.ilike.%${filters.search}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data as Product[]
  },

  // Get single product
  async getProduct(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name),
        supplier:suppliers(name)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Product
  },

  // Create product
  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()

    if (error) throw error
    return data as Product
  },

  // Update product
  async updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Product
  },

  // Delete product
  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Categories API
export const categoriesApi = {
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data as Category[]
  },

  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single()

    if (error) throw error
    return data as Category
  }
}

// Suppliers API
export const suppliersApi = {
  async getSuppliers() {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data as Supplier[]
  },

  async createSupplier(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(supplier)
      .select()
      .single()

    if (error) throw error
    return data as Supplier
  }
}

// Inventory API
export const inventoryApi = {
  async getInventory(filters?: {
    product_id?: string
    location_id?: string
    low_stock?: boolean
  }) {
    let query = supabase
      .from('inventory')
      .select(`
        *,
        product_join:products(name, sku, reorder_level, base_price),
        location_join:locations(name)
      `)
      .order('updated_at', { ascending: false })

    if (filters?.product_id) {
      query = query.eq('product_id', filters.product_id)
    }
    if (filters?.location_id) {
      query = query.eq('location_id', filters.location_id)
    }

    const { data, error } = await query
    if (error) throw error

    // Map join aliases to expected property names to avoid name collisions
    const mapped = (data || []).map((row: any) => ({
      ...row,
      product: row.product_join,
      location: row.location_join,
    })) as Inventory[]

    let inventory = mapped as Inventory[]

    // Filter for low stock if requested
    if (filters?.low_stock) {
      inventory = inventory.filter(item =>
        item.product?.reorder_level &&
        item.quantity_available <= item.product.reorder_level
      )
    }

    return inventory
  },

  async updateInventory(id: string, updates: Partial<Inventory>) {
    const { data, error } = await supabase
      .from('inventory')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Inventory
  }
}

// Dashboard API
export const dashboardApi = {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    // Get counts in parallel
    const [
      { count: totalProducts },
      { count: totalCategories },
      { count: totalSuppliers },
      { data: lowStockData },
      { data: inventoryData }
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('categories').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('suppliers').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('inventory').select(`
        quantity_available,
        product_join:products(reorder_level)
      `),
      supabase.from('inventory').select('quantity_available, unit_cost')
    ])

    // Calculate low stock items
    const lowStockItems = lowStockData?.filter((item: any) =>
      item.product_join?.reorder_level &&
      item.quantity_available <= item.product_join.reorder_level
    ).length || 0

    // Calculate total inventory value
    const totalInventoryValue = inventoryData?.reduce((total, item) => {
      return total + (item.quantity_available * (item.unit_cost || 0))
    }, 0) || 0

    return {
      totalProducts: totalProducts || 0,
      totalCategories: totalCategories || 0,
      totalSuppliers: totalSuppliers || 0,
      lowStockItems,
      totalInventoryValue,
      recentTransactions: 0 // TODO: Implement when transactions table is populated
    }
  }
}

// Users/Profiles API
export const usersApi = {
  async getUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name')

    if (error) throw error
    return data
  },

  async createUser(userData: {
    email: string
    password: string
    full_name: string
    role: string
    employee_id?: string
    contact_phone?: string
    department?: string
  }) {
    // Call server-side API route that uses the Service Role key
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    const json = await res.json()
    if (!res.ok) {
      throw new Error(json?.error || 'Failed to create user')
    }
    return json
  },

  async updateUser(id: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteUser(id: string) {
    // First deactivate the profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('id', id)

    if (profileError) throw profileError

    // Note: We don't delete the auth user, just deactivate the profile
    // This preserves data integrity and audit trails
  }
}

// Transactions API
export const transactionsApi = {
  async createTransaction(transactionData: {
    customer_id?: string
    cashier_id: string
    items: Array<{
      product_id: string
      quantity: number
      unit_price: number
      total_price: number
    }>
    subtotal: number
    tax_amount: number
    discount_amount?: number
    total_amount: number
    payment_method: string
    payment_reference?: string
    notes?: string
  }) {
    // Use server-side API to perform atomic transaction and inventory updates (bypasses RLS)
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData),
    })
    const json = await res.json()
    if (!res.ok) {
      throw new Error(json?.error || 'Failed to create transaction')
    }
    return json
  },

  async getTransactions(filters?: {
    cashier_id?: string
    date_from?: string
    date_to?: string
    limit?: number
  }) {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        cashier:profiles!cashier_id(full_name),
        customer:customers(name, phone),
        transaction_items(
          *,
          product:products(name, sku)
        )
      `)
      .order('transaction_date', { ascending: false })

    if (filters?.cashier_id) {
      query = query.eq('cashier_id', filters.cashier_id)
    }
    if (filters?.date_from) {
      query = query.gte('transaction_date', filters.date_from)
    }
    if (filters?.date_to) {
      query = query.lte('transaction_date', filters.date_to)
    }
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getTodayKpis() {
    const now = new Date()
    const dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dateTo = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

    const { data: txns, error } = await supabase
      .from('transactions')
      .select('id,total_amount,transaction_date,type')
      .eq('type', 'sale')
      .gte('transaction_date', dateFrom.toISOString())
      .lt('transaction_date', dateTo.toISOString())

    if (error) throw error

    const totalSales = (txns || []).reduce((sum, t: any) => sum + (t.total_amount || 0), 0)
    const totalTransactions = (txns || []).length
    const averageSale = totalTransactions > 0 ? totalSales / totalTransactions : 0

    return { totalSales, totalTransactions, averageSale }
  }
}

// Customers API
export const customersApi = {
  async getCustomers() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data
  },

  async createCustomer(customerData: {
    name: string
    phone?: string
    email?: string
    address?: string
  }) {
    const { data, error } = await supabase
      .from('customers')
      .insert({
        ...customerData,
        is_active: true
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateCustomer(id: string, updates: any) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}


// Purchase Orders API
export const purchaseOrdersApi = {
  async getPurchaseOrders(filters?: { status?: string }) {
    let query = supabase
      .from('purchase_orders')
      .select(`
        id, po_number, status, order_date, expected_delivery, total_amount,
        purchase_order_items(count)
      `)
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query
    if (error) throw error

    // Normalize items_count from nested count
    const normalized = (data || []).map((po: any) => ({
      id: po.id,
      po_number: po.po_number,
      status: po.status,
      order_date: po.order_date,
      expected_delivery: po.expected_delivery,
      total_amount: po.total_amount || 0,
      items_count: Array.isArray(po.purchase_order_items) && po.purchase_order_items[0]?.count != null
        ? po.purchase_order_items[0].count
        : undefined,
    }))

    return normalized
  },
}

// Reports API
export const reportsApi = {
  async getReportData(dateRange: string) {
    // Compute dateFrom/dateTo based on selected range (defaults to last 30 days)
    const now = new Date()
    let dateFrom = new Date(now)
    switch (dateRange) {
      case 'today': dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break
      case 'yesterday': dateFrom = new Date(now); dateFrom.setDate(now.getDate() - 1); break
      case 'last_7_days': dateFrom = new Date(now); dateFrom.setDate(now.getDate() - 7); break
      case 'last_30_days': dateFrom = new Date(now); dateFrom.setDate(now.getDate() - 30); break
      case 'last_90_days': dateFrom = new Date(now); dateFrom.setDate(now.getDate() - 90); break
      case 'this_month': dateFrom = new Date(now.getFullYear(), now.getMonth(), 1); break
      case 'last_month': dateFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1); break
      case 'this_year': dateFrom = new Date(now.getFullYear(), 0, 1); break
      default: dateFrom = new Date(now); dateFrom.setDate(now.getDate() - 30)
    }
    const dateTo = now

    // Sales totals
    const { data: salesTxns, error: salesErr } = await supabase
      .from('transactions')
      .select('id,total_amount,transaction_date,type')
      .eq('type', 'sale')
      .gte('transaction_date', dateFrom.toISOString())
      .lte('transaction_date', dateTo.toISOString())

    if (salesErr) throw salesErr

    const totalSales = (salesTxns || []).reduce((sum, t: any) => sum + (t.total_amount || 0), 0)
    const totalTransactions = (salesTxns || []).length
    const averageTransaction = totalTransactions > 0 ? Math.round((totalSales / totalTransactions) * 100) / 100 : 0

    // Top products from transaction_items joined to transactions and products
    const { data: soldItems, error: itemsErr } = await supabase
      .from('transaction_items')
      .select(`
        product_id, quantity, total_price,
        products(name),
        transactions!inner(transaction_date, type)
      `)
      .eq('transactions.type', 'sale')
      .gte('transactions.transaction_date', dateFrom.toISOString())
      .lte('transactions.transaction_date', dateTo.toISOString())

    if (itemsErr) throw itemsErr

    const productAgg: Record<string, { name: string; sales: number; quantity: number }> = {}
    for (const row of soldItems || []) {
      const pid = row.product_id
      const name = Array.isArray((row as any).products) ? (row as any).products[0]?.name : (row as any).products?.name || 'Unknown'
      if (!productAgg[pid]) {
        productAgg[pid] = { name, sales: 0, quantity: 0 }
      }
      productAgg[pid].sales += row.total_price || 0
      productAgg[pid].quantity += row.quantity || 0
    }
    const topProducts = Object.values(productAgg)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10)

    // Inventory report
    const [productsCountRes, { data: invData, error: invErr }] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase
        .from('inventory')
        .select('quantity_available, unit_cost, product_join:products(reorder_level, base_price)')
    ])

    if (invErr) throw invErr

    const lowStockItems = (invData || []).filter((i: any) => i.product_join?.reorder_level != null && i.quantity_available > 0 && i.quantity_available <= i.product_join.reorder_level).length
    const outOfStockItems = (invData || []).filter((i: any) => i.quantity_available === 0).length
    const totalValue = (invData || []).reduce((sum: number, i: any) => sum + i.quantity_available * (i.unit_cost || i.product_join?.base_price || 0), 0)

    return {
      salesSummary: {
        totalSales,
        totalTransactions,
        averageTransaction,
        topProducts,
      },
      inventoryReport: {
        totalProducts: productsCountRes.count || 0,
        lowStockItems,
        outOfStockItems,
        totalValue,
        topCategories: [],
      },
      supplierPerformance: [],
      financialMetrics: {
        revenue: totalSales,
        costs: 0,
        grossProfit: totalSales,
        profitMargin: 0,
        monthlyGrowth: 0,
      },
    }
  }
}


// Company Settings API
export const companySettingsApi = {
  async getCompanySettings() {
    const { data, error } = await supabase
      .from('company_settings')
      .select('id, company_name, currency, timezone, notification_settings, system_settings, created_at, updated_at')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    // If table is empty, PostgREST may return code PGRST116 (No rows)
    if (error && (error as any).code !== 'PGRST116') throw error
    return (data || null) as CompanySettings | null
  },

  async updateCompanySettings(updates: Partial<CompanySettings>) {
    const { data, error } = await supabase
      .from('company_settings')
      .update(updates)
      .order('updated_at', { ascending: false })
      .limit(1)
      .select()
      .single()

    if (error) throw error
    return data as CompanySettings
  },

  async saveCompanySettings(payload: {
    company_name?: string
    currency?: string
    timezone?: string
    notification_settings?: any
    system_settings?: any
  }) {
    const existing = await this.getCompanySettings()
    if (existing) {
      return this.updateCompanySettings(payload)
    }

    const { data, error } = await supabase
      .from('company_settings')
      .insert({
        company_name: payload.company_name || 'Default Company',
        currency: payload.currency,
        timezone: payload.timezone,
        notification_settings: payload.notification_settings,
        system_settings: payload.system_settings,
      })
      .select()
      .single()

    if (error) throw error
    return data as CompanySettings
  },
}
