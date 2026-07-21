
import StaffTableLock from '../model/admin/StaffTableLock.js';
import UserTableLock from '../model/admin/UserTableLock.js';

async function checkDependencies() {
  try {
    const staffLocks = await StaffTableLock.count();
    const userLocks = await UserTableLock.count();
    
    console.log(`StaffTableLock count: ${staffLocks}`);
    console.log(`UserTableLock count: ${userLocks}`);
  } catch (error) {
    console.error('Error checking dependencies:', error);
  }
}

checkDependencies();
