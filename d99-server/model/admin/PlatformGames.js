import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const PlatformGames = sequelize.define(
  "PlatformGames",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    sport_id: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: true,
    },
  },
  {
    tableName: "platform_games",
    timestamps: false,
  }
);

// 🧱 Predefined Game IDs
PlatformGames.FIXED_GAMES = [
  { id: 3, name: "Casino", sport_id: "999" },
  { id: 4, name: "Cricket", sport_id: "4" },
  { id: 65, name: "Greyhound", sport_id: "65" },
  { id: 10, name: "HorseRace", sport_id: "10" },
  { id: 1, name: "Soccer", sport_id: "1" },
  { id: 2, name: "Tennis", sport_id: "2" },
];

// 🧩 Function to insert (or verify) fixed records
PlatformGames.syncFixedData = async () => {
  for (const game of PlatformGames.FIXED_GAMES) {
    await PlatformGames.findOrCreate({
      where: { id: game.id },
      defaults: game,
    });
  }
  console.log("✅ PlatformGames table verified and fixed data ensured.");
};

export default PlatformGames;
