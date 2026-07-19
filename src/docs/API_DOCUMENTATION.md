# Genesis Tech Fest API

**Version:** 1.0.0

API documentation for the Genesis Tech Fest platform authentication and registration.

## Base URLs

- `https://api.genesis.ivws.edu/v1` - Production Server
- `http://localhost:3000/v1` - Local Development Server

## Endpoints

### Authentication

Endpoints for school registration and login

#### POST /auth/register

**Register a new school**

Registers a participating school for the Genesis Tech Fest. The teacher-in-charge details are required.

**Responses:**

- **201**: School successfully registered.
- **400**: Invalid input parameters.

---

#### POST /auth/login

**School Login**

Authenticates a school using their designated School Code and Password.

**Responses:**

- **200**: Successfully authenticated.
- **401**: Unauthorized — Invalid school code or password.

---