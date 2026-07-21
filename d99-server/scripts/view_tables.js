
import TableCasino from '../model/admin/TableCasino.js';

async function listTables() {
  try {
    const tables = await TableCasino.findAll();
    console.log('ID | TableName | TableId');
    console.log('---|---|---');
    tables.forEach(t => {
      console.log(`${t.id} | ${t.tablename} | ${t.tableid}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

listTables();
