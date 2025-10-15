'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  Users,
  Settings,
  BarChart3,
  Database,
  Edit,
  Delete,
  Plus,
  Download,
  Upload,
  Shield,
  Activity,
  RefreshCw,
  Clock,
} from 'lucide-react'
import { AdminRoute } from '@/components/ProtectedRoute'
import { useAuth, UserRole } from '@/contexts/AuthContext'
import { usersApi, dashboardApi, productsApi, inventoryApi } from '@/lib/supabase-api'
import {
  dashboardApiCached,
  usersApiCached,
  productsApiCached,
  inventoryApiCached,
  cacheManager
} from '@/lib/supabase-api-cached'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function AdminDashboard() {
  const { profile } = useAuth()
  const [tabValue, setTabValue] = useState(0)
  const [users, setUsers] = useState<any[]>([])
  const [metrics, setMetrics] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [userDialog, setUserDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [userForm, setUserForm] = useState({
    full_name: '',
    email: '',
    role: 'inventory_clerk' as UserRole,
    employee_id: '',
    contact_phone: '',
    department: '',
    is_active: true,
  })
  const [cacheStats, setCacheStats] = useState<any>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async (forceRefresh = false) => {
    try {
      setLoading(true)
      console.log('Loading admin data...', forceRefresh ? '(force refresh)' : '(cache-first)')

      const [usersData, metricsData] = await Promise.all([
        usersApiCached.getUsers(forceRefresh),
        dashboardApiCached.getDashboardMetrics(forceRefresh),
      ])

      setUsers(usersData || [])
      setMetrics(metricsData || {})
      setLastUpdated(new Date())

      // Update cache stats
      const stats = cacheManager.getCacheStats()
      setCacheStats(stats)

      console.log('Admin data loaded successfully')
    } catch (error) {
      console.error('Error loading admin data:', error)
      // Try to show cache stats for debugging
      const cacheStats = cacheManager.getCacheStats()
      console.log('Cache stats:', cacheStats)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setUserForm({
      full_name: user.full_name || '',
      email: user.email || '',
      role: user.role || 'inventory_clerk',
      employee_id: user.employee_id || '',
      contact_phone: user.contact_phone || '',
      department: user.department || '',
      is_active: user.is_active ?? true,
    })
    setUserDialog(true)
  }

  const handleSaveUser = async () => {
    try {
      if (selectedUser) {
        await usersApiCached.updateUser(selectedUser.id, userForm)
        await loadData(true) // Force refresh after update
        setUserDialog(false)
        setSelectedUser(null)
      }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  // Data Management Handlers
  const handleExportUsers = async () => {
    try {
      console.log('Exporting users...')
      const users = await usersApiCached.getUsers() // Use cached data for export
      const csvContent = convertToCSV(users, ['full_name', 'email', 'role', 'department', 'employee_id', 'is_active'])
      downloadCSV(csvContent, 'users.csv')
    } catch (error) {
      console.error('Error exporting users:', error)
    }
  }

  const handleExportProducts = async () => {
    try {
      console.log('Exporting products...')
      const products = await productsApiCached.getProducts() // Use cached data for export
      const csvContent = convertToCSV(products, ['name', 'sku', 'barcode', 'category', 'supplier', 'unit_price', 'is_active'])
      downloadCSV(csvContent, 'products.csv')
    } catch (error) {
      console.error('Error exporting products:', error)
    }
  }

  const handleExportInventory = async () => {
    try {
      console.log('Exporting inventory...')
      const inventory = await inventoryApiCached.getInventory() // Use cached data for export
      const csvContent = convertToCSV(inventory, ['product', 'location', 'quantity_available', 'unit_cost', 'last_updated'])
      downloadCSV(csvContent, 'inventory.csv')
    } catch (error) {
      console.error('Error exporting inventory:', error)
    }
  }

  // System Settings Handlers
  const handlePasswordPolicy = () => {
    alert('Password Policy configuration coming soon!')
  }

  const handleAPIKeys = () => {
    alert('API Keys management coming soon!')
  }

  const handleAuditLogs = () => {
    alert('Audit Logs viewer coming soon!')
  }

  const handleCompanyInfo = () => {
    alert('Company Information settings coming soon!')
  }

  const handleNotificationSettings = () => {
    alert('Notification Settings coming soon!')
  }

  const handleBackupConfig = () => {
    alert('Backup Configuration coming soon!')
  }

  // Helper functions for CSV export
  const convertToCSV = (data: any[], fields: string[]) => {
    const headers = fields.join(',')
    const rows = data.map(item =>
      fields.map(field => {
        const value = getNestedValue(item, field)
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      }).join(',')
    )
    return [headers, ...rows].join('\n')
  }

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj) || ''
  }

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      administrator: 'error',
      manager: 'warning',
      inventory_clerk: 'info',
      cashier: 'success',
      supplier: 'secondary',
    }
    return colors[role] || 'default'
  }

  const formatRole = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <AdminRoute>
      <Box sx={{ width: '100%' }}>
        <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Administrator Dashboard
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Welcome back, {profile?.full_name}! Manage your SIMS system from this central control panel.
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            {lastUpdated && (
              <Box display="flex" alignItems="center" gap={1}>
                <Clock size={16} />
                <Typography variant="caption" color="textSecondary">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </Typography>
              </Box>
            )}
            {cacheStats && (
              <Typography variant="caption" color="textSecondary">
                Cache: {cacheStats.validItems}/{cacheStats.totalItems} items
              </Typography>
            )}
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshCw size={16} />}
              onClick={() => loadData(true)}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Users className="text-blue-500" size={32} />
                  <Box>
                    <Typography variant="h4">{users.length}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Users
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Database className="text-green-500" size={32} />
                  <Box>
                    <Typography variant="h4">{metrics.totalProducts || 0}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Products
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Activity className="text-orange-500" size={32} />
                  <Box>
                    <Typography variant="h4">{metrics.lowStockItems || 0}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Low Stock Alerts
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <BarChart3 className="text-purple-500" size={32} />
                  <Box>
                    <Typography variant="h4">
                      GHS{(metrics.totalInventoryValue || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Inventory Value
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="User Management" />
              <Tab label="System Settings" />
              <Tab label="Analytics" />
              <Tab label="Data Management" />
            </Tabs>
          </Box>

          {/* User Management Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
              <Typography variant="h6">User Management</Typography>
              <Button
                variant="contained"
                startIcon={<Plus />}
                onClick={() => {
                  setSelectedUser(null)
                  setUserForm({
                    full_name: '',
                    email: '',
                    role: 'inventory_clerk',
                    employee_id: '',
                    contact_phone: '',
                    department: '',
                    is_active: true,
                  })
                  setUserDialog(true)
                }}
              >
                Add User
              </Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={formatRole(user.role)}
                          color={getRoleColor(user.role) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.is_active ? 'Active' : 'Inactive'}
                          color={user.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditUser(user)} size="small">
                          <Edit size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* System Settings Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              System Configuration
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Shield className="inline mr-2" size={20} />
                      Security Settings
                    </Typography>
                    <Button variant="outlined" fullWidth sx={{ mb: 1 }} onClick={handlePasswordPolicy}>
                      Configure Password Policy
                    </Button>
                    <Button variant="outlined" fullWidth sx={{ mb: 1 }} onClick={handleAPIKeys}>
                      Manage API Keys
                    </Button>
                    <Button variant="outlined" fullWidth onClick={handleAuditLogs}>
                      Audit Logs
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Settings className="inline mr-2" size={20} />
                      System Preferences
                    </Typography>
                    <Button variant="outlined" fullWidth sx={{ mb: 1 }} onClick={handleCompanyInfo}>
                      Company Information
                    </Button>
                    <Button variant="outlined" fullWidth sx={{ mb: 1 }} onClick={handleNotificationSettings}>
                      Notification Settings
                    </Button>
                    <Button variant="outlined" fullWidth onClick={handleBackupConfig}>
                      Backup Configuration
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Analytics Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              System Analytics
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Advanced analytics dashboard coming soon. This will include user activity, system performance, and business intelligence reports.
            </Alert>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">User Activity</Typography>
                    <Typography variant="h4" color="primary">
                      {users.filter(u => u.is_active).length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Active Users
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">System Health</Typography>
                    <Typography variant="h4" color="success.main">
                      98%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Uptime
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Data Growth</Typography>
                    <Typography variant="h4" color="warning.main">
                      +12%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      This Month
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Data Management Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Data Management
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Download className="inline mr-2" size={20} />
                      Export Data
                    </Typography>
                    <Button variant="outlined" fullWidth sx={{ mb: 1 }} onClick={handleExportUsers}>
                      Export Users
                    </Button>
                    <Button variant="outlined" fullWidth sx={{ mb: 1 }} onClick={handleExportProducts}>
                      Export Products
                    </Button>
                    <Button variant="outlined" fullWidth onClick={handleExportInventory}>
                      Export Inventory
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Upload className="inline mr-2" size={20} />
                      Import Data
                    </Typography>
                    <Button variant="outlined" fullWidth sx={{ mb: 1 }} onClick={() => alert('Import Products functionality coming soon!')}>
                      Import Products
                    </Button>
                    <Button variant="outlined" fullWidth sx={{ mb: 1 }} onClick={() => alert('Import Inventory functionality coming soon!')}>
                      Import Inventory
                    </Button>
                    <Button variant="outlined" fullWidth onClick={() => alert('Bulk User Import functionality coming soon!')}>
                      Bulk User Import
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Card>

        {/* User Edit Dialog */}
        <Dialog open={userDialog} onClose={() => setUserDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={userForm.full_name}
                onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                >
                  <MenuItem value="administrator">Administrator</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="inventory_clerk">Inventory Clerk</MenuItem>
                  <MenuItem value="cashier">Cashier</MenuItem>
                  <MenuItem value="supplier">Supplier</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Employee ID"
                value={userForm.employee_id}
                onChange={(e) => setUserForm({ ...userForm, employee_id: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Department"
                value={userForm.department}
                onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Contact Phone"
                value={userForm.contact_phone}
                onChange={(e) => setUserForm({ ...userForm, contact_phone: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUserDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveUser} variant="contained">
              {selectedUser ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminRoute>
  )
}
