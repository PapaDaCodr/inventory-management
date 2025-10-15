**Supermarket** **Inventory** **Management** **System** **(SIMS)**

**Complete** **Development** **Specification** **with** **Supabase**
**Backend**

**Project** **Overview**

The Supermarket Inventory Management System (SIMS) is a comprehensive
web application designed to manage all aspects of supermarket operations
including inventory management, user authentication, sales tracking,
supplier management, and analytics. The system supports multiple user
roles with role-based access control and features offline capability.

**Backend** **Technology**: Supabase (Backend-as-a-Service)
**Authentication**: Supabase Auth with Row Level Security (RLS)
**Database**: PostgreSQL (via Supabase) **Real-time**: Supabase Realtime
**Storage**: Supabase Storage for files and images

**Database** **Schema** **Design** **(Supabase** **PostgreSQL)**

**Core** **Tables**

**1.** **User** **Profiles** **Table**

> sql
>
> *--* *Users* *table* *(extends* *Supabase* *auth.users)* CREATE TABLE
> profiles (
>
> id UUID REFERENCES auth.users(id) PRIMARY KEY, full_name TEXT NOT
> NULL,
>
> email TEXT UNIQUE NOT NULL,
>
> role TEXT NOT NULL CHECK (role IN ('administrator', 'manager',
> 'inventory_clerk', 'cashier', 'supplier')), employee_id TEXT UNIQUE,
>
> contact_phone TEXT, department TEXT, assigned_areas JSONB, shift_info
> JSONB,
>
> access_level INTEGER DEFAULT 1, is_active BOOLEAN DEFAULT true,
> last_login TIMESTAMPTZ,
>
> created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT
> NOW()
>
> );

**2.** **Company** **Information**

> sql
>
> CREATE TABLE company_settings (
>
> id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_name TEXT NOT
> NULL,
>
> store_locations JSONB, tax_configuration JSONB, currency_settings
> JSONB, fiscal_period_settings JSONB,
>
> created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT
> NOW()
>
> );

**3.** **Products** **&** **Inventory**

> sql

*--* *Product* *categories* CREATE TABLE categories (

> id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL,
>
> description TEXT,
>
> parent_category_id UUID REFERENCES categories(id), is_active BOOLEAN
> DEFAULT true,

created_at TIMESTAMPTZ DEFAULT NOW() );

*--* *Products* *master* *data* CREATE TABLE products (

> id UUID PRIMARY KEY DEFAULT gen_random_uuid(), sku TEXT UNIQUE NOT
> NULL,
>
> barcode TEXT UNIQUE, name TEXT NOT NULL, description TEXT,
>
> category_id UUID REFERENCES categories(id), brand TEXT,
>
> unit_of_measure TEXT, base_price DECIMAL(10,2), cost_price
> DECIMAL(10,2),
>
> supplier_id UUID REFERENCES suppliers(id), reorder_level INTEGER
> DEFAULT 0, max_stock_level INTEGER,
>
> is_perishable BOOLEAN DEFAULT false, shelf_life_days INTEGER,
> storage_requirements JSONB, image_urls TEXT\[\],
>
> is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW(),
> updated_at TIMESTAMPTZ DEFAULT NOW()

);

*--* *Inventory* *tracking* CREATE TABLE inventory (

> id UUID PRIMARY KEY DEFAULT gen_random_uuid(), product_id UUID
> REFERENCES products(id), location_id UUID REFERENCES locations(id),
> batch_number TEXT,
>
> lot_number TEXT,
>
> quantity_on_hand INTEGER NOT NULL DEFAULT 0, quantity_available
> INTEGER NOT NULL DEFAULT 0,
>
> quantity_reserved INTEGER DEFAULT 0, unit_cost DECIMAL(10,2),
> expiration_date DATE,
>
> received_date DATE, last_counted TIMESTAMPTZ,
>
> created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT
> NOW()
>
> );

**4.** **Suppliers**

