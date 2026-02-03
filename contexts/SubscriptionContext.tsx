import React, { useState, useEffect, useCallback, useRef, createContext, useContext, ReactNode } from 'react';
import { Platform } from 'react-native';
import Purchases, { 
  PurchasesPackage, 
  CustomerInfo,
  PurchasesOffering
} from 'react-native-purchases';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpcClient } from '@/lib/trpc';

function getRCApiKey() {
  if (__DEV__ || Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY || '';
  }
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    default: process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY,
  }) || '';
}

const apiKey = getRCApiKey();
let isConfigured = false;

if (apiKey && !isConfigured) {
  console.log('Configuring RevenueCat with API key');
  Purchases.configure({ apiKey });
  isConfigured = true;
}

export interface SubscriptionPackage {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    title: string;
    description: string;
    priceString: string;
    price: number;
  };
  rcPackage: PurchasesPackage;
}

const NOTIFIED_TRANSACTIONS_KEY = '@ronaldify_notified_transactions';

const PLAN_PRICES: Record<string, { amount: string; type: 'weekly' | 'monthly' | 'yearly' }> = {
  '$rc_weekly': { amount: '$4.99', type: 'weekly' },
  '$rc_monthly': { amount: '$9.99', type: 'monthly' },
  '$rc_annual': { amount: '$59.99', type: 'yearly' },
};

