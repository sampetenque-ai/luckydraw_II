# HR Magic Tools (LuckyDraw II)

A React-based HR utility application featuring Lucky Draw and Auto Grouping capabilities, powered by AI.

## Features

-   **Name Management**: Easy input and management of participant lists.
-   **Lucky Draw**:
    -   Visualize raffle with sound effects and confetti.
    -   **New**: Export winners list to CSV.
    -   **New**: Safe "Clear Winners" functionality with confirmation modal.
-   **Auto Grouping**: Intelligent grouping powered by Google Gemini AI.

## Technical Setup (Completed Tasks)

The following configurations have been applied to the project as per requirements:

1.  **Package Management**:
    -   `package.json` is configured with `vite` and `react`.
    -   **Tailwind CSS** has been migrated from CDN to a local build process (npm packages) for better performance and maintainability.
2.  **CI/CD**:
    -   GitHub Actions workflow (`.github/workflows/deploy.yml`) is set up to automatically build and deploy to **GitHub Pages** on push to `main`.
3.  **Git Configuration**:
    -   `.gitignore` is configured to exclude `node_modules`, `.env` files, and build artifacts (`dist`).

## Local Development

### Prerequisites
-   Node.js (v18 or higher recommended)
-   Gemini API Key (for AI features)

### Installation
1.  Clone the repository.
2.  Install all dependencies (including the newly added Tailwind CSS):
    ```bash
    npm install
    ```
    *Note: This will also generate/update your `package-lock.json`.*

### Environment Variables
1.  Create a `.env` or `.env.local` file in the root directory.
2.  Add your API key:
    ```
    GEMINI_API_KEY=your_api_key_here
    ```

### Running the App
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Deployment

This project uses **GitHub Actions** for deployment.

1.  **Push to GitHub**: Commit your changes and push to the `main` branch.
2.  **Automatic Build**: The Action will trigger, install dependencies, build the project, and deploy the `dist` folder to the `gh-pages` branch.
3.  **Settings**: In your GitHub Repository, go to **Settings > Pages** and ensure the "Source" is set to "Deploy from a branch" and select `gh-pages` / `/ (root)`.

## Project Structure
-   `src/components`: UI Components
-   `src/services`: API services
-   `.github/workflows`: Deployment scripts
-   `tailwind.config.js` & `postcss.config.js`: CSS framework configuration