> sql
>
> CREATE TABLE suppliers (
>
> id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_name TEXT NOT
> NULL,
>
> contact_person TEXT, email TEXT,
>
> phone TEXT, business_registration_number TEXT, address JSONB,
>
> product_categories TEXT\[\], delivery_schedule_preferences JSONB,
> payment_terms JSONB,
>
> rating DECIMAL(3,2),
>
> is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW(),
> updated_at TIMESTAMPTZ DEFAULT NOW()
>
> );

**5.** **Purchase** **Orders**

> sql
>
> CREATE TABLE purchase_orders (
>
> id UUID PRIMARY KEY DEFAULT gen_random_uuid(), po_number TEXT UNIQUE
> NOT NULL,
>
> supplier_id UUID REFERENCES suppliers(id), created_by UUID REFERENCES
> profiles(id),
>
> status TEXT CHECK (status IN ('draft', 'sent', 'confirmed',
> 'received', 'cancelled')), order_date DATE NOT NULL,
>
> expected_delivery_date DATE, actual_delivery_date DATE, total_amount
> DECIMAL(12,2), notes TEXT,
>
> created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT
> NOW()
>
> );
>
> CREATE TABLE purchase_order_items (
>
> id UUID PRIMARY KEY DEFAULT gen_random_uuid(), po_id UUID REFERENCES
> purchase_orders(id), product_id UUID REFERENCES products(id),
> quantity_ordered INTEGER NOT NULL, quantity_received INTEGER DEFAULT
> 0,
>
> unit_price DECIMAL(10,2), line_total DECIMAL(12,2),
>
> created_at TIMESTAMPTZ DEFAULT NOW() );

**6.** **Sales** **&** **Transactions**

> sql
>
> CREATE TABLE transactions (
>
> id UUID PRIMARY KEY DEFAULT gen_random_uuid(), transaction_number TEXT
> UNIQUE NOT NULL, cashier_id UUID REFERENCES profiles(id), customer_id
> UUID REFERENCES customers(id),
>
> transaction_type TEXT CHECK (transaction_type IN ('sale', 'return',
> 'void')), total_amount DECIMAL(12,2),
>
> tax_amount DECIMAL(10,2), discount_amount DECIMAL(10,2),
> payment_method TEXT, payment_status TEXT,
>
> transaction_date TIMESTAMPTZ DEFAULT NOW(), created_at TIMESTAMPTZ
> DEFAULT NOW()
>
> );
>
> CREATE TABLE transaction_items (
>
> id UUID PRIMARY KEY DEFAULT gen_random_uuid(), transaction_id UUID
> REFERENCES transactions(id), product_id UUID REFERENCES products(id),
> quantity INTEGER NOT NULL,
>
> unit_price DECIMAL(10,2), line_total DECIMAL(12,2),
>
> discount_applied DECIMAL(10,2) DEFAULT 0, created_at TIMESTAMPTZ
> DEFAULT NOW()
>
> );

**7.** **Stock** **Movements**

> sql
>
> CREATE TABLE stock_movements (
>
> id UUID PRIMARY KEY DEFAULT gen_random_uuid(), product_id UUID
> REFERENCES products(id), location_id UUID REFERENCES locations(id),
>
> movement_type TEXT CHECK (movement_type IN ('receipt', 'sale',
> 'adjustment', 'transfer', 'return', 'waste')), quantity_change INTEGER
> NOT NULL,
>
> reference_id UUID, *--* *Can* *reference* *PO,* *transaction,* *etc.*
> reference_type TEXT,
>
> unit_cost DECIMAL(10,2), reason TEXT,
>
> performed_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ
> DEFAULT NOW()
>
> );

**8.** **Locations** **&** **Storage**

