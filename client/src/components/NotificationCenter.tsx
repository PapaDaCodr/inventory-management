'use client'

import React, { useState } from 'react'
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Chip,
  Alert,
  Button,
} from '@mui/material'
import {
  Bell,
  Package,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
} from 'lucide-react'
import { useRealtime } from '@/contexts/RealtimeContext'

interface NotificationCenterProps {
  className?: string
}

export default function NotificationCenter({ className }: NotificationCenterProps) {
  const { notifications, isConnected } = useRealtime()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set())

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const dismissNotification = (notificationId: string) => {
    setDismissedNotifications(prev => new Set([...prev, notificationId]))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'inventory_change':
        return <Package size={16} className="text-blue-500" />
      case 'stock_movement':
        return <TrendingUp size={16} className="text-green-500" />
      case 'low_stock':
        return <AlertTriangle size={16} className="text-orange-500" />
      case 'out_of_stock':
        return <AlertTriangle size={16} className="text-red-500" />
      case 'system':
        return <CheckCircle size={16} className="text-purple-500" />
      default:
        return <Bell size={16} className="text-gray-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'inventory_change':
        return 'info'
      case 'stock_movement':
        return 'success'
      case 'low_stock':
        return 'warning'
      case 'out_of_stock':
        return 'error'
      case 'system':
        return 'info'
      default:
        return 'default'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  const visibleNotifications = notifications.filter(
    notification => !dismissedNotifications.has(notification.id)
  )

  const unreadCount = visibleNotifications.length

  return (
    <div className={className}>
      <IconButton onClick={handleClick} size="large">
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <Bell size={24} className={isConnected ? 'text-gray-600' : 'text-gray-400'} />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box display="flex" justifyContent="between" alignItems="center">
            <Typography variant="h6">Notifications</Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                size="small"
                label={isConnected ? 'Live' : 'Offline'}
                color={isConnected ? 'success' : 'default'}
                variant="outlined"
              />
              {unreadCount > 0 && (
                <Button
                  size="small"
                  onClick={() => setDismissedNotifications(new Set(notifications.map(n => n.id)))}
                >
                  Clear All
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {!isConnected && (
          <Alert severity="warning" sx={{ m: 1 }}>
            Real-time notifications are currently offline
          </Alert>
        )}

        {visibleNotifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Bell size={48} className="text-gray-300 mx-auto mb-2" />
            <Typography variant="body2" color="textSecondary">
              No new notifications
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 350, overflow: 'auto' }}>
            {visibleNotifications.map((notification, index) => (
              <MenuItem
                key={notification.id}
                sx={{
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  py: 1.5,
                  borderBottom: index < visibleNotifications.length - 1 ? '1px solid #f0f0f0' : 'none',
                }}
              >
                <Box display="flex" justifyContent="between" alignItems="flex-start" width="100%">
                  <Box display="flex" gap={1.5} flex={1}>
                    {getNotificationIcon(notification.type)}
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight="medium">
                        {notification.title}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                        {notification.message}
                      </Typography>
                      <Box display="flex" justifyContent="between" alignItems="center" mt={1}>
                        <Chip
                          size="small"
                          label={notification.type.replace('_', ' ')}
                          color={getNotificationColor(notification.type) as any}
                          variant="outlined"
                        />
                        <Typography variant="caption" color="textSecondary">
                          {formatTimestamp(notification.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      dismissNotification(notification.id)
                    }}
                  >
                    <X size={16} />
                  </IconButton>
                </Box>
              </MenuItem>
            ))}
          </Box>
        )}

        <Divider />
        <Box sx={{ p: 1 }}>
          <Button fullWidth size="small" onClick={handleClose}>
            View All Notifications
          </Button>
        </Box>
      </Menu>
    </div>
  )
}
