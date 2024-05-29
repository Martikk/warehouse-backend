const router = require("express").Router();
const knex = require("knex")(require("../knexfile"));
const { isEmail } = require("validator");

// Middleware for validating request body
const validateRequestBody = (req, res, next) => {
  const { contact_phone, contact_email } = req.body;
  const inputValues = Object.values(req.body);
  const inputKeys = Object.keys(req.body);

  const requiredFields = [
    "warehouse_name",
    "address",
    "city",
    "country",
    "contact_name",
    "contact_position",
    "contact_phone",
    "contact_email",
  ];

  // map over all required fields to see if they are included in the input keys
  if (
    requiredFields.map((value) => inputKeys.includes(value)).includes(false)
  ) {
    return res.status(400).json({
      error: "Missing required properties.",
    });
  }

  // check if every value in req.body is truthy
  if (!inputValues.every((value) => !!value)) {
    return res.status(400).json({
      error: "Missing required properties.",
    });
  }

  // validating a phone and email address
  // use regex to turn remove all non-digit chars from phone number
  if (contact_phone.replaceAll(/\D/g, "").length !== 11) {
    return res.status(400).json({
      error: "Invalid phone number format.",
    });
  }

  if (!isEmail(contact_email)) {
    return res.status(400).json({
      error: "Invalid email format.",
    });
  }

  next();
};

router.get("/", async (req, res) => {
  try {
    const warehouses = await knex("warehouses");
    console.log(warehouses);
    res.status(200).json(warehouses);
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while retrieving the warehouses.",
    });
  }
});

// post request validation
router.post("/", validateRequestBody, async (req, res) => {
  try {
    const newWarehouse = req.body;
    const insertedWarehouse = await knex("warehouses").insert(newWarehouse);
    const data = await knex("warehouses")
      .select(
        "id",
        "warehouse_name",
        "address",
        "city",
        "country",
        "contact_name",
        "contact_position",
        "contact_phone",
        "contact_email"
      )
      .where("id", insertedWarehouse[0]);

    res.status(201).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "an error occurred while inserting the warehouse.",
    });
  }
});

//get Single Warehouse id
router.get("/:id", async (req, res) => {
  try {
    const data = await knex("warehouses").where({ id: req.params.id });
    if (data.length === 0) {
      return res.status(404).json({
        message: `no warehouse found with the id ${req.params.id}`,
      });
    }
    res.status(200).json(data[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "error getting warehouse",
    });
  }
});

// PUT /api/warehouses/:id with validation
router.put("/:id", validateRequestBody, async (req, res) => {
  const update = req.body;
  const { id } = req.params;

  // reject any request with an id to prevent the recored id from changing
  if (req.body.id) {
    return res.status(400).json({ message: `You cannot update this id.` });
  }

  try {
    // update the warehouse record
    const rowsUpdated = await knex("warehouses").where({ id }).update(update);

    // return an error if the id was not found in database
    if (rowsUpdated === 0) {
      return res.status(404).json({
        message: `Warehouse with ID ${id} not found`,
      });
    }

    // request the updated record without timestamps
    const editedRecord = await knex("warehouses")
      .select(
        "id",
        "warehouse_name",
        "address",
        "city",
        "country",
        "contact_name",
        "contact_position",
        "contact_phone",
        "contact_email"
      )
      .where({ id });

    res.status(200).json(editedRecord[0]);
  } catch (err) {
    console.error("PUT request to /api/warehouses/:id failed: ", err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Get Inventory for a Given Warehouse
router.get("/:id/inventories", async (req, res) => {
  try {
    // check if the warehouse exists
    const warehouse = await knex("warehouses").where({ id: req.params.id });

    // respond with an error if the warehouse does not exist
    if (!warehouse[0]) {
      return res.status(404).json({
        message: `No warehouse found with id of ${req.params.id}`,
      });
    }

    // if the warehouse exists, return its inventory
    const data = await knex("inventories")
      .select(
        "inventories.id",
        "inventories.item_name",
        "inventories.category",
        "inventories.status",
        "inventories.quantity"
      )
      .join("warehouses", "inventories.warehouse_id", "warehouses.id")
      .where({ warehouse_id: req.params.id });

    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: `error getting inventory for specified warehouse` });
  }
});

// DELETE /api/warehouses/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const rowsDeleted = await knex("warehouses").where({ id }).delete();

    if (rowsDeleted === 0) {
      return res
        .status(404)
        .json({ message: `Warehouse with ID ${id} not found` });
    }

    // No content response if successful
    res.sendStatus(204);
  } catch (err) {
    console.error("DELETE request to /api/warehouses/:id failed: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
