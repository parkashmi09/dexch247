
import { Sequelize, Op } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

// Setup Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
  }
);

// Define Models (Simplified)
const Staff = sequelize.define('Staff', {
  staff_id: { type: Sequelize.INTEGER, primaryKey: true },
  username: Sequelize.STRING,
  parent_id: Sequelize.INTEGER,
  parent_owner_id: Sequelize.INTEGER,
  role: Sequelize.STRING
}, { tableName: 'staff', timestamps: false });

const User = sequelize.define('User', {
  user_id: { type: Sequelize.INTEGER, primaryKey: true },
  username: Sequelize.STRING,
  parent_staff_id: Sequelize.INTEGER,
  parent_owner_id: Sequelize.INTEGER
}, { tableName: 'users', timestamps: false });

const Wallet = sequelize.define('Wallet', {
  wallet_id: { type: Sequelize.INTEGER, primaryKey: true },
  user_id: Sequelize.INTEGER,
  staff_id: Sequelize.INTEGER,
  username: Sequelize.STRING,
  profit_loss: Sequelize.DECIMAL
}, { tableName: 'Wallets', timestamps: false });

async function runDebug() {
  try {
    const tables = await sequelize.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`, { type: Sequelize.QueryTypes.SELECT });
    console.log('Tables Raw:', tables);

    const ownerId = 1; // Assuming owner_1 is ID 1
    console.log(`Checking hierarchy for Owner ID: ${ownerId}`);

    // 1. Find Child Staff
    // Check specific staff ID 4
    const staff4 = await Staff.findOne({ where: { staff_id: 4 }, raw: true });
    console.log('Staff ID 4:', staff4);

    const childStaff = await Staff.findAll({
      where: { parent_id: ownerId },
      raw: true
    });
    console.log(`Found ${childStaff.length} Child Staff:`, childStaff.map(s => `${s.username} (ID: ${s.staff_id})`));

    // 2. Find Child Users
    const childUsers = await User.findAll({
      where: { parent_owner_id: ownerId },
      raw: true
    });
    console.log(`Found ${childUsers.length} Child Users:`, childUsers.map(u => `${u.username} (ID: ${u.user_id})`));

    const staffIds = childStaff.map(s => s.staff_id);
    const userIds = childUsers.map(u => u.user_id);

    // 3. Find Wallets
    const wallets = await Wallet.findAll({
      where: {
        [Op.or]: [
          { staff_id: { [Op.in]: staffIds } },
          { user_id: { [Op.in]: userIds } }
        ]
      },
      raw: true
    });

    console.log(`Found ${wallets.length} Wallets:`, wallets.map(w => `${w.username} (WalletID: ${w.wallet_id}, StaffID: ${w.staff_id}, UserID: ${w.user_id})`));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

runDebug();
