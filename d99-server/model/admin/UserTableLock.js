import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const UserTableLock = sequelize.define('UserTableLock', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    table_casino_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    is_locked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    tableName: 'user_table_locks',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'table_casino_id']
        }
    ]
});

export default UserTableLock;
