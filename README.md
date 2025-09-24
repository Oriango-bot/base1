
# Oriango MicroFinance

Oriango is a modern, web-based microfinance management system built with Next.js, TypeScript, and MongoDB. It provides a comprehensive platform for both borrowers and administrators, featuring an AI-powered loan eligibility calculator, a dynamic credit scoring system, and secure user management.

## ✨ Features

- **User Authentication**: Secure sign-up and login for borrowers and administrators.
- **Role-Based Access Control**: Different views and permissions for regular users, admins, and super-admins.
- **Loan Application & Management**: Multi-step loan application form with progress saving and a comprehensive dashboard for tracking loan status.
- **AI-Powered Eligibility Calculator**: An interactive tool on the homepage for potential borrowers to estimate their loan eligibility.
- **Dynamic Credit Scoring**: A system that rewards users with points for on-time repayments and successful loan completions, encouraging responsible financial behavior.
- **Admin & Super-Admin Dashboards**: Powerful tools for managing users, loans, user roles, and system settings.
- **API Key Management**: A secure interface for super-admins to create, manage, and revoke API keys for partner integrations.
- **Modern UI/UX**: Built with ShadCN UI components, Tailwind CSS, and Framer Motion for a clean, responsive, and animated user experience.
- **Light & Dark Modes**: A theme switcher for user preference.

## 🚀 Getting Started

To get this project running on your local machine, follow these steps:

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Set Up Environment Variables**:
    Create a `.env` file in the root of your project and add your MongoDB connection string and Gemini API Key:
    ```
    MONGODB_URI="your_mongodb_connection_string"
    GEMINI_API_KEY="your_gemini_api_key"
    ```

3.  **Run the Development Server**:
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:9002`.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) (with `mongodb` driver)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Generative AI**: [Google AI (Gemini)](https://ai.google.dev/) via Genkit
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
- **Authentication**: `bcrypt.js` for password hashing
