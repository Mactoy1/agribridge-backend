# Database Setup Guide - AgriBridge Backend

## 🚀 Quick Start

### Step 1: Install PostgreSQL

**macOS:**
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
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

### Step 2: Create Database

```bash
# Method 1: Using createdb command
createdb agribridge

# Method 2: Using psql
psql -U postgres
# Then in psql shell:
CREATE DATABASE agribridge;
```

### Step 3: Configure Connection

```bash
# Copy environment file
cp .env.example .env
```

Edit `.env` and update `DATABASE_URL`:
```env
# Default (localhost)
DATABASE_URL="postgresql://postgres:password@localhost:5432/agribridge"

# Example with custom credentials
DATABASE_URL="postgresql://username:password@host:port/agribridge"
```

**Finding your PostgreSQL credentials:**
- **Default User**: `postgres`
- **Default Port**: `5432`
- **Default Host**: `localhost`

### Step 4: Initialize Database Schema

```bash
# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push
```

### Step 5: (Optional) Load Sample Data

```bash
# Run seeder script
npm run seed
```

This creates:
- **4 Users** (2 farmers + 2 buyers)
- **4 Products** (tomatoes, rice, carrots, wheat flour)
- **3 Orders** (in different statuses)
- **3 AI Insights** (market forecasts)

**Test Credentials:**
```
Farmer Account:
  Email: rajesh@farm.com
  Password: farmer123

Buyer Account:
  Email: amit@buyer.com
  Password: buyer123
```

---

## 📊 Database Models

### User Table
```
- id (primary key)
- name (string)
- email (unique string)
- password (hashed string)
- role (FARMER, BUYER, LOGISTICS, ADMIN)
- createdAt (timestamp)
- updatedAt (timestamp)
```

### Product Table
```
- id (primary key)
- name (string)
- category (string)
- description (string, optional)
- price (float)
- stock (integer)
- imageUrl (string, optional)
- farmerId (foreign key → User)
- createdAt (timestamp)
- updatedAt (timestamp)
```

### Order Table
```
- id (primary key)
- userId (foreign key → User)
- productId (foreign key → Product)
- quantity (integer)
- total (float)
- status (PENDING, PAID, SHIPPED, DELIVERED, CANCELLED)
- createdAt (timestamp)
```

### AIInsight Table
```
- id (primary key)
- title (string)
- content (string)
- category (string)
- createdAt (timestamp)
```

---

## 🛠️ Useful Database Commands

### View Database
```bash
# Open Prisma Studio (GUI - Recommended!)
npm run prisma:studio
# Then open http://localhost:5555

# Or use psql
psql -U postgres -d agribridge
```

### Useful psql Commands
```sql
-- List all tables
\dt

-- View User table
SELECT * FROM "User";

-- View Product table
SELECT * FROM "Product";

-- View Order table
SELECT * FROM "Order";

-- Count records
SELECT COUNT(*) FROM "User";

-- Delete all data
TRUNCATE "User" CASCADE;
TRUNCATE "Product" CASCADE;
TRUNCATE "Order" CASCADE;

-- Exit
\q
```

### Backup & Restore

**Backup Database:**
```bash
pg_dump -U postgres agribridge > backup_2024.sql
```

**Restore Database:**
```bash
psql -U postgres agribridge < backup_2024.sql
```

### Reset Database

```bash
# Delete all data and recreate schema
npm run prisma:push -- --force-reset

# Then re-seed if needed
npm run seed
```

---

## 🔧 Troubleshooting

### Connection Error: "ECONNREFUSED"

**Issue:** Can't connect to PostgreSQL

**Solutions:**
```bash
# Check if PostgreSQL is running
brew services list  # macOS
sudo service postgresql status  # Linux

# Start PostgreSQL
brew services start postgresql@15  # macOS
sudo service postgresql start  # Linux

# Check connection string in .env
# Format: postgresql://username:password@host:port/dbname
```

### Error: "Database does not exist"

```bash
# Create the database
createdb agribridge

# Or in psql:
CREATE DATABASE agribridge;
```

### Error: "password authentication failed"

```bash
# Check PostgreSQL user password
# Update .env with correct credentials
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/agribridge"

# Reset PostgreSQL password (macOS):
psql -U postgres
ALTER USER postgres WITH PASSWORD 'new_password';
```

### Error: "relation does not exist"

```bash
# Re-push schema
npm run prisma:push

# Or force reset (deletes all data!)
npm run prisma:push -- --force-reset
npm run seed  # Restore sample data
```

---

## 📈 Database Performance Tips

### For Production:

1. **Connection Pooling** - Use PgBouncer or similar
2. **Indexes** - Already configured on unique fields (id, email)
3. **Backups** - Set up automated daily backups
4. **Monitoring** - Monitor disk space and connection count
5. **Query Optimization** - The ORM handles most optimization

### Check Database Size:
```bash
psql -U postgres -d agribridge -c "SELECT pg_size_pretty(pg_database_size('agribridge'));"
```

---

## ✅ Verification Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `agribridge` created
- [ ] `.env` file configured with DATABASE_URL
- [ ] `npm run prisma:generate` completed
- [ ] `npm run prisma:push` completed
- [ ] `npm run seed` completed (optional but recommended)
- [ ] `npm run dev` starts without database errors
- [ ] Can login with test credentials

---

## 🎯 Next Steps

Once database is set up:

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Test API Endpoints:**
   ```bash
   # Register a new user
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

   # Get all products
   curl http://localhost:5000/api/products
   ```

3. **View Database:**
   ```bash
   npm run prisma:studio
   ```

---

**Database Setup Complete!** 🎉

Your AgriBridge backend is now fully configured and ready to use.