> sql
>
> CREATE TABLE locations (
>
> id UUID PRIMARY KEY DEFAULT gen_random_uuid(), location_code TEXT
> UNIQUE NOT NULL, location_name TEXT NOT NULL,
>
> location_type TEXT CHECK (location_type IN ('warehouse', 'aisle',
> 'shelf', 'bin', 'cooler', 'freezer')), parent_location_id UUID
> REFERENCES locations(id),
>
> capacity INTEGER,
>
> temperature_controlled BOOLEAN DEFAULT false, temperature_range JSONB,
>
> is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW()
>
> );

**9.** **Notifications** **&** **Messages**

> sql
>
> CREATE TABLE notifications (
>
> id UUID PRIMARY KEY DEFAULT gen_random_uuid(), recipient_id UUID
> REFERENCES profiles(id),
>
> title TEXT NOT NULL, message TEXT NOT NULL,
>
> notification_type TEXT NOT NULL,
>
> priority TEXT CHECK (priority IN ('low', 'medium', 'high',
> 'critical')), is_read BOOLEAN DEFAULT false,
>
> action_required BOOLEAN DEFAULT false, action_url TEXT,
>
> created_at TIMESTAMPTZ DEFAULT NOW() );
>
> CREATE TABLE messages (
>
> id UUID PRIMARY KEY DEFAULT gen_random_uuid(), sender_id UUID
> REFERENCES profiles(id), recipient_id UUID REFERENCES profiles(id),
>
> subject TEXT,
>
> content TEXT NOT NULL, attachment_urls TEXT\[\],
>
> is_read BOOLEAN DEFAULT false, parent_message_id UUID REFERENCES
> messages(id), created_at TIMESTAMPTZ DEFAULT NOW()
>
> );

**Row** **Level** **Security** **(RLS)** **Policies**

**Profile** **Access**

> sql
>
> *--* *Enable* *RLS*
>
> ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
>
> *--* *Users* *can* *view* *their* *own* *profile*
>
> CREATE POLICY "Users can view own profile" ON profiles FOR SELECT
> USING (auth.uid() = id);
>
> *--* *Users* *can* *update* *their* *own* *profile*
>
> CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE
> USING (auth.uid() = id);
>
> *--* *Admins* *can* *view* *all* *profiles*
>
> CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT
> USING (
>
> EXISTS (
>
> SELECT 1 FROM profiles
>
> WHERE id = auth.uid() AND role = 'administrator' )
>
> );

**Inventory** **Access**

> sql
>
> ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
>
> *--* *Inventory* *clerks* *and* *managers* *can* *view* *inventory*
> CREATE POLICY "Staff can view inventory" ON inventory
>
> FOR SELECT USING ( EXISTS (
>
> SELECT 1 FROM profiles WHERE id = auth.uid()
>
> AND role IN ('inventory_clerk', 'manager', 'administrator') )
>
> );

**User** **Interface** **Requirements**

**1.** **Common** **Pages** **(All** **Users)**

**Splash** **Screen**

> **Purpose**: Initial loading screen with branding
>
> **Components**:
>
> System logo and company branding
>
> Loading animation with progress indicator
>
> Application version number display
>
> Network status indicator (online/offline)
>
> **Supabase** **Integration**: Check connection status, load initial
> auth state

**Welcome/Onboarding**

> **Purpose**: Introduction and role selection
>
> **Components**:
>
> Interactive system introduction with supermarket illustrations
>
> Feature overview carousel
>
> Role selection dropdown (Administrator/Manager/Inventory
> Clerk/Cashier/Supplier)
>
> CTA buttons ("Get Started", "Login")
>
> Offline mode indicator
>
> **Supabase** **Integration**: Role-based routing after authentication

**Authentication** **System**

> **Login** **Screen**:
>
> Email/username input with validation
>
> Password input with show/hide toggle
>
> "Remember me" checkbox
>
> Login button with loading state
>
> Forgot password link
>
> **Supabase** **Integration**: supabase.auth.signInWithPassword()
>
> **Multi-Factor** **Authentication** (Admin only): Security code input
> fields
>
> Verification status indicator
>
> Resend code option
>
> **Supabase** **Integration**: Custom MFA implementation
>
> **Password** **Reset**:
>
> Email input for reset link
>
> Security questions (if configured)
>
> New password creation with strength indicator
>
> **Supabase** **Integration**: supabase.auth.resetPasswordForEmail()

