
# Lost and Found API

A RESTful API for managing lost and found items. Users can report lost objects, publish found items, search for items, and manage their own reports through authenticated endpoints.

## Features

- User registration and login
- Secure password hashing with bcrypt
- JWT-based authentication
- Create and view lost and found items
- Search and filter items
- Update item information
- Mark items as recovered
- User-based access control
- PostgreSQL database integration
- API testing with Postman

## Technologies

- Node.js
- Express.js
- PostgreSQL
- JWT
- bcryptjs
- dotenv
- Postman

## Project Structure

```text
lost-and-found-api/
├── postman/
├── src/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/hocineguerid01/Lost-and-Found-Api.git
cd Lost-and-Found-Api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root using `.env.example` as a template.

Configure your PostgreSQL credentials and a strong, random `JWT_SECRET`.

**Never commit your `.env` file or publish your secrets.**

### 4. Configure the database

Create a PostgreSQL database named `lost_found_db`.

Run the SQL commands in `schema.sql` to create the required
`users` and `items` tables in your PostgreSQL database.

### 5. Start the API

Run the development script defined in `package.json`, for example:

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:3000
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in |

### Items

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/items` | List and search items |
| GET | `/api/items/:id` | Get an item by ID |
| POST | `/api/items` | Create an item |
| PUT | `/api/items/:id` | Update an owned item |
| PATCH | `/api/items/:id/recover` | Mark an item as recovered |

Protected endpoints require a valid JWT access token.

## Testing

The API can be tested using Postman.

1. Register a user.
2. Log in and obtain a JWT token.
3. Use the token as a Bearer Token for protected requests.
4. Test item creation, search, filtering, updates, and recovery.
5. Verify that unauthorized requests are rejected.

## Security

- Environment variables are excluded from Git.
- Passwords are hashed before storage.
- Protected endpoints require authentication.
- Users can modify only their own items.

## Project Status

Core API endpoints and authentication have been tested using Postman.

---

**Lost and Found API** — Helping people report, find, and recover lost belongings.
