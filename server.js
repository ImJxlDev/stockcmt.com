// Required dependencies
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trading-platform', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// User Model
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: String,
    balance: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', { userSchema });

// Portfolio Model
const portfolioSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    asset: String,
    quantity: Number,
    averagePrice: Number
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

// Transaction Model
const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: String, // 'buy' or 'sell'
    asset: String,
    quantity: Number,
    price: Number,
    timestamp: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Authentication Middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findOne({ _id: decoded.id });
        
        if (!user) {
            throw new Error();
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

// Routes

// User Registration
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 8);

        // Create user
        const user = new User({
            email,
            password: hashedPassword,
            fullName
        });

        await user.save();

        // Generate token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key');

        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).send({ error: 'Invalid login credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key');
        res.send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get User Portfolio
app.get('/api/portfolio', auth, async (req, res) => {
    try {
        const portfolio = await Portfolio.find({ userId: req.user._id });
        res.send(portfolio);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Place Order
app.post('/api/order', auth, async (req, res) => {
    try {
        const { type, asset, quantity, price } = req.body;
        
        // Create transaction
        const transaction = new Transaction({
            userId: req.user._id,
            type,
            asset,
            quantity,
            price
        });

        // Update portfolio
        let portfolio = await Portfolio.findOne({ 
            userId: req.user._id,
            asset
        });

        if (!portfolio) {
            portfolio = new Portfolio({
                userId: req.user._id,
                asset,
                quantity: 0,
                averagePrice: 0
            });
        }

        if (type === 'buy') {
            portfolio.quantity += quantity;
            portfolio.averagePrice = ((portfolio.averagePrice * (portfolio.quantity - quantity)) + (price * quantity)) / portfolio.quantity;
        } else {
            if (portfolio.quantity < quantity) {
                return res.status(400).send({ error: 'Insufficient assets' });
            }
            portfolio.quantity -= quantity;
        }

        await transaction.save();
        await portfolio.save();

        res.status(201).send({ transaction, portfolio });
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get Transaction History
app.get('/api/transactions', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user._id })
            .sort({ timestamp: -1 });
        res.send(transactions);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get Account Balance
app.get('/api/balance', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.send({ balance: user.balance });
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update Account Balance
app.post('/api/balance', auth, async (req, res) => {
    try {
        const { amount, type } = req.body;
        const user = await User.findById(req.user._id);
        
        if (type === 'deposit') {
            user.balance += amount;
        } else if (type === 'withdraw') {
            if (user.balance < amount) {
                return res.status(400).send({ error: 'Insufficient funds' });
            }
            user.balance -= amount;
        }

        await user.save();
        res.send({ balance: user.balance });
    } catch (error) {
        res.status(500).send(error);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});