


import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';
import Role from '../admin/Role.js';
import Staff from '../admin/Staff.js';
import bcrypt from 'bcryptjs';

import Affiliate from '../admin/Affiliate.js';

const User = sequelize.define('User', {
    user_id: {
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
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    telegramChatId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    telegram2FAEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },

    //  Removed coin_type

    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
      passwordChanged: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indicates whether user has changed default password',
    },

    //  Role ID reference
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK to roles table',
    },
    credit_limit: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Maximum credit allowed for this user',
    },

    //  Hierarchy columns
    parent_staff_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'References Staff table (who created this user)',
    },
    parent_owner_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'If user was created by an owner, reference owner ID',
    },

    //  Keep role name for readability
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'USER',
    },
    percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0,
    },
    net_win: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
        defaultValue: 0,
    },
    net_loss: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
        defaultValue: 0,
    },
    profit: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
        defaultValue: 0,
    },

    status: {
        type: DataTypes.ENUM('Active', 'InActive', 'Pending'),
        defaultValue: 'Active',
    },
    bet_locked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'If true, user cannot place bets',
    },
    exp_limit: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
        defaultValue: null,
        comment: 'Max exposure limit for the user',
    },
    login_id: {
        type: DataTypes.STRING, 
        allowNull: true,
        comment: 'Unique ID for the current active login session',
    },
    user_gt: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'users',
    timestamps: true,

});

export default User;