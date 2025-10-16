-- Sample Data for SIMS (Supermarket Inventory Management System)
-- This file contains sample data to populate the database for testing - Ghana Market

-- Insert Company Settings
INSERT INTO company_settings (
  company_name,
  address,
  contact_info,
  tax_settings,
  currency,
  timezone,
  business_hours,
  notification_settings,
  system_settings
) VALUES (
  'GhanaMart Supermarket',
  '{"street": "15 Liberation Road", "city": "Accra", "region": "Greater Accra", "postal_code": "GA-039-5028", "country": "Ghana"}',
  '{"phone": "+233-30-123-4567", "mobile": "+233-24-567-8901", "email": "info@ghanamart.com.gh", "website": "www.ghanamart.com.gh"}',
  '{"vat_rate": 12.5, "nhil_rate": 2.5, "getfund_rate": 2.5, "covid_levy_rate": 1.0, "tin": "C0012345678901"}',
  'GHS',
  'Africa/Accra',
  '{"monday": "7:00-22:00", "tuesday": "7:00-22:00", "wednesday": "7:00-22:00", "thursday": "7:00-22:00", "friday": "7:00-23:00", "saturday": "7:00-23:00", "sunday": "8:00-21:00"}',
  '{"low_stock_threshold": 10, "expiry_warning_days": 7, "email_notifications": true, "sms_notifications": true}',
  '{"auto_reorder": false, "barcode_scanning": true, "receipt_printing": true, "mobile_money_integration": true}'
);

-- Insert Categories
INSERT INTO categories (name, description, is_active) VALUES
('Beverages', 'Soft drinks, juices, water, malt drinks, and local beverages', true),
('Dairy & Eggs', 'Milk, cheese, yogurt, eggs and dairy products', true),
('Meat & Seafood', 'Fresh meat, poultry, fish, and seafood', true),
('Fresh Produce', 'Fresh fruits, vegetables, and local produce', true),
('Grains & Cereals', 'Rice, maize, millet, wheat flour, and cereals', true),
('Local Staples', 'Yam, plantain, cassava, cocoyam, and local tubers', true),
('Spices & Seasonings', 'Palm oil, groundnut oil, spices, and local seasonings', true),
('Bakery', 'Bread, pastries, biscuits, and baked goods', true),
('Health & Beauty', 'Personal care, cosmetics, and health products', true),
('Household', 'Cleaning supplies, detergents, and household items', true),
('Textiles & Clothing', 'Fabrics, clothing, and accessories', true),
('Traditional Medicine', 'Herbal remedies and traditional medicines', true);

-- Insert Locations
INSERT INTO locations (name, type, address, capacity_info, is_active) VALUES
('Main Warehouse', 'warehouse', '{"street": "Industrial Area", "city": "Tema", "region": "Greater Accra", "country": "Ghana"}', '{"total_capacity": 1000, "unit": "sq_m"}', true),
('Store Floor', 'store', '{"description": "Main retail floor - Liberation Road"}', '{"aisles": 8, "sections": 32}', true),
('Cold Storage', 'warehouse', '{"description": "Refrigerated storage for perishables"}', '{"temperature_range": "2-8C", "capacity": 50}', true),
('Dry Storage', 'warehouse', '{"description": "Storage for grains and dry goods"}', '{"capacity": 200, "unit": "sq_m"}', true);

-- Insert Suppliers
INSERT INTO suppliers (name, contact_person, email, phone, address, payment_terms, tax_id, rating, is_active) VALUES
('Tema Food Distributors', 'Kwame Asante', 'kwame@temafood.com.gh', '+233-30-234-5678', '{"street": "Harbour Road", "city": "Tema", "region": "Greater Accra", "country": "Ghana"}', 'Net 30', 'C0012345678902', 5, true),
('Accra Fresh Produce', 'Ama Serwaa', 'ama@accrafresh.gh', '+233-24-567-8901', '{"street": "Agbogbloshie Market", "city": "Accra", "region": "Greater Accra", "country": "Ghana"}', 'Net 15', 'C0012345678903', 4, true),
('Golden Tree Beverages', 'Kofi Mensah', 'kofi@goldentree.com.gh', '+233-20-345-6789', '{"street": "Spintex Road", "city": "Accra", "region": "Greater Accra", "country": "Ghana"}', 'Net 30', 'C0012345678904', 4, true),
('Kumasi Grains & Cereals', 'Akosua Boateng', 'akosua@kumasigrains.gh', '+233-32-456-7890', '{"street": "Central Market", "city": "Kumasi", "region": "Ashanti", "country": "Ghana"}', 'Net 45', 'C0012345678905', 5, true),
('West Africa Imports', 'Abdul Rahman', 'abdul@waimports.com.gh', '+233-30-567-8901', '{"street": "Ring Road", "city": "Accra", "region": "Greater Accra", "country": "Ghana"}', 'Net 30', 'C0012345678906', 4, true);

