import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Check, Sparkles, Video, Target, Zap } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface ProUpsellProps {
  variant?: 'compact' | 'full' | 'banner';
  onPress: () => void;
}

const PRO_FEATURES = [
  { icon: Video, label: 'AI Video Analysis', description: 'Get feedback on your technique' },
  { icon: Target, label: 'Advanced Drills', description: 'Pro-level training programs' },
  { icon: Sparkles, label: 'Personal AI Coach', description: 'Unlimited coaching sessions' },
  { icon: Zap, label: 'Priority Support', description: 'Get help when you need it' },
];

const PRICING = {
  weekly: { price: '$4.99', period: '/week', save: null },
  monthly: { price: '$9.99', period: '/month', save: '50%' },
  yearly: { price: '$69.99', period: '/year', save: '73%' },
};

export default function ProUpsell({ variant = 'compact', onPress }: ProUpsellProps) {
  if (variant === 'banner') {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <LinearGradient
          colors={['#FFD700', '#FF8C00']}
          style={styles.banner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Crown size={20} color={Colors.black} />
          <Text style={styles.bannerText}>Upgrade to Pro for full access</Text>
          <View style={styles.bannerArrow}>
            <Text style={styles.bannerArrowText}>→</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity 
        style={styles.compactCard}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#1A1A2E', '#2A1A3E']}
          style={styles.compactGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.compactHeader}>
            <View style={styles.compactIconContainer}>
              <Crown size={20} color={Colors.accent} />
            </View>
            <View style={styles.compactTextContainer}>
              <Text style={styles.compactTitle}>Go Pro</Text>
              <Text style={styles.compactSubtitle}>Unlock all features</Text>
            </View>
            <View style={styles.compactPricing}>
              <Text style={styles.compactPrice}>$9.99</Text>
              <Text style={styles.compactPeriod}>/mo</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.fullCard}>
      <LinearGradient
        colors={['#1A1A2E', '#0F0F1A']}
        style={styles.fullGradient}
      >
        <View style={styles.fullHeader}>
          <View style={styles.proBadge}>
            <Crown size={18} color={Colors.black} />
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
          <Text style={styles.fullTitle}>Unlock Your Potential</Text>
          <Text style={styles.fullSubtitle}>
            Train like the pros with advanced AI coaching
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          {PRO_FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <feature.icon size={18} color={Colors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureLabel}>{feature.label}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
              <Check size={16} color={Colors.primary} />
            </View>
          ))}
        </View>

        <View style={styles.pricingContainer}>
          <TouchableOpacity style={styles.pricingOption} activeOpacity={0.8}>
            <Text style={styles.pricingLabel}>Weekly</Text>
            <Text style={styles.pricingPrice}>{PRICING.weekly.price}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.pricingOption, styles.pricingOptionPopular]}
            activeOpacity={0.8}
          >
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>BEST VALUE</Text>
            </View>
            <Text style={styles.pricingLabel}>Monthly</Text>
            <Text style={styles.pricingPricePopular}>{PRICING.monthly.price}</Text>
            {PRICING.monthly.save && (
              <Text style={styles.savingText}>Save {PRICING.monthly.save}</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.pricingOption} activeOpacity={0.8}>
            <Text style={styles.pricingLabel}>Yearly</Text>
            <Text style={styles.pricingPrice}>{PRICING.yearly.price}</Text>
            {PRICING.yearly.save && (
              <Text style={styles.savingTextSmall}>Save {PRICING.yearly.save}</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={Colors.gradient.primary}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.ctaText}>Start Free Trial</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.trialText}>7-day free trial • Cancel anytime</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.black,
  },
  bannerArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerArrowText: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: '700' as const,
  },
  compactCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  compactGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: 16,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.accent}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactTextContainer: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  compactSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  compactPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  compactPrice: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.accent,
  },
  compactPeriod: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  fullCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  fullGradient: {
    padding: 24,
  },
  fullHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
  },
  proBadgeText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.black,
  },
  fullTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  fullSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  featuresContainer: {
    gap: 14,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  featureDescription: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  pricingContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  pricingOption: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pricingOptionPopular: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  popularBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: Colors.black,
  },
  pricingLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  pricingPrice: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  pricingPricePopular: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  savingText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600' as const,
    marginTop: 2,
  },
  savingTextSmall: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  ctaButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  ctaGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.black,
  },
  trialText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
