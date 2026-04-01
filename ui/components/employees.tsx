'use client';

import {useState} from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';


import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';

import employeesData from '../data/employees.json';
import EmployeeDialog from './employeedialog';
import {Employee} from '../types/types'
import {saveEmployeesToFile} from '../actions/saveEmployeesToFile';

const formatIndex = (index: number) => {
    return (index + 1).toString().padStart(3, '0');
};

export default function Employees() {
    const [employees, setEmployees] = useState<Employee[]>(employeesData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [editIndex, setEditIndex] = useState<number | null>(null);

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
        } else {
            setEmployees([...employees, updatedData]);
        }
        setIsModalOpen(false);
        setEditIndex(null);
    };
    const handleSaveToJSON = async () => {
        await saveEmployeesToFile(employees);
        console.log('Employees saved successfully');
    }
    const sendMonthlyPayroll = async () => {

    }

    return (
        <>
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
