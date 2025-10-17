"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Box, Typography, TextField, Stack, Button, Alert } from '@mui/material'
import Link from 'next/link'

export default function ProfilePage() {
  const { profile, updateProfile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [contactPhone, setContactPhone] = useState(profile?.contact_phone || '')
  const [department, setDepartment] = useState(profile?.department || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)
    const { error } = await updateProfile({
      full_name: fullName,
      contact_phone: contactPhone,
      department,
    })
    setSaving(false)
    if (error) setError(error.message)
    else setSuccess('Profile updated')
  }

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', mt: 6 }}>
      <Typography variant="h5" gutterBottom>My Profile</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Update your profile information. You can change your password from the link below.
      </Typography>

      <Box component="form" onSubmit={onSubmit}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <TextField label="Full Name" fullWidth value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <TextField label="Email" fullWidth value={profile?.email || ''} disabled />
          <TextField label="Role" fullWidth value={profile?.role || ''} disabled />
          <TextField label="Contact Phone" fullWidth value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
          <TextField label="Department" fullWidth value={department} onChange={(e) => setDepartment(e.target.value)} />

          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button component={Link} href="/auth/change-password" variant="outlined">
              Change Password
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}

