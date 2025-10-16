-- Notification Triggers for SIMS
-- These triggers automatically create notifications for important events

-- Function to create notifications for users with specific roles
CREATE OR REPLACE FUNCTION create_role_notification(
  p_roles text[],
  p_type text,
  p_title text,
  p_message text,
  p_data jsonb DEFAULT NULL
) RETURNS void AS $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT id FROM profiles WHERE role = ANY(p_roles)
  LOOP
    INSERT INTO notifications (user_id, type, title, message, data, is_read)
    VALUES (user_record.id, p_type, p_title, p_message, p_data, false);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check inventory levels and create low stock notifications
CREATE OR REPLACE FUNCTION check_inventory_levels()
RETURNS trigger AS $$
DECLARE
  product_record RECORD;
  current_stock integer;
  reorder_level integer;
BEGIN
  -- Get product details
  SELECT p.name, p.reorder_level, p.id
  INTO product_record
  FROM products p
  WHERE p.id = NEW.product_id;

  current_stock := NEW.quantity_available;
  reorder_level := COALESCE(product_record.reorder_level, 10);

  -- Check for out of stock
  IF current_stock = 0 THEN
    PERFORM create_role_notification(
      ARRAY['administrator', 'manager', 'inventory_clerk'],
      'error',
      'Out of Stock Alert',
      format('%s is now out of stock!', product_record.name),
      jsonb_build_object(
        'product_id', product_record.id,
        'product_name', product_record.name,
        'notification_type', 'out_of_stock'
      )
    );
  -- Check for low stock
  ELSIF current_stock <= reorder_level AND current_stock > 0 THEN
    PERFORM create_role_notification(
      ARRAY['administrator', 'manager', 'inventory_clerk'],
      'warning',
      'Low Stock Alert',
      format('%s is running low (%s remaining, reorder at %s)', 
             product_record.name, current_stock, reorder_level),
      jsonb_build_object(
        'product_id', product_record.id,
        'product_name', product_record.name,
        'current_stock', current_stock,
        'reorder_level', reorder_level,
        'notification_type', 'low_stock'
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for inventory level changes
DROP TRIGGER IF EXISTS inventory_level_check ON inventory;
CREATE TRIGGER inventory_level_check
  AFTER INSERT OR UPDATE OF quantity_available
  ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION check_inventory_levels();

-- Function to notify about stock movements
CREATE OR REPLACE FUNCTION notify_stock_movement()
RETURNS trigger AS $$
DECLARE
  product_name text;
  movement_type_display text;
BEGIN
  -- Get product name
  SELECT p.name INTO product_name
  FROM products p
  WHERE p.id = NEW.product_id;

  -- Format movement type for display
  movement_type_display := CASE NEW.movement_type
    WHEN 'in' THEN 'Stock In'
    WHEN 'out' THEN 'Stock Out'
    WHEN 'adjustment' THEN 'Stock Adjustment'
    WHEN 'transfer' THEN 'Stock Transfer'
    ELSE initcap(NEW.movement_type)
  END;

  -- Create notification for significant movements (>= 10 units or adjustments)
  IF ABS(NEW.quantity_change) >= 10 OR NEW.movement_type = 'adjustment' THEN
    PERFORM create_role_notification(
      ARRAY['administrator', 'manager'],
      'info',
      'Stock Movement',
      format('%s: %s of %s units', product_name, movement_type_display, ABS(NEW.quantity_change)),
      jsonb_build_object(
        'product_id', NEW.product_id,
        'product_name', product_name,
        'movement_type', NEW.movement_type,
        'quantity_change', NEW.quantity_change,
        'reason', NEW.reason,
        'notification_type', 'stock_movement'
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for stock movements
DROP TRIGGER IF EXISTS stock_movement_notification ON stock_movements;
CREATE TRIGGER stock_movement_notification
  AFTER INSERT
  ON stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION notify_stock_movement();

-- Function to notify about purchase order status changes
CREATE OR REPLACE FUNCTION notify_po_status_change()
RETURNS trigger AS $$
DECLARE
  supplier_name text;
  supplier_user_id uuid;
BEGIN
  -- Only notify on status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get supplier information
    SELECT s.name, s.contact_person_id
    INTO supplier_name, supplier_user_id
    FROM suppliers s
    WHERE s.id = NEW.supplier_id;

    -- Notify managers and admins
    PERFORM create_role_notification(
      ARRAY['administrator', 'manager'],
      CASE NEW.status
        WHEN 'delivered' THEN 'success'
        WHEN 'cancelled' THEN 'error'
        ELSE 'info'
      END,
      'Purchase Order Update',
      format('Purchase Order %s status changed to %s', NEW.po_number, NEW.status),
      jsonb_build_object(
        'po_id', NEW.id,
        'po_number', NEW.po_number,
        'status', NEW.status,
        'supplier_name', supplier_name,
        'notification_type', 'purchase_order'
      )
    );

    -- Also notify the supplier if they have a user account
    IF supplier_user_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, type, title, message, data, is_read)
      VALUES (
        supplier_user_id,
        CASE NEW.status
          WHEN 'delivered' THEN 'success'
          WHEN 'cancelled' THEN 'error'
          ELSE 'info'
        END,
        'Purchase Order Update',
        format('Your Purchase Order %s status changed to %s', NEW.po_number, NEW.status),
        jsonb_build_object(
          'po_id', NEW.id,
          'po_number', NEW.po_number,
          'status', NEW.status,
          'notification_type', 'purchase_order'
        ),
        false
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for purchase order status changes
DROP TRIGGER IF EXISTS po_status_change_notification ON purchase_orders;
CREATE TRIGGER po_status_change_notification
  AFTER UPDATE OF status
  ON purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_po_status_change();

-- Function to notify about new user registrations
CREATE OR REPLACE FUNCTION notify_new_user()
RETURNS trigger AS $$
BEGIN
  -- Notify administrators about new user registrations
  PERFORM create_role_notification(
    ARRAY['administrator'],
    'info',
    'New User Registration',
    format('%s has registered as %s', NEW.full_name, NEW.role),
    jsonb_build_object(
      'new_user_id', NEW.id,
      'new_user_name', NEW.full_name,
      'new_user_role', NEW.role,
      'notification_type', 'new_user'
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registrations
DROP TRIGGER IF EXISTS new_user_notification ON profiles;
CREATE TRIGGER new_user_notification
  AFTER INSERT
  ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_user();

-- Function to notify about large transactions
CREATE OR REPLACE FUNCTION notify_large_transaction()
RETURNS trigger AS $$
DECLARE
  cashier_name text;
  transaction_total numeric;
BEGIN
  -- Calculate transaction total
  SELECT COALESCE(SUM(ti.quantity * ti.unit_price), 0)
  INTO transaction_total
  FROM transaction_items ti
  WHERE ti.transaction_id = NEW.id;

  -- Notify for transactions over $500
  IF transaction_total >= 500 THEN
    -- Get cashier name
    SELECT p.full_name INTO cashier_name
    FROM profiles p
    WHERE p.id = NEW.cashier_id;

    PERFORM create_role_notification(
      ARRAY['administrator', 'manager'],
      'info',
      'Large Transaction Alert',
      format('Large transaction of $%s processed by %s', 
             to_char(transaction_total, 'FM999,999.00'), 
             COALESCE(cashier_name, 'Unknown')),
      jsonb_build_object(
        'transaction_id', NEW.id,
        'amount', transaction_total,
        'cashier_id', NEW.cashier_id,
        'cashier_name', cashier_name,
        'notification_type', 'large_transaction'
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for large transactions (fires after transaction items are inserted)
DROP TRIGGER IF EXISTS large_transaction_notification ON transactions;
CREATE TRIGGER large_transaction_notification
  AFTER UPDATE OF status
  ON transactions
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION notify_large_transaction();

-- Function to create system maintenance notifications
CREATE OR REPLACE FUNCTION create_system_notification(
  p_title text,
  p_message text,
  p_type text DEFAULT 'info',
  p_roles text[] DEFAULT ARRAY['administrator']
) RETURNS void AS $$
BEGIN
  PERFORM create_role_notification(p_roles, p_type, p_title, p_message, 
    jsonb_build_object('notification_type', 'system_alert'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_role_notification TO authenticated;
GRANT EXECUTE ON FUNCTION create_system_notification TO authenticated;

-- Example usage for system notifications:
-- SELECT create_system_notification('System Maintenance', 'Scheduled maintenance tonight at 2 AM', 'warning', ARRAY['administrator', 'manager']);

-- Create indexes for better notification performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Enable RLS on notifications table (should already be enabled from schema)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
