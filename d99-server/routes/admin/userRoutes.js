import express from 'express';
const router = express.Router();
import UserController from '../../controller/admin/userController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import verifyTransactionPassword from '../../middleware/transactionPasswordMiddleware.js';
import { authorize, validateHierarchy, validateParent } from '../../middleware/ruleMiddleware.js';
import requirePermission from '../../middleware/permissionMiddleware.js';


// Public route: Get all users
// router.get('/users-list', authMiddleware, UserController.getAllUsers);
// router.get('/user', authMiddleware, UserController.getUser); // user profile details

router.get('/users/all-details', authMiddleware, requirePermission('userList'), UserController.getUserAllDetails); // all details for admin of user:  username + balance + total exposure + credit

//no need ad search user by username created
//  router.get('/all-details-by-user',UserController.getSingleUserDetails);

router.get('/search-by-username', authMiddleware, requirePermission('userList'), UserController.searchUsersByUsername)

// Live username availability check (users + staff + owners)
router.get('/check-username', authMiddleware, UserController.checkUsername)

router.get('/staff/profile', authMiddleware, UserController.getLoggedInStaffDetails);

router.get('/owner/profile', authMiddleware, UserController.getLoggedInOwnerDetails);

router.get('/user/exposures/:userId', authMiddleware, UserController.getUserExposures);
router.get('/user/net-exposures/:userId', authMiddleware, UserController.getNetExposures);

router.get('/user/profile', authMiddleware, UserController.getLoggedInUserDetails);
// Protected route: Create a user
// router.post('/users-create',authMiddleware, UserController.createUser);
//public
// router.post('/register-user', UserController.registerUser);

//update pass  used by loged in user : should use in main site under profile section, can use it, not used yet 
// router.put('/user-update-password',authMiddleware, UserController.updatePassword);

//update pass  used by loged in staff : used in admin panel under profile/settings tab
router.put('/staff-update-password', authMiddleware, verifyTransactionPassword, UserController.updateStaffPassword);

//update pass and status for admin usage:   used by staff to any user or any staff , newly added
router.put('/staff-user-update', authMiddleware, verifyTransactionPassword, UserController.updateStaffAndUser)

router.post('/matchexposure/all-users', authMiddleware, UserController.getUserExposuresByHierarchyAndMatch);





// User Management
router.post(
  '/users/create-under-parent',
  authMiddleware,
  requirePermission('insertUser'),
  verifyTransactionPassword,
  authorize('CREATE_USER_UNDER_PARENT'),
  validateHierarchy,
  validateParent,
  UserController.createUserUnderParent
);

export default router;