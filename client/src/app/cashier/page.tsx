'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  IconButton,
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
  Chip,
} from '@mui/material'
import {
  ShoppingCart,
  Scan,
  CreditCard,
  Receipt,
  User,
  Plus,
  Minus,
  Delete,
  Search,
  Calculator,
  Clock,
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { productsApi } from '@/lib/supabase-api'
import { formatCurrency } from '@/lib/currency'

interface CartItem {
  id: string
  product: any
  quantity: number
  price: number
  total: number
}

export default function CashierDashboard() {
  const { profile } = useAuth()
  const [products, setProducts] = useState<any[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [barcodeInput, setBarcodeInput] = useState('')
  const [customerDialog, setCustomerDialog] = useState(false)
  const [paymentDialog, setPaymentDialog] = useState(false)
  const [customer, setCustomer] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [amountReceived, setAmountReceived] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const productsData = await productsApi.getProducts({ is_active: true })
      setProducts(productsData || [])
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id)
    if (existingItem) {
      updateCartQuantity(product.id, existingItem.quantity + 1)
    } else {
      const newItem: CartItem = {
        id: product.id,
        product,
        quantity: 1,
        price: product.base_price || 0,
        total: product.base_price || 0,
      }
      setCart([...cart, newItem])
    }
    setBarcodeInput('')
  }

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart(cart.map(item => 
      item.id === productId 
        ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
        : item
    ))
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const clearCart = () => {
    setCart([])
    setCustomer(null)
  }

  const handleBarcodeSearch = () => {
    const product = products.find(p => 
      p.barcode === barcodeInput || 
      p.sku === barcodeInput ||
      p.name.toLowerCase().includes(barcodeInput.toLowerCase())
    )
    if (product) {
      addToCart(product)
    } else {
      alert('Product not found')
    }
  }

  const handlePayment = () => {
    // Simulate payment processing
    alert('Payment processed successfully!')
    clearCart()
    setPaymentDialog(false)
    setAmountReceived('')
  }

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0)
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax
  const change = parseFloat(amountReceived) - total

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 20) // Limit to 20 products for performance

  const todaysSales = 2847 // Mock data
  const transactionsToday = 47 // Mock data

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <ProtectedRoute requiredRoles={['administrator', 'manager', 'cashier']}>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Point of Sale
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Welcome back, {profile?.full_name}! Process sales and manage transactions.
        </Typography>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box>
                    <Typography variant="h4">{formatCurrency(todaysSales)}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Today's Sales
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
                  <Receipt className="text-blue-500" size={32} />
                  <Box>
                    <Typography variant="h4">{transactionsToday}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Transactions Today
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
                  <Calculator className="text-purple-500" size={32} />
                  <Box>
                    <Typography variant="h4">{formatCurrency(todaysSales / transactionsToday)}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Average Sale
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
                  <Clock className="text-orange-500" size={32} />
                  <Box>
                    <Typography variant="h4">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Current Time
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Left Side - Product Selection */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Product Selection
                </Typography>
                
                {/* Barcode Scanner */}
                <Box display="flex" gap={2} mb={3}>
                  <TextField
                    fullWidth
                    label="Scan Barcode or Search Product"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSearch()}
                    InputProps={{
                      startAdornment: <Scan size={20} className="mr-2 text-gray-400" />,
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleBarcodeSearch}
                    startIcon={<Search />}
                  >
                    Add
                  </Button>
                </Box>

                {/* Product Search */}
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ mb: 2 }}
                />

                {/* Product Grid */}
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  <Grid container spacing={1}>
                    {filteredProducts.map((product) => (
                      <Grid item xs={6} sm={4} md={3} key={product.id}>
                        <Card 
                          sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                          onClick={() => addToCart(product)}
                        >
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Typography variant="body2" fontWeight="medium" noWrap>
                              {product.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" noWrap>
                              {product.sku}
                            </Typography>
                            <Typography variant="body2" color="primary.main">
                              {formatCurrency(product.base_price || 0)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Side - Shopping Cart */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    <ShoppingCart className="inline mr-2" size={20} />
                    Shopping Cart
                  </Typography>
                  {customer && (
                    <Chip
                      label={customer.name}
                      color="primary"
                      size="small"
                      icon={<User size={16} />}
                    />
                  )}
                </Box>

                {cart.length === 0 ? (
                  <Alert severity="info">
                    Cart is empty. Scan or select products to add them.
                  </Alert>
                ) : (
                  <>
                    <Box sx={{ maxHeight: 300, overflow: 'auto', mb: 2 }}>
                      {cart.map((item) => (
                        <Box key={item.id} sx={{ mb: 2, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                          <Box display="flex" justifyContent="between" alignItems="center">
                            <Typography variant="body2" fontWeight="medium">
                              {item.product.name}
                            </Typography>
                            <IconButton size="small" onClick={() => removeFromCart(item.id)}>
                              <Delete size={16} />
                            </IconButton>
                          </Box>
                          <Typography variant="caption" color="textSecondary">
                            {formatCurrency(item.price)} each
                          </Typography>
                          <Box display="flex" justifyContent="between" alignItems="center" mt={1}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <IconButton 
                                size="small" 
                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus size={16} />
                              </IconButton>
                              <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                                {item.quantity}
                              </Typography>
                              <IconButton 
                                size="small" 
                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus size={16} />
                              </IconButton>
                            </Box>
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(item.total)}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Totals */}
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="between">
                        <Typography variant="body2">Subtotal:</Typography>
                        <Typography variant="body2">{formatCurrency(subtotal)}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="between">
                        <Typography variant="body2">Tax (8%):</Typography>
                        <Typography variant="body2">{formatCurrency(tax)}</Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box display="flex" justifyContent="between">
                        <Typography variant="h6">Total:</Typography>
                        <Typography variant="h6" color="primary.main">
                          {formatCurrency(total)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Box display="flex" gap={1} mb={2}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setCustomerDialog(true)}
                        startIcon={<User />}
                      >
                        Customer
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={clearCart}
                        color="error"
                      >
                        Clear
                      </Button>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      onClick={() => setPaymentDialog(true)}
                      startIcon={<CreditCard />}
                    >
                      Process Payment
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Customer Dialog */}
        <Dialog open={customerDialog} onClose={() => setCustomerDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Customer Information</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              Customer management will be integrated with the customers table.
            </Alert>
            <TextField
              fullWidth
              label="Customer Name"
              sx={{ mb: 2 }}
              placeholder="Enter customer name or phone number"
            />
            <TextField
              fullWidth
              label="Phone Number"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCustomerDialog(false)}>Cancel</Button>
            <Button 
              variant="contained"
              onClick={() => {
                setCustomer({ name: 'Walk-in Customer' })
                setCustomerDialog(false)
              }}
            >
              Save Customer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Process Payment</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="h5" color="primary.main" gutterBottom>
                Total: {formatCurrency(total)}
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="card">Credit/Debit Card</MenuItem>
                  <MenuItem value="mobile">Mobile Payment</MenuItem>
                </Select>
              </FormControl>

              {paymentMethod === 'cash' && (
                <>
                  <TextField
                    fullWidth
                    label="Amount Received"
                    type="number"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  {amountReceived && parseFloat(amountReceived) >= total && (
                    <Alert severity="success">
                      Change: {formatCurrency(change)}
                    </Alert>
                  )}
                </>
              )}

              {paymentMethod === 'card' && (
                <Alert severity="info">
                  Please insert or swipe the customer's card and follow the prompts on the card reader.
                </Alert>
              )}

              {paymentMethod === 'mobile' && (
                <Alert severity="info">
                  Please have the customer scan the QR code or tap their device on the NFC reader.
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
            <Button 
              variant="contained"
              onClick={handlePayment}
              disabled={paymentMethod === 'cash' && parseFloat(amountReceived) < total}
              startIcon={<Receipt />}
            >
              Complete Sale
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ProtectedRoute>
  )
}