**Role-Specific** **Registration** **Forms**

**Administrator** **Registration**:

> Full name, email, password fields
>
> Contact information section
>
> Security question setup
>
> Company information input
>
> System configuration preferences
>
> **Supabase** **Integration**: Create user with admin role in profiles
> table

**Manager** **Registration**:

> Full name, employee ID
>
> Department selection dropdown
>
> Contact information
>
> Access level selection
>
> Manager authorization code verification
>
> **Supabase** **Integration**: Validate authorization code, create
> manager profile

**Inventory** **Clerk** **Registration**:

> Full name, employee ID
>
> Assigned storage areas (multi-select)
>
> Shift information (schedule picker)
>
> Access level configuration
>
> **Supabase** **Integration**: Link to locations table for assigned
> areas

**Cashier** **Registration**:

> Full name, employee ID
>
> POS terminal assignment
>
> Shift information
>
> Access level selection
>
> **Supabase** **Integration**: Create cashier profile with terminal
> assignment

**Supplier** **Registration**:

> Company name and contact person
>
> Business registration number
>
> Product categories supplied (multi-select)
>
> Delivery schedule preferences
>
> Contact information and address
>
> **Supabase** **Integration**: Create supplier record with verification
> pending

**2.** **Administrator-Specific** **Pages**

**Admin** **Dashboard**

> **Purpose**: System overview and quick actions
>
> **Components**:
>
> System health indicators (server status, database performance)
>
> User activity summary charts
>
> Key inventory metrics cards
>
> Pending approval notifications
>
> System alerts panel
>
> Quick access buttons to admin functions
>
> **Supabase** **Integration**: Real-time dashboard with subscriptions
> to system metrics

**System** **Configuration**

> **General** **Settings** **Panel**:
>
> Company information management form
>
> Store location setup with map integration
>
> Tax configuration matrix
>
> Currency and pricing rules engine
>
> Fiscal period settings calendar
>
> Workflow and approval configuration
>
> Backup and restore options
>
> **Supabase** **Integration**: Update company_settings table, trigger
> system-wide updates

**User** **Management**

> **User** **Listing**:
>
> Searchable table with filters (role, status, department)
>
> User detail view with edit capabilities
>
> Role assignment interface
>
> Permission configuration matrix
>
> Account status toggle (active/inactive)
>
> Activity logs viewer
>
> Bulk operations (export, deactivate, role change)
>
> **Supabase** **Integration**: CRUD operations on profiles table with
> RLS enforcement

**Data** **Management**

> **Database** **Tools**:
>
> Data archiving interface with date ranges
>
> Import/export tools for CSV/Excel files
>
> Master data management forms
>
> Data validation tools with error reporting
>
> Storage usage visualization
>
> **Supabase** **Integration**: Use Supabase API for bulk operations,
> storage management

**3.** **Manager-Specific** **Pages**

**Manager** **Dashboard**

> **Purpose**: Business overview and decision support
>
> **Components**:
>
> Inventory summary cards with trend indicators
>
> Sales performance charts
>
> Low stock alerts table
>
> Order status summary
>
> Staff performance metrics
>
> Critical notifications panel
>
> Quick action buttons
>
> **Supabase** **Integration**: Real-time data subscriptions, analytics
> queries

**Reports** **&** **Analytics**

> **Report** **Catalog**:
>
> Pre-built report templates library
>
> Custom report builder with drag-drop interface
>
> Scheduled reports management
>
> Analytics dashboard with KPI visualization
>
> Export options (PDF, Excel, CSV)
>
> **Supabase** **Integration**: Complex queries, data aggregation,
> real-time charts

**Supplier** **Management**

