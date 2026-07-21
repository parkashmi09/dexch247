
const num = (n) => Number(n) || 0;

const mockCreditsLedger = {
  create: async (data) => {
    console.log('--- CreditsLedger.create called with: ---');
    console.log(JSON.stringify(data, null, 2));
    return data;
  }
};

const mockWallet = {
  findOne: async () => ({ inr: 1000, update: async () => {} })
};

const log = { error: console.error };

async function creditINRWithLedger({ user_id, eventid, match_id, market_type, amount, description, meta, job_id, grossAmount = null, commission = null, finalAmount = null }) {
  // Use finalAmount for wallet update (net amount after commission), or fallback to amount for backward compatibility
  const creditAmount = finalAmount !== null ? finalAmount : amount;
  const amt = num(creditAmount);
  // if (amt === 0 && !LEDGER_ZERO_ROWS) return { credited: 0 }; // Mocked out
  try {
    const creditRecord = await mockWallet.findOne({ where: { user_id: String(user_id) } });
    let newBal = null;
    if (creditRecord) {
      newBal = (creditRecord.inr || 0) + amt;
      // await creditRecord.update({ inr: newBal });
    }
    
    // Create ledger entry with gross amount, commission, and final amount
    const ledgerEntry = {
      user_id: String(user_id),
      currency: 'INR',
      amount: grossAmount !== null ? num(grossAmount) : amt, // Store gross winning amount
      reason: 'settlement',
      description: description || '',
      eventid: String(eventid),
      job_id: String(job_id || ''),
      match_id: match_id ? String(match_id) : null,
      meta: meta || {},
      market_type
    };
    
    // Add commission and finalAmount if provided
    if (commission !== null) {
      ledgerEntry.commission = num(commission);
    }
    if (finalAmount !== null) {
      ledgerEntry.finalAmount = num(finalAmount);
    }
    
    await mockCreditsLedger.create(ledgerEntry);
    return { credited: amt, newBalance: newBal };
  } catch (e) {
    console.error('[Settlement] creditINRWithLedger failed', { user_id, eventid, error: e.message });
    return { credited: 0 };
  }
}

// Test case
const runTest = async () => {
  const commissionData = {
    winningAmount: 100.00,
    commission: 2.00,
    finalAmount: 98.00
  };

  console.log('Testing with commission data:', commissionData);

  await creditINRWithLedger({
    user_id: '123',
    eventid: 'evt1',
    match_id: 'match1',
    market_type: 'MO',
    amount: commissionData.finalAmount, // 98.00
    description: 'Test settlement',
    meta: {},
    job_id: 'job1',
    grossAmount: commissionData.winningAmount, // 100.00
    commission: commissionData.commission, // 2.00
    finalAmount: commissionData.finalAmount // 98.00
  });
};

runTest();
