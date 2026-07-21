import { DataTypes, Op } from 'sequelize';
import sequelize from '../../config/db.js';

const StaffTableLock = sequelize.define('StaffTableLock', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    staff_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    owner_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
    tableName: 'staff_table_locks',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['staff_id', 'table_casino_id'],
            where: {
                staff_id: {
                    [Op.ne]: null
                }
            }
        },
        {
            unique: true,
            fields: ['owner_id', 'table_casino_id'],
            where: {
                owner_id: {
                    [Op.ne]: null
                }
            }
        }
    ]
});

export default StaffTableLock;
