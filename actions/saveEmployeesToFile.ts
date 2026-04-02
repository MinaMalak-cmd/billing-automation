'use server'
import fs from 'fs/promises';
import path from 'path';
import * as XLSX from 'xlsx';
import { Employee } from '../types/empolyee';

const EXCEL_PATH = path.join(process.cwd(), 'data', 'employees.xlsx');
const JSON_PATH = path.join(process.cwd(), 'data', 'employees.json');

export async function saveEmployeesToFile(employees: Employee[], mode: 'excel' | 'json' = 'excel') {
    try {
        if (mode === 'json') {
            await fs.writeFile(JSON_PATH, JSON.stringify(employees, null, 2), 'utf-8');
            return { success: true };
        }

        const excelData = employees.map(emp => ({
            'ID': emp.id,
            'Employee Name': emp.name,
            'Personal Email': emp.email,
            'Personal Number': emp.telephone,
            'Start Date': emp.joiningDate,
            'Current Salary': emp.salary,
            'Address': emp.address
        }));

        // 2. Create a new Worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // 3. Create a new Workbook and append the sheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

        // 4. Write the file to the disk
        // XLSX.writeFile is a synchronous blocking call, which is fine for local scripts,
        // but for Next.js, we'll use XLSX.write to get a buffer and fs to write it.
        const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        await fs.writeFile(EXCEL_PATH, buf);

        return { success: true };

        return { success: true };
    } catch (error) {
        console.error("Failed to save employees:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to write to file"
        };
    }
}
