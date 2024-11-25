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
      setFormData(prevData => ({
        ...role,
        permissions: role.permissions || prevData.permissions
      }));
    }
  }, [role]);

  useEffect(() => {
    if (isOpen && role) {
      sessionStorage.setItem('roleModalData', JSON.stringify(formData));
    }
  }, [formData, isOpen, role]);

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

  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
    sessionStorage.removeItem('roleModalData');
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!role) {
      resetForm();
    } else {
      setFormData({
        ...role,
        permissions: role.permissions || []
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setErrors({});
    if (!role) {
      resetForm();
    }
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
        if (open) {
          handleOpen();
        } else {
          handleClose();
        }
      }}
    >
      <DialogTrigger asChild>
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2"
        >
          {triggerButton}
        </motion.div>
      </DialogTrigger>

      <DialogContent as={motion.div} 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="max-w-[600px] bg-background"
      >
        <DialogHeader className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DialogTitle className="text-foreground">
              {role ? 'Edit Role' : 'Add New Role'}
            </DialogTitle>
          </motion.div>
        </DialogHeader>
        <motion.div 
          className="grid gap-6 py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="roleName" className="text-right text-foreground">
              Role Name
            </Label>
            <div className="col-span-3">
              <Input
                id="roleName"
                value={formData.name}
                onChange={handleNameChange}
                className={`w-full ${errors.name ? 'border-destructive' : 'border-input'}`}
                placeholder="Enter role name..."
              />
              {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
            </div>
          </div>
          <div className="space-y-4">
            {Object.entries(permissionCategories).map(([category, categoryPermissions], index) => {
              const filteredPermissions = filterPermission === 'all' 
                ? categoryPermissions
                : categoryPermissions.filter(permission => permission === filterPermission);
              
              if (filteredPermissions.length === 0) return null;

              return (
                <motion.div 
                  key={category} 
                  className="space-y-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (index * 0.1) }}
                >
                  <Label className="text-sm text-muted-foreground font-medium">
                    {category}
                  </Label>
                  <div className="grid grid-cols-2 gap-4 pl-2">
                    {filteredPermissions.map((permission, permIndex) => (
                      <motion.div 
                        key={permission} 
                        className="flex items-center space-x-2 bg-muted/50 dark:bg-muted/20 p-3 rounded-lg hover:bg-muted/80 dark:hover:bg-muted/30 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + (permIndex * 0.05) }}
                      >
                        <Checkbox
                          id={permission}
                          checked={formData.permissions?.includes(permission)}
                          onCheckedChange={() => togglePermission(permission)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                        <Label 
                          htmlFor={permission}
                          className="text-sm font-medium leading-none cursor-pointer text-foreground"
                        >
                          {formatPermissionLabel(permission)}
                        </Label>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
            {errors.permissions && (
              <p className="text-destructive text-sm">{errors.permissions}</p>
            )}
          </div>
        </motion.div>

        <motion.div 
          className="flex justify-end space-x-2 pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="border-border hover:bg-muted"
          >
            Cancel
          </Button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={handleSubmit} 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {role ? 'Update Role' : 'Create Role'}
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default RoleModal; 