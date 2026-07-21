
import sequelize from './config/db.js';
import CreditsLedger from './model/user/CreditsLedger.js';

const testInsert = async () => {
  try {
    console.log('--- Testing Real DB Insertion ---');
    
    // Use an existing user_id if possible, or a dummy one. 
    // Based on previous logs, user_id '1' exists (testUser3).
    const userId = '1'; 

    const entry = {
      user_id: userId,
      currency: 'INR',
      amount: 100.00, // Gross
      reason: 'test_settlement',
      description: 'Test entry to verify commission columns',
      eventid: 'test_event_1',
      job_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      match_id: 'test_match_1',
      meta: { test: true },
      market_type: 'MO',
      commission: 2.00,
      finalAmount: 98.00
    };

    console.log('Inserting entry:', entry);

    const created = await CreditsLedger.create(entry);
    console.log('Entry created with ID:', created.id);

    // Read it back
    const fetched = await CreditsLedger.findByPk(created.id);
    console.log('Fetched entry:');
    console.log('Amount (Gross):', fetched.amount);
    console.log('Commission:', fetched.commission);
    console.log('Final Amount (Net):', fetched.finalAmount);

    if (Number(fetched.commission) === 2.00 && Number(fetched.finalAmount) === 98.00) {
      console.log('✅ SUCCESS: Commission and Final Amount correctly stored.');
    } else {
      console.error('❌ FAILURE: Values not stored correctly.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
};

testInsert();
