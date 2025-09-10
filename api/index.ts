import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './auth';
import usersRoutes from './users';
import medicalRecordsRoutes from './medical-records';
import appointmentsRoutes from './appointments';
import prescriptionsRoutes from './prescriptions';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    message: 'অনেক বেশি অনুরোধ, দয়া করে পরে আবার চেষ্টা করুন।'
  }
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Dr. Mimu API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/medical-records', medicalRecordsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/prescriptions', prescriptionsRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Dr. Mimu API',
    version: '1.0.0',
    description: 'Medical Assistant API for Bangladesh',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      medicalRecords: '/api/medical-records',
      appointments: '/api/appointments',
      prescriptions: '/api/prescriptions'
    },
    documentation: {
      health: 'GET /health - Health check',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        profile: 'GET /api/auth/profile',
        updateProfile: 'PUT /api/auth/profile'
      },
      users: {
        getUser: 'GET /api/users/:id',
        updateUser: 'PUT /api/users/:id',
        deleteUser: 'DELETE /api/users/:id'
      },
      medicalRecords: {
        getUserRecords: 'GET /api/medical-records/user/:userId',
        getRecord: 'GET /api/medical-records/:id',
        createRecord: 'POST /api/medical-records',
        updateRecord: 'PUT /api/medical-records/:id',
        deleteRecord: 'DELETE /api/medical-records/:id',
        getRecentRecords: 'GET /api/medical-records/user/:userId/recent',
        getRecordStats: 'GET /api/medical-records/user/:userId/stats'
      },
      appointments: {
        getUserAppointments: 'GET /api/appointments/user/:userId',
        getAppointment: 'GET /api/appointments/:id',
        createAppointment: 'POST /api/appointments',
        updateAppointment: 'PUT /api/appointments/:id',
        deleteAppointment: 'DELETE /api/appointments/:id',
        getUpcomingAppointments: 'GET /api/appointments/user/:userId/upcoming',
        getAppointmentStats: 'GET /api/appointments/user/:userId/stats'
      },
      prescriptions: {
        getUserPrescriptions: 'GET /api/prescriptions/user/:userId',
        getPrescription: 'GET /api/prescriptions/:id',
        createPrescription: 'POST /api/prescriptions',
        updatePrescription: 'PUT /api/prescriptions/:id',
        deletePrescription: 'DELETE /api/prescriptions/:id',
        getRecentPrescriptions: 'GET /api/prescriptions/user/:userId/recent',
        getPrescriptionStats: 'GET /api/prescriptions/user/:userId/stats'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    error: 'এই এন্ডপয়েন্ট পাওয়া যায়নি'
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: 'ভ্যালিডেশন এরর',
      details: err.message
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      error: 'অনুমতি নেই'
    });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'File too large',
      error: 'ফাইল অনেক বড়'
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: 'Internal Server Error',
    error: 'সার্ভার এরর',
    ...(process.env.NODE_ENV === 'development' && { details: err.message, stack: err.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Dr. Mimu API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;