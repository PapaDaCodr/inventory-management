"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  BarChart3,
  Archive,
  CreditCard,
  Truck,
} from "lucide-react";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Typography, Box, Grid, Card, CardContent, Button, CircularProgress } from "@mui/material";
import { cacheManager } from "@/lib/supabase-api-cached";
import Link from "next/link";

const Dashboard = () => {
  const { profile, loading: authLoading } = useAuth();
  const [dataPreloaded, setDataPreloaded] = useState(false);

  // Preload critical data in background for better performance
  useEffect(() => {
    const preloadData = async () => {
      try {
        console.log('Preloading critical data for faster navigation...');
        await cacheManager.preloadCriticalData();
        setDataPreloaded(true);
        console.log('Critical data preloaded successfully');
      } catch (error) {
        console.error('Error preloading data:', error);
        setDataPreloaded(true); // Continue anyway
      }
    };

    if (profile && !dataPreloaded) {
      // Small delay to not block initial render
      setTimeout(preloadData, 500);
    }
  }, [profile, dataPreloaded]);

  const getRoleSpecificCards = () => {
    const cards = [];

    if (profile?.role === 'administrator') {
      cards.push({
        title: 'Admin Panel',
        description: 'User management, system settings, and analytics',
        icon: <Shield className="text-red-500" size={32} />,
        href: '/admin',
        color: 'error.main'
      });
    }

    if (profile?.role === 'administrator' || profile?.role === 'manager') {
      cards.push({
        title: 'Manager Hub',
        description: 'Business analytics, reports, and supplier management',
        icon: <BarChart3 className="text-blue-500" size={32} />,
        href: '/manager',
        color: 'primary.main'
      });
    }

    if (['administrator', 'manager', 'inventory_clerk'].includes(profile?.role || '')) {
      cards.push({
        title: 'Inventory Control',
        description: 'Stock management, adjustments, and location tracking',
        icon: <Archive className="text-green-500" size={32} />,
        href: '/inventory-clerk',
        color: 'success.main'
      });
    }

    if (['administrator', 'manager', 'cashier'].includes(profile?.role || '')) {
      cards.push({
        title: 'POS Terminal',
        description: 'Point of sale, transactions, and customer management',
        icon: <CreditCard className="text-purple-500" size={32} />,
        href: '/cashier',
        color: 'secondary.main'
      });
    }

    if (['administrator', 'manager', 'supplier'].includes(profile?.role || '')) {
      cards.push({
        title: 'Supplier Portal',
        description: 'Purchase orders, product catalog, and deliveries',
        icon: <Truck className="text-orange-500" size={32} />,
        href: '/supplier',
        color: 'warning.main'
      });
    }

    return cards;
  };

  return (
    <ProtectedRoute>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {profile?.full_name}!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {profile?.role === 'administrator' && 'System Administrator Dashboard - Full system access and management'}
          {profile?.role === 'manager' && 'Manager Dashboard - Analytics, reports, and oversight functions'}
          {profile?.role === 'inventory_clerk' && 'Inventory Clerk Dashboard - Stock management and tracking'}
          {profile?.role === 'cashier' && 'Cashier Dashboard - POS operations and transactions'}
          {profile?.role === 'supplier' && 'Supplier Dashboard - Purchase orders and product management'}
        </Typography>
      </Box>

      {/* Role-Specific Quick Access Cards */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          Quick Access
        </Typography>
        <Grid container spacing={3}>
          {getRoleSpecificCards().map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 4 } }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    {card.icon}
                    <Typography variant="h6" component="h3">
                      {card.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {card.description}
                  </Typography>
                  <Button
                    component={Link}
                    href={card.href}
                    variant="contained"
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Open
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Analytics Section - Simplified for now */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          System Overview
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Advanced analytics dashboard is coming soon. For detailed metrics and reports, visit the role-specific modules above.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <BarChart3 className="text-blue-500" size={32} />
                  <Box>
                    <Typography variant="h6">Analytics</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Visit Manager Hub for detailed reports and analytics
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Archive className="text-green-500" size={32} />
                  <Box>
                    <Typography variant="h6">Inventory</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Real-time stock levels and inventory management
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <CreditCard className="text-purple-500" size={32} />
                  <Box>
                    <Typography variant="h6">Transactions</Typography>
                    <Typography variant="body2" color="textSecondary">
                      POS system and transaction processing
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </ProtectedRoute>
  );
};

export default Dashboard;