# Billing Automation

## Project Overview

This Node.js project automates the process of generating and sending billing sheets for team members. It is designed to streamline the monthly billing process by creating individual billing sheets for each employee and emailing them to the billing team.

## Features

- **Excel Sheet Modification**: Reads employee data (name, salary, joining date) from a master sheet and generates a billing sheet for each employee.
- **Automated Monthly Execution**: The process is scheduled to run automatically every month using Node.js scheduling libraries.
- **Email Integration**: Sends the generated billing sheets to the billing team via email using an email-sending library (e.g., Nodemailer).
- **Scalability**: Applies to all team members, ensuring no manual intervention is required.

## How It Works

1. **Data Input**: Reads employee details from a master Excel sheet using a library like `xlsx`.
2. **Billing Sheet Generation**: Creates a personalized billing sheet for each employee.
3. **Email Dispatch**: Sends the generated billing sheets to the billing team via email.
4. **Automation**: Uses a scheduler (e.g., `node-cron`) to ensure the process runs monthly without manual triggers.

## Prerequisites

- Node.js installed on your system.
- Required Node.js libraries: `xlsx`, `nodemailer`, `node-cron`.

## Setup

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Configure the email settings and master Excel sheet path in the configuration file.
4. Run the application or set it up as a service for automated execution.

## Usage

- To run the process manually: `node index.js`.
- To ensure monthly automation, verify the scheduler is correctly configured.

## Contribution

Feel free to contribute by submitting issues or pull requests to improve the project.

## License

This project is licensed under the MIT License.

## To do

- In readEmployees function replace xlsx by xlsx-populate
- Add tests
- Add emailService
  - Add security, Auth, and HTTPS
- Send dynamically and automatically
