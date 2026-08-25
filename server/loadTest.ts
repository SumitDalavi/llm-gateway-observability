import axios from 'axios';

const TEAMS = ['team-frontend', 'team-backend', 'team-data'];
const NUM_REQUESTS = 15;

async function run() {
  console.log("Starting Load Test...");
  const promises = [];
  
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const team = TEAMS[i % TEAMS.length];
    const p = axios.post('http://localhost:4003/v1/chat/completions', {
      messages: [{ role: 'user', content: 'Say hello in 5 words.' }],
      simulateOutage: i % 5 === 0 // 20% of requests trigger an outage simulation
    }, {
      headers: {
        'Authorization': `Bearer ${team}-key`
      }
    }).then(res => {
      console.log(`[${team}] Success:`, res.data._gateway.provider_used);
    }).catch(err => {
      if (err.response) {
        console.log(`[${team}] Error ${err.response.status}:`, err.response.data.error);
      } else {
        console.log(`[${team}] Error:`, err.message);
      }
    });
    promises.push(p);
  }
  
  await Promise.all(promises);
  console.log("Load Test Complete.");
}

run();
