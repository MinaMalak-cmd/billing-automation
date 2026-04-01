'use server'
import fs from 'fs/promises';
import path from 'path';
import XlsxPopulate from 'xlsx-populate';
import nodemailer from 'nodemailer';
import {
    getCurrentMonth,
    calculateFirstDayOfMonth,
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
        console.log("Generating invoice sheets...");
        await generateInvoiceSheets();
        console.log("Invoice sheets generated successfully.");

        // console.log("Sending billing emails...");
        // await sendBillingEmails();
        // await removeFilesInOutputDirectory();
        console.log("✅ payment sending job finished.");
    } catch (err) {
        console.error("❌ Payment sending job failed:", err);
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
