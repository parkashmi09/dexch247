import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const MannualResult = sequelize.define('MannualResult', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    match_title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    eventid: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    match_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    market_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    game_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    winnerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'winnerId'
    },
    winnerName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'winnerName'
    },
    fancyName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'fancyName'
    },
}, {
    tableName: 'mannual_result',
    timestamps: true,   // createdAt & updatedAt
    underscored: true,  // created_at, updated_at
});

export default MannualResult;
