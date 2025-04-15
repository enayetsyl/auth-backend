# Authentication Microservice

A robust, multi-tenant authentication microservice built with Express, TypeScript, MongoDB (Mongoose), and JWT. This service handles user registration, login, password resets, email verification, token refresh, profile retrieval, and password changes. It is designed to be used centrally by multiple projects via dynamic tenant-based database connections.

## Table of Contents
- [Authentication Microservice](#authentication-microservice)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [Installation](#installation)
  - [Configuration](#configuration)
    - [.env File](#env-file)
  - [Dynamic Parts](#dynamic-parts)
  - [Usage](#usage)
  - [Endpoints](#endpoints)
    - [Public Endpoints](#public-endpoints)
    - [Protected Endpoints (Require JWT in Authorization header)](#protected-endpoints-require-jwt-in-authorization-header)
  - [Testing with Postman](#testing-with-postman)
    - [To Test:](#to-test)
  - [Customizing for Your Project](#customizing-for-your-project)
  - [Final Thoughts](#final-thoughts)

## Overview

This authentication microservice provides a centralized endpoint for managing user authentication across multiple projects. It utilizes a **global user collection** that stores only the core authentication fields (e.g., email, password, username, role, status). Additional project-specific user data can be maintained separately in each project's own database.

Key concepts:
- **Multi-Tenancy:** Requests must include a tenant identifier (e.g., using the `X-Tenant-ID` header) to dynamically load the appropriate MongoDB connection.
- **JWT Authentication:** The service issues tokens signed with a shared secret to be verified across other services.
- **Email Service:** Nodemailer is used to send out emails for account verification and password reset.

## Features

- **User Registration & Email Verification**
- **JWT-Based Login and Token Refresh**
- **Password Reset (Request & Confirmation)**
- **Protected Endpoints (Profile, Logout, Change Password)**
- **Multi-Tenant Support (Dynamic DB Connections)**
- **Logging with Winston**
- **Validation using Zod**

## Installation

1. **Clone the Repository:**

  ```bash
  git clone https://github.com/enayetsyl/auth-backend.git
  cd auth-microservice
  ```

2. **Install Dependencies:**
 ```javascript
  npm install
  ```
 
3. **Setup TypeScript (if not already done):**

```javascript
 npx tsc --init
```

4. **(Optional) Run Tests and Linters:**
If you have scripts defined in your package.json:
```javascript
npm run test
npm run lint
```

5. **Run the Service:**

```javascript
npm run dev
```

## Configuration
### .env File
Create a .env file in the root directory with the necessary environment variables. Example:

```dotenv
# General Environment Settings
NODE_ENV=development
PORT=3000

# JWT Settings
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=1h

# MongoDB Connections
MONGO_URI_DEFAULT=mongodb://localhost:27017/default_db
TENANT_A_MONGO_URI=mongodb://localhost:27017/tenant_a_db
TENANT_B_MONGO_URI=mongodb://localhost:27017/tenant_b_db
TENANT_C_MONGO_URI=mongodb://localhost:27017/tenant_c_db
TENANT_D_MONGO_URI=mongodb://localhost:27017/tenant_d_db

# SMTP Settings for Nodemailer
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM="Auth Service" <no-reply@example.com>
```

## Dynamic Parts

- Tenant Identifier:

The service expects a tenant identifier (e.g., tenantA, tenantB, etc.) in the HTTP header X-Tenant-ID. This drives the dynamic MongoDB connection logic.

- SMTP Configuration:

Customize the SMTP values to match your email provider for features like email verification and password reset.

- JWT Secret & Expiration:

Replace JWT_SECRET with your secure secret. Adjust JWT_EXPIRES_IN as needed for token validity.


## Usage

Once installed and configured, you can integrate this authentication microservice with your project as follows:

1 **Deploy the Service:**
The service is deployed (for example, on Vercel at https://auth-backend-micro-service.vercel.app/) and exposes a RESTful API under /api/v1/auth.

2 **Token-Based Authentication:**
Your other projects (which run on separate servers) must verify tokens issued by this service using the same JWT secret. A middleware that extracts the Authorization header and verifies the token should be implemented in your project.

3 **Multi-Tenancy:**
Ensure that every API call to the authentication service includes the X-Tenant-ID header with the corresponding tenant value. This is how the service dynamically connects to the correct MongoDB instance.

## Endpoints
Below is a summary of available endpoints:

### Public Endpoints
- POST /api/v1/auth/register
  Register a new user.
  Dynamic Part: Ensure the X-Tenant-ID header matches your tenant value.

- POST /api/v1/auth/login
  Login and receive a JWT token.

- POST /api/v1/auth/password-reset
  Request a password reset link.
  Note: The email service sends an email with a reset link (configured via SMTP settings).

- POST /api/v1/auth/password-reset/confirm
  Confirm a password reset with the provided token and new password.

- POST /api/v1/auth/refresh-token
  Refresh an expired (or nearly expired) token for continued access.

- GET /api/v1/auth/verify-email
  Verify a user's email address via a token sent by email.

### Protected Endpoints (Require JWT in Authorization header)
- POST /api/v1/auth/logout
  Log out the user (client-side token deletion or token blacklisting).

- GET /api/v1/auth/profile
  Retrieve user profile data (excluding sensitive fields like password).

- POST /api/v1/auth/change-password
  Change the current password for the authenticated user.

- GET /api/v1/auth/protected
  A sample protected route to test token verification.

## Testing with Postman
A Postman collection is included for quick testing. The collection contains examples for:

- Registering a new user.
- Logging in.
- Requesting a password reset.
- Confirming a password reset.
- Refreshing a token.
- Email verification.
- Accessing protected endpoints (e.g., profile and logout).

### To Test:

1 **Import Collection:**
Import the provided Auth_micro_service_backend.postman_collection.json file into Postman.

2 **Setup Environment Variables:**
Create an environment (e.g., "Local Auth Service") in Postman with:

- host: https://auth-backend-micro-service.vercel.app
- tenantId: e.g., tenantA
- token: (leave blank until you login)
- resetToken: (if testing password reset confirm)

3 **Run Requests:**
Use the collection to test the endpoints. Set the X-Tenant-ID header using the environment variable. For protected endpoints, include an Authorization: Bearer {{token}} header.

## Customizing for Your Project

- Middleware in External Services:
When integrating with other projects, create a JWT verification middleware using the same JWT secret, ensuring seamless token verification.

- User Schema Customization:
The global user model is kept minimal (email, password, username, role, and isActive). If your project requires additional fields, maintain those in a separate (project-specific) user collection.

- Dynamic Connection:
The service uses the X-Tenant-ID header to choose the right MongoDB connection. You may modify the tenant mapping logic in /src/config/dbConfig.ts as needed.

- Email Service:
Adjust your SMTP settings in the .env file to match your email provider if you plan to use email verification or password reset features.

License
This project is licensed under the MIT License. See the LICENSE file for details.

---

## Final Thoughts

This README provides a complete overview and step-by-step instructions for anyone looking to install, configure, and integrate your authentication microservice with their project. It highlights which configuration values are dynamic (like tenant IDs, SMTP credentials, JWT secret, etc.) and how to test the API endpoints using Postman.

You can now include this README.md file in your repository and adjust any details as your project evolves.






