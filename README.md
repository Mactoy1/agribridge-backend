# AgriBridge Backend

A complete, production-ready backend for the AgriBridge agricultural marketplace, built with Node.js, Express, TypeScript, Prisma ORM, and PostgreSQL. This backend provides a comprehensive API for farmers, buyers, logistics providers, and admins to manage products, orders, and market intelligence.

## 🚀 Features

- **User Authentication** - JWT-based authentication with role-based access control (FARMER, BUYER, LOGISTICS, ADMIN)
- **Product Management** - Create, read, update, and delete agricultural products with inventory management
- **Order Management** - Place orders, track order status, and manage order lifecycle
- **Stock Management** - Automatic stock reduction on order placement and restoration on cancellation
- **AI Market Forecasting** - Integration with Google Gemini API for crop market predictions
- **AI Insights Database** - Store and retrieve market insights
- **Request Logging** - Development mode logging for debugging
- **Error Handling** - Comprehensive error handling with detailed error messages
- **Input Validation** - Server-side validation for all endpoints
- **Graceful Shutdown** - Proper cleanup on server termination

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL 12+ ([Download](https://www.postgresql.org/download/))
- Google Gemini API key (optional, for AI features)

### PostgreSQL Installation

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

**Windows:**
Download from [postgresql.org](https://www.postgresql.org/download/windows/) and follow installer

**Verify Installation:**
```bash
psql --version
```

## 🛠️ Installation

### 1. Clone and Install

```bash
git clone <repository-url>
cd agribridge-backend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

**`.env` file:**
```env
PORT=5000
JWT_SECRET=your_super_secret_key_here_change_in_production
DATABASE_URL="postgresql://postgres:password@localhost:5432/agribridge"
GEMINI_API_KEY=your_google_gemini_api_key  # Optional
NODE_ENV=development
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# (Optional) Seed database with sample data
npm run seed

# (Optional) Open Prisma Studio (GUI for database)
npm run prisma:studio
```

**What the seed script creates:**
- 4 sample users (2 farmers, 2 buyers)
- 4 sample products
- 3 sample orders
- 3 AI insights

**Test Credentials (after seeding):**
```
Farmer: rajesh@farm.com / farmer123
Buyer:  amit@buyer.com / buyer123
```

## 🗄️ Database Configuration

### Quick Start (PostgreSQL)

**1. Create Database:**
```bash
# Using psql
createdb agribridge

# Or login and run:
psql -U postgres
# Then in psql:
# CREATE DATABASE agribridge;
```

**2. Update Connection String:**
Edit `.env`:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/agribridge"
```

**3. Initialize Schema:**
```bash
npm run prisma:generate
npm run prisma:push
```

**4. Load Sample Data (optional):**
```bash
npm run seed
```

### Using Prisma Studio (GUI)

Visual database manager - perfect for viewing/editing data:
```bash
npm run prisma:studio
```
Then open `http://localhost:5555` in your browser.

### Database Backup

```bash
# Backup
pg_dump -U postgres agribridge > backup.sql

# Restore
psql -U postgres agribridge < backup.sql
```

## 📦 Available Scripts

```bash
# Start development server (with hot reload)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Generate Prisma Client
npm run prisma:generate

# Push Prisma schema to database
npm run prisma:push

# Open Prisma Studio (GUI for database)
npm run prisma:studio

# Run tests (configure as needed)
npm test
```

## 🏗️ Project Structure

```
src/
├── config/
│   └── env.ts              # Environment configuration
├── lib/
│   ├── jwt.ts              # JWT token utilities
│   └── prisma.ts           # Prisma client singleton
├── middleware/
│   └── auth.ts             # Authentication & authorization middleware
├── routes/
│   ├── auth.routes.ts      # Authentication endpoints
│   ├── product.routes.ts   # Product management endpoints
│   ├── order.routes.ts     # Order management endpoints
│   └── ai.routes.ts        # AI forecasting endpoints
├── types/
│   └── express.d.ts        # Express type definitions
└── server.ts               # Main server file

prisma/
└── schema.prisma           # Database schema definition
```

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

### Roles

- **FARMER**: Can create and manage products, view orders for their products
- **BUYER**: Can view products and place orders
- **LOGISTICS**: Can track and manage shipments
- **ADMIN**: Full access to all resources

## 📚 API Endpoints

### Health Check

```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "message": "AgriBridge backend is running",
  "timestamp": "2024-08-31T10:30:00.000Z"
}
```

### Authentication Endpoints

#### Register User

```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Farmer",
  "email": "john@example.com",
  "password": "secure_password",
  "role": "FARMER"  // Optional: defaults to BUYER
}
```

Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "name": "John Farmer",
    "email": "john@example.com",
    "role": "FARMER"
  },
  "token": "jwt_token_here"
}
```

#### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure_password"
}
```

Response:
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "name": "John Farmer",
    "email": "john@example.com",
    "role": "FARMER"
  },
  "token": "jwt_token_here"
}
```

#### Get Current User

```
GET /api/auth/me
Authorization: Bearer <token>
```

Response:
```json
{
  "id": "user_id",
  "name": "John Farmer",
  "email": "john@example.com",
  "role": "FARMER",
  "createdAt": "2024-08-31T10:00:00.000Z"
}
```

### Product Endpoints

#### Get All Products

```
GET /api/products?category=vegetables&skip=0&take=20&sortBy=createdAt&order=desc
```

Query Parameters:
- `category` (optional): Filter by product category
- `skip` (optional): Number of products to skip (default: 0)
- `take` (optional): Number of products to return (default: 20, max: 100)
- `sortBy` (optional): Field to sort by (default: createdAt)
- `order` (optional): Sort order - asc or desc (default: desc)

Response:
```json
{
  "data": [
    {
      "id": "product_id",
      "name": "Tomatoes",
      "category": "vegetables",
      "description": "Fresh red tomatoes",
      "price": 50.00,
      "stock": 100,
      "imageUrl": "https://example.com/image.jpg",
      "farmerId": "farmer_id",
      "farmer": {
        "id": "farmer_id",
        "name": "John Farmer",
        "email": "john@example.com"
      },
      "createdAt": "2024-08-31T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "skip": 0,
    "take": 20,
    "hasMore": true
  }
}
```

#### Get Product by ID

```
GET /api/products/:id
```

Response:
```json
{
  "id": "product_id",
  "name": "Tomatoes",
  "category": "vegetables",
  "description": "Fresh red tomatoes",
  "price": 50.00,
  "stock": 100,
  "imageUrl": "https://example.com/image.jpg",
  "farmerId": "farmer_id",
  "farmer": {
    "id": "farmer_id",
    "name": "John Farmer",
    "email": "john@example.com"
  },
  "createdAt": "2024-08-31T10:00:00.000Z"
}
```

#### Create Product (Farmer only)

```
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tomatoes",
  "category": "vegetables",
  "description": "Fresh red tomatoes from our farm",
  "price": 50.00,
  "stock": 100,
  "imageUrl": "https://example.com/image.jpg"
}
```

Response:
```json
{
  "message": "Product created successfully",
  "product": {
    "id": "product_id",
    "name": "Tomatoes",
    "category": "vegetables",
    "description": "Fresh red tomatoes from our farm",
    "price": 50.00,
    "stock": 100,
    "imageUrl": "https://example.com/image.jpg",
    "farmerId": "farmer_id",
    "farmer": {
      "id": "farmer_id",
      "name": "John Farmer",
      "email": "john@example.com"
    },
    "createdAt": "2024-08-31T10:00:00.000Z"
  }
}
```

#### Update Product (Farmer only)

```
PUT /api/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tomatoes (Updated)",
  "price": 55.00,
  "stock": 95
}
```

#### Delete Product (Farmer only)

```
DELETE /api/products/:id
Authorization: Bearer <token>
```

### Order Endpoints

#### Get My Orders

```
GET /api/orders/my-orders?status=PENDING&skip=0&take=20
Authorization: Bearer <token>
```

Query Parameters:
- `status` (optional): Filter by order status (PENDING, PAID, SHIPPED, DELIVERED, CANCELLED)
- `skip` (optional): Number of orders to skip
- `take` (optional): Number of orders to return

Response:
```json
{
  "data": [
    {
      "id": "order_id",
      "userId": "buyer_id",
      "productId": "product_id",
      "quantity": 5,
      "total": 250.00,
      "status": "PENDING",
      "createdAt": "2024-08-31T10:00:00.000Z",
      "product": {
        "id": "product_id",
        "name": "Tomatoes",
        "price": 50.00,
        "farmer": {
          "id": "farmer_id",
          "name": "John Farmer"
        }
      },
      "user": {
        "id": "buyer_id",
        "name": "Jane Buyer",
        "email": "jane@example.com"
      }
    }
  ],
  "pagination": {
    "total": 25,
    "skip": 0,
    "take": 20,
    "hasMore": false
  }
}
```

#### Get Order by ID

```
GET /api/orders/:id
Authorization: Bearer <token>
```

#### Create Order

```
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 5
}
```

Response:
```json
{
  "message": "Order created successfully",
  "order": {
    "id": "order_id",
    "userId": "buyer_id",
    "productId": "product_id",
    "quantity": 5,
    "total": 250.00,
    "status": "PENDING",
    "createdAt": "2024-08-31T10:00:00.000Z",
    "product": {
      "id": "product_id",
      "name": "Tomatoes",
      "farmer": {
        "id": "farmer_id",
        "name": "John Farmer"
      }
    }
  }
}
```

#### Update Order Status (Admin or Product Owner)

```
PATCH /api/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "SHIPPED"
}
```

Valid statuses: PENDING, PAID, SHIPPED, DELIVERED, CANCELLED

#### Cancel Order

```
POST /api/orders/:id/cancel
Authorization: Bearer <token>
```

Only PENDING orders can be cancelled. Stock is automatically restored.

### AI Endpoints

#### Get Market Forecast

```
POST /api/ai/forecast
Authorization: Bearer <token>
Content-Type: application/json

