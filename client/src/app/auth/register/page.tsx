'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Grid,
} from '@mui/material'
import { useAuth, UserRole } from '@/contexts/AuthContext'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'inventory_clerk' as UserRole,
    employee_id: '',
    contact_phone: '',
    department: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signUp } = useAuth()
  const router = useRouter()

  const handleChange = (field: string) => (e: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!formData.full_name.trim()) {
      setError('Full name is required')
      return
    }

    setLoading(true)

    try {
      const { error } = await signUp(formData.email, formData.password, {
        full_name: formData.full_name,
        role: formData.role,
        employee_id: formData.employee_id || undefined,
        contact_phone: formData.contact_phone || undefined,
        department: formData.department || undefined,
      })
      
      if (error) {
        setError(error.message)
      } else {
        // Registration successful
        router.push('/auth/registration-success')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const roleDescriptions = {
    administrator: 'Full system access, user management, system configuration',
    manager: 'Analytics, reports, supplier management, oversight functions',
    inventory_clerk: 'Stock management, inventory tracking, location-based access',
    cashier: 'POS operations, transaction processing, customer management',
    supplier: 'Purchase order management, product catalog, delivery scheduling'
  }

  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        py={4}
      >
        <Card sx={{ width: '100%', maxWidth: 600 }}>
          <CardContent sx={{ p: 4 }}>
            <Box textAlign="center" mb={3}>
              <Typography variant="h4" component="h1" gutterBottom>
                Register for SIMS
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Create your account for the Supermarket Inventory Management System
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.full_name}
                    onChange={handleChange('full_name')}
                    required
                    autoFocus
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    required
                    autoComplete="email"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange('password')}
                    required
                    autoComplete="new-password"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    required
                    autoComplete="new-password"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={formData.role}
                      label="Role"
                      onChange={handleChange('role')}
                    >
                      <MenuItem value="administrator">Administrator</MenuItem>
                      <MenuItem value="manager">Manager</MenuItem>
                      <MenuItem value="inventory_clerk">Inventory Clerk</MenuItem>
                      <MenuItem value="cashier">Cashier</MenuItem>
                      <MenuItem value="supplier">Supplier</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    {roleDescriptions[formData.role]}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    value={formData.employee_id}
                    onChange={handleChange('employee_id')}
                    helperText="Optional - for internal staff"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Phone"
                    value={formData.contact_phone}
                    onChange={handleChange('contact_phone')}
                    helperText="Optional"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={formData.department}
                    onChange={handleChange('department')}
                    helperText="Optional - e.g., Produce, Dairy, Electronics"
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Account'}
              </Button>
            </form>

            <Divider sx={{ my: 2 }} />

            <Box textAlign="center">
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Already have an account?
              </Typography>
              <Button
                component={Link}
                href="/auth/login"
                variant="outlined"
                fullWidth
              >
                Sign In
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
