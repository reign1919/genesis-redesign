# Genesis Tech Fest API Documentation

**Version:** 1.0.0  
**Host Site:** `genesisfest.ivwschool.com`  
**Format:** REST / JSON  

Official public API reference for the Genesis Tech Fest platform, covering school registration, authentication, and school dashboard data endpoints.

---

## Overview & Base URLs

All API endpoints accept and return standard JSON payloads (`Content-Type: application/json`).

| Environment | Service Type | Base URL |
| :--- | :--- | :--- |
| **Production Server** | Auth & API Routing | `https://genesisfest.ivwschool.com/v1` |
| **Supabase Edge Functions** | Registration & Credentials | `https://kcnmvggxqcxlbbfgtrwq.supabase.co/functions/v1` |

---

## Authentication & Headers

Endpoints requiring school authentication expect a standard JWT Bearer token in the HTTP `Authorization` header:

```http
Authorization: Bearer <YOUR_ACCESS_TOKEN>
Content-Type: application/json
```

---

## Standard Response Structure

Unless explicitly noted (such as direct auth token responses), Genesis Edge Function endpoints return a consistent JSON response envelope:

```json
{
  "ok": true,
  "code": "STATUS_CODE",
  "message": "Human-readable status or notification message",
  "requestId": "f81d4fae-7dec-11d0-a765-00a0c91e6bf6"
}
```

### Common Error Codes

| HTTP Status | Error Code | Description |
| :--- | :--- | :--- |
| `400` | `INVALID_PAYLOAD` | Missing required parameters or invalid field formatting. |
| `401` | `AUTH_REQUIRED` | Missing or expired authorization token. |
| `403` | `FORBIDDEN` | Access denied or unauthorized origin. |
| `409` | `ALREADY_PENDING` | School application is already registered or pending review. |
| `429` | `RATE_LIMITED` | Rate limit exceeded. Please try again later. |
| `503` | `SERVICE_UNAVAILABLE` | Backend service or enrollment is temporarily unavailable. |

---

## Public Endpoints

### 1. Submit School Registration

#### `POST /submit-registration`
> **Service:** Supabase Edge Functions  
> **Endpoint:** `https://kcnmvggxqcxlbbfgtrwq.supabase.co/functions/v1/submit-registration`

Submits a new school registration application for Genesis Tech Fest.

##### Request Headers
```http
Content-Type: application/json
```

##### Request Body

| Field | Type | Required | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `schoolName` | `string` | **Yes** | 2–120 chars | Official name of the participating school. |
| `teacherWhatsapp` | `string` | **Yes** | E.164 pattern (`^\+[1-9][0-9]{7,14}$`) | WhatsApp number of teacher-in-charge. |

> [!IMPORTANT]  
> **Note on E.164 WhatsApp Formatting:** The leading `+` prefix and international country code are strictly required by backend validation (`^\+[1-9][0-9]{7,14}$`). Raw 10-digit local numbers (e.g. `9876543210`) or numbers missing the leading `+` (e.g. `919876543210`) will fail validation with error code `INVALID_PHONE`. Frontends must format or validate user inputs to include `+` and country code (e.g. `+919876543210`) prior to submission.

##### Example Request Body
```json
{
  "schoolName": "Indus Valley World School",
  "teacherWhatsapp": "+919876543210"
}
```

##### Example Responses

- **`201 Created` — Registration Submitted**
```json
{
  "ok": true,
  "code": "REGISTRATION_SUBMITTED",
  "message": "Application received. The core committee will contact approved schools on WhatsApp.",
  "requestId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
}
```

- **`400 Bad Request` — Invalid Input**
```json
{
  "ok": false,
  "code": "INVALID_SCHOOL_NAME",
  "message": "Enter a school name between 2 and 120 characters.",
  "requestId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
}
```

- **`409 Conflict` — Already Registered**
```json
{
  "ok": false,
  "code": "ALREADY_PENDING",
  "message": "Your school registration is already awaiting review.",
  "requestId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
}
```

---

### 2. School Login

#### `POST /auth/login`
> **Service:** Production Server / Auth  
> **Endpoint:** `https://genesisfest.ivwschool.com/v1/auth/login`

Authenticates an approved school using their designated school code and password.

##### Request Headers
```http
Content-Type: application/json
```

##### Request Body

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `school_code` | `string` | **Yes** | School identifier code (e.g., `GEN-0001`). |
| `password` | `string` | **Yes** | Assigned 16-character school password. |

##### Example Request Body
```json
{
  "school_code": "GEN-0001",
  "password": "xK8#mP2$nL9@qW4!"
}
```

##### Example Responses

> [!NOTE]  
> **Note on Response Envelope Exception:** The login endpoint communicates directly with the Authentication provider and bypasses the standard `ok` / `code` / `message` response envelope on successful login. On HTTP 200 OK, it returns standard OAuth2 token properties (`access_token`, `token_type`, `user`). Frontend implementations should verify login success by checking the HTTP status or checking for `access_token`, rather than inspecting `data.ok`.

- **`200 OK` — Login Successful**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "email": "gen-0001@schools.genesis.invalid"
  }
}
```

- **`401 Unauthorized` — Invalid Credentials**
```json
{
  "ok": false,
  "code": "AUTH_INVALID",
  "message": "Invalid school code or password.",
  "requestId": "a2b3c4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d"
}
```

---

### 3. Retrieve School Dashboard Data

#### `GET /school-credentials`
> **Service:** Supabase Edge Functions  
> **Endpoint:** `https://kcnmvggxqcxlbbfgtrwq.supabase.co/functions/v1/school-credentials`

Fetches authenticated school profile details, registration status, and event dashboard credentials.

##### Request Headers
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

##### Example Response (`200 OK`)
```json
{
  "ok": true,
  "code": "SCHOOL_CREDENTIALS_LOADED",
  "message": "School credentials loaded.",
  "requestId": "c7344177-3e1e-48e4-8f55-90059c4033f9",
  "school": {
    "school_id": "b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "school_name": "Indus Valley World School",
    "school_code": "GEN-0001",
    "status": "approved"
  }
}
```

---

## Administration & Internal System Services

Administrative services (application verification, school approvals, and credential generation) are restricted exclusively to authorized Genesis Core Committee administrators.

Access to administrative features is secured via strict server-side Role-Based Access Control (RBAC) and encrypted authentication channels. Internal management APIs are omitted from this public reference guide.