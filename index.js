const cron = require('node-cron');
const { sendBillingEmails } = require('./emailService.js');
const { generateInvoiceSheets } = require('./ExcelManipulationService.js');

// Main task runner
async function runMonthlyTask() {
    try {
        console.log("Generating invoice sheets...");
        await generateInvoiceSheets();
        console.log("Invoice sheets generated successfully.");

        console.log("Sending billing emails...");
        await sendBillingEmails();
        console.log("Billing emails sent successfully.");
    } catch (error) {
        console.error("Error in monthly task:", error);
    }
}

// Run immediately (useful for Lambda or manual testing)
// runMonthlyTask();

// Uncomment below to run it on the 24th of every month at 9:00 AM (local time)

// cron.schedule("0 0 9 24 * *", () => {
cron.schedule("0 1 * * * *", () => {
    console.log("Running scheduled monthly task...");
    runMonthlyTask();
});

