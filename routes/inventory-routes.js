const router = require("express").Router();
const knex = require("knex")(require("../knexfile"));

// Middleware for validating request body
const validateRequestBody = async (req, res, next) => {
  const inputValues = Object.values(req.body);
  const inputKeys = Object.keys(req.body);

  const requiredFields = [
    "warehouse_id",
    "item_name",
    "description",
    "category",
    "status",
    "quantity",
  ];

  // map over all required fields to see if they are included in the input keys
  if (
    requiredFields.map((value) => inputKeys.includes(value)).includes(false)
  ) {
    return res.status(400).json({
      error: "Missing required properties.",
    });
  }

  // check if every value in req.body is truthy or the quantity 0
  if (!inputValues.every((value) => !!value || value === 0)) {
    return res.status(400).json({
      error: "Missing required properties.",
    });
  }

  if (isNaN(+req.body.quantity)) {
    return res.status(400).json({
      error: "The quantity must be a number.",
    });
  }

  try {
    const warehouseIdExists = await knex("warehouses")
      .select("*")
      .where({ id: req.body.warehouse_id });

    if (!warehouseIdExists[0]) {
      return res.status(400).json({
        error: "Warehouse Id does not exist.",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "internal server error",
    });
  }

  next();
};

// Get list of all Inventory Items
router.get("/", async (_req, res) => {
  try {
    const data = await knex("inventories")
      .select(
        "inventories.id",
        "warehouses.warehouse_name",
        "inventories.item_name",
        "inventories.description",
        "inventories.category",
        "inventories.status",
        "inventories.quantity"
      )
      .join("warehouses", "inventories.warehouse_id", "warehouses.id");
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error getting inventories",
    });
  }
});

// Get details about a single inventory item.
router.get("/:id", async (req, res) => {
  try {
    const data = await knex("inventories")
      .select(
        "inventories.id",
        "warehouses.warehouse_name",
        "inventories.item_name",
        "inventories.description",
        "inventories.category",
        "inventories.status",
        "inventories.quantity"
      )
      .join("warehouses", "inventories.warehouse_id", "warehouses.id")
      .where({ "inventories.id": req.params.id });
    if (data.length === 0) {
      return res.status(404).json({
        message: `Inventory item with ID ${req.params.id} not found`,
      });
    }
    res.status(200).json(data[0]);
  } catch (error) {
    res.status(500).json({
      message: `Unable to retrieve inventory information for item with ID ${req.params.id}: ${error}`,
    });
  }
});

// Post request - New Inventory Item
router.post("/", validateRequestBody, async (req, res) => {
  try {
    const newInventoryItem = req.body;
    const insertedInventoryItem = await knex("inventories").insert(
      newInventoryItem
    );

    const newInventoryRecord = await knex("inventories")
      .select(
        "id",
        "warehouse_id",
        "item_name",
        "description",
        "category",
        "status",
        "quantity"
      )
      .where({ id: insertedInventoryItem[0] });

    res.status(201).json(newInventoryRecord);
  } catch (error) {
    res.status(500).json({
      error: "an error occurred while inserting the inventory item.",
    });
  }
});

// DELETE /api/inventories/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedRows = await knex("inventories").where({ id }).del();

    if (deletedRows === 0) {
      return res.status(404).json({
        message: `No inventory item found with ID ${id}`,
      });
    }

    res.status(204).json();
  } catch (error) {
    res.status(500).json({
      message: `Error deleting inventory item with ID ${id}: ${error}`,
    });
  }
});

//PUT/EDIT item in Inventory
router.put("/:id", validateRequestBody, async (req, res) => {
  // reject requests with id to prevent users from changing record id
  if (req.body.id) {
    return res.status(400).json({ message: "You cannot update this id." });
  }

  try {
    // check if the warehouse_id value does exist in the warehouses table
    const warehouseCheck = await knex("warehouses").where({
      id: req.body.warehouse_id,
    });

    //error out if it doesnt
    if (warehouseCheck.length === 0) {
      return res.status(400).json({
        message: `no warehouse found with the id ${req.body.warehouse_id}`,
      });
    }

    // check if inventory with id exist and update
    const data = await knex("inventories")
      .where({ id: req.params.id })
      .update(req.body);
    if (data === 0) {
      return res.status(404).json({
        message: `no inventory found with the id ${req.params.id}`,
      });
    }

    // display updated data
    const updatedData = await knex("inventories")
      .where({ id: req.params.id })
      .select(
        "id",
        "warehouse_id",
        "item_name",
        "description",
        "category",
        "status",
        "quantity"
      );
    res.status(200).json(updatedData[0]);
  } catch (error) {
    res.status(400).json({
      message: "Error getting inventories",
    });
  }
});

module.exports = router;
