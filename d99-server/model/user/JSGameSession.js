// models/js_game_sessions.js
import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js'; 

const JSGameSession = sequelize.define('JSGameSession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  game_uid: {
    type: DataTypes.STRING,
    allowNull: false
  },
  session_token: {
    type: DataTypes.STRING,
    allowNull: false
  },
  launch_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'active'
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ended_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'js_game_sessions', 
  timestamps: false
});

export default JSGameSession;
