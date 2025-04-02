// payments-service/app.js
const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://payments-db:27017/payments', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Payment Schema
const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: { type: String, default: 'credit_card' },
  createdAt: { type: Date, default: Date.now },
});

const Payment = mongoose.model('Payment', paymentSchema);

// Mock payment processing (would be a real payment gateway in production)
const processPayment = async (amount, currency = 'USD') => {
  // Simulate API call to payment processor
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 90% success rate for demo purposes
      if (Math.random() < 0.9) {
        resolve({
          success: true,
          transactionId: uuidv4(),
        });
      } else {
        reject(new Error('Payment processing failed'));
      }
    }, 500); // Simulate processing delay
  });
};

// Routes
app.post('/payments', async (req, res) => {
  try {
    const { orderId, amount, userId } = req.body;
    
    if (!orderId || !amount || !userId) {
      return res.status(400).json({ message: 'Order ID, amount, and user ID are required' });
    }
    
    // Create payment record
    const payment = new Payment({
      paymentId: uuidv4(),
      orderId,
      userId,
      amount,
    });
    
    // Process payment
    try {
      const result = await processPayment(amount);
      payment.status = 'completed';
      await payment.save();
      
      // Notify notification service
      try {
        const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://notifications-service:3006';
        await axios.post(`${notificationUrl}/notifications`, {
          userId,
          type: 'payment_successful',
          message: `Payment for order #${orderId} has been processed successfully.`,
          paymentId: payment.paymentId,
          orderId,
        });
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
      }
      
      res.status(201).json({
        paymentId: payment.paymentId,
        status: 'completed',
        transactionId: result.transactionId,
      });
    } catch (paymentError) {
      payment.status = 'failed';
      await payment.save();
      
      // Notify notification service about failed payment
      try {
        const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://notifications-service:3006';
        await axios.post(`${notificationUrl}/notifications`, {
          userId,
          type: 'payment_failed',
          message: `Payment for order #${orderId} has failed. Please try again.`,
          paymentId: payment.paymentId,
          orderId,
        });
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
      }
      
      res.status(400).json({
        paymentId: payment.paymentId,
        status: 'failed',
        message: paymentError.message,
      });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/payments', async (req, res) => {
  try {
    const { userId, orderId } = req.query;
    
    let query = {};
    
    if (userId) {
      query.userId = userId;
    }
    
    if (orderId) {
      query.orderId = orderId;
    }
    
    const payments = await Payment.find(query).sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/payments/:paymentId', async (req, res) => {
  try {
    const payment = await Payment.findOne({ paymentId: req.params.paymentId });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/payments/:paymentId/refund', async (req, res) => {
  try {
    const payment = await Payment.findOne({ paymentId: req.params.paymentId });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    if (payment.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed payments can be refunded' });
    }
    
    // Process refund (mock)
    payment.status = 'refunded';
    await payment.save();
    
    // Notify notification service
    try {
      const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://notifications-service:3006';
      await axios.post(`${notificationUrl}/notifications`, {
        userId: payment.userId,
        type: 'payment_refunded',
        message: `Payment for order #${payment.orderId} has been refunded.`,
        paymentId: payment.paymentId,
        orderId: payment.orderId,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
    
    res.json({
      paymentId: payment.paymentId,
      status: 'refunded',
    });
  } catch (error) {
    console.error('Error refunding payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Payments service running on port ${PORT}`);
});
