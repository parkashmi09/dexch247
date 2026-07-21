import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const UserActivityLog = sequelize.define('UserActivityLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID if type is USER',
    },
    staff_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID if type is STAFF',
    },
    owner_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID if type is OWNER',
    },
    user_type: {
        type: DataTypes.ENUM('USER', 'STAFF', 'OWNER'),
        allowNull: false,
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'LOGIN, PASSWORD_CHANGE, STATUS_CHANGE, etc.',
    },
    ip_address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    browser_detail: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'User Agent string',
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Additional details in JSON or text format',
    },
}, {
    tableName: 'user_activity_logs',
    timestamps: true,
    updatedAt: false, // We only care about creation time for logs
});

export default UserActivityLog;
