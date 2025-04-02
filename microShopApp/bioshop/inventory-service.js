// inventory-service/app.js
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://inventory-db:27017/inventory', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Inventory Schema
const inventorySchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true, default: 0 },
  reservedQuantity: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

const Inventory = mongoose.model('Inventory', inventorySchema);

// Routes
app.get('/inventory/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    let inventory = await Inventory.findOne({ productId });
    
    if (!inventory) {
      inventory = { productId, quantity: 0, reservedQuantity: 0 };
    }
    
    res.json({
      productId: inventory.productId,
      quantity: inventory.quantity,
      availableQuantity: inventory.quantity - inventory.reservedQuantity,
      updatedAt: inventory.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/inventory', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    let inventory = await Inventory.findOne({ productId });
    
    if (inventory) {
      return res.status(400).json({ message: 'Inventory for this product already exists' });
    }
    
    inventory = new Inventory({
      productId,
      quantity: quantity || 0,
    });
    
    await inventory.save();
    
    res.status(201).json(inventory);
  } catch (error) {
    console.error('Error creating inventory:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/inventory/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (quantity === undefined) {
      return res.status(400).json({ message: 'Quantity is required' });
    }
    
    let inventory = await Inventory.findOne({ productId });
    
    if (!inventory) {
      inventory = new Inventory({ productId, quantity: 0 });
    }
    
    // Update quantity (add or subtract)
    inventory.quantity += Number(quantity);
    inventory.updatedAt = new Date();
    
    // Ensure quantity doesn't go below 0
    if (inventory.quantity < 0) {
      inventory.quantity = 0;
    }
    
    await inventory.save();
    
    res.json(inventory);
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/inventory/:productId/reserve', async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }
    
    let inventory = await Inventory.findOne({ productId });
    
    if (!inventory) {
      return res.status(404).json({ message: 'Product not found in inventory' });
    }
    
    const availableQuantity = inventory.quantity - inventory.reservedQuantity;
    
    if (availableQuantity < quantity) {
      return res.status(400).json({ 
        message: 'Not enough inventory', 
        available: availableQuantity,
        requested: quantity 
      });
    }
    
    inventory.reservedQuantity += quantity;
    await inventory.save();
    
    res.json({
      reserved: true,
      quantity,
      remaining: inventory.quantity - inventory.reservedQuantity,
    });
  } catch (error) {
    console.error('Error reserving inventory:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/inventory/:productId/release', async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }
    
    let inventory = await Inventory.findOne({ productId });
    
    if (!inventory) {
      return res.status(404).json({ message: 'Product not found in inventory' });
    }
    
    // Release reservation
    inventory.reservedQuantity -= quantity;
    
    // Ensure reservedQuantity doesn't go below 0
    if (inventory.reservedQuantity < 0) {
      inventory.reservedQuantity = 0;
    }
    
    await inventory.save();
    
    res.json({
      released: true,
      quantity,
      remaining: inventory.quantity - inventory.reservedQuantity,
    });
  } catch (error) {
    console.error('Error releasing inventory:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Inventory service running on port ${PORT}`);
});