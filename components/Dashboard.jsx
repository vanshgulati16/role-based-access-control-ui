"use client";

import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Users, Shield, UserCheck, Lock } from 'lucide-react';
import UserModal from './UserModal';
import RoleModal from './RoleModal';
import { motion } from 'framer-motion';
import { useToast } from "@/hooks/use-toast"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"

// Mock data structures
const initialUsers = [
  { 
    id: 1, 
    name: "John Doe", 
    email: "john@example.com", 
    role: "Super Admin", 
    status: "Active" 
  },
  { 
    id: 2, 
    name: "Jane Smith", 
    email: "jane@example.com", 
    role: "Editor", 
    status: "Inactive" 
  }
];

const initialRoles = [
  { 
    id: 1, 
    name: "Super Admin", 
    permissions: [
      "manage_users",
      "manage_roles",
      "view_analytics",
      "manage_settings",
      "approve_content",
      "delete_content"
    ] 
  },
  { 
    id: 2, 
    name: "Content Manager", 
    permissions: [
      "create_content",
      "edit_content",
      "delete_content",
      "view_analytics"
    ] 
  },
  {
    id: 3,
    name: "Editor",
    permissions: [
      "create_content",
      "edit_content",
      "view_analytics"
    ]
  },
  {
    id: 4,
    name: "Viewer",
    permissions: [
      "view_content",
      "view_analytics"
    ]
  }
];

const permissionsList = [
  "manage_users",     
  "manage_roles",     
  "create_content",   
  "edit_content",     
  "delete_content",   
  "approve_content",  
  "view_content",     
  "view_analytics",   
  "manage_settings",  
];

const toastConfig = {
  duration: 3000,
  className: "top-right-toast"
};

