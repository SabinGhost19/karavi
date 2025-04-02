// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import axios from 'axios';

// API configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Auth context
const AuthContext = React.createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    
    if (token) {
      axios.get(`${API_URL}/auth/user`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setUser(res.data);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Components
function Navbar() {
  const { user, logout } = React.useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">MicroShop</Link>
      </div>
      <div className="navbar-menu">
        <Link to="/products">Products</Link>
        {user ? (
          <>
            <Link to="/orders">My Orders</Link>
            <Link to="/profile">Profile</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = React.useContext(AuthContext);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

// Pages
function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/products/products?limit=3`)
      .then(res => {
        setFeaturedProducts(res.data.products);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="home-page">
      <h1>Welcome to MicroShop</h1>
      <div className="featured-products">
        <h2>Featured Products</h2>
        <div className="products-grid">
          {featuredProducts.map(product => (
            <div key={product._id} className="product-card">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p className="price">${product.price.toFixed(2)}</p>
              <Link to={`/products/${product._id}`}>View Details</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    axios.get(`${API_URL}/products/products?page=${page}`)
      .then(res => {
        setProducts(res.data.products);
        setTotalPages(res.data.pagination.pages);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, [page]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="products-page">
      <h1>Products</h1>
      <div className="products-grid">
        {products.map(product => (
          <div key={product._id} className="product-card">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p className="price">${product.price.toFixed(2)}</p>
            <Link to={`/products/${product._id}`}>View Details</Link>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button 
          disabled={page === 1} 
          onClick={() => setPage(p => p - 1)}
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button 
          disabled={page === totalPages} 
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function ProductDetailPage() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { user } = React.useContext(AuthContext);
  
  // In a real app, you would get the product ID from the URL params
  const productId = window.location.pathname.split('/').pop();

  useEffect(() => {
    axios.get(`${API_URL}/products/products/${productId}`)
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching product:', err);
        setLoading(false);
      });
  }, [productId]);

  const addToCart = () => {
    // In a real app, you would implement cart functionality
    alert(`Added ${quantity} of ${product.name} to cart`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="product-detail">
      <h1>{product.name}</h1>
      <p className="description">{product.description}</p>
      <p className="price">${product.price.toFixed(2)}</p>
      <p className="stock">
        {product.inStock ? `In Stock (${product.quantity} available)` : 'Out of Stock'}
      </p>
      <div className="actions">
        <input
          type="number"
          min="1"
          max={product.quantity}
          value={quantity}
          onChange={e => setQuantity(parseInt(e.target.value))}
        />
        <button 
          onClick={addToCart}
          disabled={!product.inStock || !user}
        >
          Add to Cart
        </button>
        {!user && <p>Please login to add items to cart</p>}
      </div>
    </div>
  );
}

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = React.useContext(AuthContext);
  const { user } = React.useContext(AuthContext);

  if (user) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-page">
      <h1>Login</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register } = React.useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await register(name, email, password);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  if (success) {
    return (
      <div className="register-success">
        <h1>Registration Successful</h1>
        <p>You can now <Link to="/login">login</Link> with your new account.</p>
      </div>
    );
  }

  return (
    <div className="register-page">
      <h1>Register</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength="6"
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/orders" element={
                <PrivateRoute>
                  <div>Orders Page (Not Implemented)</div>
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <div>Profile Page (Not Implemented)</div>
                </PrivateRoute>
              } />
              <Route path="*" element={<div>Page Not Found</div>} />
            </Routes>
          </main>
          <footer>
            <p>&copy; {new Date().getFullYear()} MicroShop - Demo for Docker & Kubernetes</p>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;