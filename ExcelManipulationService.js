// Here we handle logic related to invoice and payment processing regarding reading and generating invoices
const XLSX = require("xlsx");
const fse = require("fs-extra");
const path = require("path");
const XlsxPopulate = require("xlsx-populate");
const { getCurrentMonth } = require("./utils/utils.js");

const {
  calculateFirstDayOfMonth,
  calculateInvoiceNo,
} = require("./utils/excelUtils");

const EMPLOYEE_FILE = path.join("templates", "employees.xlsx");
const TEMPLATE_FILE = path.join("templates", "invoice.xlsx");
const OUTPUT_DIR = "outputs";

const options = {
  cellDates: true,
  type: "binary",
  cellStyles: true,
  cellText: true,
  cellFormula: true,
  cellHTML: true,
  cellComments: true,
};
function readEmployees() {
  const employeeWorkbook = XLSX.readFile(EMPLOYEE_FILE, options);
  const employeeSheet = employeeWorkbook.Sheets[employeeWorkbook.SheetNames[0]];
  const employees = XLSX.utils.sheet_to_json(employeeSheet);
  return employees;
}
async function generateInvoiceSheets() {
  await fse.ensureDir(OUTPUT_DIR);

  for (const emp of readEmployees()) {
    const workbook = await XlsxPopulate.fromFileAsync(TEMPLATE_FILE);
    const sheet = workbook.sheet(0);
    sheet.cell("B12").value(emp.Name);
    sheet.cell("B13").value(emp.Address);
    sheet.cell("B14").value("Cairo");
    sheet.cell("B15").value(`+20${emp.Telephone}`);
    sheet.cell("B16").value(emp.email);
    sheet.cell("H5").value(calculateFirstDayOfMonth());
    sheet.cell("H7").value(calculateInvoiceNo(emp.joiningDate));
    sheet.cell("H35").value(emp.Salary).style("numberFormat", "$  #,##0.00");
    sheet.cell("F39").value(emp.Name);

    const fileName = `invoice_${emp.Name.replace(/\s+/g, "_")}_${getCurrentMonth()}.xlsx`;
    const filePath = path.join(OUTPUT_DIR, fileName);

    await workbook.toFileAsync(filePath);
  }

  return fse.readdir(OUTPUT_DIR);
}

module.exports = { generateInvoiceSheets };
