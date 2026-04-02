'use client';

import {useState} from 'react';
// Material UI Imports
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Box, Tooltip, IconButton, Button, Stack, Snackbar, Alert
} from '@mui/material';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';

// Local Assets/Actions
import employeesData from '../data/employees.json';
import EmployeeDialog from './employeedialog';
import {Employee} from '../types/types'
import {saveEmployeesToFile} from '../actions/saveEmployeesToFile';
import {processPayrollAndEmail} from '../actions/sendPayroll';

const formatIndex = (index: number) => {
    return (index + 1).toString().padStart(3, '0');
};

export default function Employees() {
    const [employees, setEmployees] = useState<Employee[]>(employeesData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [editIndex, setEditIndex] = useState<number | null>(null);

    // --- ALERT STATE ---
    const [alert, setAlert] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
        open: false,
        message: '',
        severity: 'success',
    });
    const triggerAlert = (message: string, severity: 'success' | 'error' | 'info' = 'success') => {
        setAlert({ open: true, message, severity });
    };

    const handleCloseAlert = () => {
        setAlert({ ...alert, open: false });
    };
    const handleAddClick = () => {
        setSelectedEmployee(null); // Ensure form is empty
        setEditIndex(null);         // Ensure we aren't in edit mode
        setIsModalOpen(true);
    };

    const onDelete = (indexToDelete: number, name: string) => {
        const confirmDelete = window.confirm(`Are you sure you want to remove this employee: ${name}?`);
        if (confirmDelete) {
            const updatedList = employees.filter((_, index) => index !== indexToDelete);
            setEmployees(updatedList);
            triggerAlert(`Employee "${name}" removed from the empolyees list.`, 'info');
        }
    };

    const handleEditClick = (index: number) => {
        setEditIndex(index);
        setSelectedEmployee(employees[index]);
        setIsModalOpen(true);
    };

    const handleSaveEmployee = (updatedData: Employee) => {
        if (editIndex !== null) {
            const updatedList = [...employees];
            updatedList[editIndex] = updatedData;
            setEmployees(updatedList);
            triggerAlert("Employee updated successfully!");
        } else {
            setEmployees([...employees, updatedData]);
            triggerAlert("New employee added to the list!");
        }
        setIsModalOpen(false);
        setEditIndex(null);
    };
    const handleSaveToJSON = async () => {
        try {
            const result = await saveEmployeesToFile(employees);
            if (result.success) {
                triggerAlert("JSON file updated successfully!", "success");
            } else {
                triggerAlert("Failed to save to JSON file.", "error");
            }
        } catch (err) {
            triggerAlert("An error occurred while saving.", "error");
        }
    }
    const sendMonthlyPayroll = async () => {
        triggerAlert("Processing payroll and sending emails...", "info");
        try {
            const result = await processPayrollAndEmail();
            if (result?.success) {
                triggerAlert("Emails sent successfully and outputs cleaned!", "success");
            } else {
                triggerAlert(result?.error || "Failed to send payroll emails.", "error");
            }
        } catch (err) {
            triggerAlert("Critical error during payroll process.", "error");
        }
    };

    return (
        <>
            {/* Notification Snackbar */}
            <Snackbar
                open={alert.open}
                autoHideDuration={4000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }} variant="filled">
                    {alert.message}
                </Alert>
            </Snackbar>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddClick}
                >
                    Add New Employee
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveToJSON}
                >
                    Save into JSON
                </Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<ScreenShareIcon />}
                    onClick={sendMonthlyPayroll}
                >
                    Send monthly payroll
                </Button>
            </Stack>
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
                <Table sx={{ minWidth: 650 }} aria-label="employee payroll table">
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Salary</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell>Telephone</TableCell>
                            <TableCell>Joining Date</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employees.map((employee, index) => (
                            <TableRow
                                key={Math.random()}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {formatIndex(index)}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    {employee.name}
                                </TableCell>
                                <TableCell>${employee.salary.toLocaleString()}</TableCell>
                                <TableCell>{employee.address}</TableCell>
                                <TableCell>{employee.telephone}</TableCell>
                                <TableCell>{employee.joiningDate}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {employee.email}
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Edit">
                                        <IconButton onClick={() => handleEditClick(index)} color="primary">
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton onClick={() => onDelete(index, employee.name)} color="error">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {isModalOpen && (
                <EmployeeDialog
                    open={isModalOpen}
                    initialData={selectedEmployee}
                    onSave={handleSaveEmployee}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
}
