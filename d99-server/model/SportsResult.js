
// not used yet ...

import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const SportsResult = sequelize.define('Result', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    match_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    winner: { type: DataTypes.STRING },
    actual_value: { type: DataTypes.FLOAT },  // for over-under
    session_value: { type: DataTypes.FLOAT }, // for fancy
    match_status: { type: DataTypes.ENUM('completed', 'abandoned', 'no-result'), allowNull: false },
});

// Association logic should be handled in dbInit.js or similar if needed, 
// but for now we just export the model.
// The original code had:
// SportsResult.associate = (models) => {
//   SportsResult.belongsTo(models.Match, { foreignKey: 'match_id' });
// };
// We might need to move this association to dbInit.js where other associations are defined.

export default SportsResult;
  
