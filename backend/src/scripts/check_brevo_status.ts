import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

async function checkBrevo() {
  const apiKey = process.env.SMTP_PASSWORD || '';
  console.log('Testing Brevo API access with key prefix:', apiKey ? apiKey.substring(0, 15) + '...' : 'NONE');

  try {
    const res = await fetch('https://api.brevo.com/v3/account', {
      headers: {
        'api-key': apiKey,
        'Accept': 'application/json',
      },
    });
    console.log('Account endpoint status:', res.status, res.statusText);
    const data = await res.json();
    console.log('Account data:', JSON.stringify(data, null, 2));

    const sendersRes = await fetch('https://api.brevo.com/v3/senders', {
      headers: {
        'api-key': apiKey,
        'Accept': 'application/json',
      },
    });
    console.log('\nSenders endpoint status:', sendersRes.status, sendersRes.statusText);
    const sendersData = await sendersRes.json();
    console.log('Senders data:', JSON.stringify(sendersData, null, 2));

    const eventsRes = await fetch('https://api.brevo.com/v3/smtp/statistics/events?limit=20', {
      headers: {
        'api-key': apiKey,
        'Accept': 'application/json',
      },
    });
    console.log('\nEvents endpoint status:', eventsRes.status, eventsRes.statusText);
    const eventsData = await eventsRes.json();
    console.log('Recent Events:', JSON.stringify(eventsData, null, 2));
  } catch (err) {
    console.error('Error querying Brevo API:', err);
  }
}

checkBrevo();