function formatPriceString(priceString: string): string {
  if (priceString.startsWith('

const MOCK_PACKAGES: SubscriptionPackage[] = [
  {
    identifier: 'ronaldify_weekly',
    packageType: '$rc_weekly',
    product: {
      identifier: 'ronaldify_weekly',
      title: 'Weekly Pro',
      description: '$4.99/week',
      priceString: '$4.99',
      price: 4.99,
    },
    rcPackage: null as unknown as PurchasesPackage,
  },
  {
    identifier: 'ronaldify_monthly',
    packageType: '$rc_monthly',
    product: {
      identifier: 'ronaldify_monthly',
      title: 'Monthly Pro',
      description: '$9.99/month',
      priceString: '$9.99',
      price: 9.99,
    },
    rcPackage: null as unknown as PurchasesPackage,
  },
  {
    identifier: 'ronaldify_yearly',
    packageType: '$rc_annual',
    product: {
      identifier: 'ronaldify_yearly',
      title: 'Yearly Pro',
      description: '$59.99/year',
      priceString: '$59.99',
      price: 59.99,
    },
    rcPackage: null as unknown as PurchasesPackage,
  },
];

async function getNotifiedTransactions(): Promise<Set<string>> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFIED_TRANSACTIONS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

async function markTransactionNotified(transactionId: string): Promise<void> {
  try {
    const notified = await getNotifiedTransactions();
    notified.add(transactionId);
    const arr = Array.from(notified).slice(-100);
    await AsyncStorage.setItem(NOTIFIED_TRANSACTIONS_KEY, JSON.stringify(arr));
  } catch (error) {
    console.log('Error saving notified transaction:', error);
  }
}

interface SubscriptionContextValue {
  isPro: boolean;
  isLoading: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;
  packages: SubscriptionPackage[];
  currentOffering: PurchasesOffering | null | undefined;
  customerInfo: CustomerInfo | null;
  purchasePackage: (pkg: SubscriptionPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refetchCustomerInfo: () => void;
  setAuthUser: (user: { uid: string; displayName: string | null; email: string } | null) => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [authUser, setAuthUser] = useState<{ uid: string; displayName: string | null; email: string } | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const notificationSentRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (authUser && isConfigured) {
      console.log('Logging in to RevenueCat with user:', authUser.uid);
      Purchases.logIn(authUser.uid).catch(err => {
        console.log('RevenueCat login error:', err);
      });
    }
  }, [authUser]);

  const customerInfoQuery = useQuery({
    queryKey: ['customerInfo'],
    queryFn: async () => {
      if (!isConfigured) return null;
      console.log('Fetching customer info...');
      const info = await Purchases.getCustomerInfo();
      console.log('Customer info:', info.entitlements.active);
      return info;
    },
    enabled: !!authUser && isConfigured,
    staleTime: 1000 * 60 * 5,
  });

  const offeringsQuery = useQuery({
    queryKey: ['offerings'],
    queryFn: async () => {
      if (!isConfigured) return null;
      console.log('Fetching offerings...');
      const offerings = await Purchases.getOfferings();
      console.log('Offerings:', offerings.current?.availablePackages.length, 'packages');
      return offerings;
    },
    enabled: isConfigured,
    staleTime: 1000 * 60 * 30,
  });

  const sendSubscriptionNotification = useCallback(async (
    packageType: string,
    transactionId: string,
    isRenewal: boolean = false
  ) => {
    if (notificationSentRef.current.has(transactionId)) {
      console.log('Notification already sent for transaction:', transactionId);
      return;
    }

    const notified = await getNotifiedTransactions();
    if (notified.has(transactionId)) {
      console.log('Transaction already notified (from storage):', transactionId);
      notificationSentRef.current.add(transactionId);
      return;
    }

    const planInfo = PLAN_PRICES[packageType] || { amount: 'Unknown', type: 'monthly' as const };
    const userName = authUser?.displayName || authUser?.email || 'Anonymous';

    try {
      console.log('Sending subscription notification for:', userName, planInfo.type);
      await trpcClient.notifications.notifySubscription.mutate({
        userName,
        planType: planInfo.type,
        amount: planInfo.amount,
        isRenewal,
        transactionId,
      });
      
      notificationSentRef.current.add(transactionId);
      await markTransactionNotified(transactionId);
      console.log('Subscription notification sent successfully');
    } catch (error) {
      console.log('Failed to send subscription notification:', error);
    }
  }, [authUser]);

  const purchaseMutation = useMutation({
    mutationFn: async (pkg: PurchasesPackage) => {
      console.log('Purchasing package:', pkg.identifier);
      setIsPurchasing(true);
      try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        return { customerInfo, packageType: pkg.packageType };
      } finally {
        setIsPurchasing(false);
      }
    },
    onSuccess: async ({ customerInfo, packageType }) => {
      console.log('Purchase successful');
      queryClient.setQueryData(['customerInfo'], customerInfo);
      
      const purchaseTimestamp = Date.now();
      const productId = customerInfo.allPurchasedProductIdentifiers?.[customerInfo.allPurchasedProductIdentifiers.length - 1] || 'unknown';
      const transactionId = `${productId}_${purchaseTimestamp}`;
      
      console.log('Sending notification with transaction ID:', transactionId);
      
      sendSubscriptionNotification(packageType, transactionId, false).catch(err => {
        console.log('Notification send failed:', err);
      });
    },
    onError: (error: Error) => {
      console.log('Purchase error:', error.message);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      console.log('Restoring purchases...');
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo;
    },
    onSuccess: (customerInfo) => {
      console.log('Restore successful');
      queryClient.setQueryData(['customerInfo'], customerInfo);
    },
    onError: (error: Error) => {
      console.log('Restore error:', error.message);
    },
  });

  const customerInfo = customerInfoQuery.data as CustomerInfo | null;
  const isPro = customerInfo?.entitlements.active['Ronaldify Pro'] !== undefined;

  const currentOffering = offeringsQuery.data?.current;
  
  const packages: SubscriptionPackage[] = currentOffering?.availablePackages.map(pkg => ({
    identifier: pkg.identifier,
    packageType: pkg.packageType,
    product: {
      identifier: pkg.product.identifier,
      title: pkg.product.title,
      description: pkg.product.description,
      priceString: formatPriceString(pkg.product.priceString),
      price: pkg.product.price,
    },
    rcPackage: pkg,
  })) || [];

  const hasRealPackages = packages.length > 0;
  const displayPackages = hasRealPackages ? packages : MOCK_PACKAGES;
  
  const sortedPackages = [...displayPackages].sort((a, b) => {
    const order: Record<string, number> = { '$rc_weekly': 0, '$rc_monthly': 1, '$rc_annual': 2 };
    return (order[a.packageType] ?? 99) - (order[b.packageType] ?? 99);
  });

  const { mutateAsync: purchaseMutateAsync } = purchaseMutation;
  const purchasePackage = useCallback(async (pkg: SubscriptionPackage): Promise<boolean> => {
    try {
      await purchaseMutateAsync(pkg.rcPackage);
      return true;
    } catch {
      return false;
    }
  }, [purchaseMutateAsync]);

  const { mutateAsync: restoreMutateAsync } = restoreMutation;
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    try {
      const info = await restoreMutateAsync();
      return info.entitlements.active['Ronaldify Pro'] !== undefined;
    } catch {
      return false;
    }
  }, [restoreMutateAsync]);

  const value: SubscriptionContextValue = {
    isPro,
    isLoading: customerInfoQuery.isLoading || offeringsQuery.isLoading,
    isPurchasing: isPurchasing || purchaseMutation.isPending,
    isRestoring: restoreMutation.isPending,
    packages: sortedPackages,
    currentOffering,
    customerInfo,
    purchasePackage,
    restorePurchases,
    refetchCustomerInfo: () => queryClient.invalidateQueries({ queryKey: ['customerInfo'] }),
    setAuthUser,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}
)) return priceString;
  const match = priceString.match(/([\d.,]+)/);
  if (match) {
    return '

const MOCK_PACKAGES: SubscriptionPackage[] = [
  {
    identifier: 'ronaldify_weekly',
    packageType: '$rc_weekly',
    product: {
      identifier: 'ronaldify_weekly',
      title: 'Weekly Pro',
      description: '$4.99/week',
      priceString: '$4.99',
      price: 4.99,
    },
    rcPackage: null as unknown as PurchasesPackage,
  },
  {
    identifier: 'ronaldify_monthly',
    packageType: '$rc_monthly',
    product: {
      identifier: 'ronaldify_monthly',
      title: 'Monthly Pro',
      description: '$9.99/month',
      priceString: '$9.99',
      price: 9.99,
    },
    rcPackage: null as unknown as PurchasesPackage,
  },
  {
    identifier: 'ronaldify_yearly',
    packageType: '$rc_annual',
    product: {
      identifier: 'ronaldify_yearly',
      title: 'Yearly Pro',
      description: '$59.99/year',
      priceString: '$59.99',
      price: 59.99,
    },
    rcPackage: null as unknown as PurchasesPackage,
  },
];

async function getNotifiedTransactions(): Promise<Set<string>> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFIED_TRANSACTIONS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

async function markTransactionNotified(transactionId: string): Promise<void> {
  try {
    const notified = await getNotifiedTransactions();
    notified.add(transactionId);
    const arr = Array.from(notified).slice(-100);
    await AsyncStorage.setItem(NOTIFIED_TRANSACTIONS_KEY, JSON.stringify(arr));
  } catch (error) {
    console.log('Error saving notified transaction:', error);
  }
}

interface SubscriptionContextValue {
  isPro: boolean;
  isLoading: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;
  packages: SubscriptionPackage[];
  currentOffering: PurchasesOffering | null | undefined;
  customerInfo: CustomerInfo | null;
  purchasePackage: (pkg: SubscriptionPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refetchCustomerInfo: () => void;
  setAuthUser: (user: { uid: string; displayName: string | null; email: string } | null) => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [authUser, setAuthUser] = useState<{ uid: string; displayName: string | null; email: string } | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const notificationSentRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (authUser && isConfigured) {
      console.log('Logging in to RevenueCat with user:', authUser.uid);
      Purchases.logIn(authUser.uid).catch(err => {
        console.log('RevenueCat login error:', err);
      });
    }
  }, [authUser]);

  const customerInfoQuery = useQuery({
    queryKey: ['customerInfo'],
    queryFn: async () => {
      if (!isConfigured) return null;
      console.log('Fetching customer info...');
      const info = await Purchases.getCustomerInfo();
      console.log('Customer info:', info.entitlements.active);
      return info;
    },
    enabled: !!authUser && isConfigured,
    staleTime: 1000 * 60 * 5,
  });

  const offeringsQuery = useQuery({
    queryKey: ['offerings'],
    queryFn: async () => {
      if (!isConfigured) return null;
      console.log('Fetching offerings...');
      const offerings = await Purchases.getOfferings();
      console.log('Offerings:', offerings.current?.availablePackages.length, 'packages');
      return offerings;
    },
    enabled: isConfigured,
    staleTime: 1000 * 60 * 30,
  });

  const sendSubscriptionNotification = useCallback(async (
    packageType: string,
    transactionId: string,
    isRenewal: boolean = false
  ) => {
    if (notificationSentRef.current.has(transactionId)) {
      console.log('Notification already sent for transaction:', transactionId);
      return;
    }

    const notified = await getNotifiedTransactions();
    if (notified.has(transactionId)) {
      console.log('Transaction already notified (from storage):', transactionId);
      notificationSentRef.current.add(transactionId);
      return;
    }

    const planInfo = PLAN_PRICES[packageType] || { amount: 'Unknown', type: 'monthly' as const };
    const userName = authUser?.displayName || authUser?.email || 'Anonymous';

    try {
      console.log('Sending subscription notification for:', userName, planInfo.type);
      await trpcClient.notifications.notifySubscription.mutate({
        userName,
        planType: planInfo.type,
        amount: planInfo.amount,
        isRenewal,
        transactionId,
      });
      
      notificationSentRef.current.add(transactionId);
      await markTransactionNotified(transactionId);
      console.log('Subscription notification sent successfully');
    } catch (error) {
      console.log('Failed to send subscription notification:', error);
    }
  }, [authUser]);

  const purchaseMutation = useMutation({
    mutationFn: async (pkg: PurchasesPackage) => {
      console.log('Purchasing package:', pkg.identifier);
      setIsPurchasing(true);
      try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        return { customerInfo, packageType: pkg.packageType };
      } finally {
        setIsPurchasing(false);
      }
    },
    onSuccess: async ({ customerInfo, packageType }) => {
      console.log('Purchase successful');
      queryClient.setQueryData(['customerInfo'], customerInfo);
      
      const purchaseTimestamp = Date.now();
      const productId = customerInfo.allPurchasedProductIdentifiers?.[customerInfo.allPurchasedProductIdentifiers.length - 1] || 'unknown';
      const transactionId = `${productId}_${purchaseTimestamp}`;
      
      console.log('Sending notification with transaction ID:', transactionId);
      
      sendSubscriptionNotification(packageType, transactionId, false).catch(err => {
        console.log('Notification send failed:', err);
      });
    },
    onError: (error: Error) => {
      console.log('Purchase error:', error.message);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      console.log('Restoring purchases...');
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo;
    },
    onSuccess: (customerInfo) => {
      console.log('Restore successful');
      queryClient.setQueryData(['customerInfo'], customerInfo);
    },
    onError: (error: Error) => {
      console.log('Restore error:', error.message);
    },
  });

  const customerInfo = customerInfoQuery.data as CustomerInfo | null;
  const isPro = customerInfo?.entitlements.active['Ronaldify Pro'] !== undefined;

  const currentOffering = offeringsQuery.data?.current;
  
  const packages: SubscriptionPackage[] = currentOffering?.availablePackages.map(pkg => ({
    identifier: pkg.identifier,
    packageType: pkg.packageType,
    product: {
      identifier: pkg.product.identifier,
      title: pkg.product.title,
      description: pkg.product.description,
      priceString: formatPriceString(pkg.product.priceString),
      price: pkg.product.price,
    },
    rcPackage: pkg,
  })) || [];

  const hasRealPackages = packages.length > 0;
  const displayPackages = hasRealPackages ? packages : MOCK_PACKAGES;
  
  const sortedPackages = [...displayPackages].sort((a, b) => {
    const order: Record<string, number> = { '$rc_weekly': 0, '$rc_monthly': 1, '$rc_annual': 2 };
    return (order[a.packageType] ?? 99) - (order[b.packageType] ?? 99);
  });

  const { mutateAsync: purchaseMutateAsync } = purchaseMutation;
  const purchasePackage = useCallback(async (pkg: SubscriptionPackage): Promise<boolean> => {
    try {
      await purchaseMutateAsync(pkg.rcPackage);
      return true;
    } catch {
      return false;
    }
  }, [purchaseMutateAsync]);

  const { mutateAsync: restoreMutateAsync } = restoreMutation;
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    try {
      const info = await restoreMutateAsync();
      return info.entitlements.active['Ronaldify Pro'] !== undefined;
    } catch {
      return false;
    }
  }, [restoreMutateAsync]);

  const value: SubscriptionContextValue = {
    isPro,
    isLoading: customerInfoQuery.isLoading || offeringsQuery.isLoading,
    isPurchasing: isPurchasing || purchaseMutation.isPending,
    isRestoring: restoreMutation.isPending,
    packages: sortedPackages,
    currentOffering,
    customerInfo,
    purchasePackage,
    restorePurchases,
    refetchCustomerInfo: () => queryClient.invalidateQueries({ queryKey: ['customerInfo'] }),
    setAuthUser,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}
 + match[1];
  }
  return priceString;
}

