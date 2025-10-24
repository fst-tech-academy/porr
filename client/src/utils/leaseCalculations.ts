export interface LeaseCalculationResult {
  duration: number;
  daysRemaining: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  totalRent: number;
  monthlyRent: number;
  renewalEligible: boolean;
  terminationNoticeDate: string;
  earlyTerminationFee: number;
}

export const calculateLeaseFields = (
  startDate: string,
  endDate: string,
  monthlyRent: number = 0,
  earlyTerminationFee: number = 0
): LeaseCalculationResult => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  
  // Calculate duration in months
  const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  
  // Calculate days remaining
  const daysRemaining = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Check if lease is expired
  const isExpired = daysRemaining < 0;
  
  // Check if lease is expiring soon (within 30 days)
  const isExpiringSoon = daysRemaining <= 30 && daysRemaining > 0;
  
  // Calculate total rent for the lease period
  const totalRent = duration * monthlyRent;
  
  // Check if renewal is eligible (not expired and within renewal window)
  const renewalEligible = !isExpired && daysRemaining <= 60;
  
  // Calculate termination notice date (30 days before end date)
  const terminationNoticeDate = new Date(end.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  return {
    duration,
    daysRemaining,
    isExpired,
    isExpiringSoon,
    totalRent,
    monthlyRent,
    renewalEligible,
    terminationNoticeDate: terminationNoticeDate.toISOString().split('T')[0],
    earlyTerminationFee
  };
};

export const calculateEndDateFromStart = (startDate: string, durationMonths: number): string => {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setMonth(end.getMonth() + durationMonths);
  return end.toISOString().split('T')[0];
};

export const calculateStartDateFromEnd = (endDate: string, durationMonths: number): string => {
  const end = new Date(endDate);
  const start = new Date(end);
  start.setMonth(start.getMonth() - durationMonths);
  return start.toISOString().split('T')[0];
};

export const getLeaseStatus = (startDate: string, endDate: string): 'draft' | 'active' | 'expired' | 'upcoming' => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  
  if (today < start) {
    return 'upcoming';
  } else if (today >= start && today <= end) {
    return 'active';
  } else if (today > end) {
    return 'expired';
  } else {
    return 'draft';
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getDaysUntilExpiry = (endDate: string): number => {
  const end = new Date(endDate);
  const today = new Date();
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const isLeaseExpiringSoon = (endDate: string, daysThreshold: number = 30): boolean => {
  const daysUntilExpiry = getDaysUntilExpiry(endDate);
  return daysUntilExpiry <= daysThreshold && daysUntilExpiry > 0;
};
