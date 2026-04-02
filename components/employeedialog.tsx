"use client";

import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Stack
} from '@mui/material';
import { Employee } from '../types/empolyee';

interface Props {
    open: boolean;
    onClose: () => void;
    onSave: (data: Employee) => void;
    initialData: Employee | null; // The logic "Switch"
}

export default function EmployeeDialog({ open, onClose, onSave, initialData }: Props) {
    const [formData, setFormData] = useState<Employee>({
        name: '', email: '', salary: 0, telephone: '', address: '', joiningDate: '',
        id: ''
    });

    // Logic: Sync internal state with props when editing starts
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({ name: '', email: '', salary: 0, telephone: '', address: '', joiningDate: '', id: '' });
        }
    }, [initialData, open]);

    const handleSubmit = () => {
        if (!formData.name || !formData.email) return alert("Name and Email are required");
        onSave(formData);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{initialData ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        name="name"
                        label="Full Name"
                        fullWidth
                        value={formData.name}
                        onChange={handleChange}
                    />
                    <TextField
                        name="email"
                        label="Email Address"
                        fullWidth
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <TextField
                        name="salary"
                        label="Monthly Salary"
                        type="number"
                        fullWidth
                        value={formData.salary}
                        onChange={handleChange}
                    />
                    <TextField
                        name="telephone"
                        label="Telephone"
                        fullWidth
                        value={formData.telephone}
                        onChange={handleChange}
                    />
                    <TextField
                        name="joiningDate"
                        label="Joining Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={formData.joiningDate}
                        onChange={handleChange}
                    />
                    <TextField
                        name="address"
                        label="Address"
                        multiline
                        rows={2}
                        fullWidth
                        value={formData.address}
                        onChange={handleChange}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    {initialData ? 'Update' : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );

    // Helper inside the component
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }
}
