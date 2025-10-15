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
        product:products(name, sku, reorder_level),
        location:locations(name)
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

    let inventory = data as Inventory[]

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
        product:products(reorder_level)
      `),
      supabase.from('inventory').select('quantity_available, unit_cost')
    ])

    // Calculate low stock items
    const lowStockItems = lowStockData?.filter(item => 
      item.product?.reorder_level && 
      item.quantity_available <= item.product.reorder_level
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

  async updateUser(id: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
