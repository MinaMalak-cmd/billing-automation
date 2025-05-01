// Here we handle logic related to billing and payment processing regarding reading and generating invoices
// const { readFileSync, writeFileXLSX } = require("xlsx");
const XLSX = require("xlsx");
const fse = require("fs-extra");
const path = require("path");

const EMPLOYEE_FILE = path.join("templates", "employees.xlsx");
const TEMPLATE_FILE = path.join("templates", "billing.xlsx");
const OUTPUT_DIR = "outputs";

async function generateBillingSheets() {
  await fse.ensureDir(OUTPUT_DIR);
  const employeeWorkbook = XLSX.readFile(EMPLOYEE_FILE);
  const employeeSheet = employeeWorkbook.Sheets[employeeWorkbook.SheetNames[0]];
  const employees = XLSX.utils.sheet_to_json(employeeSheet);
  console.log("employees", employees);
  for (const emp of employees) {
    const templateWorkbook = XLSX.readFile(TEMPLATE_FILE);
    const sheet = templateWorkbook.Sheets[templateWorkbook.SheetNames[0]];

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

    // Calculate months difference to get invoice no
    const joiningDate = new Date(emp.JoiningDate);
    const currentDate = new Date();

    // Calculate months difference
    console.log("joiningDate", joiningDate);
    const years = currentDate.getFullYear() - joiningDate.getFullYear();
    const months = currentDate.getMonth() - joiningDate.getMonth();

    console.log("years", years, "months", months);
    // parse joiningDate
    const totalMonths = years * 12 + months;

    // Fill the billing sheet with employee data
    sheet["B12"] = { t: "s", v: emp.Name };
    sheet["B13"] = { t: "s", v: emp.Address };
    sheet["B14"] = { t: "s", v: "Cairo" };
    sheet["B15"] = { t: "s", v: `+20${emp.Telephone}` };
    sheet["B16"] = { t: "s", v: emp.email };
    sheet["H5"] = { t: "s", v: formattedDate };
    sheet["H7"] = { t: "n", v: totalMonths, z: "0" };
    sheet["H35"] = { t: "n", v: emp.Salary, z: "$   #,##0.00" };
    sheet["F39"] = { t: "s", v: emp.Name };

    const fileName = `billing_${emp.Name.replace(/\s+/g, "_")}.xlsx`;
    const filePath = path.join(OUTPUT_DIR, fileName);
    XLSX.writeFile(templateWorkbook, filePath);
  }

  return fse.readdir(OUTPUT_DIR);
}
console.log("generateBillingSheets", generateBillingSheets());
module.exports = { generateBillingSheets };
