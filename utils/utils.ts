export function getCurrentMonth() {
    return new Date().toLocaleString("default", { month: "long" });
}
/**
 * Retrieves the current date formatted as a string for Excel.
 * Default format: DD/MM/YYYY
 * @returns {string} The current date
 */
export function calculateTodayDate(): string {
    const today = new Date();

    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = today.getFullYear();

    return `${day}/${month}/${year}`;
}

/**
 * Calculates the invoice number based on the number of months
 * between the joining date and the current date.
 * * @param joiningDateString - Date string in YYYY-MM-DD format
 * @returns The total number of months (Invoice No)
 */
export function calculateInvoiceNo(joiningDateString: string): string {
    if (!joiningDateString) return "000";

    const currentDate = new Date();
    const joiningDate = new Date(joiningDateString);

    // Safety check: Ensure the date is valid
    if (isNaN(joiningDate.getTime())) {
        console.error("Invalid joining date provided:", joiningDateString);
        return "000";
    }

    // Calculate total months difference
    const yearsDiff = currentDate.getFullYear() - joiningDate.getFullYear();
    const monthsDiff = currentDate.getMonth() - joiningDate.getMonth();

    let totalMonths = yearsDiff * 12 + monthsDiff;

    // Optional: Ensure invoice number isn't negative if joining date is in the future
    totalMonths = Math.max(0, totalMonths);

    // Format to 3 digits (e.g., 5 -> "005") to match your UI style
    return totalMonths.toString().padStart(2, '0');
}

/**
 * Returns the full name of the current month (e.g., "April")
 */
export function getCurrentMonthAsString(): string {
    const today = new Date();

    // Uses the internationalization API to get the full month name
    return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(today);
}
