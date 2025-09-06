// User API Routes - Express.js endpoints for user management
// Integrates with Prisma database services

import express from 'express';
import { userService, type CreateUserData, type UpdateUserData } from '../lib/services';

const router = express.Router();

// GET /api/users - Get all users with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    let result;
    if (search) {
      result = await userService.searchUsers(search, page, limit);
    } else {
      result = await userService.getUsers(page, limit);
    }

    res.json({
      success: true,
      data: result.users,
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
      error: 'Failed to fetch users',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const includeRelations = req.query.include === 'true';

    const user = await userService.getUserById(id, includeRelations);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/users - Create new user
router.post('/', async (req, res) => {
  try {
    const userData: CreateUserData = req.body;

    // Validate required fields
    if (!userData.email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    // Check if user already exists
    const existingUser = await userService.getUserByEmail(userData.email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists',
      });
    }

    const user = await userService.createUser(userData);

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData: UpdateUserData = req.body;

    const user = await userService.updateUser(id, updateData);

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully',
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
      error: 'Failed to update user',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await userService.deleteUser(id);

    res.json({
      success: true,
      message: 'User deleted successfully',
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
      error: 'Failed to delete user',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/users/:id/stats - Get user statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const stats = await userService.getUserStats(id);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/users/check-email - Check if email exists
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    const exists = await userService.userExists(email);

    res.json({
      success: true,
      data: { exists },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check email',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;