{
  "crop": "tomatoes",
  "region": "Punjab",
  "market": "Delhi wholesale market"
}
```

Response:
```json
{
  "message": "Forecast generated successfully",
  "forecast": {
    "summary": "Strong demand expected for tomatoes in Delhi market",
    "recommendation": "Increase supply to capitalize on high demand",
    "trend": "UP",
    "priceOutlook": "Prices expected to rise by 15% in next week",
    "confidence": "HIGH"
  }
}
```

#### Get AI Insights

```
GET /api/ai/insights?category=market_trends&skip=0&take=10
Authorization: Bearer <token>
```

Query Parameters:
- `category` (optional): Filter by insight category
- `skip` (optional): Number of insights to skip
- `take` (optional): Number of insights to return

#### Get Single Insight

```
GET /api/ai/insights/:id
Authorization: Bearer <token>
```

## 🗄️ Database Schema

### User

```prisma
- id: String (primary key)
- name: String
- email: String (unique)
- password: String (hashed)
- role: Role (FARMER, BUYER, LOGISTICS, ADMIN)
- createdAt: DateTime
- updatedAt: DateTime
- products: Product[]
- orders: Order[]
```

### Product

```prisma
- id: String (primary key)
- name: String
- category: String
- description: String (optional)
- price: Float
- stock: Int
- imageUrl: String (optional)
- farmerId: String (foreign key)
- farmer: User
- createdAt: DateTime
- updatedAt: DateTime
- orders: Order[]
```

### Order

```prisma
- id: String (primary key)
- userId: String (foreign key)
- user: User
- productId: String (foreign key)
- product: Product
- quantity: Int
- total: Float
- status: OrderStatus (PENDING, PAID, SHIPPED, DELIVERED, CANCELLED)
- createdAt: DateTime
```

### AIInsight

```prisma
- id: String (primary key)
- title: String
- content: String
- category: String
- createdAt: DateTime
```

## 🚀 Deployment

### Production Setup

1. Build the project:
```bash
npm run build
```

2. Set environment to production:
```bash
export NODE_ENV=production
```

3. Start the server:
```bash
npm start
```

### Docker Support (Optional)

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY prisma ./prisma

EXPOSE 5000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t agribridge-backend .
docker run -p 5000:5000 --env-file .env agribridge-backend
```

