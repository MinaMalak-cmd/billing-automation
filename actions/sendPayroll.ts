'use server'
import fs from 'fs/promises';
import path from 'path';
import XlsxPopulate from 'xlsx-populate';
import nodemailer from 'nodemailer';
import {
    getCurrentMonth,
    calculateTodayDate,
    calculateInvoiceNo
} from '../utils/utils';
import { Employee } from '../types/types';

/**
 * Server Action to process employee payroll:
 * 1. Reads current employee data from local JSON.
 * 2. Generates individual Excel invoices from a template.
 * 3. Emails all invoices as attachments.
 * 4. Cleans up the temporary output directory.
*/

export async function processPayrollAndEmail () {
    try {
        console.log('Processing Payroll');
        const { EMAIL_USER, EMAIL_PASS, EMAIL_TO } = process.env;
        if (!EMAIL_USER || !EMAIL_PASS || !EMAIL_TO) {
            console.log('Please enter a valid email address', process.env);
            return {
                success: false,
                error: "Server configuration missing: Please check your .env.local file."
            };
        }

        // 2. Define Paths
        const DATA_PATH = path.join(process.cwd(), 'data', 'employees.json');
        const TEMPLATE_PATH = path.join(process.cwd(), 'templates', 'invoice.xlsx');
        const OUTPUT_DIR = path.join(process.cwd(), 'outputs');

        console.log('Creating a missing directory');
        // 3. Ensure Directories exist & Read Data
        await fs.mkdir(OUTPUT_DIR, { recursive: true });
        console.log('Creating an empty directory');

        const rawData = await fs.readFile(DATA_PATH, 'utf-8');
        const employees: Employee[] = JSON.parse(rawData);
        console.log('employees ', employees[0]);
        if (!employees || employees.length === 0) {
            return { success: false, error: "The employee list is currently empty." };
        }
        const generatedFiles: string[] = [];

        // 4. Generate Excel Files
        for (const emp of employees) {
            // Load the Excel Template
            const workbook = await XlsxPopulate.fromFileAsync(TEMPLATE_PATH);
            const sheet = workbook.sheet(0);

            // Populate Cells (Mapping JSON keys to Excel Coordinates)
            sheet.cell("B12").value(emp.name);
            sheet.cell("B14").value("Cairo");
            sheet.cell("F39").value(emp.name);
            sheet.cell("B13").value(emp.address);
            sheet.cell("B15").value(`+20${emp.telephone}`);
            sheet.cell("B16").value(emp.email);

            // Logic for Invoice Dates and Numbers from Utils
            sheet.cell("H5").value(calculateTodayDate());
            sheet.cell("H7").value(calculateInvoiceNo(emp.joiningDate));

            // Financial Formatting (Ensuring salary is a number)
            const salaryValue = typeof emp.salary === 'string' ? parseFloat(emp.salary) : emp.salary;
            sheet.cell("H35").value(salaryValue).style("numberFormat", "$  #,##0.00");

            sheet.cell("F39").value(emp.name);

            // Create a safe filename (remove spaces and special characters)
            const safeName = emp.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const fileName = `invoice_${safeName}_${getCurrentMonth()}.xlsx`;
            const filePath = path.join(OUTPUT_DIR, fileName);

            // Write individual file to disk
            await workbook.toFileAsync(filePath);
            generatedFiles.push(filePath);
        }
        console.log('generatedFiles', generatedFiles);
        return {
            success: true,
            error: "New invoices was successfully created!"
        };
        // 5. Initialize Nodemailer Transporter
        // const transporter = nodemailer.createTransport({
        //     service: "gmail",
        //     auth: {
        //         user: EMAIL_USER,
        //         pass: EMAIL_PASS
        //     },
        // });
        console.log("✅ payment sending job finished.");
    } catch (error: unknown) {
        // Proper TypeScript error handling
        const errorMessage = error instanceof Error ? error.message : "An unexpected server error occurred.";
        console.error("Payroll Action Error:", error);
        return { success: false, error: errorMessage };
    }
}

async function removeFilesInOutputDirectory() {
    const OUTPUT_DIR = path.join(process.cwd(), "outputs");
    if (fs.existsSync(OUTPUT_DIR)) {
        const files = fs.readdirSync(OUTPUT_DIR);
        console.log('OUTPUT_DIR', OUTPUT_DIR, files)
        for (const file of files) {
            console.log(`Removing file: ${file}`);
            const filePath = path.join(OUTPUT_DIR, file);
            const stat = fs.statSync(filePath);
            if (stat.isFile()) {
                fs.unlinkSync(filePath);
            }
        }
        console.log("All files in 'outputs/' directory removed successfully.");
    } else {
        console.log("Output directory does not exist or OUTPUT_TARGET is not 'local'.");
    }
}
