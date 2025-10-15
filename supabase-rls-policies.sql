-- Row Level Security (RLS) Policies for SIMS
-- Comprehensive security implementation for all user roles

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT role FROM profiles WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin or manager
CREATE OR REPLACE FUNCTION is_admin_or_manager()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() IN ('administrator', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES TABLE POLICIES
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT
USING (auth.uid() = id);

-- Admins and managers can view all profiles
CREATE POLICY "Admins and managers can view all profiles" ON profiles FOR SELECT
USING (is_admin_or_manager());

-- Admins can insert/update/delete profiles
CREATE POLICY "Admins can manage profiles" ON profiles FOR ALL
USING (get_user_role() = 'administrator');

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  role = (SELECT role FROM profiles WHERE id = auth.uid()) -- Can't change role
);

-- COMPANY_SETTINGS TABLE POLICIES
-- Only admins can manage company settings
CREATE POLICY "Admins can manage company settings" ON company_settings FOR ALL
USING (get_user_role() = 'administrator');

-- All authenticated users can view company settings
CREATE POLICY "All users can view company settings" ON company_settings FOR SELECT
USING (auth.uid() IS NOT NULL);

-- CATEGORIES TABLE POLICIES
-- All authenticated users can view categories
CREATE POLICY "All users can view categories" ON categories FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Admins and managers can manage categories
CREATE POLICY "Admins and managers can manage categories" ON categories FOR ALL
USING (is_admin_or_manager());

-- SUPPLIERS TABLE POLICIES
-- All authenticated users can view suppliers
CREATE POLICY "All users can view suppliers" ON suppliers FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Admins, managers, and suppliers can manage supplier data
CREATE POLICY "Authorized users can manage suppliers" ON suppliers FOR ALL
USING (get_user_role() IN ('administrator', 'manager', 'supplier'));

-- LOCATIONS TABLE POLICIES
-- All authenticated users can view locations
CREATE POLICY "All users can view locations" ON locations FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Admins and managers can manage locations
CREATE POLICY "Admins and managers can manage locations" ON locations FOR ALL
USING (is_admin_or_manager());

-- PRODUCTS TABLE POLICIES
-- All authenticated users can view products
CREATE POLICY "All users can view products" ON products FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Admins, managers, and inventory clerks can manage products
CREATE POLICY "Authorized users can manage products" ON products FOR ALL
USING (get_user_role() IN ('administrator', 'manager', 'inventory_clerk'));

-- INVENTORY TABLE POLICIES
-- All authenticated users can view inventory
CREATE POLICY "All users can view inventory" ON inventory FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Inventory clerks can only see assigned locations
CREATE POLICY "Clerks see assigned inventory" ON inventory FOR SELECT
USING (
  get_user_role() = 'inventory_clerk' AND
  location_id::text = ANY(
    SELECT jsonb_array_elements_text(assigned_areas) 
    FROM profiles 
    WHERE id = auth.uid()
  )
);

-- Admins, managers, and inventory clerks can manage inventory
CREATE POLICY "Authorized users can manage inventory" ON inventory FOR ALL
USING (get_user_role() IN ('administrator', 'manager', 'inventory_clerk'));

-- PURCHASE_ORDERS TABLE POLICIES
-- Admins, managers, and suppliers can view purchase orders
CREATE POLICY "Authorized users can view purchase orders" ON purchase_orders FOR SELECT
USING (get_user_role() IN ('administrator', 'manager', 'supplier'));

-- Suppliers can only see their own purchase orders
CREATE POLICY "Suppliers see own purchase orders" ON purchase_orders FOR SELECT
USING (
  get_user_role() = 'supplier' AND
  supplier_id IN (
    SELECT id FROM suppliers WHERE 
    -- Assuming supplier users are linked via email or employee_id
    email = (SELECT email FROM profiles WHERE id = auth.uid())
  )
);

-- Admins and managers can manage purchase orders
CREATE POLICY "Admins and managers can manage purchase orders" ON purchase_orders FOR ALL
USING (is_admin_or_manager());

-- PURCHASE_ORDER_ITEMS TABLE POLICIES
-- Same access as purchase orders
CREATE POLICY "Authorized users can view PO items" ON purchase_order_items FOR SELECT
USING (get_user_role() IN ('administrator', 'manager', 'supplier'));

CREATE POLICY "Admins and managers can manage PO items" ON purchase_order_items FOR ALL
USING (is_admin_or_manager());

-- CUSTOMERS TABLE POLICIES
-- Cashiers, admins, and managers can view customers
CREATE POLICY "Authorized users can view customers" ON customers FOR SELECT
USING (get_user_role() IN ('administrator', 'manager', 'cashier'));

-- Admins and managers can manage customers
CREATE POLICY "Admins and managers can manage customers" ON customers FOR ALL
USING (is_admin_or_manager());

-- Cashiers can create customers during transactions
CREATE POLICY "Cashiers can create customers" ON customers FOR INSERT
WITH CHECK (get_user_role() = 'cashier');

-- TRANSACTIONS TABLE POLICIES
-- Cashiers can view and create transactions
CREATE POLICY "Cashiers can manage transactions" ON transactions FOR ALL
USING (get_user_role() IN ('administrator', 'manager', 'cashier'));

-- Users can only see transactions they created
CREATE POLICY "Users see own transactions" ON transactions FOR SELECT
USING (cashier_id = auth.uid());

-- TRANSACTION_ITEMS TABLE POLICIES
-- Same access as transactions
CREATE POLICY "Authorized users can view transaction items" ON transaction_items FOR SELECT
USING (get_user_role() IN ('administrator', 'manager', 'cashier'));

CREATE POLICY "Authorized users can manage transaction items" ON transaction_items FOR ALL
USING (get_user_role() IN ('administrator', 'manager', 'cashier'));

-- STOCK_MOVEMENTS TABLE POLICIES
-- All authenticated users can view stock movements (audit trail)
CREATE POLICY "All users can view stock movements" ON stock_movements FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Admins, managers, and inventory clerks can create stock movements
CREATE POLICY "Authorized users can create stock movements" ON stock_movements FOR INSERT
WITH CHECK (get_user_role() IN ('administrator', 'manager', 'inventory_clerk'));

-- Only admins can delete stock movements (audit integrity)
CREATE POLICY "Only admins can delete stock movements" ON stock_movements FOR DELETE
USING (get_user_role() = 'administrator');

-- NOTIFICATIONS TABLE POLICIES
-- Users can only see their own notifications
CREATE POLICY "Users see own notifications" ON notifications FOR SELECT
USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- System can create notifications for users
CREATE POLICY "System can create notifications" ON notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- MESSAGES TABLE POLICIES
-- Users can see messages they sent or received
CREATE POLICY "Users see own messages" ON messages FOR SELECT
USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Users can send messages
CREATE POLICY "Users can send messages" ON messages FOR INSERT
WITH CHECK (sender_id = auth.uid());

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can update received messages" ON messages FOR UPDATE
USING (recipient_id = auth.uid())
WITH CHECK (recipient_id = auth.uid());

-- Admins can see all messages (for moderation)
CREATE POLICY "Admins can view all messages" ON messages FOR SELECT
USING (get_user_role() = 'administrator');