-- Insert Products
INSERT INTO products (
  sku, barcode, name, description, category_id, brand, unit_of_measure,
  base_price, cost_price, supplier_id, reorder_level, max_stock_level,
  is_perishable, shelf_life_days, is_active
) VALUES
-- Beverages
('BEV001', '1234567890123', 'Voltic Water 1.5L', 'Pure natural water in 1.5L bottle',
 (SELECT id FROM categories WHERE name = 'Beverages'), 'Voltic', 'each', 3.50, 2.20,
 (SELECT id FROM suppliers WHERE name = 'Golden Tree Beverages'), 50, 500, false, null, true),

('BEV002', '1234567890124', 'Malta Guinness 330ml', 'Non-alcoholic malt drink',
 (SELECT id FROM categories WHERE name = 'Beverages'), 'Guinness', 'each', 4.00, 2.80,
 (SELECT id FROM suppliers WHERE name = 'Golden Tree Beverages'), 30, 200, false, null, true),

('BEV003', '1234567890125', 'Sobolo (Hibiscus Tea)', 'Traditional hibiscus drink',
 (SELECT id FROM categories WHERE name = 'Beverages'), 'Local', 'bottle', 2.50, 1.50,
 (SELECT id FROM suppliers WHERE name = 'Accra Fresh Produce'), 25, 100, true, 3, true),

-- Fresh Produce
('PRO001', '3456789012345', 'Plantain', 'Fresh ripe plantain',
 (SELECT id FROM categories WHERE name = 'Fresh Produce'), 'Local', 'piece', 1.50, 0.80,
 (SELECT id FROM suppliers WHERE name = 'Accra Fresh Produce'), 40, 200, true, 7, true),

('PRO002', '3456789012346', 'Yam', 'Fresh white yam',
 (SELECT id FROM categories WHERE name = 'Fresh Produce'), 'Local', 'kg', 8.00, 5.00,
 (SELECT id FROM suppliers WHERE name = 'Accra Fresh Produce'), 20, 100, true, 14, true),

('PRO003', '3456789012347', 'Tomatoes', 'Fresh red tomatoes',
 (SELECT id FROM categories WHERE name = 'Fresh Produce'), 'Local', 'kg', 6.00, 3.50,
 (SELECT id FROM suppliers WHERE name = 'Accra Fresh Produce'), 30, 150, true, 5, true),

('PRO004', '3456789012348', 'Garden Eggs', 'Fresh garden eggs (eggplant)',
 (SELECT id FROM categories WHERE name = 'Fresh Produce'), 'Local', 'kg', 4.50, 2.80,
 (SELECT id FROM suppliers WHERE name = 'Accra Fresh Produce'), 25, 120, true, 7, true),

-- Grains & Cereals
('GRA001', '4567890123456', 'Jasmine Rice 25kg', 'Premium jasmine rice, 25kg bag',
 (SELECT id FROM categories WHERE name = 'Grains & Cereals'), 'Royal Umbrella', 'bag', 180.00, 150.00,
 (SELECT id FROM suppliers WHERE name = 'Kumasi Grains & Cereals'), 10, 50, false, null, true),

('GRA002', '4567890123457', 'Maize (Corn) 50kg', 'Dried white maize, 50kg bag',
 (SELECT id FROM categories WHERE name = 'Grains & Cereals'), 'Local', 'bag', 120.00, 95.00,
 (SELECT id FROM suppliers WHERE name = 'Kumasi Grains & Cereals'), 8, 40, false, null, true),

-- Spices & Seasonings
('SPI001', '5678901234567', 'Palm Oil 4L', 'Pure red palm oil, 4 liter container',
 (SELECT id FROM categories WHERE name = 'Spices & Seasonings'), 'Frytol', 'container', 45.00, 35.00,
 (SELECT id FROM suppliers WHERE name = 'West Africa Imports'), 15, 80, false, null, true),

('SPI002', '5678901234568', 'Groundnut Oil 1L', 'Pure groundnut oil, 1 liter bottle',
 (SELECT id FROM categories WHERE name = 'Spices & Seasonings'), 'Gino', 'bottle', 18.00, 14.00,
 (SELECT id FROM suppliers WHERE name = 'West Africa Imports'), 20, 100, false, null, true),

-- Dairy & Eggs
('DAI001', '2345678901234', 'Fresh Eggs', 'Local farm fresh eggs, 30 pieces',
 (SELECT id FROM categories WHERE name = 'Dairy & Eggs'), 'Local', 'crate', 25.00, 18.00,
 (SELECT id FROM suppliers WHERE name = 'Accra Fresh Produce'), 20, 100, true, 21, true),

-- Household
('HOU001', '6789012345678', 'Omo Washing Powder 1kg', 'Omo detergent powder, 1kg pack',
 (SELECT id FROM categories WHERE name = 'Household'), 'Omo', 'pack', 15.00, 11.00,
 (SELECT id FROM suppliers WHERE name = 'West Africa Imports'), 25, 120, false, null, true);

