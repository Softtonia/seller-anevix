# Anevix Frontend Setup

This project is built with Next.js, MUI, and Bootstrap.

## Setup Instructions

1.  **Add Fonts**: I have created the directory structure for fonts in `public/assets/fonts/`. Please place your `.ttf` files in their respective folders:
    *   `public/assets/fonts/Poppins/`
        *   `Poppins-Regular.ttf`
        *   `Poppins-Bold.ttf`
        *   `Poppins-SemiBold.ttf`
        *   `Poppins-Medium.ttf`
        *   `Poppins-Thin.ttf`
    *   `public/assets/fonts/Inter/`
        *   `Inter-Regular.ttf`
        *   `Inter-Bold.ttf`
        *   `Inter-SemiBold.ttf`
        *   `Inter-Medium.ttf`
        *   `Inter-Thin.ttf`

2.  **Dependencies**: All required dependencies (MUI, Bootstrap, Lucide, etc.) have been installed.

3.  **Run the Project**:
    ```bash
    npm run dev
    ```

## Project Structure

*   `app/`: Next.js App Router files.
*   `components/`: Reusable components (Header, Footer, ThemeRegistry).
*   `public/`: Static assets (Logo, Fonts).
*   `styles/`: Global styles.

## Header & Footer

*   **Header**: Implemented with a search bar, location selector, and user actions (Wishlist, Cart, Profile).
*   **Footer**: Professional multi-column footer.
*   **Theme**: MUI Theme configured with Poppins and Inter fonts.
