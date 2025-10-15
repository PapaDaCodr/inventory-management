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
  IconButton,
} from '@mui/material'
import {
  Package,
  Truck,
  FileText,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit,
  Eye,
  Plus,
  BarChart3,
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { productsApiCached } from '@/lib/supabase-api-cached'
import { formatCurrency } from '@/lib/currency'
import { startTiming, endTiming } from '@/lib/performance'

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
      id={`supplier-tabpanel-${index}`}
      aria-labelledby={`supplier-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function SupplierDashboard() {
  const { profile } = useAuth()
  const [tabValue, setTabValue] = useState(0)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [productDialog, setProductDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    base_price: '',
    cost_price: '',
    unit_of_measure: '',
    brand: '',
  })

  // Mock data for purchase orders
  const mockPurchaseOrders = [
    {
      id: '1',
      po_number: 'PO-2024-001',
      status: 'pending',
      order_date: '2024-01-15',
      expected_delivery: '2024-01-22',
      total_amount: 2500.00,
      items_count: 15,
    },
    {
      id: '2',
      po_number: 'PO-2024-002',
      status: 'approved',
      order_date: '2024-01-10',
      expected_delivery: '2024-01-18',
      total_amount: 1800.00,
      items_count: 8,
    },
    {
      id: '3',
      po_number: 'PO-2024-003',
      status: 'delivered',
      order_date: '2024-01-05',
      expected_delivery: '2024-01-12',
      total_amount: 3200.00,
      items_count: 22,
    },
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      startTiming('supplier-data-load')
      console.log('Loading supplier data with caching...')

      // Use cached API for better performance
      const productsData = await productsApiCached.getProducts({ is_active: true })
      setProducts(productsData || [])

      endTiming('supplier-data-load')
      console.log('Supplier data loaded successfully')
    } catch (error) {
      console.error('Error loading supplier data:', error)
      endTiming('supplier-data-load')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product)
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      base_price: product.base_price?.toString() || '',
      cost_price: product.cost_price?.toString() || '',
      unit_of_measure: product.unit_of_measure || '',
      brand: product.brand || '',
    })
    setProductDialog(true)
  }

  const handleSaveProduct = async () => {
    try {
      if (selectedProduct) {
        const updates = {
          ...productForm,
          base_price: parseFloat(productForm.base_price) || 0,
          cost_price: parseFloat(productForm.cost_price) || 0,
        }
        await productsApiCached.updateProduct(selectedProduct.id, updates)
        await loadData()
        setProductDialog(false)
        setSelectedProduct(null)
      }
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'warning',
      approved: 'info',
      delivered: 'success',
      cancelled: 'error',
    }
    return colors[status] || 'default'
  }

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <ProtectedRoute requiredRoles={['administrator', 'manager', 'supplier']}>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Supplier Portal
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Welcome back, {profile?.full_name}! Manage your purchase orders and product catalog.
        </Typography>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <FileText className="text-blue-500" size={32} />
                  <Box>
                    <Typography variant="h4">{mockPurchaseOrders.length}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Active Orders
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
                  <Package className="text-green-500" size={32} />
                  <Box>
                    <Typography variant="h4">{products.length}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Products Supplied
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
                  <DollarSign className="text-purple-500" size={32} />
                  <Box>
                    <Typography variant="h4">
                      {formatCurrency(mockPurchaseOrders.reduce((sum, po) => sum + po.total_amount, 0))}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Order Value
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
                  <Truck className="text-orange-500" size={32} />
                  <Box>
                    <Typography variant="h4">
                      {mockPurchaseOrders.filter(po => po.status === 'pending').length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Pending Deliveries
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
              <Tab label="Purchase Orders" />
              <Tab label="Product Catalog" />
              <Tab label="Delivery Schedule" />
              <Tab label="Performance" />
            </Tabs>
          </Box>

          {/* Purchase Orders Tab */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              Purchase Orders Management
            </Typography>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>PO Number</TableCell>
                    <TableCell>Order Date</TableCell>
                    <TableCell>Expected Delivery</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Total Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockPurchaseOrders.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {po.po_number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(po.order_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(po.expected_delivery).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{po.items_count} items</TableCell>
                      <TableCell>{formatCurrency(po.total_amount)}</TableCell>
                      <TableCell>
                        <Chip
                          label={formatStatus(po.status)}
                          color={getStatusColor(po.status) as any}
                          size="small"
                          icon={
                            po.status === 'delivered' ? <CheckCircle size={16} /> :
                            po.status === 'pending' ? <Clock size={16} /> :
                            <AlertTriangle size={16} />
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <Eye size={16} />
                        </IconButton>
                        {po.status === 'pending' && (
                          <IconButton size="small">
                            <Edit size={16} />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Product Catalog Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
              <Typography variant="h6">Product Catalog</Typography>
              <Button
                variant="contained"
                startIcon={<Plus />}
                onClick={() => {
                  setSelectedProduct(null)
                  setProductForm({
                    name: '',
                    description: '',
                    base_price: '',
                    cost_price: '',
                    unit_of_measure: '',
                    brand: '',
                  })
                  setProductDialog(true)
                }}
              >
                Add Product
              </Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Brand</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Cost Price</TableCell>
                    <TableCell>Retail Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.slice(0, 10).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {product.description}
                        </Typography>
                      </TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{product.brand || '-'}</TableCell>
                      <TableCell>{product.unit_of_measure || 'each'}</TableCell>
                      <TableCell>{formatCurrency(product.cost_price || 0)}</TableCell>
                      <TableCell>{formatCurrency(product.base_price || 0)}</TableCell>
                      <TableCell>
                        <Chip
                          label={product.is_active ? 'Active' : 'Inactive'}
                          color={product.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleEditProduct(product)}>
                          <Edit size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Delivery Schedule Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Delivery Schedule
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Calendar className="inline mr-2" size={20} />
                      Upcoming Deliveries
                    </Typography>
                    {mockPurchaseOrders
                      .filter(po => po.status !== 'delivered')
                      .map((po) => (
                        <Box key={po.id} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {po.po_number}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Expected: {new Date(po.expected_delivery).toLocaleDateString()}
                          </Typography>
                          <Box mt={1}>
                            <Chip
                              label={formatStatus(po.status)}
                              color={getStatusColor(po.status) as any}
                              size="small"
                            />
                          </Box>
                        </Box>
                      ))}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Truck className="inline mr-2" size={20} />
                      Delivery Instructions
                    </Typography>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Standard delivery hours: 8:00 AM - 5:00 PM, Monday to Friday
                    </Alert>
                    <Typography variant="body2" paragraph>
                      <strong>Delivery Address:</strong><br />
                      SuperMart Distribution Center<br />
                      123 Warehouse District<br />
                      Business City, BC 12345
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Contact:</strong><br />
                      Receiving Department<br />
                      Phone: (555) 123-4567<br />
                      Email: receiving@supermart.com
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Performance Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Supplier Performance Metrics
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <BarChart3 className="inline mr-2" size={20} />
                      Delivery Performance
                    </Typography>
                    <Typography variant="h3" color="success.main">
                      95%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      On-time delivery rate
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Quality Rating
                    </Typography>
                    <Typography variant="h3" color="primary.main">
                      4.8/5
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Average quality score
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Order Accuracy
                    </Typography>
                    <Typography variant="h3" color="info.main">
                      98%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Correct orders delivered
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Feedback
                </Typography>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>January 2024:</strong> Excellent delivery performance and product quality. 
                    All orders delivered on time with no quality issues reported.
                  </Typography>
                </Alert>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Improvement Suggestion:</strong> Consider implementing real-time delivery 
                    tracking to further enhance customer experience.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </TabPanel>
        </Card>

        {/* Product Edit Dialog */}
        <Dialog open={productDialog} onClose={() => setProductDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedProduct ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Product Name"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Brand"
                value={productForm.brand}
                onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Unit of Measure"
                value={productForm.unit_of_measure}
                onChange={(e) => setProductForm({ ...productForm, unit_of_measure: e.target.value })}
                sx={{ mb: 2 }}
                placeholder="e.g., each, kg, liter"
              />
              <TextField
                fullWidth
                label="Cost Price"
                type="number"
                value={productForm.cost_price}
                onChange={(e) => setProductForm({ ...productForm, cost_price: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Retail Price"
                type="number"
                value={productForm.base_price}
                onChange={(e) => setProductForm({ ...productForm, base_price: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProductDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveProduct} variant="contained">
              {selectedProduct ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ProtectedRoute>
  )
}
