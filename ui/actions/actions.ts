'use server'

import fs from 'fs/promises';
import path from 'path';
import { Employee } from '../types/types';

export async function saveEmployeesToFile(employees: Employee[]) {
    try {
        const filePath = path.join(__dirname, 'data', 'employees.json');

        // Ensure the directory exists
        const dirPath = path.dirname(filePath);
        await fs.mkdir(dirPath, { recursive: true });

        // Write the file
        await fs.writeFile(filePath, JSON.stringify(employees, null, 2), 'utf-8');

        return { success: true };
    } catch (error) {
        console.error("Failed to save JSON:", error);
        return { success: false, error: "Disk Write Failed" };
    }
}
