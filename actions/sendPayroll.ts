'use server'
import fs from 'fs/promises';
import path from 'path';
// @ts-ignore
import XlsxPopulate from 'xlsx-populate';
import nodemailer from 'nodemailer';
import * as XLSX from 'xlsx';
import {
    getCurrentMonth,
    calculateTodayDate,
    calculateInvoiceNo,
    getCurrentMonthAsString
} from '../utils/utils';
import { Employee } from '../types/empolyee';
import {cleanDirectory} from "../utils/fileUtils";

/**
 * Server Action to process employee payroll:
 * 1. Reads current employee data from local JSON.
 * 2. Generates individual Excel invoices from a template.
 * 3. Emails all invoices as attachments.
 * 4. Cleans up the temporary output directory.
*/
const DATA_PATH = path.join(process.cwd(), 'data', 'employees.json');
const TEMPLATE_PATH = path.join(process.cwd(), 'templates', 'invoice.xlsx');
const OUTPUT_DIR = path.join(process.cwd(), 'outputs');
const JSON_PATH = path.join(process.cwd(), 'data', 'employees.json');
const EXCEL_PATH = path.join(process.cwd(), 'data', 'employees.xlsx');

export async function processPayrollAndEmail (
    source: 'json' | 'excel',
    toEmails: string[],
    ccEmails: string[]
) {
    try {
        const { EMAIL_USER, EMAIL_PASS } = process.env;
        if (!EMAIL_USER || !EMAIL_PASS) {
            return {
                success: false,
                error: "Server configuration missing: Please check your .env file."
            };
        }

        await fs.mkdir(OUTPUT_DIR, { recursive: true });

        let employees: Employee[] = [];
        // --- FLAG LOGIC: SELECT DATA SOURCE ---
        if (source === 'json') {
            console.log('Reading from JSON...');
            const rawData = await fs.readFile(JSON_PATH, 'utf-8');
            employees = JSON.parse(rawData);
        } else {
            console.log('Reading from Excel...');
            const fileBuffer = await fs.readFile(EXCEL_PATH);
            const workbook = XLSX.read(fileBuffer, {
                type: 'buffer',
                cellDates: true
            });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const rawRows = XLSX.utils.sheet_to_json(worksheet);

            // Map Excel headers to Employee Interface
            employees = rawRows.map((row: any) => ({
                name: row['Employee Name'],
                email: row['Personal Email'],
                salary: row['Current Salary'],
                telephone: row['Personal Number'],
                address: row['Address'],
                joiningDate: row['Start Date'] || "",
                id: row['ID']
            }));
        }

        const rawData = await fs.readFile(DATA_PATH, 'utf-8');
        console.log('employees ', employees[0]);
        if (!employees || employees.length === 0) {
            return { success: false, error: "The employee list is currently empty." };
        }
        const generatedFiles: string[] = [];

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

        const employeeListHtml = employees
            .map(emp => `<li><strong>${emp.name}</strong> (${emp.email})</li>`)
            .join('');

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: EMAIL_USER, pass: EMAIL_PASS },
        });

        await transporter.sendMail({
            from: `"Nexspec Payroll" <${EMAIL_USER}>`,
            to: toEmails.join(','),
            cc: ccEmails.join(','),
            subject: `Monthly Payroll Invoices - ${getCurrentMonthAsString()} ${new Date().getFullYear()}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px;">
                    <h2 style="color: #2e7d32; border-bottom: 2px solid #2e7d32; padding-bottom: 10px;">
                        Monthly Payroll Report
                    </h2>
                    <p>Hello,</p>
                    <p>The payroll processing for <strong>${getCurrentMonthAsString()}</strong> has been completed successfully.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #2e7d32; margin: 20px 0;">
                        <p style="margin-top: 0;"><strong>Summary:</strong></p>
                        <ul style="margin-bottom: 0;">
                            <li>Total Invoices: ${employees.length}</li>
                            <li>Date Generated: ${calculateTodayDate()}</li>
                        </ul>
                    </div>

                    <p><strong>Processed Recipients:</strong></p>
                    <ul style="color: #555;">
                        ${employeeListHtml}
                    </ul>

                    <p style="font-size: 0.9em; color: #777; margin-top: 30px;">
                        <em>This is an automated message. All individual invoice sheets are attached to this email.</em>
                    </p>
                </div>
            `,
            attachments: generatedFiles.map(file => ({
                filename: path.basename(file),
                path: file
            }))
        });

        // 4. Automatic Cleanup
        await cleanDirectory(OUTPUT_DIR);
        return {
            success: true,
            message: `Successfully sent ${generatedFiles.length} invoices for ${getCurrentMonthAsString()}.`
        };
    } catch (error: unknown) {
        // Proper TypeScript error handling
        const errorMessage = error instanceof Error ? error.message : "An unexpected server error occurred.";
        console.error("Payroll Action Error:", error);
        return { success: false, error: errorMessage };
    };
}


