# CRUD Functionality Testing Guide
## Step-by-Step Testing Instructions for All Fixed Features

---

## 🚀 **Getting Started**

### **Prerequisites**
1. Ensure your development server is running: `npm run dev`
2. Make sure Supabase is connected and tables exist
3. Have test data ready (sample products, users, etc.)
4. Open browser developer tools (F12) to monitor console logs

### **Test User Accounts**
You'll need accounts with different roles to test properly:
- **Administrator**: Can test user management
- **Cashier**: Can test transaction processing
- **Supplier**: Can test product creation
- **Inventory Clerk**: Can test inventory adjustments

---

## 1️⃣ **Testing User Management (Administrator Role)**

### **Test User Creation**
1. **Login as Administrator**
   - Go to `/auth/login`
   - Use admin credentials

2. **Navigate to Admin Dashboard**
   - Go to `/admin`
   - Click on "User Management" tab

3. **Create New User**
   - Click "Add User" button
   - Fill in the form:
     ```
     Full Name: Test User
     Email: testuser@example.com
     Role: cashier (or any role)
     Employee ID: EMP001
     Phone: +233123456789
     Department: Sales
     ```
   - Click "Create" button

4. **Expected Results**
   - ✅ Success alert with temporary password
   - ✅ User appears in the users table
   - ✅ Console shows successful API call
   - ✅ Cache is refreshed automatically

5. **Verify in Database**
   - Check Supabase dashboard
   - New user should appear in `profiles` table
   - Auth user should be created in Authentication section

### **Test User Updates**
1. **Edit Existing User**
   - Click edit icon (pencil) next to any user
   - Modify some fields (name, role, department)
   - Click "Update" button

2. **Expected Results**
   - ✅ Changes saved successfully
   - ✅ Updated data appears in table
   - ✅ No error messages in console

---

## 2️⃣ **Testing Transaction Processing (Cashier Role)**

### **Test Complete Sales Transaction**
1. **Login as Cashier**
   - Use cashier credentials
   - Go to `/cashier`

2. **Add Products to Cart**
   - Use barcode scanner field or browse products
   - Add multiple products with different quantities
   - Verify cart updates correctly

3. **Process Cash Payment**
   - Click "Process Payment"
   - Select "Cash" as payment method
   - Enter amount received (more than total)
   - Click "Complete Sale"

4. **Expected Results**
   - ✅ Transaction processed successfully
   - ✅ Receipt information displayed in alert
   - ✅ Cart cleared automatically
   - ✅ Inventory levels updated
   - ✅ Console shows transaction creation logs

5. **Verify in Database**
   - Check `transactions` table for new record
   - Check `transaction_items` table for line items
   - Check `inventory` table for updated quantities
   - Check `stock_movements` table for audit trail

### **Test Card/Mobile Payment**
1. **Repeat transaction process**
2. **Select "Credit/Debit Card" or "Mobile Payment"**
3. **Complete transaction**
4. **Verify payment method recorded correctly**

### **Test Customer Management**
1. **Create New Customer**
   - Click "Customer" button in cart
   - Fill customer form:
     ```
     Name: John Doe
     Phone: +233987654321
     Email: john@example.com
     ```
   - Click "Save Customer"

2. **Expected Results**
   - ✅ Customer created successfully
   - ✅ Customer linked to transaction
   - ✅ Customer appears in future selections

3. **Test Walk-in Customer**
   - Click "Walk-in Customer" button
   - Verify generic customer is set

---

## 3️⃣ **Testing Product Management (Supplier Role)**

### **Test Product Creation**
1. **Login as Supplier**
   - Use supplier credentials
   - Go to `/supplier`

2. **Navigate to Product Catalog**
   - Click "Product Catalog" tab
   - Click "Add Product" button

3. **Create New Product**
   - Fill the form:
     ```
     Product Name: Test Product
     Description: This is a test product
     SKU: (leave empty for auto-generation)
     Brand: Test Brand
     Unit of Measure: each
     Cost Price: 10.00
     Retail Price: 15.00
     ```
   - Click "Create" button

4. **Expected Results**
   - ✅ Product created successfully
   - ✅ SKU auto-generated if empty
   - ✅ Product appears in products table
   - ✅ Supplier linked correctly

