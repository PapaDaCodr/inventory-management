"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { Bell, Menu, Moon, Sun, LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Menu as MuiMenu, MenuItem, IconButton, Avatar, Typography } from "@mui/material";
import NotificationCenter from "@/components/NotificationCenter";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { profile, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const toggleDarkMode = () => {
    dispatch(setIsDarkMode(!isDarkMode));
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    try {
      handleProfileMenuClose();
      console.log('Signing out user...');
      await signOut();
      console.log('User signed out successfully');
      // Force redirect to login page
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  const handleProfileClick = () => {
    handleProfileMenuClose();
    // Navigate to profile page - for now show alert
    alert('Profile page navigation coming soon!');
  };

  return (
    <div className="flex justify-between items-center w-full mb-7">
      {/* LEFT SIDE */}
      <div className="flex justify-between items-center gap-5">
        <button
          type="button"
          className="px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="relative">
          <input
            type="search"
            placeholder="Start type to search groups & products"
            className="pl-10 pr-4 py-2 w-50 md:w-60 border-2 border-gray-300 bg-white rounded-lg focus:outline-none focus:border-blue-500"
          />

          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-non">
            <Bell className="text-gray-500" size={20} />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex justify-between items-center gap-5">
        <div className="hidden md:flex justify-between items-center gap-5">
          <div>
            <button type="button" onClick={toggleDarkMode}>
              {isDarkMode ? (
                <Sun className="cursor-pointer text-gray-500" size={24} />
              ) : (
                <Moon className="cursor-pointer text-gray-500" size={24} />
              )}
            </button>
          </div>
          <NotificationCenter />
          <hr className="w-0 h-7 border border-solid border-l border-gray-300 mx-3" />
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleProfileMenuOpen}>
            <Avatar sx={{ width: 40, height: 40 }}>
              {profile?.full_name?.charAt(0) || 'U'}
            </Avatar>
            <div className="hidden md:block">
              <Typography variant="body2" className="font-semibold">
                {profile?.full_name || 'User'}
              </Typography>
              <Typography variant="caption" color="textSecondary" className="capitalize">
                {profile?.role?.replace('_', ' ') || 'User'}
              </Typography>
            </div>
          </div>
          <MuiMenu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleProfileClick}>
              <User className="mr-2" size={16} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleSignOut}>
              <LogOut className="mr-2" size={16} />
              Sign Out
            </MenuItem>
          </MuiMenu>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
