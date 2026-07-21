import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';


const Agent = sequelize.define('Agent', {
    agent_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Ensure email is unique
        validate: {
            isEmail: true, // Validate email format
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('Master', 'Agent'), // Enum for role
        allowNull: false,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

export default Agent;