// Dr. Mimu API Server - Express.js backend with Prisma database integration
// Main server file that sets up all routes and middleware

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectToDatabase, disconnectFromDatabase, databaseService } from '../lib/services';

// Import API routes
import userRoutes from './users';
import medicalRecordRoutes from './medical-records';
// Additional routes can be imported here
// import prescriptionRoutes from './prescriptions';
// import appointmentRoutes from './appointments';
// import medicineRoutes from './medicines';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const healthCheck = await databaseService.healthCheck();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: healthCheck.database,
      services: healthCheck.services,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Database statistics endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await databaseService.getOverallStats();
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/medical-records', medicalRecordRoutes);

// Additional routes can be added here
// app.use('/api/prescriptions', prescriptionRoutes);
// app.use('/api/appointments', appointmentRoutes);
// app.use('/api/medicines', medicineRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Dr. Mimu API Server',
    version: '1.0.0',
    description: 'AI-powered medical chatbot backend with PostgreSQL database',
    endpoints: {
      health: '/health',
      stats: '/api/stats',
      users: '/api/users',
      medicalRecords: '/api/medical-records',
      // prescriptions: '/api/prescriptions',
      // appointments: '/api/appointments',
      // medicines: '/api/medicines',
    },
    documentation: '/api/docs', // Future: API documentation
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  
  try {
    await disconnectFromDatabase();
    console.log('Database disconnected successfully');
  } catch (error) {
    console.error('Error during database disconnection:', error);
  }
  
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  
  try {
    await disconnectFromDatabase();
    console.log('Database disconnected successfully');
  } catch (error) {
    console.error('Error during database disconnection:', error);
  }
  
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    // Connect to database
    console.log('🔌 Connecting to database...');
    await connectToDatabase();
    
    // Verify database health
    const healthCheck = await databaseService.healthCheck();
    if (healthCheck.database.status !== 'healthy') {
      throw new Error('Database health check failed');
    }
    
    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`🚀 Dr. Mimu API Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📈 Statistics: http://localhost:${PORT}/api/stats`);
      console.log(`🏥 API Documentation: http://localhost:${PORT}/`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

export default app;
export { startServer };