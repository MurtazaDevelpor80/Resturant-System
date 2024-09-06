const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/restaurant_management', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Define schemas
const menuItemSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
});

const orderSchema = new mongoose.Schema({
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
    total: Number,
    date: { type: Date, default: Date.now },
});

const reservationSchema = new mongoose.Schema({
    name: String,
    date: Date,
    time: String,
    guests: Number,
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
const Order = mongoose.model('Order', orderSchema);
const Reservation = mongoose.model('Reservation', reservationSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Route for home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to get all menu items
app.get('/menu', async (req, res) => {
    const menuItems = await MenuItem.find();
    res.json(menuItems);
});

// Route to place an order
app.post('/order', async (req, res) => {
    const { items } = req.body;
    const menuItems = await MenuItem.find({ _id: { $in: items } });
    const total = menuItems.reduce((sum, item) => sum + item.price, 0);
    const order = new Order({ items, total });
    await order.save();
    res.send('Order placed successfully!');
});

// Route to make a reservation
app.post('/reserve', async (req, res) => {
    const { name, date, time, guests } = req.body;
    const reservation = new Reservation({ name, date, time, guests });
    await reservation.save();
    res.send('Reservation made successfully!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
