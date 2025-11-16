# Project Summary: paeasybooks

This is a Next.js application named "paeasybooks" built with TypeScript. It appears to be an inventory and sales management tool.

## Key Features


Based on the file structure and `docs/blueprint.md`, the application includes the following features:

*   **Product Management:** Creating and displaying products with details like category, SKU, cost, price, and stock quantity.
*   **Sales Management:** Creating sales invoices, and reporting on sales by different time periods.
*   **Expense Tracking:** Logging business expenses.
*   **Dashboard:** A central dashboard to display key metrics like total sales, low stock items, and profit/loss summaries.
*   **AI-Powered Suggestions:** The application plans to use AI to provide reorder suggestions based on historical data.

## Tech Stack

The project uses a modern web development stack:

*   **Framework:** [Next.js](https://nextjs.org/) (v15) with the App Router.
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) with a custom theme.
*   **UI Components:** A rich set of UI components from [shadcn/ui](https://ui.shadcn.com/) are used, located in `src/components/ui`.
*   **Backend:** The use of `@supabase/supabase-js` indicates that [Supabase](https://supabase.com/) is likely used for the database and backend services.
*   **Data Visualization:** [Recharts](https://recharts.org/) is used for creating charts.
*   **Forms:** [React Hook Form](https://react-hook-form.com/) and [Zod](https://zod.dev/) are used for form handling and validation.

## Project Structure

The project follows a standard Next.js App Router structure:

*   `src/app`: Contains the different pages of the application, such as `expenses`, `inventory`, and `sales`.
*   `src/components`: Contains reusable React components, including a large set of UI components from `shadcn/ui`.
*   `src/lib`: Contains utility functions.
*   `docs/blueprint.md`: A document outlining the application's features and style guidelines.

## Scripts

The `package.json` file defines the following scripts:

*   `dev`: Starts the development server with Turbopack.
*   `build`: Builds the application for production.
*   `start`: Starts the production server.
*   `lint`: Lints the codebase using Next.js's built-in ESLint configuration.
*   `typecheck`: Checks for TypeScript errors.
