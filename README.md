# warehouse-backend

Welcome to the official video repository of Warehouse . Visit the video link: [Warehouse-Instock](https://youtu.be/_kAHgS-aRPc).

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./Assets/1.png">
  <source media="(prefers-color-scheme: light)" srcset="./Assets/1.png">
  <img alt="Dreamy Dates Website" srcset="./Assets/1.png">
</picture>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./Assets/2.png">
  <source media="(prefers-color-scheme: light)" srcset="./Assets/2.png">
  <img alt="Dreamy Dates Website" srcset="./Assets/2.png">
</picture>

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
  - [Warehouse Endpoints](#warehouse-endpoints)
  - [Inventory Endpoints](#inventory-endpoints)
- [Database Migrations and Seeds](#database-migrations-and-seeds)

## Introduction
The InStock backend is a RESTful API designed to manage warehouses and inventory items. It provides endpoints for CRUD operations on warehouses and inventory, with validation and error handling mechanisms.

## Features
- CRUD operations for warehouses and inventory items.
- Validation for request bodies.
- Error handling for common scenarios.
- Environment variable configuration for database and server settings.

## Technologies Used
- Node.js
- Express.js
- Knex.js
- MySQL (using mysql2 package)
- dotenv for environment variables
- validator for email validation
- nodemon for development

## Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/instock-backend.git
   cd instock-backend
   ```
   2. Install dependencies:
   ```sh
   npm install
## Environment Variables
Create a .env file in the root directory and configure the following variables:
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=your_database
```

## API Endpoints
### Warehouse Endpoints
- GET /api/warehouses: Retrieve all warehouses.
- GET /api/warehouses/ 
: Retrieve a specific warehouse by ID.
- POST /api/warehouses: Create a new warehouse.
- PUT /api/warehouses/
: Update an existing warehouse by ID.
- DELETE /api/warehouses/
: Delete a warehouse by ID.
- GET /api/warehouses/
- /inventories: Retrieve inventories for a specific warehouse.
- Inventory Endpoints
GET /api/inventories: Retrieve all inventory items.
- GET /api/inventories/
: Retrieve a specific inventory item by ID.
- POST /api/inventories: Create a new inventory item.
- PUT /api/inventories/
: Update an existing inventory item by ID.
- DELETE /api/inventories/
: Delete an inventory item by ID.
## Database Migrations and Seeds
To run migrations:
```
npx knex migrate:latest
```
To run seeds:
```
npx knex seed:run
```