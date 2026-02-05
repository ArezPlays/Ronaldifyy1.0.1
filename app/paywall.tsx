import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  X, 
  Crown, 
  Check, 
  Video, 
  Target, 
  Sparkles, 
  Zap,
  Shield
} from 'lucide-react-native';
import { useSubscription, SubscriptionPackage } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';



function getPackageLabelKey(packageType: string): 'weekly' | 'monthly' | 'yearly' {
  if (packageType === '$rc_weekly') return 'weekly';
  if (packageType === '$rc_monthly') return 'monthly';
  if (packageType === '$rc_annual') return 'yearly';
  // Fallback based on identifier substring
  const lower = packageType.toLowerCase();
  if (lower.includes('week')) return 'weekly';
  if (lower.includes('year') || lower.includes('annual')) return 'yearly';
  return 'monthly';
}

function getPackageBadgeText(packageType: string): string | null {
  if (packageType === '$rc_monthly') return 'MOST POPULAR';
  if (packageType === '$rc_annual') return 'SAVE 50%';
  return null;
}

export default function PaywallScreen() {
  const { 
    packages, 
    purchasePackage, 
    restorePurchases, 
    isLoading, 
    isPurchasing,
    isRestoring 
  } = useSubscription();
  const { t } = useLanguage();
  const { colors } = useTheme();
  
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(
    packages.find(p => p.packageType === '$rc_annual') || packages[0] || null
  );
  
  const PRO_FEATURES = [
    { icon: Video, label: t.aiVideoAnalysisFeature, description: t.getFeedbackTechnique },
    { icon: Target, label: t.advancedDrillsFeature, description: t.proLevelPrograms },
    { icon: Sparkles, label: t.personalAiCoach, description: t.unlimitedCoaching },
    { icon: Zap, label: t.prioritySupport, description: t.getHelpNeeded },
  ];

  React.useEffect(() => {
    if (packages.length > 0) {
      const yearly = packages.find(p => p.packageType === '$rc_annual');
      const newSelected = yearly || packages[0];
      if (!selectedPackage || !selectedPackage.rcPackage) {
        console.log('Setting selected package to:', newSelected.identifier, 'hasRcPackage:', !!newSelected.rcPackage);
        setSelectedPackage(newSelected);
      }
    }
  }, [packages, selectedPackage]);

  const isMockPackage = selectedPackage && !selectedPackage.rcPackage;

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    
    if (isMockPackage) {
      Alert.alert(
        t.purchasesOnDevice,
        t.purchasesOnlyDevice,
        [{ text: 'OK' }]
      );
      return;
    }
    
    console.log('Starting purchase for:', selectedPackage.identifier);
    const success = await purchasePackage(selectedPackage);
    
    if (success) {
      Alert.alert(
        t.welcomeToPro,
        t.accessAllFeatures,
        [{ text: t.letsGo, onPress: () => router.back() }]
      );
    }
  };

  const handleRestore = async () => {
    console.log('Starting restore...');
    const success = await restorePurchases();
    
    if (success) {
      Alert.alert(
        t.purchasesRestored,
        t.proRestored,
        [{ text: t.letsGo, onPress: () => router.back() }]
      );
    } else {
      Alert.alert(
        t.noPurchasesFound,
        t.noPreviousPurchases
      );
    }
  };

  const isProcessing = isPurchasing || isRestoring;
  
  const getPackageLabel = (packageType: string): string => {
    const key = getPackageLabelKey(packageType);
    return t[key];
  };
  
  const dynamicStyles = createDynamicStyles(colors);

  return (
    <View style={dynamicStyles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMiddle, colors.gradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={dynamicStyles.safeArea} edges={['top', 'bottom']}>
        <View style={dynamicStyles.header}>
          <TouchableOpacity 
            style={dynamicStyles.closeButton}
            onPress={() => router.back()}
            disabled={isProcessing}
          >
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={dynamicStyles.scrollView}
          contentContainerStyle={dynamicStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={dynamicStyles.heroSection}>
            <View style={dynamicStyles.proBadge}>
              <Crown size={20} color={colors.black} />
              <Text style={dynamicStyles.proBadgeText}>{t.pro.toUpperCase()}</Text>
            </View>
            <Text style={dynamicStyles.heroTitle}>{t.unlockYourPotential}</Text>
            <Text style={dynamicStyles.heroSubtitle}>
              {t.trainLikePros}
            </Text>
          </View>

          <View style={dynamicStyles.featuresContainer}>
            {PRO_FEATURES.map((feature, index) => (
              <View key={index} style={dynamicStyles.featureRow}>
                <View style={dynamicStyles.featureIcon}>
                  <feature.icon size={18} color={colors.primary} />
                </View>
                <View style={dynamicStyles.featureText}>
                  <Text style={dynamicStyles.featureLabel}>{feature.label}</Text>
                  <Text style={dynamicStyles.featureDescription}>{feature.description}</Text>
                </View>
                <Check size={16} color={colors.primary} />
              </View>
            ))}
          </View>

          {isLoading ? (
            <View style={dynamicStyles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={dynamicStyles.loadingText}>{t.loadingPlans}</Text>
            </View>
          ) : (
            <View style={dynamicStyles.packagesContainer}>
              {packages.map((pkg) => {
                const isSelected = selectedPackage?.identifier === pkg.identifier;
                const label = getPackageLabel(pkg.packageType);
                const badgeText = getPackageBadgeText(pkg.packageType);
                
                return (
                  <TouchableOpacity
                    key={pkg.identifier}
                    style={[
                      dynamicStyles.packageCard,
                      isSelected && dynamicStyles.packageCardSelected
                    ]}
                    onPress={() => setSelectedPackage(pkg)}
                    disabled={isProcessing}
                    activeOpacity={0.7}
                  >
                    {badgeText && (
                      <View style={[
                        dynamicStyles.savingsBadge,
                        pkg.packageType === '$rc_annual' && dynamicStyles.savingsBadgeBest
                      ]}>
                        <Text style={dynamicStyles.savingsBadgeText}>{badgeText}</Text>
                      </View>
                    )}
                    
                    <View style={dynamicStyles.packageContent}>
                      <View style={[
                        dynamicStyles.radioOuter,
                        isSelected && dynamicStyles.radioOuterSelected
                      ]}>
                        {isSelected && <View style={dynamicStyles.radioInner} />}
                      </View>
                      
                      <View style={dynamicStyles.packageInfo}>
                        <Text style={dynamicStyles.packageLabel}>{label}</Text>
                        <Text style={dynamicStyles.packageDescription}>
                          {pkg.product.priceString}/{label === t.weekly ? 'week' : label === t.yearly ? 'year' : 'month'}
                        </Text>
                      </View>
                      
                      <View style={dynamicStyles.packagePricing}>
                        <Text style={[
                          dynamicStyles.packagePrice,
                          isSelected && dynamicStyles.packagePriceSelected
                        ]}>
                          {pkg.product.priceString}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <TouchableOpacity
            style={[dynamicStyles.ctaButton, isProcessing && dynamicStyles.ctaButtonDisabled]}
            onPress={handlePurchase}
            disabled={isProcessing || !selectedPackage}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isProcessing ? ['#666', '#444'] : [colors.primary, colors.accent]}
              style={dynamicStyles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isPurchasing ? (
                <ActivityIndicator size="small" color={colors.black} />
              ) : (
                <Text style={dynamicStyles.ctaText}>
                  {isMockPackage ? t.next : `${t.continueWith} ${selectedPackage ? getPackageLabel(selectedPackage.packageType) : ''}`}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.restoreButton}
            onPress={handleRestore}
            disabled={isProcessing}
          >
            {isRestoring ? (
              <ActivityIndicator size="small" color={colors.textSecondary} />
            ) : (
              <Text style={dynamicStyles.restoreText}>{t.restorePurchases}</Text>
            )}
          </TouchableOpacity>

          <View style={dynamicStyles.footer}>
            <View style={dynamicStyles.secureRow}>
              <Shield size={14} color={colors.textMuted} />
              <Text style={dynamicStyles.secureText}>{t.securePayment} • {t.cancelAnytime}</Text>
            </View>
            <Text style={dynamicStyles.termsText}>
              {t.subscriptionTerms.split('Terms of Service')[0]}
              <Text 
                style={dynamicStyles.termsLink}
                onPress={() => Linking.openURL('https://factual-headstand-dcf.notion.site/Ronaldify-Terms-of-Service-2fbb9d755c11806fa894fcc080a8b8ea?pvs=73')}
              >
                {t.termsOfService}
              </Text>
              {' & '}
              <Text 
                style={dynamicStyles.termsLink}
                onPress={() => Linking.openURL('https://factual-headstand-dcf.notion.site/Ronaldify-Privacy-Policy-2fbb9d755c118040aca3f5e890ab22a4')}
              >
                {t.privacyPolicy}
              </Text>
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createDynamicStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 6,
    marginBottom: 20,
  },
  proBadgeText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: colors.black,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  featuresContainer: {
    gap: 10,
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: colors.textMuted,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  packagesContainer: {
    gap: 12,
    marginBottom: 20,
  },
  packageCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  packageCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}08`,
  },
  savingsBadge: {
    position: 'absolute',
    top: -12,
    right: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  savingsBadgeBest: {
    backgroundColor: '#FF6B35',
  },
  savingsBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  packageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  packageInfo: {
    flex: 1,
  },
  packageLabel: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 2,
  },
  packageDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  packagePricing: {
    alignItems: 'flex-end',
  },
  packagePrice: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  packagePriceSelected: {
    color: colors.primary,
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.black,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 16,
  },
  restoreText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  footer: {
    alignItems: 'center',
    gap: 8,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  secureText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  termsText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
  },
  termsLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
