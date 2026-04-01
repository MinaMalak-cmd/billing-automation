export function getCurrentMonth() {
    return new Date().toLocaleString("default", { month: "long" });
}

export function calculateFirstDayOfMonth() {
    // Calculate date
    const firstDayOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
    );
    const formattedDate = `${String(firstDayOfMonth.getDate()).padStart(
        2,
        "0"
    )}/${String(firstDayOfMonth.getMonth() + 1).padStart(
        2,
        "0"
    )}/${firstDayOfMonth.getFullYear()}`;

    return formattedDate;
}

export function calculateInvoiceNo(joiningDate: string) {
    // Calculate months difference to get invoice no
    const currentDate = new Date();

    // Calculate months difference
    const years = currentDate.getFullYear() - joiningDate.getFullYear();
    const months = currentDate.getMonth() - joiningDate.getMonth();
    const invoiceNo = years * 12 + months;

    return invoiceNo;
}
