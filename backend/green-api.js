function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} — copy backend/.env.example to backend/.env and fill in your Green API console values.`);
  }
  return value;
}

// Green API expects a chatId like "972501234567@c.us" (international,
// no leading 0, no "+"). Israeli mobiles are dialed locally as 05X-XXXXXXX,
// so a leading 0 is assumed to mean "+972 without the 0" — adjust here if
// this backend ever serves clients outside Israel.
function normalizePhoneToChatId(phone) {
  const digits = String(phone).replace(/[^0-9]/g, "");
  if (!digits) throw new Error(`Invalid phone number: "${phone}"`);
  const international = digits.startsWith("0") ? "972" + digits.slice(1) : digits;
  return `${international}@c.us`;
}

async function sendWhatsAppMessage(phone, message) {
  const idInstance = requireEnv("GREEN_API_ID_INSTANCE");
  const apiToken = requireEnv("GREEN_API_TOKEN");
  const apiUrl = process.env.GREEN_API_URL || "https://api.green-api.com";
  const chatId = normalizePhoneToChatId(phone);

  const url = `${apiUrl}/waInstance${idInstance}/sendMessage/${apiToken}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, message }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Green API error ${response.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

module.exports = { sendWhatsAppMessage, normalizePhoneToChatId };
