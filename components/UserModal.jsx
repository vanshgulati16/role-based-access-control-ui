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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

const UserModal = ({ user, onSubmit, roles, triggerButton }) => {
  const initialFormData = {
    name: '',
    email: '',
    role: '',
    status: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    
    // When adding a new user, validate all fields
    if (!user) {
      if (!formData.name?.trim()) {
        newErrors.name = "Name is required.";
      }
      if (!formData.email?.trim()) {
        newErrors.email = "Email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Invalid email format.";
      }
      if (!formData.role) {
        newErrors.role = "Role is required.";
      }
      if (!formData.status) {
        newErrors.status = "Status is required.";
      }
    } else {
      // When updating, validating fields that have been changed
      if (formData.name !== user.name && !formData.name?.trim()) {
        newErrors.name = "Name is required.";
      }
      if (formData.email !== user.email) {
        if (!formData.email?.trim()) {
          newErrors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Invalid email format.";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));

    // Clear errors when field is filled
    if (value.trim()) {
      if (id === 'email') {
        // For email, only clear error if format is valid
        if (validateEmail(value)) {
          setErrors(prev => ({ ...prev, [id]: '' }));
        } else {
          setErrors(prev => ({ ...prev, [id]: 'Invalid email format' }));
        }
      } else {
        // For other fields, clear error when not empty
        setErrors(prev => ({ ...prev, [id]: '' }));
      }
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    if (value) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    if (user) {
      // For updates, only include changed fields
      const changedData = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== user[key]) {
          changedData[key] = formData[key];
        }
      });
      const success = onSubmit({ ...user, ...changedData });
      if (success) {
        handleClose();
      }
    } else {
      // For new users, submit all fields
      const success = onSubmit(formData);
      if (success) {
        handleClose();
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormData(user || initialFormData);
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) handleClose();
    }}>
      <DialogTrigger asChild>
        <div onClick={() => setIsOpen(true)}>
          {triggerButton}
        </div>
      </DialogTrigger>
      <DialogContent as={motion.div} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle>
            {user ? 'Edit User' : 'Add New User'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <div className="col-span-3">
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`w-full ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <div className="col-span-3">
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.role}
                onValueChange={(value) => handleSelectChange('role', value)}
                className={`${errors.role ? 'border-red-500' : 'border-gray-300'}`}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem 
                      key={role.id} 
                      value={role.name}
                    >
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
                className={`${errors.status ? 'border-red-500' : 'border-gray-300'}`}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={handleSubmit}>
              {user ? 'Update' : 'Add'}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserModal;