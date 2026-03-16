---
name: api-endpoints
description: Reference for all Money Minder backend API endpoints, auth patterns, and request/response structure
---

# Money Minder — API Endpoints Reference

## Base URL

`http://localhost:3000/api`

Health check (public): `GET /health`

---

## Authentication

**Type:** JWT Bearer Token  
**Header:** `Authorization: Bearer <accessToken>`

### Token Flow

- **Access token** — short-lived (15m), sent in every protected request header
- **Refresh token** — long-lived (7d), sent in body to `/api/auth/refresh`

### Auth Endpoints (public, no token required)

| Method | Path                 | Body                                   |
| ------ | -------------------- | -------------------------------------- |
| POST   | `/api/auth/register` | `{ name, email, password, currency? }` |
| POST   | `/api/auth/login`    | `{ email, password }`                  |
| POST   | `/api/auth/refresh`  | `{ refreshToken }`                     |
| POST   | `/api/auth/logout`   | _(no body, requires Bearer token)_     |

---

## Protected Endpoints

All routes below require `Authorization: Bearer <accessToken>`.

### Accounts — `/api/accounts`

Account types: `BANK` | `CASH` | `CREDIT_CARD` | `SAVINGS`

| Method | Path                | Body / Query                          |
| ------ | ------------------- | ------------------------------------- |
| GET    | `/api/accounts`     | —                                     |
| GET    | `/api/accounts/:id` | —                                     |
| POST   | `/api/accounts`     | `{ name, type, balance?, color? }`    |
| PUT    | `/api/accounts/:id` | `{ name?, type?, color?, isActive? }` |
| DELETE | `/api/accounts/:id` | —                                     |

---

### Categories — `/api/categories`

Category types: `INCOME` | `EXPENSE`

| Method | Path                  | Body                            |
| ------ | --------------------- | ------------------------------- |
| GET    | `/api/categories`     | —                               |
| POST   | `/api/categories`     | `{ name, type, icon?, color? }` |
| PUT    | `/api/categories/:id` | `{ name?, icon?, color? }`      |
| DELETE | `/api/categories/:id` | —                               |

---

### Transactions — `/api/transactions`

Transaction types: `INCOME` | `EXPENSE` | `TRANSFER`

> `TRANSFER` requires the `toAccountId` field.

| Method | Path                    | Body / Query                                                                             |
| ------ | ----------------------- | ---------------------------------------------------------------------------------------- |
| GET    | `/api/transactions`     | Query: `accountId?, categoryId?, type?, dateFrom?, dateTo?, limit?, offset?`             |
| GET    | `/api/transactions/:id` | —                                                                                        |
| POST   | `/api/transactions`     | `{ accountId, categoryId, amount, type, description, date, toAccountId?, notes? }`       |
| PUT    | `/api/transactions/:id` | `{ accountId?, categoryId?, amount?, type?, description?, date?, toAccountId?, notes? }` |
| DELETE | `/api/transactions/:id` | —                                                                                        |

---

### Budgets — `/api/budgets`

Budget periods: `WEEKLY` | `MONTHLY`

| Method | Path               | Body                                                  |
| ------ | ------------------ | ----------------------------------------------------- |
| GET    | `/api/budgets`     | —                                                     |
| GET    | `/api/budgets/:id` | —                                                     |
| POST   | `/api/budgets`     | `{ categoryId, amount, period, startDate, alertAt? }` |
| PUT    | `/api/budgets/:id` | `{ amount?, period?, startDate?, alertAt? }`          |
| DELETE | `/api/budgets/:id` | —                                                     |

---

### Savings Goals — `/api/savings`

Status: `ACTIVE` | `COMPLETED`

| Method | Path               | Body                                                           |
| ------ | ------------------ | -------------------------------------------------------------- |
| GET    | `/api/savings`     | —                                                              |
| GET    | `/api/savings/:id` | —                                                              |
| POST   | `/api/savings`     | `{ name, targetAmount, currentAmount?, deadline? }`            |
| PUT    | `/api/savings/:id` | `{ name?, targetAmount?, currentAmount?, deadline?, status? }` |
| DELETE | `/api/savings/:id` | —                                                              |

---

### Reports — `/api/reports`

| Method | Path                            | Query Params         |
| ------ | ------------------------------- | -------------------- |
| GET    | `/api/reports/summary`          | —                    |
| GET    | `/api/reports/by-category`      | `dateFrom?, dateTo?` |
| GET    | `/api/reports/monthly-trend`    | —                    |
| GET    | `/api/reports/account-balances` | —                    |

---

## Response Format

All responses follow this envelope:

```json
{
  "success": true,
  "message": "optional string",
  "data": { ... }
}
HTTP Status Codes
Code	Meaning
200	OK (GET / PUT / DELETE)
201	Created (POST)
400	Validation error
401	Missing or invalid token
404	Resource not found
409	Conflict (duplicate)
500	Server error
Validation Error Shape

{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
Rate Limits
Scope	Window	Max Requests
Global	15 min	200 per IP
/api/auth/*	15 min	20 per IP
Color Fields
All color fields accept hex format: #RRGGBB (e.g. #3B82F6)
```
}
Rate Limits
Scope Window Max Requests
Global 15 min 200 per IP
/api/auth/* 15 min 20 per IP
Color Fields
All color fields accept hex format: #RRGGBB (e.g. #3B82F6)
