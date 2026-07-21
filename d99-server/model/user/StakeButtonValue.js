import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const StakeButtonValue = sequelize.define('StakeButtonValue', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Assuming your user table is named 'users'
            key: 'user_id',
        },
    },
    game_buttons: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        comment: 'Array of { label: string, value: number } for Sports',
    },
    casino_buttons: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        comment: 'Array of { label: string, value: number } for Casino',
    },
}, {
    tableName: 'stake_button_values',
    timestamps: true,
});

export default StakeButtonValue;
