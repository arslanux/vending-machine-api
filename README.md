# Vending Machine API

This project implements a RESTful API for a vending machine, allowing users with a "seller" role to add, update or remove products, while users with a "buyer" role can deposit coins into the machine and make purchases.

## Features

- User authentication and authorization using JWT
- Role-based access control (buyer and seller roles)
- Product management (CRUD operations)
- Deposit functionality for buyers
- Purchase functionality with change calculation
- Session management with ability to logout from all active sessions

## Technologies Used

- Backend: NestJS
- Frontend: React
- Database: SQLite
- Authentication: Passport.js with JWT strategy

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/vending-machine-api.git
   cd vending-machine-api
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

4. Set up environment variables:
   Create a `.env` file in the `backend` directory with the following content:
   ```
   JWT_SECRET=your_jwt_secret_here
   DATABASE_PATH=./vending_machine.sqlite
   ```
   Replace `your_jwt_secret_here` with a secure random string.

## Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run start:dev
   ```
   The API will be available at `http://localhost:3000`.

2. Start the frontend development server:
   ```
   cd frontend
   npm start
   ```
   The frontend will be available at `http://localhost:5173`.

## API Endpoints

- POST `/user` - Register a new user
- POST `/auth/login` - User login
- GET `/product` - Get all products
- POST `/product` - Create a new product (seller only)
- PUT `/product/:id` - Update a product (seller only)
- DELETE `/product/:id` - Delete a product (seller only)
- PUT `/user/deposit` - Deposit coins (buyer only)
- POST `/product/buy` - Buy a product (buyer only)
- PUT `/user/reset` - Reset deposit (buyer only)

For detailed API documentation, run the server and visit `http://localhost:3000/api` for Swagger documentation.

## Testing

To run the automated tests:

```
cd backend
npm run test
```

## Postman Collection

A Postman collection for testing the API is included in the `postman` directory. Import this collection into Postman to easily test all API endpoints.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
