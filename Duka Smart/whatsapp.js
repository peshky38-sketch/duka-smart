// Turns a Kenyan phone number into the format WhatsApp links need (254712345678)
export const toWhatsAppNumber = (phone = "") => {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) d = "254" + d.slice(1);
  else if (d.length === 9) d = "254" + d; // 712345678
  return d;
};

export const reorderMessage = (shop, supplier, items) =>
  `Hello ${supplier}, this is ${shop}. Please supply:\n` +
  items.map((i) => `- ${i.name} x ${i.qty}`).join("\n") +
  "\nThank you.";

export const whatsappLink = (phone, text) => `https://wa.me/${toWhatsAppNumber(phone)}?text=${encodeURIComponent(text)}`;
