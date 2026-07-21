import Staff from '../../model/admin/Staff.js';
import Owner from '../../model/admin/Owner.js';
import PasswordService from '../../services/passwordService.js';
import sequelize from '../../config/db.js';

export const updatePassword = async (userId, userRole, oldPassword, newPassword) => {
  const transaction = await sequelize.transaction();
  try {
    let user;
    // Determine if user is Owner or Staff
    if (userRole === 'OWNER' || userRole === 'Owner') {
      user = await Owner.findOne({ where: { owner_id: userId } });
    } else {
      user = await Staff.findByPk(userId);
    }

    if (!user) {
      await transaction.rollback();
      return { success: false, status: 404, message: 'User not found' };
    }

    // Verify old password
    const isValid = await PasswordService.comparePassword(oldPassword, user.password);
    if (!isValid) {
      await transaction.rollback();
      return { success: false, status: 400, message: 'Old password is incorrect' };
    }

    // Validate new password strength
    const validation = PasswordService.validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      await transaction.rollback();
      return {
        success: false,
        status: 400,
        message: `New password too weak: ${validation.errors.join(', ')}`
      };
    }

    // Hash new password
    const hashedPassword = await PasswordService.hashPassword(newPassword);

    // Update user
    await user.update({ password: hashedPassword }, { transaction });

    await transaction.commit();

    return { success: true, status: 200, message: 'Password updated successfully' };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
