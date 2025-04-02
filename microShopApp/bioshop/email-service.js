// email-service/app.js
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3007;

// Middleware
app.use(express.json());

// Create reusable transporter object using the default SMTP transport
// For demo purposes, we'll use a mock transporter
const createTransporter = () => {
  // In production, you would use real SMTP settings
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  
  // For development, use a mock transporter
  return {
    sendMail: (mailOptions) => {
      return new Promise((resolve) => {
        console.log('Mock email sent:');
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('Text:', mailOptions.text);
        resolve({ messageId: `mock-id-${Date.now()}` });
      });
    },
  };
};

// Routes
app.post('/email', async (req, res) => {
  try {
    const { to, subject, message, metadata } = req.body;
    
    if (!to || !subject || !message) {
      return res.status(400).json({ message: 'To, subject, and message are required' });
    }
    
    // Get email content based on template and metadata
    const emailContent = formatEmail(subject, message, metadata);
    
    // Create transporter
    const transporter = createTransporter();
    
    // Send email
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@microshop.example',
      to,
      subject,
      text: emailContent.text,
      html: emailContent.html,
    });
    
    res.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Helper functions
function formatEmail(subject, message, metadata = {}) {
  // Basic text version
  const text = `${message}\n\n${formatMetadata(metadata)}`;
  
  // Simple HTML version
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${subject}</h2>
      <p>${message}</p>
      ${formatMetadataHtml(metadata)}
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
        <p>This is an automated message from MicroShop. Please do not reply to this email.</p>
      </div>
    </div>
  `;
  
  return { text, html };
}

function formatMetadata(metadata) {
  let text = '';
  
  if (metadata.orderId) {
    text += `Order ID: ${metadata.orderId}\n`;
  }
  
  if (metadata.paymentId) {
    text += `Payment ID: ${metadata.paymentId}\n`;
  }
  
  return text;
}

function formatMetadataHtml(metadata) {
  let html = '<div style="margin-top: 20px;">';
  
  if (metadata.orderId) {
    html += `<p><strong>Order ID:</strong> ${metadata.orderId}</p>`;
  }
  
  if (metadata.paymentId) {
    html += `<p><strong>Payment ID:</strong> ${metadata.paymentId}</p>`;
  }
  
  html += '</div>';
  
  return html;
}

app.listen(PORT, () => {
  console.log(`Email service running on port ${PORT}`);
});
