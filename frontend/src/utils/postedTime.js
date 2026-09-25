export function postedTime(item) {
  const sourceDate = item?.publishedOn || item?.createdAt;
  if (!sourceDate) return item?.time || 'Recently';

  const posted = new Date(sourceDate.length === 10 ? `${sourceDate}T12:00:00` : sourceDate);
  if (Number.isNaN(posted.getTime())) return item?.time || 'Recently';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const postedDay = new Date(posted.getFullYear(), posted.getMonth(), posted.getDate());
  const daysAgo = Math.round((today - postedDay) / 86400000);
  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return 'Yesterday';
  return posted.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(posted.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
  });
}
