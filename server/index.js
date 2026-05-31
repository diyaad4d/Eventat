require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 1 GLOBAL MIDDLEWARES
app.use(helmet()); // Secure HTTP headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse incoming JSON payloads
app.use(morgan('combined')); // Request logging

// 2. RATE LIMITING
// Max 100 requests per 15 minutes per IP applied to all API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// ==========================================
// 3. API ROUTES (To be implemented in Layer 3)
// ==========================================
// const authRoutes = require('./routes/auth.routes');
// const categoriesRoutes = require('./routes/categories.routes');
// const servicesRoutes = require('./routes/services.routes');
// const bookingsRoutes = require('./routes/bookings.routes');
// const vendorsRoutes = require('./routes/vendors.routes');
// const reviewsRoutes = require('./routes/reviews.routes');
// const notificationsRoutes = require('./routes/notifications.routes');
// const usersRoutes = require('./routes/users.routes');
// const adminRoutes = require('./routes/admin.routes');
// const uploadRoutes = require('./routes/upload.routes');

// app.use('/api/auth', authRoutes);
// app.use('/api/categories', categoriesRoutes);
// app.use('/api/services', servicesRoutes);
// app.use('/api/bookings', bookingsRoutes);
// app.use('/api/vendor', vendorsRoutes);
// app.use('/api/reviews', reviewsRoutes);
// app.use('/api/notifications', notificationsRoutes);
// app.use('/api/users', usersRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/upload', uploadRoutes);

// 4. ERROR HANDLING
// Must be applied at the very end of the middleware stack
app.use(errorHandler);

// ==========================================
// 5. START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});