import { supabase } from '@/lib/supabase'

export interface NotificationData {
  user_id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  data?: any
}

export class NotificationService {
  // Create a notification for a specific user
  static async createNotification(notification: NotificationData) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: notification.user_id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          is_read: false,
          data: notification.data
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  // Create notifications for multiple users (e.g., all admins/managers)
  static async createBulkNotifications(notifications: NotificationData[]) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(
          notifications.map(notification => ({
            user_id: notification.user_id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            is_read: false,
            data: notification.data
          }))
        )
        .select()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating bulk notifications:', error)
      throw error
    }
  }

  // Get users by role for targeted notifications
  static async getUsersByRole(roles: string[]) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('role', roles)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching users by role:', error)
      return []
    }
  }

  // Inventory-specific notification methods
  static async notifyLowStock(productId: string, productName: string, currentStock: number, reorderLevel: number) {
    try {
      // Get admins, managers, and inventory clerks
      const users = await this.getUsersByRole(['administrator', 'manager', 'inventory_clerk'])
      
      const notifications: NotificationData[] = users.map(user => ({
        user_id: user.id,
        type: 'warning' as const,
        title: 'Low Stock Alert',
        message: `${productName} is running low (${currentStock} remaining, reorder at ${reorderLevel})`,
        data: {
          product_id: productId,
          product_name: productName,
          current_stock: currentStock,
          reorder_level: reorderLevel,
          notification_type: 'low_stock'
        }
      }))

      return await this.createBulkNotifications(notifications)
    } catch (error) {
      console.error('Error creating low stock notifications:', error)
    }
  }

  static async notifyOutOfStock(productId: string, productName: string) {
    try {
      const users = await this.getUsersByRole(['administrator', 'manager', 'inventory_clerk'])
      
      const notifications: NotificationData[] = users.map(user => ({
        user_id: user.id,
        type: 'error' as const,
        title: 'Out of Stock Alert',
        message: `${productName} is now out of stock!`,
        data: {
          product_id: productId,
          product_name: productName,
          notification_type: 'out_of_stock'
        }
      }))

      return await this.createBulkNotifications(notifications)
    } catch (error) {
      console.error('Error creating out of stock notifications:', error)
    }
  }

  static async notifyStockMovement(productId: string, productName: string, movementType: string, quantity: number, userId: string) {
    try {
      // Notify managers and admins about significant stock movements
      const users = await this.getUsersByRole(['administrator', 'manager'])
      
      const notifications: NotificationData[] = users.map(user => ({
        user_id: user.id,
        type: 'info' as const,
        title: 'Stock Movement',
        message: `${productName}: ${movementType} of ${quantity} units`,
        data: {
          product_id: productId,
          product_name: productName,
          movement_type: movementType,
          quantity: quantity,
          moved_by: userId,
          notification_type: 'stock_movement'
        }
      }))

      return await this.createBulkNotifications(notifications)
    } catch (error) {
      console.error('Error creating stock movement notifications:', error)
    }
  }

  static async notifyPurchaseOrderStatus(poId: string, poNumber: string, status: string, supplierId?: string) {
    try {
      let users = await this.getUsersByRole(['administrator', 'manager'])
      
      // If there's a supplier, also notify them
      if (supplierId) {
        const supplier = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .eq('id', supplierId)
          .single()
        
        if (supplier.data) {
          users.push(supplier.data)
        }
      }

      const notifications: NotificationData[] = users.map(user => ({
        user_id: user.id,
        type: status === 'delivered' ? 'success' : 'info' as const,
        title: 'Purchase Order Update',
        message: `Purchase Order ${poNumber} status changed to ${status}`,
        data: {
          po_id: poId,
          po_number: poNumber,
          status: status,
          notification_type: 'purchase_order'
        }
      }))

      return await this.createBulkNotifications(notifications)
    } catch (error) {
      console.error('Error creating purchase order notifications:', error)
    }
  }

  static async notifyNewUser(newUserId: string, newUserName: string, role: string) {
    try {
      const admins = await this.getUsersByRole(['administrator'])
      
      const notifications: NotificationData[] = admins.map(admin => ({
        user_id: admin.id,
        type: 'info' as const,
        title: 'New User Registration',
        message: `${newUserName} has registered as ${role}`,
        data: {
          new_user_id: newUserId,
          new_user_name: newUserName,
          new_user_role: role,
          notification_type: 'new_user'
        }
      }))

      return await this.createBulkNotifications(notifications)
    } catch (error) {
      console.error('Error creating new user notifications:', error)
    }
  }

  static async notifySystemAlert(title: string, message: string, severity: 'info' | 'warning' | 'error' = 'info') {
    try {
      const admins = await this.getUsersByRole(['administrator'])
      
      const notifications: NotificationData[] = admins.map(admin => ({
        user_id: admin.id,
        type: severity,
        title: title,
        message: message,
        data: {
          notification_type: 'system_alert'
        }
      }))

      return await this.createBulkNotifications(notifications)
    } catch (error) {
      console.error('Error creating system alert notifications:', error)
    }
  }

  // Transaction-related notifications
  static async notifyLargeTransaction(transactionId: string, amount: number, cashierId: string) {
    try {
      const managers = await this.getUsersByRole(['administrator', 'manager'])
      
      const notifications: NotificationData[] = managers.map(manager => ({
        user_id: manager.id,
        type: 'info' as const,
        title: 'Large Transaction Alert',
        message: `Large transaction of $${amount.toLocaleString()} processed`,
        data: {
          transaction_id: transactionId,
          amount: amount,
          cashier_id: cashierId,
          notification_type: 'large_transaction'
        }
      }))

      return await this.createBulkNotifications(notifications)
    } catch (error) {
      console.error('Error creating large transaction notifications:', error)
    }
  }

  // Supplier-related notifications
  static async notifySupplierDelivery(supplierId: string, poNumber: string, expectedDate: string) {
    try {
      // Notify the supplier and relevant staff
      const users = await this.getUsersByRole(['administrator', 'manager', 'inventory_clerk'])
      const supplier = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', supplierId)
        .single()
      
      if (supplier.data) {
        users.push(supplier.data)
      }

      const notifications: NotificationData[] = users.map(user => ({
        user_id: user.id,
        type: 'info' as const,
        title: 'Delivery Scheduled',
        message: `Delivery for PO ${poNumber} scheduled for ${expectedDate}`,
        data: {
          po_number: poNumber,
          supplier_id: supplierId,
          expected_date: expectedDate,
          notification_type: 'delivery_scheduled'
        }
      }))

      return await this.createBulkNotifications(notifications)
    } catch (error) {
      console.error('Error creating delivery notifications:', error)
    }
  }
}