> **Supplier** **Directory**:
>
> Searchable supplier database
>
> Performance dashboard with metrics
>
> Contract management system
>
> Price negotiation tracking
>
> Communication history
>
> Issue resolution workflow
>
> Rating and evaluation system
>
> **Supabase** **Integration**: Supplier CRUD operations, performance
> analytics

**4.** **Inventory** **Clerk-Specific** **Pages**

**Inventory** **Operations**

> **Stock** **Management**:
>
> Stock receiving interface with barcode scanning
>
> Stock transfer tool between locations
>
> Stock adjustment form with reason codes
>
> Cycle count interface
>
> Batch/lot tracking system
>
> Expiration date monitoring alerts
>
> Inventory reconciliation tool
>
> **Supabase** **Integration**: Real-time inventory updates, stock
> movement tracking

**Product** **Catalog**

> **Product** **Management**:
>
> Advanced search with multiple filters
>
> Product listing with grid/list views
>
> Detailed product information pages
>
> Category browser with hierarchy
>
> Image gallery management
>
> Barcode lookup functionality
>
> Product history tracking
>
> **Supabase** **Integration**: Product CRUD operations, image storage
> via Supabase Storage

**Location** **Management**

> **Warehouse** **Operations**:
>
> Interactive store layout visualizer
>
> Hierarchical location browser (aisle/shelf/bin)
>
> Location capacity dashboard
>
> Stock distribution by location
>
> Put-away suggestion engine
>
> Space utilization analytics
>
> **Supabase** **Integration**: Location hierarchy queries, capacity
> calculations

**5.** **Cashier-Specific** **Pages**

**POS** **Integration**

> **Transaction** **Processing**:
>
> Real-time transaction interface
>
> Product lookup with autocomplete
>
> Price override with manager authorization
>
> Discount application system
>
> Return processing workflow
>
> Customer lookup integration
>
> Receipt generation and reprint
>
> **Supabase** **Integration**: Transaction recording, inventory
> updates, real-time sync

**Sales** **Tools**

> **Customer** **Service**:
>
> Special offers and promotions browser
>
> Price check utility
>
> Stock availability checker
>
> Alternative product suggestions
>
> Cross-selling recommendations
>
> Customer loyalty program integration
>
> **Supabase** **Integration**: Product queries, promotion management,
> customer data

**6.** **Supplier-Specific** **Pages**

**Order** **Management**

> **Purchase** **Orders**:
>
> Current orders dashboard
>
> Order confirmation interface
>
> Delivery scheduling calendar
>
> Order history browser
>
> Template management
>
> Invoice submission portal
>
> **Supabase** **Integration**: PO management, delivery tracking,
> payment status

**Product** **Catalog** **Management**

> **Supplier** **Products**:
>
> Product listing management
>
> Pricing update forms
>
> New product proposal system
>
> Discontinuation notices
>
> Promotion scheduling
>
> Inventory visibility dashboard
>
> **Supabase** **Integration**: Product catalog sync, price updates,
> availability tracking

**Special** **Features** **Implementation**

**1.** **Offline** **Mode** **Manager**

> **Purpose**: Handle offline operations and sync
>
> **Components**:
>
> Sync status dashboard
>
> Cached data browser
>
> Manual sync controls
>
> Conflict resolution interface
>
> **Supabase** **Integration**: Use local storage/IndexedDB, sync on
> reconnection

**2.** **Real-time** **Features**

> **Implementation**: Supabase Realtime subscriptions
>
> **Use** **Cases**:
>
> Live inventory updates
>
> Real-time notifications
>
> Collaborative editing
>
> Live dashboard metrics

**3.** **File** **Management**

> **Implementation**: Supabase Storage
>
> **Features**:
>
> Product image uploads
>
> Document attachments
>
> Report exports
>
> Backup files

**API** **Integration** **Strategy**

**Supabase** **Client** **Configuration**

