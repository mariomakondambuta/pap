function toCents(amount) {
  const value = Number(amount);
  if (Number.isNaN(value) || value < 0) return 0;
  return Math.round(value * 100);
}

function formatCents(cents, currency = 'EUR') {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency }).format((cents || 0) / 100);
}

function splitAmount(amountCents, commissionPercent) {
  const platformFeeCents = Math.round((amountCents * commissionPercent) / 100);
  const sellerNetCents = amountCents - platformFeeCents;
  return { platformFeeCents, sellerNetCents };
}

module.exports = { toCents, formatCents, splitAmount };