## 🔒 Security Best Practices

1. **Change JWT_SECRET** in production
2. **Use HTTPS** for all communications
3. **Enable CORS** properly for frontend domains
4. **Validate all inputs** (already implemented)
5. **Use strong passwords** for database
6. **Keep dependencies updated** with `npm audit fix`
7. **Use environment variables** for sensitive data
8. **Enable rate limiting** (recommended for production)
9. **Use PostgreSQL with strong credentials**

## 📝 Error Handling

All errors return appropriate HTTP status codes:

- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `409`: Conflict (resource already exists)
- `500`: Internal Server Error

Error Response Format:
```json
{
  "message": "Error description",
  "fields": {
    "fieldName": true
  }
}
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -U postgres -d agribridge -c "SELECT 1"

# Check DATABASE_URL format
postgresql://username:password@localhost:5432/dbname
```

### JWT Token Issues

- Ensure JWT_SECRET is set in .env
- Token expires after 7 days (configurable in jwt.ts)
- Use correct Bearer token format in headers

### AI Forecast Not Working

- Verify GEMINI_API_KEY is set in .env (optional, will use fallback)
- Check API key validity in Google Cloud Console
- Review error logs for API rate limiting

## 📄 License

ISC

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss proposed changes.

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Last Updated**: August 2024
**Status**: ✅ Production Ready
