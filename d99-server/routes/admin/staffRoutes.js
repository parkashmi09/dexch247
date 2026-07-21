// routes/staffRoutes.js
import express from 'express';
import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  getStaffByRole,
  getStaffUnderParent,
  deleteStaff,
  updateStaffPassword
} from '../../controller/admin/StaffController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import verifyTransactionPassword from '../../middleware/transactionPasswordMiddleware.js';


import { authorize, validateHierarchy, validateParent } from '../../middleware/ruleMiddleware.js';

const router = express.Router();

// Apply auth + permission middleware (assume req.user is set)
// router.use(requirePower('manage_staff')); // All staff routes require this

// CREATE
router.post('/staff/create-staff', authMiddleware, verifyTransactionPassword, validateHierarchy, validateParent, createStaff);

// READ
router.get('/staff/get-all-staff', getAllStaff);
router.get('/staff/get-staff-by-id/:id', getStaffById);
router.get('/staff/get-staff-by-role-id/:role', getStaffByRole);
router.get('/staff/get-staff-by-parent-id/:parentId', getStaffUnderParent);

// UPDATE
router.patch('/staff/update-staff/:id', updateStaff);

// DELETE
router.delete('/staff/delete-staff/:id', deleteStaff);

// UPDATE PASSWORD (Owner/Staff)
router.post('/staff-update-password', authMiddleware, updateStaffPassword);

export default router;