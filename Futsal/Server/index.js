const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const md5 = require('md5');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // URL of your Client
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Listen for booking details from the client
  socket.on('booking_details', (data) => {
    console.log('Received booking details:', data);

    // Broadcast message to admin (assuming admin joins 'admin_room' or just broadcast to everyone for now/demo)
    // In a real app, you'd check if the user is an admin.
    // For now, we will simply log it and emit an event that an admin dashboard could listen to.
    io.emit('admin_notification', {
      message: `New Booking Alert!`,
      details: data,
      timestamp: new Date()
    });

    console.log('Notification sent to admin.');
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
  });
});

// In-memory store for bookings (Replace with DB in production)
let bookings = [];

// Helper to find booking
const findBooking = (orderId) => bookings.find(b => b.orderId === orderId);

// Get Bookings (Availability Check)
app.get('/api/bookings', (req, res) => {
  const { date, time } = req.query;
  // Return bookings that are PAID or PENDING (you might want to expire PENDING after some time)
  // For simplicity, we assume PENDING blocks the slot too for a short while, but let's just return all non-failed/cancelled
  const activeBookings = bookings.filter(b => b.status === 'PAID' || b.status === 'PENDING');

  if (date && time) {
    // Return courtIds that are booked for this date/time
    const bookedCourts = activeBookings
      .filter(b => b.date === date && b.time === time)
      .map(b => b.courtId);
    return res.json(bookedCourts);
  }

  res.json(activeBookings);
});

// PayHere Integration Routes

// 1. Generate Hash & Create Pending Booking
app.post('/api/payhere/hash', (req, res) => {
  const { order_id, amount, currency, courtId, date, time, customerName } = req.body;

  if (!order_id || !amount || !currency) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  // Check if already booked
  const isTaken = bookings.some(b =>
    b.courtId === courtId &&
    b.date === date &&
    b.time === time &&
    b.status === 'PAID'
  );

  if (isTaken) {
    return res.status(409).json({ error: "Slot already booked" });
  }

  // Save Pending Booking
  bookings.push({
    orderId: order_id,
    courtId,
    date,
    time,
    customerName,
    amount,
    currency,
    status: 'PENDING',
    timestamp: new Date()
  });

  const merchantSecret = process.env.MERCHANT_SECRET;
  const merchantId = process.env.MERCHANT_ID;

  if (!merchantSecret || !merchantId) {
    return res.status(500).json({ error: "Server misconfiguration: Missing PayHere credentials" });
  }

  const amountFormatted = parseFloat(amount).toFixed(2);
  const hashedSecret = md5(merchantSecret).toUpperCase();
  const hash = md5(merchantId + order_id + amountFormatted + currency + hashedSecret).toUpperCase();

  res.json({ hash });
});

// 2. Notify URL (Called by PayHere server after payment)
app.post('/api/payhere/notify', (req, res) => {
  console.log("PayHere Notification Received:", req.body);

  const {
    merchant_id,
    order_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig
  } = req.body;

  const merchantSecret = process.env.MERCHANT_SECRET;
  const hashedSecret = md5(merchantSecret).toUpperCase();

  const localMd5sig = md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret).toUpperCase();

  if (localMd5sig === md5sig) {
    console.log("Payment Verified Successfully");

    // Update booking status
    const booking = findBooking(order_id);
    if (booking) {
      if (status_code === "2") {
        booking.status = 'PAID';
        // Notify client/admin via socket
        io.emit('payment_success', { order_id, status: status_code });
        io.emit('booking_update', { courtId: booking.courtId, date: booking.date, time: booking.time }); // Broadcast to update UI
      } else {
        booking.status = 'FAILED';
      }
    } else {
      // Handle case where booking wasn't in memory (server restart?) - In prod, use DB
      console.log("Booking not found in memory for order:", order_id);
    }

    res.status(200).send("Status Update Successful");
  } else {
    console.log("Payment Verification Failed");
    res.status(400).send("Verification Failed");
  }
});


const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
