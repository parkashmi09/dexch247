import ReportsController from './controller/admin/reportsController.js';
import sequelize from './config/db.js';

const req = {
  user: {
    user_id: 1,
    role: 'USER',
    username: 'testUser1'
  },
  body: {
    gameName: 'SPORTS',
    fromDate: '2025-11-29',
    toDate: '2025-11-30',
    page: 1,
    limit: 10
  }
};

const res = {
  status: (code) => ({
    json: (data) => {
      console.log(`Response Status: ${code}`);
      console.log('Response Data:', JSON.stringify(data, null, 2));
    }
  })
};

async function run() {
  try {
    await sequelize.authenticate();
    console.log('DB Connected');
    await ReportsController.getAccountStatement(req, res);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // await sequelize.close(); // Keep open if needed or close
    process.exit(0);
  }
}

run();
