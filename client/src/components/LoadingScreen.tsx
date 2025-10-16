'use client'

import React from 'react'
import {
  Box,
  CircularProgress,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  Fade
} from '@mui/material'

interface LoadingScreenProps {
  message?: string
  showProgress?: boolean
  fullScreen?: boolean
}

export default function LoadingScreen({ 
  message = 'Loading...', 
  showProgress = true,
  fullScreen = true 
}: LoadingScreenProps) {
  return (
    <Fade in timeout={300}>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={fullScreen ? "100vh" : "200px"}
        sx={{ 
          background: fullScreen ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
          padding: 2
        }}
      >
        <Card sx={{ minWidth: 300, textAlign: 'center' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" component="h1" gutterBottom color="primary">
              SIMS
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Supermarket Inventory Management System
            </Typography>
            
            <Box sx={{ mt: 3, mb: 2 }}>
              <CircularProgress size={40} />
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>
            
            {showProgress && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Fade>
  )
}

// Convenience components for different loading states
export function AuthLoadingScreen() {
  return <LoadingScreen message="Checking authentication..." />
}

export function DataLoadingScreen() {
  return <LoadingScreen message="Loading data..." fullScreen={false} />
}

export function RedirectLoadingScreen({ destination }: { destination: string }) {
  return <LoadingScreen message={`Redirecting to ${destination}...`} />
}
