'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'
import { 
  Snackbar, 
  Alert, 
  Badge, 
  IconButton, 
  Menu, 
  MenuItem, 
  Typography, 
  Box, 
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material'
import { 
  Bell, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X,
  MailOpen
} from 'lucide-react'

interface Notification {
  id: string
  user_id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  is_read: boolean
  created_at: string
  data?: any
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  showNotification: (type: 'info' | 'warning' | 'error' | 'success', title: string, message: string) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  clearNotification: (notificationId: string) => void
  clearAllNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Helper function to get notification icon
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'warning': return <AlertTriangle size={20} className="text-orange-500" />
    case 'error': return <AlertTriangle size={20} className="text-red-500" />
    case 'success': return <CheckCircle size={20} className="text-green-500" />
    default: return <Info size={20} className="text-blue-500" />
  }
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { profile } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [currentSnackbar, setCurrentSnackbar] = useState<{
    type: 'info' | 'warning' | 'error' | 'success'
    title: string
    message: string
  } | null>(null)

  useEffect(() => {
    if (profile?.id) {
      loadNotifications()
      subscribeToNotifications()
    }
  }, [profile?.id])

  const loadNotifications = async () => {
    if (!profile?.id) return

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const subscribeToNotifications = () => {
    if (!profile?.id) return

    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications(prev => [newNotification, ...prev])
          
          // Show snackbar for new notification
          setCurrentSnackbar({
            type: newNotification.type,
            title: newNotification.title,
            message: newNotification.message
          })
          setSnackbarOpen(true)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const showNotification = async (
    type: 'info' | 'warning' | 'error' | 'success',
    title: string,
    message: string
  ) => {
    if (!profile?.id) return

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: profile.id,
          type,
          title,
          message,
          is_read: false
        })
        .select()
        .single()

      if (error) throw error

      // Add to local state immediately
      setNotifications(prev => [data, ...prev])
      
      // Show snackbar
      setCurrentSnackbar({ type, title, message })
      setSnackbarOpen(true)
    } catch (error) {
      console.error('Error creating notification:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!profile?.id) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', profile.id)
        .eq('is_read', false)

      if (error) throw error

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const clearNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      )
    } catch (error) {
      console.error('Error clearing notification:', error)
    }
  }

  const clearAllNotifications = async () => {
    if (!profile?.id) return

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', profile.id)

      if (error) throw error

      setNotifications([])
    } catch (error) {
      console.error('Error clearing all notifications:', error)
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length



  const getSeverity = (type: string): 'info' | 'warning' | 'error' | 'success' => {
    return type as 'info' | 'warning' | 'error' | 'success'
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        showNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAllNotifications,
      }}
    >
      {children}
      
      {/* Snackbar for new notifications */}
      <Snackbar
        open={snackbarOpen && currentSnackbar !== null}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={getSeverity(currentSnackbar?.type || 'info')}
          variant="filled"
        >
          <Typography variant="subtitle2" fontWeight="bold">
            {currentSnackbar?.title || ''}
          </Typography>
          <Typography variant="body2">
            {currentSnackbar?.message || ''}
          </Typography>
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  )
}

// Notification Bell Component
export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
  }

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="large"
        aria-label={`${unreadCount} unread notifications`}
        color="inherit"
      >
        <Badge badgeContent={unreadCount} color="error">
          <Bell />
        </Badge>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: { width: 400, maxHeight: 500 }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box display="flex" justifyContent="between" alignItems="center">
            <Typography variant="h6">Notifications</Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={markAllAsRead} startIcon={<MailOpen size={16} />}>
                Mark All Read
              </Button>
            )}
          </Box>
        </Box>
        
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
            {notifications.slice(0, 10).map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    cursor: 'pointer',
                    bgcolor: notification.is_read ? 'transparent' : 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="between" alignItems="center">
                        <Typography variant="subtitle2" fontWeight={notification.is_read ? 'normal' : 'bold'}>
                          {notification.title}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            clearNotification(notification.id)
                          }}
                        >
                          <X size={16} />
                        </IconButton>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(notification.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Menu>
    </>
  )
}
