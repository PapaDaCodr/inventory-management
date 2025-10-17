"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Box, Button, TextField, Typography, Alert, Stack } from '@mui/material'

export default function ChangePasswordPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    try {
      setLoading(true)
      // Update password AND clear the must_reset_password flag in one call
      const { error: updateErr } = await supabase.auth.updateUser({
        password,
        data: { must_reset_password: false },
      })
      if (updateErr) throw updateErr

      setSuccess('Password changed successfully')
      // Give a brief moment for state to update, then redirect
      setTimeout(() => router.replace('/dashboard'), 800)
    } catch (err: any) {
      setError(err?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 420, mx: 'auto', mt: 8 }}>
      <Typography variant="h5" gutterBottom>Change your password</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {user?.email || ''}
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <TextField
            type="password"
            label="New Password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <TextField
            type="password"
            label="Confirm New Password"
            fullWidth
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : 'Change Password'}
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}

