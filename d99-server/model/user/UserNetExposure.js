
import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const UserNetExposure = sequelize.define('UserNetExposure', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        unique: true
    },
    net_exposure: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'user_net_exposure',
    timestamps: true 
});



export default UserNetExposure;