const Dashboard = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState(initialUsers);
  const [roles, setRoles] = useState(initialRoles);
  const [selectedRole, setSelectedRole] = useState(null);
  const [statusFilter, setSortOrder] = useState('all');
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // User Management Functions
  const handleAddUser = (newUser) => {
    if (isDuplicateUser(newUser)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "A user with this name or email already exists.",
        ...toastConfig
      });
      return false;
    }

    setUsers(prevUsers => [...prevUsers, { ...newUser, id: Date.now() }]);
    toast({
      title: "Success",
      description: "User added successfully.",
      ...toastConfig
    });
    return true;
  };

  const handleEditUser = (updatedUser) => {
    if (isDuplicateUser(updatedUser, updatedUser.id)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "A user with this name or email already exists.",
        ...toastConfig
      });
      return false;
    }

    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      )
    );
    toast({
      title: "Success",
      description: "User updated successfully.",
      ...toastConfig
    });
    return true;
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
    toast({
      title: "Success",
      description: "User deleted successfully.",
      ...toastConfig
    });
  };

  // Role Management Functions
  const handleRoleSubmit = (roleData, sortRoles) => {
    // checking for duplicate role name first
    if (isDuplicateRole(roleData, roleData.id)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "A role with this name already exists.",
        ...toastConfig
      });
      return false;
    }

    try {
      if (roleData.id) {
        // updating existing role
        const updatedRoles = roles.map(role => 
          role.id === roleData.id ? roleData : role
        );
        const sortedRoles = sortRoles(updatedRoles);
        setRoles(sortedRoles);
        toast({
          title: "Success",
          description: "Role updated successfully.",
          ...toastConfig
        });
      } else {
        // adding new role
        const updatedRoles = [...roles, { ...roleData, id: Date.now() }];
        const sortedRoles = sortRoles(updatedRoles);
        setRoles(sortedRoles);
        toast({
          title: "Success", 
          description: "Role created successfully.",
          ...toastConfig
        });
      }
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save role.",
        ...toastConfig
      });
      return false;
    }
  };

  const handleDeleteRole = (roleId) => {
    setRoles(roles.filter(role => role.id !== roleId));
    toast({
      title: "Success",
      description: "Role deleted successfully.",
      ...toastConfig
    });
  };

  const EmptyState = ({ message }) => (
    <TableRow>
      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
        {message}
      </TableCell>
    </TableRow>
  );

  // Add these new helper functions
  const isDuplicateUser = (userData, excludeId = null) => {
    return users.some(user => 
      (user.id !== excludeId) && 
      (user.email.toLowerCase() === userData.email.toLowerCase() ||
       user.name.toLowerCase() === userData.name.toLowerCase())
    );
  };

  const isDuplicateRole = (roleData, excludeId = null) => {
    return roles.some(role => 
      (role.id !== excludeId) && 
      (role.name.toLowerCase() === roleData.name.toLowerCase())
    );
  };

  const formatPermissionName = (permission) => {
    return permission
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filterRolesByPermissions = (role) => {
    if (!Array.isArray(selectedPermissions) || selectedPermissions.length === 0) {
      return true;
    }
    
    return selectedPermissions.every(permission => 
      role.permissions.includes(permission)
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        <motion.div 
          className="text-left"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1 
            className="text-4xl font-bold text-foreground mb-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Welcome Back
          </motion.h1>
          <motion.p 
            className="text-muted-foreground mb-8"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Manage your users and roles efficiently
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="bg-blue-50 dark:bg-primary/10 rounded-t-xl">
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Total Users</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-3xl font-bold text-blue-600">{users.length}</p>
                <p className="text-muted-foreground">Active accounts</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="bg-blue-50 dark:bg-primary/10 rounded-t-xl">
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Total Roles</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-3xl font-bold text-blue-600">{roles.length}</p>
                <p className="text-muted-foreground">Available role types</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="bg-purple-50 dark:bg-primary/10 rounded-t-xl">
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  <span>Active Users</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-3xl font-bold text-purple-600">
                  {users.filter(user => user.status === 'Active').length}
                </p>
                <p className="text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="bg-purple-50 dark:bg-primary/10 rounded-t-xl">
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <span>Permissions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-3xl font-bold text-purple-600">{permissionsList.length}</p>
                <p className="text-muted-foreground">Total permissions</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div 
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Tabs defaultValue="users" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <TabsList className="grid w-full grid-cols-2 max-w-[400px] mx-auto bg-muted p-1 rounded-lg">
                <TabsTrigger value="users">
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="roles">
                  <Shield className="h-4 w-4 mr-2" />
                  Roles
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <TabsContent value="users" className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="border-b border-border bg-card/50 backdrop-blur-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>User Management</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {statusFilter === 'all' 
                            ? `Showing all ${users.length} users`
                            : `Showing ${users.filter(user => user.status === statusFilter).length} ${statusFilter} users`
                          }
                        </p>
                      </div>
                      <UserModal 
                        onSubmit={handleAddUser} 
                        roles={roles}
                        triggerButton={
                          <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add User
                          </Button>
                        }
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-muted/50">
                            <TableHead className="pl-6">Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>
                              <div className="flex items-center gap-2">
                                Status
                                <Select
                                  value={statusFilter}
                                  onValueChange={setSortOrder}
                                >
                                  <SelectTrigger className="w-[130px] h-8">
                                    <SelectValue placeholder="Filter Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableHead>
                            <TableHead className="pr-6">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.length === 0 ? (
                            <EmptyState message="No users found. Add a new user to get started." />
                          ) : (
                            users
                              .filter(user => statusFilter === 'all' || user.status === statusFilter)
                              .map((user) => (
                                <TableRow key={user.id} className="hover:bg-muted/50">
                                  <TableCell className="pl-6 font-medium">{user.name}</TableCell>
                                  <TableCell>{user.email}</TableCell>
                                  <TableCell>
                                    <Badge variant="secondary">{user.role}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant={user.status === 'Active' ? 'success' : 'destructive'}
                                      className={user.status === 'Active' ? 'bg-green-600 hover:bg-green-500 text-white' : ''}
                                    >
                                      {user.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="pr-6">
                                    <div className="flex space-x-2">
                                      <UserModal 
                                        user={user}
                                        onSubmit={handleEditUser}
                                        roles={roles}
                                        triggerButton={
                                          <Button size="icon" variant="outline">
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                        }
                                      />
                                      <Button 
                                        size="icon" 
                                        variant="destructive"
                                        onClick={() => handleDeleteUser(user.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="roles" className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="border-b border-border bg-card/50 backdrop-blur-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Role Management</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedPermissions.length === 0 
                            ? `Showing all ${roles.length} roles`
                            : `Showing ${roles.filter(role => 
                                selectedPermissions.every(p => role.permissions.includes(p))
                              ).length} roles with selected permissions`
                          }
                        </p>
                      </div>
                      <RoleModal 
                        onSubmit={handleRoleSubmit}
                        permissions={permissionsList}
                        triggerButton={
                          <Button className="bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700">
                            <Plus className="mr-2 h-4 w-4" /> Add Role
                          </Button>
                        }
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-muted/50">
                            <TableHead className="pl-6">Role Name</TableHead>
                            <TableHead>
                              <div className="flex items-center gap-2">
                                Permissions
                                <Select>
                                  <SelectTrigger className="w-[280px] h-8">
                                    <SelectValue placeholder="Filter by Permissions">
                                      {selectedPermissions.length > 0 
                                        ? `${selectedPermissions.length} permission${selectedPermissions.length > 1 ? 's' : ''} selected`
                                        : "All Permissions"
                                      }
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent className="max-h-[300px]">
                                    <div className="p-2">
                                      {permissionsList.map((permission) => (
                                        <div
                                          key={permission}
                                          className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md"
                                        >
                                          <Checkbox
                                            id={permission}
                                            checked={selectedPermissions.includes(permission)}
                                            onCheckedChange={(checked) => {
                                              setSelectedPermissions(prev => {
                                                if (checked) {
                                                  return [...prev, permission];
                                                } else {
                                                  return prev.filter(p => p !== permission);
                                                }
                                              });
                                            }}
                                          />
                                          <label
                                            htmlFor={permission}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                          >
                                            {formatPermissionName(permission)}
                                          </label>
                                        </div>
                                      ))}
                                      {selectedPermissions.length > 0 && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedPermissions([]);
                                          }}
                                          className="w-full mt-4"
                                        >
                                          Clear All
                                        </Button>
                                      )}
                                    </div>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableHead>
                            <TableHead className="pr-6">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {roles.length === 0 ? (
                            <EmptyState message="No roles found. Add a new role to get started." />
                          ) : (
                            roles
                              .filter(filterRolesByPermissions)
                              .map((role) => (
                                <TableRow key={role.id} className="hover:bg-muted/50">
                                  <TableCell className="pl-6 font-medium">{role.name}</TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-3 py-2">
                                      {role.permissions.map((perm) => (
                                        <Badge 
                                          key={perm} 
                                          variant="secondary"
                                          className={selectedPermissions.includes(perm) ? 
                                            "bg-primary/10 text-primary border-primary/20" : ""}
                                        >
                                          {formatPermissionName(perm)}
                                        </Badge>
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell className="pr-6">
                                    <div className="flex space-x-2">
                                      <RoleModal 
                                        role={role}
                                        onSubmit={handleRoleSubmit}
                                        permissions={permissionsList}
                                        triggerButton={
                                          <Button size="icon" variant="outline">
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                        }
                                      />
                                      <Button 
                                        size="icon" 
                                        variant="destructive"
                                        onClick={() => handleDeleteRole(role.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;