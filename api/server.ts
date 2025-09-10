import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

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
const NODE_ENV = process.env.NODE_ENV || 'development';

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://api.supabase.co", "wss://realtime.supabase.co"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 100 : 1000, // More lenient in development
  message: {
    error: 'Too many requests from this IP, please try again later.',
    message: 'অনেক বেশি অনুরোধ, দয়া করে পরে আবার চেষ্টা করুন।'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = NODE_ENV === 'production' 
      ? [
          'https://your-domain.com',
          'https://www.your-domain.com'
        ]
      : [
          'http://localhost:5173',
          'http://localhost:3000',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:3000'
        ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
}));

// Logging middleware
if (NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      res.status(400).json({
        success: false,
        message: 'Invalid JSON',
        error: 'অবৈধ JSON ডেটা'
      });
      return;
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (NODE_ENV === 'development') {
      console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    }
  });
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    message: 'Dr. Mimu API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
    }
  };
  
  res.json(healthCheck);
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
    environment: NODE_ENV,
    endpoints: {
      health: 'GET /health - Health check',
      auth: {
        base: '/api/auth',
        endpoints: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          logout: 'POST /api/auth/logout',
          profile: 'GET /api/auth/profile',
          updateProfile: 'PUT /api/auth/profile',
          changePassword: 'PUT /api/auth/change-password',
          forgotPassword: 'POST /api/auth/forgot-password',
          resetPassword: 'POST /api/auth/reset-password'
        }
      },
      users: {
        base: '/api/users',
        endpoints: {
          getUser: 'GET /api/users/:id',
          updateUser: 'PUT /api/users/:id',
          deleteUser: 'DELETE /api/users/:id',
          getUserStats: 'GET /api/users/:id/stats'
        }
      },
      medicalRecords: {
        base: '/api/medical-records',
        endpoints: {
          getUserRecords: 'GET /api/medical-records/user/:userId',
          getRecord: 'GET /api/medical-records/:id',
          createRecord: 'POST /api/medical-records',
          updateRecord: 'PUT /api/medical-records/:id',
          deleteRecord: 'DELETE /api/medical-records/:id',
          getRecentRecords: 'GET /api/medical-records/user/:userId/recent',
          getRecordStats: 'GET /api/medical-records/user/:userId/stats',
          getRecordsByType: 'GET /api/medical-records/user/:userId/type/:type',
          getRecordsByDateRange: 'GET /api/medical-records/user/:userId/date-range'
        }
      },
      appointments: {
        base: '/api/appointments',
        endpoints: {
          getUserAppointments: 'GET /api/appointments/user/:userId',
          getAppointment: 'GET /api/appointments/:id',
          createAppointment: 'POST /api/appointments',
          updateAppointment: 'PUT /api/appointments/:id',
          deleteAppointment: 'DELETE /api/appointments/:id',
          getUpcomingAppointments: 'GET /api/appointments/user/:userId/upcoming',
          getAppointmentStats: 'GET /api/appointments/user/:userId/stats'
        }
      },
      prescriptions: {
        base: '/api/prescriptions',
        endpoints: {
          getUserPrescriptions: 'GET /api/prescriptions/user/:userId',
          getPrescription: 'GET /api/prescriptions/:id',
          createPrescription: 'POST /api/prescriptions',
          updatePrescription: 'PUT /api/prescriptions/:id',
          deletePrescription: 'DELETE /api/prescriptions/:id',
          getRecentPrescriptions: 'GET /api/prescriptions/user/:userId/recent',
          getPrescriptionStats: 'GET /api/prescriptions/user/:userId/stats',
          getPrescriptionsByDoctor: 'GET /api/prescriptions/user/:userId/doctor/:doctorName',
          getPrescriptionsByDateRange: 'GET /api/prescriptions/user/:userId/date-range'
        }
      }
    },
    documentation: {
      swagger: '/api/docs',
      postman: '/api/postman.json'
    }
  });
});

// Serve static files in production
if (NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Handle React Router
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    error: 'এই API এন্ডপয়েন্ট পাওয়া যায়নি',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', {
    error: err.message,
    stack: NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: 'ভ্যালিডেশন এরর',
      details: err.message
    });
  }
  
  if (err.name === 'UnauthorizedError' || err.status === 401) {
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
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON',
      error: 'অবৈধ JSON ডেটা'
    });
  }
  
  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS Error',
      error: 'এই ডোমেইন থেকে অ্যাক্সেস অনুমোদিত নয়'
    });
  }
  
  // Default error response
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal Server Error' : err.message,
    error: statusCode === 500 ? 'সার্ভার এরর' : err.message,
    ...(NODE_ENV === 'development' && { 
      details: err.message, 
      stack: err.stack,
      path: req.path,
      method: req.method
    })
  });
});

// Graceful shutdown handlers
const gracefulShutdown = (signal: string) => {
  console.log(`\n${signal} received, shutting down gracefully...`);
  
  // Close server
  server.close(() => {
    console.log('HTTP server closed.');
    
    // Close database connections, cleanup resources, etc.
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Dr. Mimu API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  
  if (NODE_ENV === 'development') {
    console.log(`\n🔗 Available endpoints:`);
    console.log(`   • Authentication: http://localhost:${PORT}/api/auth`);
    console.log(`   • Users: http://localhost:${PORT}/api/users`);
    console.log(`   • Medical Records: http://localhost:${PORT}/api/medical-records`);
    console.log(`   • Appointments: http://localhost:${PORT}/api/appointments`);
    console.log(`   • Prescriptions: http://localhost:${PORT}/api/prescriptions`);
  }
});

export default app;