import { DataTypes } from "sequelize";
import sequelize from '../config/db.js';

const Executive = sequelize.define(
  "Executive",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    parent_type: {
      type: DataTypes.ENUM("OWNER", "STAFF"),
      allowNull: false
    },

    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false
    },

    role: {
      type: DataTypes.STRING,
      allowNull: false
    },

    permissions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    },

    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    tableName: "executives",
    timestamps: true
  }
);

export default Executive;
