// Helper to filter order history by unique status_to (keep latest by created_at)
export function filterHistoryByStatusTo(history) {
  if (!Array.isArray(history)) return [];
  // Sort by created_at descending
  const sorted = [...history].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const seen = new Set();
  const result = [];
  for (const item of sorted) {
    if (item.status_to !== null && !seen.has(item.status_to)) {
      seen.add(item.status_to);
      result.push(item);
    }
  }
  // Also include payment status changes (metadata.new_payment_status)
  // Only keep the latest one
  const paymentStatusItems = sorted.filter(
    (item) => item.metadata && item.metadata.new_payment_status !== undefined
  );
  if (paymentStatusItems.length > 0) {
    result.unshift(paymentStatusItems[0]);
  }
  return result;
}
