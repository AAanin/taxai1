// Medical Records API Routes - Express.js endpoints for medical record management
// Integrates with Prisma database services

import express from 'express';
import { medicalRecordService, type CreateMedicalRecordData, type UpdateMedicalRecordData } from '../lib/services';

const router = express.Router();

// GET /api/medical-records/user/:userId - Get medical records for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    let result;
    if (search) {
      result = await medicalRecordService.searchMedicalRecords(userId, search, page, limit);
    } else {
      result = await medicalRecordService.getMedicalRecordsByUserId(userId, page, limit);
    }

    res.json({
      success: true,
      data: result.records,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: result.pages,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch medical records',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/medical-records/:id - Get medical record by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const includeUser = req.query.includeUser === 'true';

    const record = await medicalRecordService.getMedicalRecordById(id, includeUser);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Medical record not found',
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch medical record',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/medical-records - Create new medical record
router.post('/', async (req, res) => {
  try {
    const recordData: CreateMedicalRecordData = req.body;

    // Validate required fields
    if (!recordData.userId || !recordData.title || !recordData.description) {
      return res.status(400).json({
        success: false,
        error: 'User ID, title, and description are required',
      });
    }

    const record = await medicalRecordService.createMedicalRecord(recordData);

    res.status(201).json({
      success: true,
      data: record,
      message: 'Medical record created successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create medical record',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// PUT /api/medical-records/:id - Update medical record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData: UpdateMedicalRecordData = req.body;

    const record = await medicalRecordService.updateMedicalRecord(id, updateData);

    res.json({
      success: true,
      data: record,
      message: 'Medical record updated successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Medical record not found') {
      return res.status(404).json({
        success: false,
        error: 'Medical record not found',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update medical record',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE /api/medical-records/:id - Delete medical record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await medicalRecordService.deleteMedicalRecord(id);

    res.json({
      success: true,
      message: 'Medical record deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Medical record not found') {
      return res.status(404).json({
        success: false,
        error: 'Medical record not found',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to delete medical record',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/medical-records/user/:userId/recent - Get recent medical records
router.get('/user/:userId/recent', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;

    const records = await medicalRecordService.getRecentMedicalRecords(userId, limit);

    res.json({
      success: true,
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent medical records',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/medical-records/user/:userId/stats - Get medical record statistics
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await medicalRecordService.getMedicalRecordStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch medical record statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/medical-records/user/:userId/by-date - Get medical records by date range
router.get('/user/:userId/by-date', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required',
      });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format',
      });
    }

    const records = await medicalRecordService.getMedicalRecordsByDateRange(userId, start, end);

    res.json({
      success: true,
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch medical records by date range',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/medical-records/user/:userId/by-diagnosis - Get medical records by diagnosis
router.get('/user/:userId/by-diagnosis', async (req, res) => {
  try {
    const { userId } = req.params;
    const { diagnosis } = req.query;

    if (!diagnosis) {
      return res.status(400).json({
        success: false,
        error: 'Diagnosis parameter is required',
      });
    }

    const records = await medicalRecordService.getMedicalRecordsByDiagnosis(userId, diagnosis as string);

    res.json({
      success: true,
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch medical records by diagnosis',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;