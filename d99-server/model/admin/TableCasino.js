import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const TableCasino = sequelize.define('TableCasino', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    tableid: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tablename: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    tableName: 'table_casino',
    timestamps: true,
});


// 🧱 Predefined Tables
TableCasino.FIXED_TABLES = [
  { id: 1, tableid: "teen", tablename: "Teenpatti 1-day" },
  { id: 2, tableid: "poker", tablename: "Poker 1-Day" },
  { id: 3, tableid: "baccarat", tablename: "Baccarat" },
  { id: 4, tableid: "baccarat2", tablename: "Baccarat 2" },
  { id: 5, tableid: "card32", tablename: "32 Cards A" },
  { id: 6, tableid: "card32eu", tablename: "32 Cards B" },
  { id: 7, tableid: "dt20", tablename: "20-20 Dragon Tiger" },
  { id: 8, tableid: "dt6", tablename: "1 Day Dragon Tiger" },
  { id: 9, tableid: "lucky7", tablename: "Lucky 7 - A" },
  { id: 10, tableid: "lucky7eu", tablename: "Lucky 7 - B" },
  { id: 11, tableid: "poker20", tablename: "20-20 Poker" },
  { id: 12, tableid: "poker6", tablename: "Poker 6 Players" },
  { id: 13, tableid: "teen20", tablename: "20-20 Teenpatti" },
  { id: 14, tableid: "teen8", tablename: "Teenpatti Open" },
  { id: 15, tableid: "teen9", tablename: "Teenpatti Test" },
  { id: 16, tableid: "queen", tablename: "Queen" },
  { id: 17, tableid: "lucky7eu2", tablename: "Lucky 7 - C" },
  { id: 18, tableid: "superover", tablename: "Super Over" },
  { id: 19, tableid: "trap", tablename: "The Trap" },
  { id: 20, tableid: "patti2", tablename: "2 Cards Teenpatti" },
  { id: 21, tableid: "teensin", tablename: "29Card Baccarat" },
  { id: 22, tableid: "teenmuf", tablename: "Muflis Teenpatti" },
  { id: 23, tableid: "race17", tablename: "Race to 17" },
  { id: 24, tableid: "teen20b", tablename: "20-20 Teenpatti B" },
  { id: 25, tableid: "trio", tablename: "Trio" },
  { id: 26, tableid: "notenum", tablename: "Note Number" },
  { id: 27, tableid: "teen1", tablename: "1 CARD ONE-DAY" },
  { id: 28, tableid: "race2", tablename: "Race to 2nd" },
  { id: 29, tableid: "teen32", tablename: "Instant Teenpatti" },
  { id: 30, tableid: "dum10", tablename: "Dus ka Dum" },
  { id: 31, tableid: "sicbo", tablename: "Sic Bo" },
  { id: 32, tableid: "ballbyball", tablename: "Ball By Ball" },
  { id: 33, tableid: "teen33", tablename: "Instant Teenpatti 3.0" },
  { id: 34, tableid: "superover2", tablename: "Super Over2" },
  { id: 35, tableid: "sicbo2", tablename: "Sic Bo 2" },
  { id: 36, tableid: "teen41", tablename: "Queen top open teenpatti" },
  { id: 37, tableid: "teen42", tablename: "Jack top open teenpatti" },
  { id: 38, tableid: "lucky15", tablename: "Lucky 15" },
  { id: 39, tableid: "goal", tablename: "Goal" },
  { id: 40, tableid: "superover3", tablename: "mini super over" },
  { id: 41, tableid: "teen20c", tablename: "20-20 Teenpatti C" },
  { id: 42, tableid: "joker20", tablename: "Teenpatti Joker 20-20" },
  { id: 43, tableid: "poison20", tablename: "Teenpatti Poison 20-20" },
  { id: 44, tableid: "poison", tablename: "Teenpatti Poison One Day" },
  { id: 45, tableid: "lucky5", tablename: "Lucky 6" },
  { id: 46, tableid: "mogambo", tablename: "Mogambo" },
  { id: 47, tableid: "dolidana", tablename: "Dolidana" },
  { id: 48, tableid: "teen62", tablename: "V VIP Teenpatti 1-day" },
  { id: 49, tableid: "dtl20", tablename: "Dragon Tiger Lion" },
  { id: 50, tableid: "dt202", tablename: "Dragon Tiger 202" },
  { id: 51, tableid: "kbc", tablename: "Kaun Banega Crorepati" },
  { id: 52, tableid: "race20", tablename: "Race 20" },
];

// 🧩 Function to insert (or verify) fixed records
TableCasino.syncFixedData = async () => {
    try {
        for (const table of TableCasino.FIXED_TABLES) {
            // Using upsert to ensure all fields are up-to-date, or findOrCreate if we only want to ensure existence.
            // Given "sync with current state", upsert is safer to enforce the definition.
            // However, verify if user meant "if not there". 
            // "insert pladtform games if not there" -> findOrCreate logic is safer for preserving custom edits if any.
            // User said: "sync table games which insert tables data"
            // Let's use findOrCreate logic as in PlatformGames example provided by user.
            
            await TableCasino.findOrCreate({
                where: { id: table.id },
                defaults: table,
            });
            
            // Also ensure the exact data if it exists? 
            // PlatformGames example did: findOrCreate, then explicit update.
            // Let's stick to findOrCreate first. If they want to force update, they can say so.
            // Actually, for table_id stability, we probably want to ensure tableid and tablename match ID.
            
            // Checking if we should enforce updates.
             const existing = await TableCasino.findByPk(table.id);
             if (existing) {
                 if (existing.tableid !== table.tableid || existing.tablename !== table.tablename) {
                     await existing.update({ tableid: table.tableid, tablename: table.tablename });
                 }
             }
        }
        console.log("✅ TableCasino table verified and fixed data ensured.");
    } catch (error) {
        console.error("❌ Error syncing TableCasino data:", error);
    }
};

export default TableCasino;
