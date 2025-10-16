'use client'

import Link from 'next/link'
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Container,
} from '@mui/material'
import { CheckCircle } from 'lucide-react'

export default function RegistrationSuccessPage() {
  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        py={4}
      >
        <Card sx={{ width: '100%', maxWidth: 400 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box mb={3}>
              <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
              <Typography variant="h4" component="h1" gutterBottom>
                Registration Successful!
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                Your account has been created successfully. You can now sign in to access the SIMS system.
              </Typography>
            </Box>

            <Button
              component={Link}
              href="/auth/login"
              variant="contained"
              size="large"
              fullWidth
              sx={{ mb: 2 }}
            >
              Sign In Now
            </Button>

            <Typography variant="body2" color="textSecondary">
              Please check your email for any additional verification steps if required.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
