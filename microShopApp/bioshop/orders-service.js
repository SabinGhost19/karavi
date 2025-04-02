// orders-service/app.js
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://orders-db:27017/orders', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Order Schema
const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  paymentId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);

// Routes
app.post('/orders', async (req, res) => {
  try {
    const { userId, items, shippingAddress } = req.body;
    
    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Check inventory
    try {
      const inventoryUrl = process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3005';
      
      // Check all items inventory
      for (const item of items) {
        const inventoryResponse = await axios.get(`${inventoryUrl}/inventory/${item.productId}`);
        
        if (inventoryResponse.data.quantity < item.quantity) {
          return res.status(400).json({ 
            message: `Not enough inventory for product: ${item.name}. 
                     Available: ${inventoryResponse.data.quantity}, Requested: ${item.quantity}` 
          });
        }
      }
    } catch (error) {
      console.error('Error checking inventory:', error);
      return res.status(500).json({ message: 'Error checking inventory' });
    }
    
    // Create order
    const order = new Order({
      userId,
      items,
      totalAmount,
      shippingAddress,
    });
    
    await order.save();
    
    // Process payment
    try {
      const paymentUrl = process.env.PAYMENT_SERVICE_URL || 'http://payments-service:3004';
      const paymentResponse = await axios.post(`${paymentUrl}/payments`, {
        orderId: order._id,
        amount: totalAmount,
        userId,
      });
      
      // Update order with payment ID
      order.paymentId = paymentResponse.data.paymentId;
      order.status = 'processing';
      await order.save();
    } catch (error) {
      console.error('Payment processing error:', error);
      order.status = 'cancelled';
      await order.save();
      return res.status(400).json({ message: 'Payment processing failed' });
    }
    
    // Update inventory
    try {
      const inventoryUrl = process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3005';
      
      // Reduce inventory for each item
      for (const item of items) {
        await axios.put(`${inventoryUrl}/inventory/${item.productId}`, {
          quantity: -item.quantity, // Negative value to reduce stock
        });
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      // We could implement compensating transaction here if inventory update fails
    }
    
    // Send notification
    try {
      const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://notifications-service:3006';
      await axios.post(`${notificationUrl}/notifications`, {
        userId,
        type: 'order_created',
        message: `Your order #${order._id} has been created successfully.`,
        orderId: order._id,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/orders', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.status = status;
    await order.save();
    
    // Send notification on status change
    try {
      const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://notifications-service:3006';
      await axios.post(`${notificationUrl}/notifications`, {
        userId: order.userId,
        type: 'order_status_changed',
        message: `Your order #${order._id} status has been updated to ${status}.`,
        orderId: order._id,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Orders service running on port ${PORT}`);
});