const MOCK_PACKAGES: SubscriptionPackage[] = [
  {
    identifier: 'ronaldify_weekly',
    packageType: '$rc_weekly',
    product: {
      identifier: 'ronaldify_weekly',
      title: 'Weekly Pro',
      description: '$4.99/week',
      priceString: '$4.99',
      price: 4.99,
    },
    rcPackage: null as unknown as PurchasesPackage,
  },
  {
    identifier: 'ronaldify_monthly',
    packageType: '$rc_monthly',
    product: {
      identifier: 'ronaldify_monthly',
      title: 'Monthly Pro',
      description: '$9.99/month',
      priceString: '$9.99',
      price: 9.99,
    },
    rcPackage: null as unknown as PurchasesPackage,
  },
  {
    identifier: 'ronaldify_yearly',
    packageType: '$rc_annual',
    product: {
      identifier: 'ronaldify_yearly',
      title: 'Yearly Pro',
      description: '$59.99/year',
      priceString: '$59.99',
      price: 59.99,
    },
    rcPackage: null as unknown as PurchasesPackage,
  },
];

async function getNotifiedTransactions(): Promise<Set<string>> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFIED_TRANSACTIONS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

async function markTransactionNotified(transactionId: string): Promise<void> {
  try {
    const notified = await getNotifiedTransactions();
    notified.add(transactionId);
    const arr = Array.from(notified).slice(-100);
    await AsyncStorage.setItem(NOTIFIED_TRANSACTIONS_KEY, JSON.stringify(arr));
  } catch (error) {
    console.log('Error saving notified transaction:', error);
  }
}

