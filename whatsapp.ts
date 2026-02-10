export const getWhatsAppLink = (phone: string, message?: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMessage = message ? encodeURIComponent(message) : '';
  return `https://wa.me/55${cleanPhone}?text=${encodedMessage}`;
};
