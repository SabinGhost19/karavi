// notifications-service/app.js
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3006;

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://notifications-db:27017/notifications', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  metadata: { type: Object, default: {} },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model('Notification', notificationSchema);

// Routes
app.post('/notifications', async (req, res) => {
  try {
    const { userId, type, message, ...metadata } = req.body;
    
    if (!userId || !type || !message) {
      return res.status(400).json({ message: 'User ID, type, and message are required' });
    }
    
    // Create notification
    const notification = new Notification({
      userId,
      type,
      message,
      metadata,
    });
    
    await notification.save();
    
    // Send to email service if configured
    try {
      const emailUrl = process.env.EMAIL_SERVICE_URL || 'http://email-service:3007';
      
      // Only send emails for specific notification types
      if (['order_created', 'payment_successful', 'order_shipped'].includes(type)) {
        await axios.post(`${emailUrl}/email`, {
          to: userId, // In a real app, we'd lookup the email address
          subject: getEmailSubject(type),
          message,
          metadata,
        });
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue despite email error
    }
    
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/notifications', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    notification.isRead = true;
    await notification.save();
    
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/notifications/read-all', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Helper functions
function getEmailSubject(type) {
  const subjects = {
    order_created: 'Your order has been created',
    payment_successful: 'Payment successful',
    payment_failed: 'Payment failed',
    order_shipped: 'Your order has been shipped',
    order_delivered: 'Your order has been delivered',
    order_cancelled: 'Your order has been cancelled',
  };
  
  return subjects[type] || 'Notification from MicroShop';
}

app.listen(PORT, () => {
  console.log(`Notifications service running on port ${PORT}`);
});