interface SubscriptionContextValue {
  isPro: boolean;
  isLoading: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;
  packages: SubscriptionPackage[];
  currentOffering: PurchasesOffering | null | undefined;
  customerInfo: CustomerInfo | null;
  purchasePackage: (pkg: SubscriptionPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refetchCustomerInfo: () => void;
  setAuthUser: (user: { uid: string; displayName: string | null; email: string } | null) => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [authUser, setAuthUser] = useState<{ uid: string; displayName: string | null; email: string } | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const notificationSentRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (authUser && isConfigured) {
      console.log('Logging in to RevenueCat with user:', authUser.uid);
      Purchases.logIn(authUser.uid).catch(err => {
        console.log('RevenueCat login error:', err);
      });
    }
  }, [authUser]);

  const customerInfoQuery = useQuery({
    queryKey: ['customerInfo'],
    queryFn: async () => {
      if (!isConfigured) return null;
      console.log('Fetching customer info...');
      const info = await Purchases.getCustomerInfo();
      console.log('Customer info:', info.entitlements.active);
      return info;
    },
    enabled: !!authUser && isConfigured,
    staleTime: 1000 * 60 * 5,
  });

  const offeringsQuery = useQuery({
    queryKey: ['offerings'],
    queryFn: async () => {
      if (!isConfigured) return null;
      console.log('Fetching offerings...');
      const offerings = await Purchases.getOfferings();
      console.log('Offerings:', offerings.current?.availablePackages.length, 'packages');
      return offerings;
    },
    enabled: isConfigured,
    staleTime: 1000 * 60 * 30,
  });

  const sendSubscriptionNotification = useCallback(async (
    packageType: string,
    transactionId: string,
    isRenewal: boolean = false
  ) => {
    if (notificationSentRef.current.has(transactionId)) {
      console.log('Notification already sent for transaction:', transactionId);
      return;
    }

    const notified = await getNotifiedTransactions();
    if (notified.has(transactionId)) {
      console.log('Transaction already notified (from storage):', transactionId);
      notificationSentRef.current.add(transactionId);
      return;
    }

    const planInfo = PLAN_PRICES[packageType] || { amount: 'Unknown', type: 'monthly' as const };
    const userName = authUser?.displayName || authUser?.email || 'Anonymous';

    try {
      console.log('Sending subscription notification for:', userName, planInfo.type);
      await trpcClient.notifications.notifySubscription.mutate({
        userName,
        planType: planInfo.type,
        amount: planInfo.amount,
        isRenewal,
        transactionId,
      });
      
      notificationSentRef.current.add(transactionId);
      await markTransactionNotified(transactionId);
      console.log('Subscription notification sent successfully');
    } catch (error) {
      console.log('Failed to send subscription notification:', error);
    }
  }, [authUser]);

  const purchaseMutation = useMutation({
    mutationFn: async (pkg: PurchasesPackage) => {
      console.log('Purchasing package:', pkg.identifier);
      setIsPurchasing(true);
      try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        return { customerInfo, packageType: pkg.packageType };
      } finally {
        setIsPurchasing(false);
      }
    },
    onSuccess: async ({ customerInfo, packageType }) => {
      console.log('Purchase successful');
      queryClient.setQueryData(['customerInfo'], customerInfo);
      
      const purchaseTimestamp = Date.now();
      const productId = customerInfo.allPurchasedProductIdentifiers?.[customerInfo.allPurchasedProductIdentifiers.length - 1] || 'unknown';
      const transactionId = `${productId}_${purchaseTimestamp}`;
      
      console.log('Sending notification with transaction ID:', transactionId);
      
      sendSubscriptionNotification(packageType, transactionId, false).catch(err => {
        console.log('Notification send failed:', err);
      });
    },
    onError: (error: Error) => {
      console.log('Purchase error:', error.message);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      console.log('Restoring purchases...');
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo;
    },
    onSuccess: (customerInfo) => {
      console.log('Restore successful');
      queryClient.setQueryData(['customerInfo'], customerInfo);
    },
    onError: (error: Error) => {
      console.log('Restore error:', error.message);
    },
  });

  const customerInfo = customerInfoQuery.data as CustomerInfo | null;
  const isPro = customerInfo?.entitlements.active['Ronaldify Pro'] !== undefined;

  const currentOffering = offeringsQuery.data?.current;
  
  const packages: SubscriptionPackage[] = currentOffering?.availablePackages.map(pkg => ({
    identifier: pkg.identifier,
    packageType: pkg.packageType,
    product: {
      identifier: pkg.product.identifier,
      title: pkg.product.title,
      description: pkg.product.description,
      priceString: formatPriceString(pkg.product.priceString),
      price: pkg.product.price,
    },
    rcPackage: pkg,
  })) || [];

  const hasRealPackages = packages.length > 0;
  const displayPackages = hasRealPackages ? packages : MOCK_PACKAGES;
  
  const sortedPackages = [...displayPackages].sort((a, b) => {
    const order: Record<string, number> = { '$rc_weekly': 0, '$rc_monthly': 1, '$rc_annual': 2 };
    return (order[a.packageType] ?? 99) - (order[b.packageType] ?? 99);
  });

  const { mutateAsync: purchaseMutateAsync } = purchaseMutation;
  const purchasePackage = useCallback(async (pkg: SubscriptionPackage): Promise<boolean> => {
    try {
      await purchaseMutateAsync(pkg.rcPackage);
      return true;
    } catch {
      return false;
    }
  }, [purchaseMutateAsync]);

  const { mutateAsync: restoreMutateAsync } = restoreMutation;
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    try {
      const info = await restoreMutateAsync();
      return info.entitlements.active['Ronaldify Pro'] !== undefined;
    } catch {
      return false;
    }
  }, [restoreMutateAsync]);

  const value: SubscriptionContextValue = {
    isPro,
    isLoading: customerInfoQuery.isLoading || offeringsQuery.isLoading,
    isPurchasing: isPurchasing || purchaseMutation.isPending,
    isRestoring: restoreMutation.isPending,
    packages: sortedPackages,
    currentOffering,
    customerInfo,
    purchasePackage,
    restorePurchases,
    refetchCustomerInfo: () => queryClient.invalidateQueries({ queryKey: ['customerInfo'] }),
    setAuthUser,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}
