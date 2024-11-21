'use client';

import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Bell, Settings, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 bg-white border-b border-gray-200"
    >
      <div className="max-w-[1800px] mx-auto">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-8">
            <motion.h1 
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Dashboard
            </motion.h1>
            
          </div>

          <div className="flex items-center space-x-6">
            <motion.div 
              className="hidden sm:flex items-center space-x-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                <Settings className="h-5 w-5" />
              </Button>
            </motion.div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Avatar className="h-10 w-10 ring-2 ring-white shadow-lg cursor-pointer">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    JD
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar; 