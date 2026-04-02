'use client';

import {useState, useEffect} from 'react';
// Material UI Imports
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Box, Tooltip, IconButton, Button, Stack, Snackbar, Alert,
    TextField, Typography
} from '@mui/material';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';

// Local Assets/Actions
import EmployeeDialog from './employeedialog';
import {Employee} from '../types/empolyee'
import {saveEmployeesToFile} from '../actions/saveEmployeesToFile';
import {processPayrollAndEmail} from '../actions/sendPayroll';
import {fetchEmployees} from "../actions/fetchEmployees";

const MODE: 'excel' | 'json' = 'excel';

/**
 *
 * @deprecated We no longer use index but employeeId
 */
// const formatIndex = (index: number) => {
//     return (index + 1).toString().padStart(3, '0');
// };

export default function Employees() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    console.log('Employees', employees);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
        open: false,
        message: '',
        severity: 'success',
    });
    const [toEmails, setToEmails] = useState<string>("");
    const [ccEmails, setCcEmails] = useState<string>("");

    // Save to Local Storage whenever they change
    useEffect(() => {
        localStorage.setItem('payroll_to', toEmails);
        localStorage.setItem('payroll_cc', ccEmails);
    }, [toEmails, ccEmails]);
    // Load from Local Storage on Mount
    useEffect(() => {
        const savedTo = localStorage.getItem('payroll_to');
        const savedCc = localStorage.getItem('payroll_cc');
        if (savedTo) setToEmails(savedTo);
        if (savedCc) setCcEmails(savedCc);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const data = await fetchEmployees(MODE);
            console.log('testData', data)
            setEmployees(data);
            setLoading(false);
        };
        loadData();
    }, []);

    const triggerAlert = (message: string, severity: 'success' | 'error' | 'info' = 'success') => {
        setAlert({ open: true, message, severity });
    };
    const handleCloseAlert = () => {
        setAlert({ ...alert, open: false });
    };
    const handleAddClick = () => {
        setSelectedEmployee(null);  // Ensure form is empty
        setEditingId(null);         // Ensure we aren't in edit mode
        setIsModalOpen(true);
    };
    const onDelete = (id: string, name: string) => {
        const confirmDelete = window.confirm(`Are you sure you want to remove this employee: ${name}?`);
        if (confirmDelete) {
            setEmployees(prev => prev.filter((employee) => employee.id !== id));
            triggerAlert(`Employee "${name}" removed from the empolyees list.`, 'info');
        }
    };
    const handleEditClick = (id: string) => {
        const employeeToEdit = employees.find(emp => emp.id === id);
        if (employeeToEdit) {
            setSelectedEmployee(employeeToEdit);
            // If you still need the array index for updating:
            setEditingId(id);
            setIsModalOpen(true);
        }
    };
    const handleSaveEmployee = (updatedData: Employee) => {
        if (editingId !== null) {
            // FIX: Use .map() to update the specific employee by ID
            setEmployees(prev =>
                prev.map(emp => emp.id === editingId ? updatedData : emp)
            );
            triggerAlert("Employee updated successfully!");
        } else {
            // FIX: Generate a unique ID for new employees if the dialog doesn't provide one
            const newId = updatedData.id || `EMP-${Date.now()}`;
            setEmployees(prev => [...prev, { ...updatedData, id: newId }]);
            triggerAlert("New employee added to the list!");
        }
        setIsModalOpen(false);
        setEditingId(null);
    };
    const handleSaveToJSON = async () => {
        try {
            setLoading(true);
            const result = await saveEmployeesToFile(employees);
            setLoading(false);
            if (result.success) {
                triggerAlert(`${MODE.toUpperCase()} file updated successfully!`, "success");
            } else {
                triggerAlert("Failed to save to file.", "error");
            }
        } catch (err) {
            setLoading(false);
            triggerAlert("An error occurred while saving.", "error");
        }
    }
    const sendMonthlyPayroll = async () => {
        if (!toEmails) {
            triggerAlert("Please enter at least one recipient in 'To'", "error");
            return;
        }

        // Convert strings to arrays
        const toArray = toEmails.split(',').map(e => e.trim()).filter(e => e);
        const ccArray = ccEmails.split(',').map(e => e.trim()).filter(e => e);

        triggerAlert(`Processing payroll via ${MODE}...`, "info");
        try {
            const result = await processPayrollAndEmail(MODE, toArray, ccArray);
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
            <Stack spacing={2} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                <Typography variant="subtitle2">Email Settings (Saved Locally)</Typography>
                <Stack direction="row" spacing={2}>
                    <TextField
                        fullWidth
                        label="To (comma separated)"
                        variant="outlined"
                        size="small"
                        value={toEmails}

                        onChange={(e) => setToEmails(e.target.value)}
                        placeholder="boss@company.com, HR@company.com"
                    />
                    <TextField
                        fullWidth
                        label="CC (comma separated)"
                        variant="outlined"
                        size="small"
                        value={ccEmails}
                        onChange={(e) => setCcEmails(e.target.value)}
                    />
                </Stack>
            </Stack>
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
                    {MODE === "excel" ? 'Save into Excel' : 'Save into JSON'}
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
                        {employees.map((employee) => (
                            <TableRow
                                key={employee.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {employee.id}
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
                                        <IconButton onClick={() => handleEditClick(employee.id)} color="primary">
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton onClick={() => onDelete(employee.id, employee.name)} color="error">
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
