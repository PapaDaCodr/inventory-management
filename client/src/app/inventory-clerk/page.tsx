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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material'
import {
  Package,
  MapPin,
  Scan,
  Edit,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { inventoryApi } from '@/lib/supabase-api'

import { useRealtime } from '@/contexts/RealtimeContext'
import { useRealtimeInventory } from '@/hooks/useRealtimeInventory'

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
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function InventoryClerkDashboard() {
  const { profile } = useAuth()
  const { isConnected } = useRealtime()
  const { inventory, loading, stats, reorderItems, lastUpdated, refresh } = useRealtimeInventory()
  const [tabValue, setTabValue] = useState(0)

  const [adjustmentDialog, setAdjustmentDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [adjustmentForm, setAdjustmentForm] = useState({
    quantity_change: 0,
    reason: '',
    notes: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [barcodeInput, setBarcodeInput] = useState('')





  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleStockAdjustment = (item: any) => {
    setSelectedItem(item)
    setAdjustmentForm({
      quantity_change: 0,
      reason: '',
      notes: '',
    })
    setAdjustmentDialog(true)
  }

  const handleSaveAdjustment = async () => {
    try {
      if (selectedItem && adjustmentForm.quantity_change !== 0) {
        const newQuantity = selectedItem.quantity_available + adjustmentForm.quantity_change
        await inventoryApi.updateInventory(selectedItem.id, {
          quantity_available: Math.max(0, newQuantity),
          quantity_on_hand: Math.max(0, newQuantity),
        })
        await refresh()
        setAdjustmentDialog(false)
        setSelectedItem(null)
      }
    } catch (error) {
      console.error('Error updating inventory:', error)
    }
  }

  const getStockStatus = (item: any) => {
    const { quantity_available, product } = item
    const reorderLevel = product?.reorder_level || 0

    if (quantity_available === 0) {
      return { status: 'Out of Stock', color: 'error', icon: <AlertTriangle size={16} /> }
    } else if (quantity_available <= reorderLevel) {
      return { status: 'Low Stock', color: 'warning', icon: <AlertTriangle size={16} /> }
    } else {
      return { status: 'In Stock', color: 'success', icon: <CheckCircle size={16} /> }
    }
  }

  const filteredInventory = inventory.filter(item =>
    item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product?.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const lowStockItems = inventory.filter(item =>
    item.product?.reorder_level &&
    item.quantity_available <= item.product.reorder_level
  )

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={['administrator', 'manager', 'inventory_clerk']}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </ProtectedRoute>
    )
  }



  return (
    <ProtectedRoute requiredRoles={['administrator', 'manager', 'inventory_clerk']}>
      <Box sx={{ width: '100%' }}>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Inventory Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {profile?.full_name}! Manage stock levels and track inventory movements.
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Chip
              size="small"
              label={isConnected ? 'Live Updates' : 'Offline'}
              color={isConnected ? 'success' : 'default'}
              variant="outlined"
              icon={isConnected ? <CheckCircle size={16} /> : <Clock size={16} />}
            />
            {lastUpdated && (
              <Typography variant="caption" color="text.secondary">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
            )}
            <Button
              variant="outlined"
              size="small"
              onClick={refresh}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : undefined}
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
                  <Package className="text-blue-500" size={32} />
                  <Box>
                    <Typography variant="h4">{stats.totalItems}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Items
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
                  <AlertTriangle className="text-orange-500" size={32} />
                  <Box>
                    <Typography variant="h4">{stats.lowStockItems}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Low Stock Items
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
                  <CheckCircle className="text-green-500" size={32} />
                  <Box>
                    <Typography variant="h4">{stats.inStockItems}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      In Stock Items
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
                  <MapPin className="text-purple-500" size={32} />
                  <Box>
                    <Typography variant="h4">{new Set(inventory.map(i => i.location?.name || 'Main')).size}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Storage Locations
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Barcode Scanner Simulation */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <Scan className="inline mr-2" size={20} />
              Quick Product Lookup
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                label="Scan or Enter Barcode/SKU"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                sx={{ flexGrow: 1 }}
                placeholder="Enter product barcode or SKU"
              />
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={() => setSearchTerm(barcodeInput)}
              >
                Search
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Current Inventory" />
              <Tab label="Low Stock Alerts" />
              <Tab label="Stock Movements" />
              <Tab label="Location Management" />
            </Tabs>
          </Box>

          {/* Current Inventory Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Current Inventory</Typography>
              <TextField
                size="small"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} className="mr-2 text-gray-400" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Available</TableCell>
                    <TableCell>Reserved</TableCell>
                    <TableCell>Reorder Level</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredInventory.map((item) => {
                    const stockStatus = getStockStatus(item)
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {item.product?.name || 'Unknown Product'}
                          </Typography>
                          {item.batch_number && (
                            <Typography variant="caption" color="text.secondary">
                              Batch: {item.batch_number}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{item.product?.sku}</TableCell>
                        <TableCell>{item.location?.name || 'Main'}</TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color={item.quantity_available === 0 ? 'error' : 'inherit'}
                          >
                            {item.quantity_available}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.quantity_reserved || 0}</TableCell>
                        <TableCell>{item.product?.reorder_level || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={stockStatus.status}
                            color={stockStatus.color as any}
                            size="small"
                            icon={stockStatus.icon}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleStockAdjustment(item)}
                          >
                            <Edit size={16} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Low Stock Alerts Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Low Stock Alerts
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
                      <TableCell>Last Updated</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lowStockItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {item.product?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            SKU: {item.product?.sku}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="error">
                            {item.quantity_available}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.product?.reorder_level}</TableCell>
                        <TableCell>{item.location?.name || 'Main'}</TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {new Intl.DateTimeFormat('en-GH', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Africa/Accra' }).format(new Date(item.updated_at))}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleStockAdjustment(item)}
                          >
                            Adjust Stock
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
                  Great! No low stock alerts at this time.
                </Typography>
              </Alert>
            )}
          </TabPanel>

          {/* Stock Movements Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Recent Stock Movements
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Stock movement tracking will be implemented when the stock_movements table is populated with data.
            </Alert>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  This section will show:
                </Typography>
                <ul>
                  <li>Recent stock adjustments</li>
                  <li>Incoming deliveries</li>
                  <li>Outgoing sales</li>
                  <li>Transfer between locations</li>
                  <li>Audit trail with timestamps</li>
                </ul>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Location Management Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Storage Location Overview
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <MapPin className="inline mr-2" size={20} />
                      Main Warehouse
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Primary storage location for most inventory
                    </Typography>
                    <Typography variant="h4" color="primary.main">
                      {inventory.filter(item => item.location?.name === 'Main Warehouse').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Items stored
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <MapPin className="inline mr-2" size={20} />
                      Cold Storage
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Temperature-controlled storage for perishables
                    </Typography>
                    <Typography variant="h4" color="info.main">
                      {inventory.filter(item => item.location?.name === 'Cold Storage').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Items stored
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Card>

        {/* Stock Adjustment Dialog */}
        <Dialog open={adjustmentDialog} onClose={() => setAdjustmentDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Stock Adjustment - {selectedItem?.product?.name}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Stock: {selectedItem?.quantity_available || 0}
              </Typography>
              <TextField
                fullWidth
                label="Quantity Change"
                type="number"
                value={adjustmentForm.quantity_change}
                onChange={(e) => setAdjustmentForm({
                  ...adjustmentForm,
                  quantity_change: parseInt(e.target.value) || 0
                })}
                sx={{ mb: 2 }}
                helperText="Use positive numbers to add stock, negative to remove"
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Reason</InputLabel>
                <Select
                  value={adjustmentForm.reason}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                >
                  <MenuItem value="received">Stock Received</MenuItem>
                  <MenuItem value="damaged">Damaged Goods</MenuItem>
                  <MenuItem value="expired">Expired Items</MenuItem>
                  <MenuItem value="theft">Theft/Loss</MenuItem>
                  <MenuItem value="count_adjustment">Count Adjustment</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={adjustmentForm.notes}
                onChange={(e) => setAdjustmentForm({ ...adjustmentForm, notes: e.target.value })}
                placeholder="Additional notes about this adjustment..."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAdjustmentDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSaveAdjustment}
              variant="contained"
              disabled={adjustmentForm.quantity_change === 0}
            >
              Save Adjustment
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </ProtectedRoute>
  )
}