5. **Test Product Updates**
   - Click edit icon next to created product
   - Modify price or description
   - Save changes
   - Verify updates persist

### **Verify in Database**
- Check `products` table for new record
- Verify `supplier_id` matches current user
- Confirm all fields saved correctly

---

## 4️⃣ **Testing Inventory Management (Inventory Clerk Role)**

### **Test Stock Adjustments**
1. **Login as Inventory Clerk**
   - Go to `/inventory-clerk`

2. **Make Stock Adjustment**
   - Find product with current stock
   - Click edit icon (pencil)
   - Enter quantity change (positive or negative)
   - Select reason (e.g., "Stock Received")
   - Add notes
   - Save adjustment

3. **Expected Results**
   - ✅ Stock levels updated
   - ✅ Changes reflected immediately
   - ✅ Audit trail created

---

## 5️⃣ **Integration Testing**

### **End-to-End Workflow Test**
1. **Admin creates new cashier user**
2. **Supplier creates new product**
3. **Inventory clerk adjusts stock levels**
4. **Cashier processes sale of new product**
5. **Verify all data flows correctly**

### **Test Data Persistence**
1. **Perform operations**
2. **Refresh browser**
3. **Verify data still exists**
4. **Check database directly**

---

## 🔍 **Debugging and Troubleshooting**

### **Common Issues and Solutions**

#### **"User creation failed"**
- Check console for specific error
- Verify admin permissions
- Ensure email is unique
- Check Supabase RLS policies

#### **"Transaction processing failed"**
- Verify cashier role permissions
- Check product inventory levels
- Ensure all required fields filled
- Check network connectivity

#### **"Product creation failed"**
- Verify supplier role
- Check for duplicate SKU
- Ensure required fields completed
- Check database constraints

### **Monitoring Tools**

#### **Browser Developer Tools**
- **Console Tab**: Check for JavaScript errors
- **Network Tab**: Monitor API calls
- **Application Tab**: Check local storage/cache

#### **Supabase Dashboard**
- **Table Editor**: View data directly
- **Authentication**: Check user creation
- **Logs**: Monitor database operations

---

## ✅ **Testing Checklist**

### **User Management**
- [ ] Create new user (all roles)
- [ ] Update existing user
- [ ] Verify temporary password generation
- [ ] Check role-based access
- [ ] Verify cache invalidation

### **Transaction Processing**
- [ ] Cash payment with change
- [ ] Card payment
- [ ] Mobile payment
- [ ] Customer creation
- [ ] Walk-in customer
- [ ] Inventory updates
- [ ] Stock movement tracking

### **Product Management**
- [ ] Create product with auto SKU
- [ ] Create product with custom SKU
- [ ] Update existing product
- [ ] Verify supplier linking
- [ ] Check form validation

### **Data Integrity**
- [ ] Database records created
- [ ] Foreign keys linked correctly
- [ ] Audit trails generated
- [ ] Cache updates properly
- [ ] Error handling works

---

## 📊 **Performance Testing**

### **Load Testing**
1. **Create multiple transactions rapidly**
2. **Monitor response times**
3. **Check for memory leaks**
4. **Verify cache performance**

### **Concurrent User Testing**
1. **Multiple users performing operations**
2. **Check for race conditions**
3. **Verify data consistency**

---

## 🐛 **Error Scenarios to Test**

### **Network Issues**
- Disconnect internet during operation
- Verify error handling
- Check retry mechanisms

### **Invalid Data**
- Submit empty required fields
- Enter invalid email formats
- Use duplicate SKUs
- Verify validation messages

### **Permission Issues**
- Try operations with wrong role
- Verify access denied messages
- Check redirect behavior

---

## 📝 **Test Results Documentation**

### **Create Test Log**
For each test, document:
- **Test Name**: What you're testing
- **Steps Taken**: Exact actions performed
- **Expected Result**: What should happen
- **Actual Result**: What actually happened
- **Status**: Pass/Fail
- **Notes**: Any observations

### **Example Test Log Entry**
```
Test: Create New User
Steps: Login as admin → Add User → Fill form → Submit
Expected: User created with temp password
Actual: User created successfully, password: Temp8x9k2m!
Status: ✅ PASS
Notes: Cache refreshed automatically
```

This comprehensive testing approach will help you verify that all CRUD functionality is working correctly and identify any remaining issues!
