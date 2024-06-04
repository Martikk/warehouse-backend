const express = require('express');
const router = express.Router();
const knex = require('knex');
const knexConfig = require('../knexfile');
const { isEmail } = require('validator');

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];
const db = knex(config);

// Middleware for validating request body
const validateRequestBody = (req, res, next) => {
  const { contact_phone, contact_email } = req.body;
  const inputValues = Object.values(req.body);
  const inputKeys = Object.keys(req.body);

  const requiredFields = [
    'warehouse_name',
    'address',
    'city',
    'country',
    'contact_name',
    'contact_position',
    'contact_phone',
    'contact_email',
  ];

  if (requiredFields.map((value) => inputKeys.includes(value)).includes(false)) {
    return res.status(400).json({ error: 'Missing required properties.' });
  }

  if (!inputValues.every((value) => !!value)) {
    return res.status(400).json({ error: 'Missing required properties.' });
  }

  if (contact_phone.replace(/\D/g, '').length !== 11) {
    return res.status(400).json({ error: 'Invalid phone number format.' });
  }

  if (!isEmail(contact_email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  next();
};

router.get('/', async (req, res) => {
  try {
    const warehouses = await db('warehouses');
    console.log(warehouses);
    res.status(200).json(warehouses);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving the warehouses.' });
  }
});

router.post('/', validateRequestBody, async (req, res) => {
  try {
    const newWarehouse = req.body;
    const insertedWarehouse = await db('warehouses').insert(newWarehouse);
    const data = await db('warehouses')
      .select(
        'id',
        'warehouse_name',
        'address',
        'city',
        'country',
        'contact_name',
        'contact_position',
        'contact_phone',
        'contact_email'
      )
      .where('id', insertedWarehouse[0]);

    res.status(201).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while inserting the warehouse.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await db('warehouses').where({ id: req.params.id });
    if (data.length === 0) {
      return res.status(404).json({ message: `No warehouse found with the id ${req.params.id}` });
    }
    res.status(200).json(data[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error getting warehouse' });
  }
});

router.put('/:id', validateRequestBody, async (req, res) => {
  const update = req.body;
  const { id } = req.params;

  if (req.body.id) {
    return res.status(400).json({ message: 'You cannot update this id.' });
  }

  try {
    const rowsUpdated = await db('warehouses').where({ id }).update(update);

    if (rowsUpdated === 0) {
      return res.status(404).json({ message: `Warehouse with ID ${id} not found` });
    }

    const editedRecord = await db('warehouses')
      .select(
        'id',
        'warehouse_name',
        'address',
        'city',
        'country',
        'contact_name',
        'contact_position',
        'contact_phone',
        'contact_email'
      )
      .where({ id });

    res.status(200).json(editedRecord[0]);
  } catch (err) {
    console.error('PUT request to /api/warehouses/:id failed: ', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id/inventories', async (req, res) => {
  try {
    const warehouse = await db('warehouses').where({ id: req.params.id });

    if (!warehouse[0]) {
      return res.status(404).json({ message: `No warehouse found with id of ${req.params.id}` });
    }

    const data = await db('inventories')
      .select('inventories.id', 'inventories.item_name', 'inventories.category', 'inventories.status', 'inventories.quantity')
      .join('warehouses', 'inventories.warehouse_id', 'warehouses.id')
      .where({ warehouse_id: req.params.id });

    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error getting inventory for specified warehouse' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const rowsDeleted = await db('warehouses').where({ id }).delete();

    if (rowsDeleted === 0) {
      return res.status(404).json({ message: `Warehouse with ID ${id} not found` });
    }

    res.sendStatus(204);
  } catch (err) {
    console.error('DELETE request to /api/warehouses/:id failed: ', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
