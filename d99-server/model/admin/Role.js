// import { DataTypes } from 'sequelize';
// import sequelize from '../../config/db.js';

// const Role = sequelize.define('Role', {
//     role_id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//     },
//     role: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         unique: true,
//     },
//     power: {
//         type: DataTypes.JSON, // Store as JSON array of strings for permissions
//         allowNull: false,
//         defaultValue: [],
//     },
//     level: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
// });

// export default Role;

// models/Role.js
import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Role = sequelize.define('Role', {
    role_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    power: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
    level: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    is_owner: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    is_company: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    max_downline_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 100.00,
        comment: 'Max % this role can distribute down'
    }
}, {
    timestamps: false
});

export default Role;