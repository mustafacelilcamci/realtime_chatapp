Detailed Project Plan: WhatsApp Web Clone
This project is divided into two separate folders at the root level: one for the frontend (React 18 + TypeScript, Tailwind CSS, Vite) and one for the backend (Node.js + Express, MongoDB, JWT-based token service, server-side QR code generation). Below is a step-by-step outline of the changes and files to be created for each part, with error handling and best practices incorporated.

---

Project Structure
At the project root, create two folders:
/frontend
/backend

The resulting structure should be as follows:
/project-root
  /frontend
    package.json
    tsconfig.json
    vite.config.ts
    tailwind.config.js
    postcss.config.js
    /public
      index.html
    /src
      main.tsx
      App.tsx
      /api
        authAPI.ts
        qrAPI.ts
      /pages
        LoginPage.tsx
        ChatPage.tsx
      /components
        QRCodeDisplay.tsx
      /styles
        globals.css
  /backend
    package.json
    tsconfig.json
    .env
    /src
      index.ts
      /config
        config.ts
      /models
        User.ts
      /middlewares
        authMiddleware.ts
      /controllers
        authController.ts
        qrController.ts
      /routes
        authRoutes.ts
        qrRoutes.ts
      /services
        tokenService.ts
---

## Backend Implementation (Node.js + Express + MongoDB)

### 1. Setup and Configuration

- **File: backend/package.json**
  - List dependencies: `express`, `cors`, `mongoose`, `jsonwebtoken`, `dotenv`, `qrcode`.
  - Include devDependencies for TypeScript such as `ts-node-dev` and corresponding type definitions (`@types/express`, etc.).

- **File: backend/tsconfig.json**
  - Configure TypeScript (target ES6, module CommonJS, outDir as needed).

- **File: backend/.env**
  - Define environment variables:
    - `PORT` (default: 3000)
    - `MONGO_URI` (local or Atlas connection string)
    - `JWT_SECRET` (generated secret key)

- **File: backend/src/config/config.ts**
  - Read environment variables using `dotenv` and export a config object.
  - Handle missing environment variables with appropriate defaults or error messages.

### 2. Server and Database Connection

- **File: backend/src/index.ts**
  - Import and configure `dotenv`, then initialize Express.
  - Apply middleware: `cors()`, `express.json()`, and error logging middleware.
  - Connect to MongoDB using Mongoose with try/catch blocks for connection errors.
  - Import routes from `/routes` (both auth and QR) and mount them (e.g. `/api/auth`, `/api/qr`).
  - Set up a global error handler to catch any unhandled errors.

### 3. Data Models

- **File: backend/src/models/User.ts**
  - Define a Mongoose schema for a User that includes:
    - `username`, `email`, `password` (hashed), and timestamps.
  - Export the User model, and include error handling for validation.

### 4. Middleware for Token Authentication

- **File: backend/src/middlewares/authMiddleware.ts**
  - Create middleware that extracts the JWT token from the `Authorization` header.
  - Use the token service (see next) to verify tokens inside a try/catch block.
  - On success, attach the user info to the request object; on failure, return a 401 Unauthorized response with an appropriate error message.

### 5. Business Logic Controllers

- **File: backend/src/controllers/authController.ts**
  - Implement a **register** function:
    - Validate request data.
    - Check if the user already exists.
    - Hash the password (using bcrypt or similar).
    - Save the user document and return a success message.
  - Implement a **login** function:
    - Validate user credentials.
    - On success, generate a JWT token using the token service.
    - Return the token along with user details.
  - Implement a **tokenCheck** function:
    - Simply return a success response if the middleware validation passed.

- **File: backend/src/controllers/qrController.ts**
  - Implement a **generateQRCode** function:
    - Use the `qrcode` library to generate a QR code as a data URL.
    - Wrap processing in try/catch to handle any generation errors.
    - Return the generated QR code image URL (which will be refreshed on each request).

### 6. Routes

- **File: backend/src/routes/authRoutes.ts**
  - Setup routes for:
    - `POST /register` → `authController.register`
    - `POST /login` → `authController.login`
    - `GET /token-check` → Use `authMiddleware` then `authController.tokenCheck`
  - Ensure proper error handling on each route.

- **File: backend/src/routes/qrRoutes.ts**
  - Setup route for:
    - `GET /generate` → `qrController.generateQRCode`
  - Validate errors and send appropriate HTTP status codes.

### 7. Token Service

- **File: backend/src/services/tokenService.ts**
  - Implement a function `generateToken(userId)` that uses `jsonwebtoken.sign` with the `JWT_SECRET` and an expiration time.
  - Implement a `verifyToken(token)` function that uses `jsonwebtoken.verify` wrapped in try/catch to return decoded user info or throw an error.

---

## Frontend Implementation (React 18 + TypeScript + Tailwind CSS)

### 1. Setup and Configuration

