import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";
import PlatformGames from "./PlatformGames.js";

const GamesMarkets = sequelize.define(
  "GamesMarkets",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    game_id: {
      type: DataTypes.TEXT, // Now referencing sport_id (TEXT)
      allowNull: false,
      references: {
        model: PlatformGames,
        key: "sport_id",
      },
      onDelete: "CASCADE",
    },
    staff_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // null = Owner/Global
    },

    // ✅ New Field
    ALL: { type: DataTypes.BOOLEAN, defaultValue: false },

    // ---- Casino ----
    TurboGrill_Studio: { type: DataTypes.BOOLEAN, defaultValue: false },
    Royal_Casino: { type: DataTypes.BOOLEAN, defaultValue: false },
    Bettor_Games: { type: DataTypes.BOOLEAN, defaultValue: false },
    Star_Casino: { type: DataTypes.BOOLEAN, defaultValue: false },
    Betfair: { type: DataTypes.BOOLEAN, defaultValue: false },
    Sports_Book: { type: DataTypes.BOOLEAN, defaultValue: false },
    Super_Nova: { type: DataTypes.BOOLEAN, defaultValue: false },

    // ---- Cricket ----
    Figure: { type: DataTypes.BOOLEAN, defaultValue: false },
    Fancy: { type: DataTypes.BOOLEAN, defaultValue: false },
    Match_Odds: { type: DataTypes.BOOLEAN, defaultValue: false },
    Even_Odd: { type: DataTypes.BOOLEAN, defaultValue: false },
    Live: { type: DataTypes.BOOLEAN, defaultValue: false },
    Cup_Winner: { type: DataTypes.BOOLEAN, defaultValue: false },

    // ---- Greyhound ----
    Australia: { type: DataTypes.BOOLEAN, defaultValue: false },
    Britain: { type: DataTypes.BOOLEAN, defaultValue: false },
    New_Zealand: { type: DataTypes.BOOLEAN, defaultValue: false },

    // ---- Horse Race ----
    Dubai: { type: DataTypes.BOOLEAN, defaultValue: false },
    France: { type: DataTypes.BOOLEAN, defaultValue: false },
    Germany: { type: DataTypes.BOOLEAN, defaultValue: false },
    Ireland: { type: DataTypes.BOOLEAN, defaultValue: false },
    Ireland_PLACE: { type: DataTypes.BOOLEAN, defaultValue: false },
    England: { type: DataTypes.BOOLEAN, defaultValue: false },
    Sweden: { type: DataTypes.BOOLEAN, defaultValue: false },
    Singapore: { type: DataTypes.BOOLEAN, defaultValue: false },
    America: { type: DataTypes.BOOLEAN, defaultValue: false },
    Africa: { type: DataTypes.BOOLEAN, defaultValue: false },

    // ---- Soccer ----
    Over_Under_Goals: { type: DataTypes.BOOLEAN, defaultValue: false },

    // ---- Tennis ----
    Tennis_Match_Odds: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    tableName: "games_markets",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Associations
PlatformGames.hasMany(GamesMarkets, { foreignKey: "game_id" });
GamesMarkets.belongsTo(PlatformGames, { foreignKey: "game_id" });

export default GamesMarkets;
