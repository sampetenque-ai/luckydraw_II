# HR Magic Tools (LuckyDraw II)

A React-based HR utility application featuring Lucky Draw and Auto Grouping capabilities, powered by AI.

## Features

-   **Name Management**: Easy input and management of participant lists.
-   **Lucky Draw**:
    -   Visualize raffle with sound effects and confetti.
    -   **New**: Export winners list to CSV.
    -   **New**: Safe "Clear Winners" functionality with confirmation modal.
-   **Auto Grouping**: Intelligent grouping powered by Google Gemini AI.

## Local Development

### Prerequisites
-   Node.js (v18 or higher recommended)
-   Gemini API Key (for AI features)

### Installation
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    -   Create `.env.local` in the root directory.
    -   Add your API key: `GEMINI_API_KEY=your_api_key_here`

### Running
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the port shown in terminal).

## Deployment

This project is configured for automatic deployment to **GitHub Pages** using GitHub Actions.

### How to Deploy
1.  Push your changes to the `main` branch.
2.  The GitHub Action defined in `.github/workflows/deploy.yml` will automatically:
    -   Install dependencies.
    -   Build the project.
    -   Deploy the `dist` folder to the `gh-pages` branch.
3.  Go to your repository settings -> Pages, and ensure the source is set to `gh-pages` branch.

### Manual Build
To build the project locally for production:
```bash
npm run build
```
The output will be in the `dist` directory.

## Project Structure
-   `src/components`: UI Components (LuckyDraw, AutoGrouping, etc.)
-   `src/services`: API services (Gemini integration)
-   `.github/workflows`: CI/CD configurations
