const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

// import routers
const inventoryRoutes = require("./routes/inventory-routes");
const warehouseRoutes = require("./routes/warehouse-routes");

const { PORT } = process.env;

// middleware
app.use(cors());
app.use(express.json());

app.use("/api/inventories", inventoryRoutes);
app.use("/api/warehouses", warehouseRoutes);

// set server to listen on PORT
app.listen(PORT, () => {
    console.log(`Server listening on port http://localhost:${PORT}`);
});
