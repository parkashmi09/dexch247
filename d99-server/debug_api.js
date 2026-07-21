
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.DIAMOND_BASE_URL || 'http://164.52.216.63:3009';
const API_KEY = process.env.DIAMOND_API_KEY;

console.log('Testing API with:', BASE_URL, API_KEY);

async function testEsid(sid) {
    console.log(`\n\n--- Testing /esid for sid=${sid} ---`);
    
    // Test 1: Without newline
    try {
        console.log('1. Trying WITHOUT newline...');
        const res = await axios.get(`${BASE_URL}/esid`, {
            params: { sid, key: API_KEY },
             headers: { Accept: "*/*" }
        });
        console.log('✅ Success:', res.status, res.data ? 'Data received' : 'No data');
    } catch (err) {
        console.log('❌ Failed:', err.message, err.response?.status, err.response?.data);
    }

    // Test 2: With newline
    try {
        console.log('2. Trying WITH newline...');
        const res = await axios.get(`${BASE_URL}/esid\n`, {
            params: { sid, key: API_KEY },
             headers: { Accept: "*/*" }
        });
         console.log('✅ Success:', res.status, res.data ? 'Data received' : 'No data');
    } catch (err) {
        console.log('❌ Failed:', err.message, err.response?.status, err.response?.data);
    }
}

async function run() {
    await testEsid(4); // Cricket - Should work
    await testEsid(11); // The one failing
    await testEsid(68); // The one failing
}

run();
