"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  Grid,
  Alert,
  Tabs,
  Tab,
  FormControlLabel,
  Paper,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  User,
  Palette,
  Globe,
  DollarSign,
  Bell,
  Shield,
  Save,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, CURRENCY } from "@/lib/currency";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface UserSettings {
  // Profile settings
  fullName: string;
  email: string;
  phone: string;

  // System preferences
  language: string;
  timezone: string;
  currency: string;
  dateFormat: string;

  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;

  // Display preferences
  darkMode: boolean;
  compactView: boolean;
  showTutorials: boolean;
}

const Settings = () => {
  const { profile } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [saveMessage, setSaveMessage] = useState('');

  const [settings, setSettings] = useState<UserSettings>({
    // Profile settings
    fullName: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.contact_phone || '',

    // System preferences
    language: 'English',
    timezone: 'GMT+0 (Ghana)',
    currency: 'GHS',
    dateFormat: 'DD/MM/YYYY',

    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,

    // Display preferences
    darkMode: false,
    compactView: false,
    showTutorials: true,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log('Saving settings:', settings);
    setSaveMessage('Settings saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <ProtectedRoute>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Settings
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage your account settings and preferences
          </Typography>
        </Box>

        {saveMessage && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSaveMessage('')}>
            {saveMessage}
          </Alert>
        )}

        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
              <Tab
                icon={<User size={20} />}
                label="Profile"
                id="settings-tab-0"
                aria-controls="settings-tabpanel-0"
              />
              <Tab
                icon={<SettingsIcon size={20} />}
                label="System"
                id="settings-tab-1"
                aria-controls="settings-tabpanel-1"
              />
              <Tab
                icon={<Bell size={20} />}
                label="Notifications"
                id="settings-tab-2"
                aria-controls="settings-tabpanel-2"
              />
              <Tab
                icon={<Palette size={20} />}
                label="Display"
                id="settings-tab-3"
                aria-controls="settings-tabpanel-3"
              />
            </Tabs>
          </Box>

          {/* Profile Tab */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={settings.fullName}
                  onChange={(e) => handleSettingChange('fullName', e.target.value)}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleSettingChange('email', e.target.value)}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={settings.phone}
                  onChange={(e) => handleSettingChange('phone', e.target.value)}
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* System Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              System Preferences
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={settings.language}
                    label="Language"
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                  >
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="Twi">Twi</MenuItem>
                    <MenuItem value="Ga">Ga</MenuItem>
                    <MenuItem value="Ewe">Ewe</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={settings.timezone}
                    label="Timezone"
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  >
                    <MenuItem value="GMT+0 (Ghana)">GMT+0 (Ghana)</MenuItem>
                    <MenuItem value="GMT+1 (WAT)">GMT+1 (WAT)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={settings.currency}
                    label="Currency"
                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                  >
                    <MenuItem value="GHS">
                      <Box display="flex" alignItems="center" gap={1}>
                        <DollarSign size={16} />
                        Ghana Cedi (GHS) - {formatCurrency(1000)}
                      </Box>
                    </MenuItem>
                    <MenuItem value="USD">US Dollar (USD)</MenuItem>
                    <MenuItem value="EUR">Euro (EUR)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    value={settings.dateFormat}
                    label="Date Format"
                    onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                  >
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Current currency setting: <strong>{CURRENCY.NAME} ({CURRENCY.CODE})</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Sample formatting: {formatCurrency(12345.67)}
            </Typography>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  />
                }
                label="Email Notifications"
                sx={{ mb: 2, display: 'block' }}
              />
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3, ml: 4 }}>
                Receive notifications about orders, inventory alerts, and system updates via email
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.pushNotifications}
                    onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                  />
                }
                label="Push Notifications"
                sx={{ mb: 2, display: 'block' }}
              />
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3, ml: 4 }}>
                Receive real-time notifications in your browser
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.smsNotifications}
                    onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                  />
                }
                label="SMS Notifications"
                sx={{ mb: 2, display: 'block' }}
              />
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3, ml: 4 }}>
                Receive critical alerts via SMS (charges may apply)
              </Typography>
            </Box>
          </TabPanel>

          {/* Display Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Display Preferences
            </Typography>
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.darkMode}
                    onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                  />
                }
                label="Dark Mode"
                sx={{ mb: 2, display: 'block' }}
              />
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3, ml: 4 }}>
                Use dark theme for better viewing in low light conditions
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.compactView}
                    onChange={(e) => handleSettingChange('compactView', e.target.checked)}
                  />
                }
                label="Compact View"
                sx={{ mb: 2, display: 'block' }}
              />
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3, ml: 4 }}>
                Show more information in less space
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.showTutorials}
                    onChange={(e) => handleSettingChange('showTutorials', e.target.checked)}
                  />
                }
                label="Show Tutorials"
                sx={{ mb: 2, display: 'block' }}
              />
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3, ml: 4 }}>
                Display helpful tips and tutorials for new features
              </Typography>
            </Box>
          </TabPanel>

          {/* Save Button */}
          <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
            <Button
              variant="contained"
              startIcon={<Save size={20} />}
              onClick={handleSave}
              size="large"
            >
              Save Settings
            </Button>
          </Box>
        </Paper>
      </Box>
    </ProtectedRoute>
  );
};

export default Settings;