
import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';
import Role from './Role.js';

const Staff = sequelize.define('Staff', {
    staff_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Role,
            key: 'role_id',
        },
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Denormalized role name for quick lookup (e.g., SUPER_ADMIN, ADMIN, USER)',
    },
    level: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Denormalized level (L1, L2, ..., L6)',
    },
    parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        // ✅ REMOVED the references block - let associations handle it
    },
    parent_owner_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID of the owner who created this staff member (if applicable)',
    },
    percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: null,
    },
      credit_limit: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Maximum credit allowed for this staff member',
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indicates if the staff member is active',
    },
    first_login: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    transaction_password: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Stored as plain text',
    },
    telegramChatId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    telegram2FAEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    bet_locked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'If true, this staff and all downline cannot place bets',
    },
    exp_limit: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
        defaultValue: null,
        comment: 'Max exposure limit for the staff',
    },
    bal_down: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Balance down value for the staff member',
    },
    bal_up: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Balance up value for the staff member',
    },
    login_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Unique ID for the current active login session (single-session enforcement)',
    },
}, {
    tableName: 'staff',        // ✅ Explicitly set lowercase table name
    timestamps: true,
    paranoid: true,
});

// ---------------------------
// Associations
// ---------------------------

// Staff belongs to a Role
Staff.belongsTo(Role, {
    foreignKey: 'role_id',
    as: 'roleDetails',
});

// Self-reference: parent staff
Staff.belongsTo(Staff, {
    foreignKey: 'parent_id',
    as: 'parent',
});

// Children (inverse of parent)
Staff.hasMany(Staff, {
    foreignKey: 'parent_id',
    as: 'children',
});

export default Staff;