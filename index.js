const cron = require('node-cron');
const { sendBillingEmails } = require('./emailService.js');
const { generateInvoiceSheets } = require('./ExcelManipulationService.js');
const fs = require('fs');
const path = require('path');

// Main task runner
async function runMonthlyTask() {
    try {
        console.log("Generating invoice sheets...");
        await generateInvoiceSheets();
        console.log("Invoice sheets generated successfully.");

        console.log("Sending billing emails...");
        await sendBillingEmails();
    } catch (error) {
        console.error("Error in monthly task:", error);
    }
}
async function removeFilesInOutputDirectory() {
    const OUTPUT_DIR = path.join(__dirname, "outputs");
    if (process.env.OUTPUT_TARGET === "local" && fs.existsSync(OUTPUT_DIR)) {
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

// Run immediately (useful for Lambda or manual testing)
// runMonthlyTask();

// Uncomment below 
const everyMonth24th9AMTrigger = "0 9 24 * *"; // to run it on the 24th of every month at 9:00 AM (local time)
const everyMinuteTrigger = "* * * * *"; //for testing purposes

cron.schedule(everyMonth24th9AMTrigger, async () => {
    console.log("⏰ Running task...");
    try {
        await runMonthlyTask(); // Wait for invoice generation + email sending
        await removeFilesInOutputDirectory(); // Then clean up local files
        console.log("✅ Task completed and output directory cleaned.");
    } catch (err) {
        console.error("❌ Error during scheduled task:", err);
    }
});
