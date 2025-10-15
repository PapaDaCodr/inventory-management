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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  Alert,
  Divider,
} from '@mui/material'
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  FileText,
  PieChart,
  Activity,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  AlertTriangle,
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { dashboardApi } from '@/lib/supabase-api'

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
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function ReportsPage() {
  const { profile } = useAuth()
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('last_30_days')
  const [reportData, setReportData] = useState<any>({})
  const [exportDialog, setExportDialog] = useState(false)
  const [selectedReport, setSelectedReport] = useState('')

  useEffect(() => {
    loadReportData()
  }, [dateRange])

  const loadReportData = async () => {
    try {
      setLoading(true)
      // Mock comprehensive report data
      setReportData({
        salesSummary: {
          totalSales: 125000,
          totalTransactions: 1250,
          averageTransaction: 100,
          topProducts: [
            { name: 'Premium Coffee Beans', sales: 15000, quantity: 500 },
            { name: 'Organic Milk', sales: 12000, quantity: 800 },
            { name: 'Fresh Bread', sales: 10000, quantity: 1200 },
          ]
        },
        inventoryReport: {
          totalProducts: 2500,
          lowStockItems: 45,
          outOfStockItems: 12,
          totalValue: 450000,
          topCategories: [
            { name: 'Dairy Products', value: 85000, percentage: 18.9 },
            { name: 'Beverages', value: 72000, percentage: 16.0 },
            { name: 'Bakery', value: 65000, percentage: 14.4 },
          ]
        },
        supplierPerformance: [
          { name: 'Fresh Foods Co.', orders: 25, onTimeDelivery: 96, rating: 4.8 },
          { name: 'Dairy Direct', orders: 18, onTimeDelivery: 94, rating: 4.6 },
          { name: 'Beverage Plus', orders: 22, onTimeDelivery: 89, rating: 4.2 },
        ],
        financialMetrics: {
          revenue: 125000,
          costs: 87500,
          grossProfit: 37500,
          profitMargin: 30,
          monthlyGrowth: 8.5
        }
      })
    } catch (error) {
      console.error('Error loading report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleExportReport = (reportType: string) => {
    setSelectedReport(reportType)
    setExportDialog(true)
  }

  const generateReport = () => {
    // Mock report generation
    alert(`Generating ${selectedReport} report for ${dateRange}...`)
    setExportDialog(false)
  }

  const getDateRangeLabel = (range: string) => {
    switch (range) {
      case 'today': return 'Today'
      case 'yesterday': return 'Yesterday'
      case 'last_7_days': return 'Last 7 Days'
      case 'last_30_days': return 'Last 30 Days'
      case 'last_90_days': return 'Last 90 Days'
      case 'this_month': return 'This Month'
      case 'last_month': return 'Last Month'
      case 'this_year': return 'This Year'
      default: return 'Last 30 Days'
    }
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
        <Box display="flex" justifyContent="between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Reports & Analytics
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Comprehensive business insights and performance metrics
            </Typography>
          </Box>
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              label="Date Range"
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="yesterday">Yesterday</MenuItem>
              <MenuItem value="last_7_days">Last 7 Days</MenuItem>
              <MenuItem value="last_30_days">Last 30 Days</MenuItem>
              <MenuItem value="last_90_days">Last 90 Days</MenuItem>
              <MenuItem value="this_month">This Month</MenuItem>
              <MenuItem value="last_month">Last Month</MenuItem>
              <MenuItem value="this_year">This Year</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Key Metrics Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <DollarSign className="text-green-500" size={32} />
                  <Box>
                    <Typography variant="h4">
                      ${reportData.financialMetrics?.revenue?.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Revenue
                    </Typography>
                    <Chip 
                      label={`+${reportData.financialMetrics?.monthlyGrowth}%`} 
                      color="success" 
                      size="small" 
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <ShoppingCart className="text-blue-500" size={32} />
                  <Box>
                    <Typography variant="h4">
                      {reportData.salesSummary?.totalTransactions?.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Transactions
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Avg: ${reportData.salesSummary?.averageTransaction}
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
                  <Package className="text-purple-500" size={32} />
                  <Box>
                    <Typography variant="h4">
                      {reportData.inventoryReport?.totalProducts?.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Products
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Value: ${reportData.inventoryReport?.totalValue?.toLocaleString()}
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
                  <TrendingUp className="text-orange-500" size={32} />
                  <Box>
                    <Typography variant="h4">
                      {reportData.financialMetrics?.profitMargin}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Profit Margin
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Profit: ${reportData.financialMetrics?.grossProfit?.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Detailed Reports */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Sales Report" />
              <Tab label="Inventory Report" />
              <Tab label="Supplier Performance" />
              <Tab label="Financial Analysis" />
            </Tabs>
          </Box>

          {/* Sales Report Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
              <Typography variant="h6">Sales Performance - {getDateRangeLabel(dateRange)}</Typography>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={() => handleExportReport('Sales Report')}
              >
                Export Report
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Top Performing Products
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Product Name</TableCell>
                            <TableCell align="right">Sales Amount</TableCell>
                            <TableCell align="right">Quantity Sold</TableCell>
                            <TableCell align="right">Revenue %</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reportData.salesSummary?.topProducts?.map((product: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>{product.name}</TableCell>
                              <TableCell align="right">${product.sales.toLocaleString()}</TableCell>
                              <TableCell align="right">{product.quantity}</TableCell>
                              <TableCell align="right">
                                {((product.sales / reportData.salesSummary.totalSales) * 100).toFixed(1)}%
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Sales Summary
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">Total Sales</Typography>
                      <Typography variant="h5" color="primary.main">
                        ${reportData.salesSummary?.totalSales?.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">Total Transactions</Typography>
                      <Typography variant="h6">
                        {reportData.salesSummary?.totalTransactions?.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Average Transaction</Typography>
                      <Typography variant="h6">
                        ${reportData.salesSummary?.averageTransaction}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Inventory Report Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
              <Typography variant="h6">Inventory Analysis - {getDateRangeLabel(dateRange)}</Typography>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={() => handleExportReport('Inventory Report')}
              >
                Export Report
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Inventory Status
                    </Typography>
                    <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                      <Typography variant="body2">Total Products</Typography>
                      <Typography variant="h6">{reportData.inventoryReport?.totalProducts}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                      <Typography variant="body2">Low Stock Items</Typography>
                      <Chip 
                        label={reportData.inventoryReport?.lowStockItems} 
                        color="warning" 
                        size="small"
                        icon={<AlertTriangle size={16} />}
                      />
                    </Box>
                    <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                      <Typography variant="body2">Out of Stock Items</Typography>
                      <Chip 
                        label={reportData.inventoryReport?.outOfStockItems} 
                        color="error" 
                        size="small"
                        icon={<AlertTriangle size={16} />}
                      />
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" justifyContent="between" alignItems="center">
                      <Typography variant="body2">Total Inventory Value</Typography>
                      <Typography variant="h6" color="primary.main">
                        ${reportData.inventoryReport?.totalValue?.toLocaleString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Top Categories by Value
                    </Typography>
                    {reportData.inventoryReport?.topCategories?.map((category: any, index: number) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Box display="flex" justifyContent="between" alignItems="center" mb={1}>
                          <Typography variant="body2">{category.name}</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            ${category.value.toLocaleString()} ({category.percentage}%)
                          </Typography>
                        </Box>
                        <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                          <Box
                            sx={{
                              width: `${category.percentage}%`,
                              bgcolor: 'primary.main',
                              height: '100%',
                              borderRadius: 1,
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Supplier Performance Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
              <Typography variant="h6">Supplier Performance - {getDateRangeLabel(dateRange)}</Typography>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={() => handleExportReport('Supplier Performance')}
              >
                Export Report
              </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Supplier Name</TableCell>
                    <TableCell align="right">Total Orders</TableCell>
                    <TableCell align="right">On-Time Delivery %</TableCell>
                    <TableCell align="right">Quality Rating</TableCell>
                    <TableCell align="center">Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.supplierPerformance?.map((supplier: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{supplier.name}</TableCell>
                      <TableCell align="right">{supplier.orders}</TableCell>
                      <TableCell align="right">{supplier.onTimeDelivery}%</TableCell>
                      <TableCell align="right">{supplier.rating}/5.0</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={supplier.onTimeDelivery >= 95 ? 'Excellent' : 
                                supplier.onTimeDelivery >= 90 ? 'Good' : 'Needs Improvement'}
                          color={supplier.onTimeDelivery >= 95 ? 'success' : 
                                supplier.onTimeDelivery >= 90 ? 'info' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Financial Analysis Tab */}
          <TabPanel value={tabValue} index={3}>
            <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
              <Typography variant="h6">Financial Analysis - {getDateRangeLabel(dateRange)}</Typography>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={() => handleExportReport('Financial Analysis')}
              >
                Export Report
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Revenue Breakdown
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Box display="flex" justifyContent="between" alignItems="center" mb={1}>
                        <Typography variant="body2">Total Revenue</Typography>
                        <Typography variant="h6" color="primary.main">
                          ${reportData.financialMetrics?.revenue?.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="between" alignItems="center" mb={1}>
                        <Typography variant="body2">Total Costs</Typography>
                        <Typography variant="h6" color="error.main">
                          ${reportData.financialMetrics?.costs?.toLocaleString()}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box display="flex" justifyContent="between" alignItems="center">
                        <Typography variant="body2" fontWeight="medium">Gross Profit</Typography>
                        <Typography variant="h6" color="success.main">
                          ${reportData.financialMetrics?.grossProfit?.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Performance Metrics
                    </Typography>
                    <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                      <Typography variant="body2">Profit Margin</Typography>
                      <Typography variant="h6" color="success.main">
                        {reportData.financialMetrics?.profitMargin}%
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                      <Typography variant="body2">Monthly Growth</Typography>
                      <Chip
                        label={`+${reportData.financialMetrics?.monthlyGrowth}%`}
                        color="success"
                        size="small"
                        icon={<TrendingUp size={16} />}
                      />
                    </Box>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Performance is above industry average. Continue current strategies.
                    </Alert>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Card>

        {/* Export Dialog */}
        <Dialog open={exportDialog} onClose={() => setExportDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Export {selectedReport}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Export Format</InputLabel>
                <Select defaultValue="pdf">
                  <MenuItem value="pdf">PDF Report</MenuItem>
                  <MenuItem value="excel">Excel Spreadsheet</MenuItem>
                  <MenuItem value="csv">CSV Data</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Date Range</InputLabel>
                <Select value={dateRange}>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="last_7_days">Last 7 Days</MenuItem>
                  <MenuItem value="last_30_days">Last 30 Days</MenuItem>
                  <MenuItem value="last_90_days">Last 90 Days</MenuItem>
                </Select>
              </FormControl>
              <Alert severity="info">
                The report will be generated and downloaded automatically.
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExportDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={generateReport} startIcon={<FileText />}>
              Generate Report
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ProtectedRoute>
  )
}
