export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

export const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN').format(amount);
};