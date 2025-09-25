# Pharma ERP System

A complete ERP solution for pharmaceutical companies with sales, purchase, inventory, customer, and supplier management.

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Backend Setup

1. **Install dependencies**

```bash
cd backend
npm install
```

2. **Create a .env file in the backend folder**

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pharma-erp
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

Note: Replace `your_secret_key` with a strong secret key for JWT token generation.

3. **Start the backend server**

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The backend server will run on http://localhost:5000

### Frontend Setup

1. **Install dependencies**

```bash
cd frontend
npm install
```

2. **Update API base URL**

In your frontend project, create a `.env` file (or `.env.local` for React) with:

```
REACT_APP_API_URL=http://localhost:5000/api
```

3. **Start the frontend development server**

```bash
npm start
```

The frontend will run on http://localhost:3000

## Connecting Frontend to Backend

To connect your React frontend to the backend API, you can use axios:

```javascript
import axios from 'axios';

// Create an axios instance with the base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add authorization token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
```

Then, in your components, you can use this API instance to make requests:

```javascript
import api from '../utils/api';

// Example: Fetch all products
const fetchProducts = async () => {
  try {
    const response = await api.get('/products');
    setProducts(response.data.data);
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

// Example: Create a new customer
const createCustomer = async (customerData) => {
  try {
    const response = await api.post('/customers', customerData);
    return response.data;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};
```

## API Documentation

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user and get token

### Users

- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/profile` - Get current user profile
- `GET /api/users/:id` - Get user by ID (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `PUT /api/users/change-password` - Change password

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PUT /api/products/:id/stock` - Update product stock

### Customers

- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `PUT /api/customers/:id/outstanding` - Update customer outstanding balance

### Suppliers

- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get supplier by ID
- `POST /api/suppliers` - Create new supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier
- `PUT /api/suppliers/:id/payable` - Update supplier payable balance

### Invoices (Sales)

- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get invoice by ID
- `POST /api/invoices` - Create new invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `PUT /api/invoices/:id/status` - Update invoice status

### Purchases

- `GET /api/purchases` - Get all purchases
- `GET /api/purchases/:id` - Get purchase by ID
- `POST /api/purchases` - Create new purchase
- `DELETE /api/purchases/:id` - Delete purchase
- `PUT /api/purchases/:id/status` - Update purchase status

### Transactions (Ledger)

- `GET /api/transactions/customer/:id` - Get customer ledger
- `GET /api/transactions/supplier/:id` - Get supplier ledger
- `POST /api/transactions/customer-payment` - Record customer payment
- `POST /api/transactions/supplier-payment` - Record supplier payment
- `DELETE /api/transactions/:id` - Delete transaction (Admin only) 