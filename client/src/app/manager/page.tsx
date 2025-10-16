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
  LinearProgress,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Package,
  Truck,
  AlertTriangle,
  DollarSign,
  Users,
  ShoppingCart,
  BarChart3,
  FileText,
  Calendar,
  Target,
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { dashboardApi, suppliersApi, inventoryApi } from '@/lib/supabase-api'
import { formatCurrency } from '@/lib/currency'

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
      id={`manager-tabpanel-${index}`}
      aria-labelledby={`manager-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function ManagerDashboard() {
  const { profile } = useAuth()
  const [tabValue, setTabValue] = useState(0)
  const [metrics, setMetrics] = useState<any>({})
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [lowStockItems, setLowStockItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [metricsData, suppliersData, lowStockData] = await Promise.all([
        dashboardApi.getDashboardMetrics(),
        suppliersApi.getSuppliers(),
        inventoryApi.getInventory({ low_stock: true }),
      ])
      setMetrics(metricsData || {})
      setSuppliers(suppliersData || [])
      setLowStockItems(lowStockData || [])
    } catch (error) {
      console.error('Error loading manager data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <ProtectedRoute requiredRoles={['administrator', 'manager']}>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manager Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Welcome back, {profile?.full_name}! Monitor operations and make strategic decisions.
        </Typography>

        {/* Key Performance Indicators */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <DollarSign className="text-green-500" size={32} />
                  <Box>
                    <Typography variant="h4">
                      {formatCurrency(metrics.totalInventoryValue || 0)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Inventory Value
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingUp size={16} className="text-green-500" />
                      <Typography variant="caption" color="success.main">
                        +8.2%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Package className="text-blue-500" size={32} />
                  <Box>
                    <Typography variant="h4">{metrics.totalProducts || 0}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Active Products
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingUp size={16} className="text-green-500" />
                      <Typography variant="caption" color="success.main">
                        +12 this week
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <AlertTriangle className="text-orange-500" size={32} />
                  <Box>
                    <Typography variant="h4">{metrics.lowStockItems || 0}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Low Stock Alerts
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingDown size={16} className="text-orange-500" />
                      <Typography variant="caption" color="warning.main">
                        Needs attention
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Truck className="text-purple-500" size={32} />
                  <Box>
                    <Typography variant="h4">{suppliers.length}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Active Suppliers
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Target size={16} className="text-purple-500" />
                      <Typography variant="caption" color="primary.main">
                        98% reliability
                      </Typography>
                    </Box>
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
              <Tab label="Analytics" />
              <Tab label="Suppliers" />
              <Tab label="Inventory Alerts" />
              <Tab label="Reports" />
            </Tabs>
          </Box>

          {/* Analytics Tab */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              Business Analytics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <BarChart3 className="inline mr-2" size={20} />
                      Sales Performance
                    </Typography>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Interactive charts will be implemented with a charting library like Chart.js or Recharts.
                    </Alert>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Monthly Revenue Target: {formatCurrency(50000)}
                      </Typography>
                      <LinearProgress variant="determinate" value={75} sx={{ mb: 1 }} />
                      <Typography variant="caption" color="textSecondary">
                        {formatCurrency(37500)} achieved (75%)
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Inventory Turnover Rate
                      </Typography>
                      <LinearProgress variant="determinate" value={85} color="success" sx={{ mb: 1 }} />
                      <Typography variant="caption" color="textSecondary">
                        8.5x annually (Target: 10x)
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Quick Stats
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Today's Sales
                      </Typography>
                      <Typography variant="h5" color="success.main">
                        {formatCurrency(2847)}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Orders Processed
                      </Typography>
                      <Typography variant="h5" color="primary.main">
                        47
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Customer Satisfaction
                      </Typography>
                      <Typography variant="h5" color="warning.main">
                        4.8/5
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Suppliers Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
              <Typography variant="h6">Supplier Management</Typography>
              <Button variant="contained" startIcon={<Truck />}>
                Add Supplier
              </Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Supplier Name</TableCell>
                    <TableCell>Contact Person</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {supplier.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{supplier.contact_person || '-'}</TableCell>
                      <TableCell>{supplier.email || '-'}</TableCell>
                      <TableCell>{supplier.phone || '-'}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">
                            {supplier.rating || 'N/A'}
                          </Typography>
                          {supplier.rating && (
                            <Typography variant="caption" color="textSecondary">
                              /5
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={supplier.is_active ? 'Active' : 'Inactive'}
                          color={supplier.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Inventory Alerts Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Inventory Alerts & Actions Required
            </Typography>
            
            {lowStockItems.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Current Stock</TableCell>
                      <TableCell>Reorder Level</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lowStockItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {item.product?.name || 'Unknown Product'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            SKU: {item.product?.sku}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="error.main">
                            {item.quantity_available}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.product?.reorder_level}</TableCell>
                        <TableCell>{item.location?.name || 'Main'}</TableCell>
                        <TableCell>
                          <Chip
                            label="Low Stock"
                            color="warning"
                            size="small"
                            icon={<AlertTriangle size={16} />}
                          />
                        </TableCell>
                        <TableCell>
                          <Button size="small" variant="outlined">
                            Reorder
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="success">
                <Typography variant="body2">
                  Great! No low stock alerts at this time. All inventory levels are healthy.
                </Typography>
              </Alert>
            )}
          </TabPanel>

          {/* Reports Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Reports & Analytics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <FileText className="inline mr-2" size={20} />
                      Operational Reports
                    </Typography>
                    <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
                      Daily Sales Report
                    </Button>
                    <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
                      Inventory Movement Report
                    </Button>
                    <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
                      Supplier Performance Report
                    </Button>
                    <Button variant="outlined" fullWidth>
                      Staff Performance Report
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Calendar className="inline mr-2" size={20} />
                      Scheduled Reports
                    </Typography>
                    <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
                      Weekly Summary
                    </Button>
                    <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
                      Monthly P&L Statement
                    </Button>
                    <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
                      Quarterly Business Review
                    </Button>
                    <Button variant="outlined" fullWidth>
                      Annual Inventory Audit
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Card>
      </Box>
    </ProtectedRoute>
  )
}
