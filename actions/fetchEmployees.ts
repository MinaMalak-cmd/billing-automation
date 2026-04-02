'use server'

import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs/promises';
import { Employee } from '../types/empolyee';

const EXCEL_PATH = path.join(process.cwd(), 'data', 'employees.xlsx');
const JSON_PATH = path.join(process.cwd(), 'data', 'employees.json');

export async function fetchEmployees(mode: 'excel' | 'json'): Promise<Employee[]> {
    try {
        if (mode === 'json') {
            const data = await fs.readFile(JSON_PATH, 'utf-8');
            return JSON.parse(data);
        }

        // Excel Reading Logic
        const workbook = XLSX.readFile(EXCEL_PATH);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Map Excel columns to your Employee interface
        const rawData = XLSX.utils.sheet_to_json(worksheet);

        return rawData.map((row: any) => ({
            id: row['ID'],
            name: row['Employee Name'],
            email: row['Personal Email'],
            salary: row['Current Salary'],
            telephone: row['Personal Number'],
            address: row['Address'],
            joiningDate: row['Start Date']
        })) as Employee[];

    } catch (error) {
        console.error("Failed to fetch employees:", error);
        return [];
    }
}
