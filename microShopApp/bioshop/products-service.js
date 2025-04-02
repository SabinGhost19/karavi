// products-service/app.js
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://products-db:27017/products', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model('Product', productSchema);

// Routes
app.get('/products', async (req, res) => {
  try {
    const { category, search, sort, limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    let sortOption = {};
    if (sort === 'price_asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { price: -1 };
    } else {
      sortOption = { createdAt: -1 };
    }
    
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(query);
    
    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check inventory service for availability
    try {
      const inventoryUrl = process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3005';
      const inventoryResponse = await axios.get(`${inventoryUrl}/inventory/${product._id}`);
      product._doc.inStock = inventoryResponse.data.quantity > 0;
      product._doc.quantity = inventoryResponse.data.quantity;
    } catch (error) {
      console.error('Error checking inventory:', error);
      product._doc.inStock = false;
      product._doc.quantity = 0;
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes - would typically be protected
app.post('/products', async (req, res) => {
  try {
    const { name, description, price, imageUrl, category } = req.body;
    
    const product = new Product({
      name,
      description,
      price,
      imageUrl,
      category,
    });
    
    await product.save();
    
    // Notify inventory service about new product
    try {
      const inventoryUrl = process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3005';
      await axios.post(`${inventoryUrl}/inventory`, {
        productId: product._id,
        quantity: 0,
      });
    } catch (error) {
      console.error('Error notifying inventory service:', error);
    }
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Seed data route for testing
app.post('/seed', async (req, res) => {
  try {
    await Product.deleteMany({});
    
    const products = [
      {
        name: 'Smartphone X',
        description: 'Latest smartphone with amazing features',
        price: 999.99,
        imageUrl: 'https://example.com/smartphone.jpg',
        category: 'Electronics',
      },
      {
        name: 'Laptop Pro',
        description: 'Powerful laptop for professionals',
        price: 1499.99,
        imageUrl: 'https://example.com/laptop.jpg',
        category: 'Electronics',
      },
      {
        name: 'Running Shoes',
        description: 'Comfortable shoes for runners',
        price: 129.99,
        imageUrl: 'https://example.com/shoes.jpg',
        category: 'Clothing',
      },
    ];
    
    const createdProducts = await Product.insertMany(products);
    
    // Notify inventory service about new products
    try {
      const inventoryUrl = process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3005';
      
      await Promise.all(createdProducts.map(product => 
        axios.post(`${inventoryUrl}/inventory`, {
          productId: product._id,
          quantity: Math.floor(Math.random() * 100),
        })
      ));
    } catch (error) {
      console.error('Error notifying inventory service:', error);
    }
    
    res.status(201).json({ message: 'Products seeded successfully', products: createdProducts });
  } catch (error) {
    console.error('Error seeding products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Products service running on port ${PORT}`);
});