- **File: frontend/package.json**
  - Include dependencies: `react`, `react-dom`, `axios`, `vite`, `tailwindcss`, `postcss`, `autoprefixer`, and TypeScript.

- **File: frontend/tsconfig.json**
  - Use a standard React+TS configuration.

- **File: frontend/vite.config.ts**
  - Configure Vite for a React application.

- **File: frontend/tailwind.config.js**
  - Extend the theme with WhatsApp green (`#25D366`) as your accent color.
  - Set up responsive breakpoints (Mobile: <768px, Tablet: 768px–1024px, Desktop: >1024px).

- **File: frontend/postcss.config.js**
  - Configure PostCSS to use Tailwind CSS and autoprefixer.

- **File: frontend/public/index.html**
  - Create a basic HTML structure that includes the mounting `<div id="root"></div>`.
  - Ensure meta tags for responsiveness and link the compiled CSS.

### 2. Entry Point and Main Application

- **File: frontend/src/main.tsx**
  - Import React, ReactDOM, global styles, and render `<App />` inside `React.StrictMode`.

- **File: frontend/src/App.tsx**
  - Implement routing (or conditional rendering) to show either the Login page or Chat page based on authentication state (read token from localStorage).
  - Include basic navigation and error boundaries if necessary.

### 3. Pages and Components

- **File: frontend/src/pages/LoginPage.tsx**
  - Create a modern, clean login UI with the WhatsApp green theme and system fonts.
  - Include two sections: a login form (with fields for username/email and password, proper ARIA labels, and error messages) and a QR code display area.
  - Use appropriate Tailwind CSS classes for spacing, typography, and smooth animations.
  - Handle form submission with API calls using `authAPI.ts` and store the received token in localStorage.
  - Ensure error handling for failed logins.

- **File: frontend/src/pages/ChatPage.tsx**
  - Build a placeholder chat UI mimicking WhatsApp Web’s layout:
    - Sidebar for contacts.
    - Main chat window with dummy messages.
    - Use responsive design to adjust layout across devices.
  - Prepare the design for future integration of real-time messaging and media sharing.

- **File: frontend/src/components/QRCodeDisplay.tsx**
  - Create a component that fetches the QR code from the backend using the `qrAPI.ts` module.
  - Use the `useEffect` hook with `setInterval` to trigger a new QR code fetch every 30 seconds.
  - Render an `<img>` tag with the `src` set to the fetched data URL.
  - Add an `onerror` handler to display a fallback text message if the image fails to load.
  - Ensure the `alt` attribute is descriptive: e.g. "Client-generated QR code for secure login, auto-refreshed every 30 seconds."

### 4. API Integration

- **File: frontend/src/api/authAPI.ts**
  - Create functions to interact with backend authentication endpoints (`/api/auth/register`, `/api/auth/login`, and `/api/auth/token-check`).
  - Use Axios for HTTP requests and include error handling (try/catch) for network errors.
  - Store and manage the token in localStorage and inject it into request headers when needed.

- **File: frontend/src/api/qrAPI.ts**
  - Create a function to call the backend endpoint `/api/qr/generate` for fetching the latest QR code.
  - Incorporate proper error handling and return the QR code URL to the component.

---

## UI/UX and Best Practices

- Use Tailwind CSS classes for a pixel-perfect, responsive layout and modern typography.
- Ensure smooth animations for loading states (e.g., fading in the QR code after each refresh).
- Apply ARIA labels for accessibility in forms and interactive elements.
- Maintain error handling on both API calls (frontend) and controller logic (backend) with clear error messaging.
- The login form and chat interface are built with a clean layout, focusing on whitespace, typography, and consistent WhatsApp green (#25D366) accents.
- All network service calls (for token validations and QR generation) use try/catch blocks, and appropriate HTTP status feedback is returned.
- Implement modular coding practices: separate concerns in controllers, routes, and services on the backend; and use components and custom hooks on the frontend.

---

## Testing and Deployment Considerations

- Perform API endpoint testing using curl commands (e.g., testing `/api/auth/login`, `/api/qr/generate`) with proper HTTP status and JSON validation.
- Validate responsive UI designs using browser developer tools.
- For deployment, the frontend will be deployed on Netlify, while the backend can be hosted on a Node-friendly platform (Heroku, Render, etc.). Adjust environment variables accordingly.
- Ensure proper handling of JWT token expiry and secure password hashing for production.

---

## Summary

- The project is separated into **/frontend** (React, Tailwind, Vite) and **/backend** (Express, MongoDB, JWT, QR generation).
- Backend files include configuration, user model, auth and QR controllers, routes, and token service with robust error handling.
- Frontend features a responsive login page with auto-refreshing QR code and a placeholder chat page mimicking WhatsApp Web design.
- API integration is handled via Axios with proper error management, ensuring secure token storage and validation.
- UI/UX adheres to modern design principles with smooth animations, accessibility, and the WhatsApp green theme.
- Deployment strategies and testing methods (using curl) are outlined for both parts.
