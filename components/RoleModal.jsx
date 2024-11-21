import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";


const RoleModal = ({ role, onSubmit, permissions, triggerButton }) => {
  const { toast } = useToast();
  const initialFormState = {
    name: '',
    permissions: []
  };

  const [formData, setFormData] = useState(role || initialFormState);
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [filterPermission, setFilterPermission] = useState('all');

  useEffect(() => {
    if (role) {
      setFormData(role);
    } else {
      setFormData(initialFormState);
    }
  }, [role]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = "Role name is required.";
    }
    if (!formData.permissions?.length) {
      newErrors.permissions = "Select at least one permission.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Sort roles based on permissions count and name
      const sortRoles = (roles) => {
        return [...roles].sort((a, b) => {
          // First, sort by number of permissions (descending)
          if (b.permissions.length !== a.permissions.length) {
            return b.permissions.length - a.permissions.length;
          }
          // If same number of permissions, sort alphabetically by name
          return a.name.localeCompare(b.name);
        });
      };

      const success = onSubmit(formData, sortRoles);
      
      if (success) {
        handleClose();
        toast({
          title: role ? "Role Updated" : "Role Created",
          description: role ? "Role has been updated successfully." : "New role has been created successfully.",
          duration: 3000,
          className: "top-right-toast"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save role.",
        duration: 3000,
        className: "top-right-toast"
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormData(initialFormState);
    setErrors({});
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData, 
      name: value
    });

    if (value.trim()) {
      setErrors(prev => ({ ...prev, name: '' }));
    }
  };

  const togglePermission = (permission) => {
    const currentPermissions = formData.permissions || [];
    const updatedPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];
    
    setFormData({
      ...formData,
      permissions: updatedPermissions
    });

    if (updatedPermissions.length > 0) {
      setErrors(prev => ({ ...prev, permissions: '' }));
    }
  };

  // Group permissions by category
  const permissionCategories = {
    "User Management": ["manage_users", "manage_roles"],
    "Content Management": ["create_content", "edit_content", "delete_content", "approve_content", "view_content"],
    "Analytics & Settings": ["view_analytics", "manage_settings"]
  };

  const formatPermissionLabel = (permission) => {
    return permission
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getUniquePermissions = () => {
    const allPermissions = [];
    Object.values(permissionCategories).forEach(categoryPerms => {
      allPermissions.push(...categoryPerms);
    });
    return ['all', ...new Set(allPermissions)];
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogTrigger asChild>
        <div className="flex items-center gap-2">
          {triggerButton}
        </div>
      </DialogTrigger>

      <DialogContent as={motion.div} 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.3 }}
        className="max-w-[600px]"
      >
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle>
            {role ? 'Edit Role' : 'Add New Role'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="roleName" className="text-right">
              Role Name
            </Label>
            <div className="col-span-3">
              <Input
                id="roleName"
                value={formData.name}
                onChange={handleNameChange}
                className={`w-full ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter role name..."
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
          </div>
          <div className="space-y-4">
            {Object.entries(permissionCategories).map(([category, categoryPermissions]) => {
              // Filter permissions based on selected filter
              const filteredPermissions = filterPermission === 'all' 
                ? categoryPermissions
                : categoryPermissions.filter(permission => permission === filterPermission);
              
              // Only show categories that have permissions after filtering
              if (filteredPermissions.length === 0) return null;

              return (
                <div key={category} className="space-y-3">
                  <Label className="text-sm text-gray-500 font-medium">{category}</Label>
                  <div className="grid grid-cols-2 gap-4 pl-2">
                    {filteredPermissions.map((permission) => (
                      <div 
                        key={permission} 
                        className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Checkbox
                          id={permission}
                          checked={formData.permissions?.includes(permission)}
                          onCheckedChange={() => togglePermission(permission)}
                          className="data-[state=checked]:bg-blue-500"
                        />
                        <Label 
                          htmlFor={permission}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {formatPermissionLabel(permission)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-600">
              {role ? 'Update Role' : 'Create Role'}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoleModal; 