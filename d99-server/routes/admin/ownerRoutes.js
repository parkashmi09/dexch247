import express from 'express';
import OwnerController from '../../controller/admin/OwnerController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import AuthController from '../../controller/admin/ownerAuthController.js';
import verifyTransactionPassword from '../../middleware/transactionPasswordMiddleware.js';

const router = express.Router();




//========== previously used routes but now disabled ==========================


//create owner used by cfz technologies only=======================================
router.post('/owner/create-owner', OwnerController.createOwner);
// Get all clients/websites
// router.get('/owner', OwnerController.getAllOwners);
// // Delete a client/website
// router.delete('/owner/:ownerId', OwnerController.deleteOwner);

// //============================================================================================





// //login client/website
// router.post('/login-owner', AuthController.login);



// //Update a client/website
// router.put('/owner/:ownerId', authMiddleware, OwnerController.updateOwner);



// //Get a specific client/website
// router.get('/owner/:ownerId', authMiddleware, OwnerController.getOwner);



router.put('/owner/update-password', authMiddleware, verifyTransactionPassword, OwnerController.updatePassword);

export default router;