-- Insert Initial Inventory
INSERT INTO inventory (
  product_id, location_id, quantity_on_hand, quantity_available,
  unit_cost, received_date, last_counted
) VALUES
-- Beverages in Main Warehouse
((SELECT id FROM products WHERE sku = 'BEV001'), (SELECT id FROM locations WHERE name = 'Main Warehouse'),
 200, 200, 2.20, CURRENT_DATE - INTERVAL '5 days', NOW()),
((SELECT id FROM products WHERE sku = 'BEV002'), (SELECT id FROM locations WHERE name = 'Main Warehouse'),
 120, 120, 2.80, CURRENT_DATE - INTERVAL '3 days', NOW()),
((SELECT id FROM products WHERE sku = 'BEV003'), (SELECT id FROM locations WHERE name = 'Cold Storage'),
 50, 50, 1.50, CURRENT_DATE - INTERVAL '1 day', NOW()),

-- Fresh Produce in Cold Storage
((SELECT id FROM products WHERE sku = 'PRO001'), (SELECT id FROM locations WHERE name = 'Cold Storage'),
 150, 150, 0.80, CURRENT_DATE, NOW()),
((SELECT id FROM products WHERE sku = 'PRO002'), (SELECT id FROM locations WHERE name = 'Cold Storage'),
 80, 80, 5.00, CURRENT_DATE - INTERVAL '2 days', NOW()),
((SELECT id FROM products WHERE sku = 'PRO003'), (SELECT id FROM locations WHERE name = 'Cold Storage'),
 60, 60, 3.50, CURRENT_DATE, NOW()),
((SELECT id FROM products WHERE sku = 'PRO004'), (SELECT id FROM locations WHERE name = 'Cold Storage'),
 45, 45, 2.80, CURRENT_DATE, NOW()),

-- Grains in Dry Storage
((SELECT id FROM products WHERE sku = 'GRA001'), (SELECT id FROM locations WHERE name = 'Dry Storage'),
 25, 25, 150.00, CURRENT_DATE - INTERVAL '10 days', NOW()),
((SELECT id FROM products WHERE sku = 'GRA002'), (SELECT id FROM locations WHERE name = 'Dry Storage'),
 15, 15, 95.00, CURRENT_DATE - INTERVAL '7 days', NOW()),

-- Spices & Seasonings in Main Warehouse
((SELECT id FROM products WHERE sku = 'SPI001'), (SELECT id FROM locations WHERE name = 'Main Warehouse'),
 40, 40, 35.00, CURRENT_DATE - INTERVAL '5 days', NOW()),
((SELECT id FROM products WHERE sku = 'SPI002'), (SELECT id FROM locations WHERE name = 'Main Warehouse'),
 60, 60, 14.00, CURRENT_DATE - INTERVAL '3 days', NOW()),

-- Dairy & Eggs in Cold Storage
((SELECT id FROM products WHERE sku = 'DAI001'), (SELECT id FROM locations WHERE name = 'Cold Storage'),
 30, 30, 18.00, CURRENT_DATE - INTERVAL '2 days', NOW()),

-- Household items in Main Warehouse
((SELECT id FROM products WHERE sku = 'HOU001'), (SELECT id FROM locations WHERE name = 'Main Warehouse'),
 80, 80, 11.00, CURRENT_DATE - INTERVAL '4 days', NOW());

-- Insert Sample Customers
INSERT INTO customers (customer_code, name, email, phone, address, loyalty_points, is_active) VALUES
('CUST001', 'Kwame Nkrumah', 'kwame.nkrumah@gmail.com', '+233-24-123-4567', '{"street": "Cantonments Road", "city": "Accra", "region": "Greater Accra", "country": "Ghana"}', 150, true),
('CUST002', 'Akosua Mensah', 'akosua.mensah@yahoo.com', '+233-20-234-5678', '{"street": "East Legon", "city": "Accra", "region": "Greater Accra", "country": "Ghana"}', 75, true),
('CUST003', 'Kofi Asante', 'kofi.asante@hotmail.com', '+233-26-345-6789', '{"street": "Dansoman", "city": "Accra", "region": "Greater Accra", "country": "Ghana"}', 200, true),
('CUST004', 'Ama Serwaa', 'ama.serwaa@gmail.com', '+233-54-456-7890', '{"street": "Kumasi Central", "city": "Kumasi", "region": "Ashanti", "country": "Ghana"}', 50, true),
('CUST005', 'Yaw Boateng', 'yaw.boateng@outlook.com', '+233-27-567-8901', '{"street": "Tema Community 1", "city": "Tema", "region": "Greater Accra", "country": "Ghana"}', 120, true);

-- Note: Sample profiles, transactions, and other data that requires auth.users 
-- will need to be inserted after user registration through the application