> javascript
>
> import { createClient } from '@supabase/supabase-js'
>
> const supabaseUrl = 'YOUR_SUPABASE_URL'
>
> const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
>
> export const supabase = createClient(supabaseUrl, supabaseKey)

**Authentication** **Patterns**

> javascript
>
> *//* *Login*
>
> const { data, error } = await supabase.auth.signInWithPassword({
> email: email,
>
> password: password })
>
> *//* *Get* *user* *profile* *with* *role*
>
> const { data: profile } = await supabase .from('profiles')
>
> .select('\*') .eq('id', user.id) .single()

**Real-time** **Subscriptions**

> javascript
>
> *//* *Subscribe* *to* *inventory* *changes* const subscription =
> supabase
>
> .channel('inventory_changes') .on('postgres_changes',
>
> { event: '\*', schema: 'public', table: 'inventory' }, (payload) =\> {
>
> *//* *Handle* *real-time* *updates* }
>
> ) .subscribe()

**Security** **Implementation**

**Row** **Level** **Security** **Examples**

> sql
>
> *--* *Inventory* *clerks* *can* *only* *see* *assigned* *locations*
>
> CREATE POLICY "Clerks see assigned inventory" ON inventory FOR SELECT
> USING (
>
> location_id IN (
>
> SELECT unnest(assigned_areas::text\[\]) FROM profiles WHERE id =
> auth.uid()
>
> ) );

**API** **Security**

> Use Supabase RLS for data access control
>
> Implement role-based API endpoints
>
> Secure file uploads with storage policies
>
> Enable audit logging for sensitive operations

**Development** **Guidelines**

**Frontend** **Framework** **Recommendations**

> **React/Vue/Angular** with TypeScript
>
> **State** **Management**: Redux/Vuex/NgRx for complex state
>
> **UI** **Framework**: Material-UI, Ant Design, or Tailwind CSS
>
> **Mobile**: React Native or Flutter for mobile app

**Code** **Organization**

> src/
>
> ├── components/
>
> ├── pages/
>
> \# Reusable UI components

\# Page components by role

> │ ├── admin/
>
> │ ├── manager/ │ ├── inventory/ │ ├── cashier/
>
> │ └── supplier/
>
> ├── hooks/ ├── services/ ├── utils/ ├── types/
>
> └── constants/
>
> \# Custom React hooks \# Supabase API services

\# Helper functions

> \# TypeScript type definitions
>
> \# Application constants

**Performance** **Considerations**

> Implement pagination for large datasets
>
> Use Supabase filters to reduce data transfer
>
> Implement caching for frequently accessed data
>
> Optimize images using Supabase image transformations
>
> Use virtual scrolling for large lists

**Testing** **Strategy**

**Unit** **Testing**

> Test utility functions and helpers
>
> Test custom hooks and state management
>
> Test component logic and user interactions

**Integration** **Testing**

> Test Supabase API integrations
>
> Test authentication flows
>
> Test real-time subscriptions
>
> Test offline/online sync

**End-to-End** **Testing**

> Test complete user workflows
>
> Test role-based access scenarios
>
> Test cross-browser compatibility
>
> Test mobile responsiveness

**Deployment** **and** **DevOps**

**Environment** **Setup**

> **Development**: Local Supabase instance or development project
>
> **Staging**: Separate Supabase project for testing
>
> **Production**: Production Supabase project with backups

**CI/CD** **Pipeline**

> 1\. Code quality checks (ESLint, Prettier)
>
> 2\. Unit and integration tests
>
> 3\. Build and bundle optimization
>
> 4\. Database migration scripts
>
> 5\. Deployment to hosting platform (Vercel, Netlify, or custom)

**Monitoring** **and** **Analytics**

> Supabase built-in analytics
>
> Error tracking (Sentry)
>
> Performance monitoring
>
> User behavior analytics

This comprehensive specification provides everything needed to build the
SIMS application with Supabase as the backend. The document includes
database schemas, security policies, detailed UI requirements, and
implementation guidelines for all user roles and features.
