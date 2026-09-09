const path = require("path");
const { loadEnv } = require("./env");
const { sendWhatsAppMessage } = require("./green-api");

loadEnv(path.join(__dirname, ".env"));

const [, , phone, ...messageParts] = process.argv;
const message = messageParts.join(" ");

if (!phone || !message) {
  console.error("Usage: node send.js <phone> <message>");
  console.error('Example: node send.js 0501234567 "היי, זו הודעת בדיקה מ-JACRICE"');
  process.exit(1);
}

sendWhatsAppMessage(phone, message)
  .then((result) => {
    console.log("נשלח:", JSON.stringify(result));
  })
  .catch((err) => {
    console.error("שגיאה בשליחה:", err.message);
    process.exit(1);
  });
