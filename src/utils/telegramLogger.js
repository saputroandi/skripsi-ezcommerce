const https = require('https');
const TELEGRAM_URL = 'https://api.telegram.org/bot1870520537:AAFoz0hpkpB3976t6jbJDkrmHgDvkzKL4G4/sendMessage';
const CHAT_ID = '-550574946';

function sendTelegramLog(message) {
  const text = encodeURIComponent(message);
  const url = `${TELEGRAM_URL}?chat_id=${CHAT_ID}&text=${text}`;

  https.get(url, (res) => {
    // Optional: handle response if needed
    res.on('data', () => {});
  }).on('error', (err) => {
    // Optional: handle error (do not throw to avoid breaking main flow)
    console.error('Telegram log error:', err.message);
  });
}

module.exports = { sendTelegramLog };