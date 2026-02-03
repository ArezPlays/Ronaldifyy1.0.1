import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { 
  User, 
  Settings, 
  Crown, 
  Bell, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Zap,
  Shield,
  FileText
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { POSITIONS } from '@/constants/positions';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { profile } = useUser();
  const { isPro } = useSubscription();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const positionLabel = profile?.position 
    ? POSITIONS.find(p => p.id === profile.position)?.label 
    : t.notSet;

  const handleSignOut = () => {
    Alert.alert(
      t.signOut,
      t.signOutConfirm,
      [
        { text: t.cancel, style: 'cancel' },
        { 
          text: t.signOut, 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/welcome');
          }
        },
      ]
    );
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMiddle, colors.gradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t.profile}</Text>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <User size={32} color={colors.textSecondary} />
              </View>
              {isPro && (
                <View style={styles.crownBadge}>
                  <Crown size={14} color={colors.accent} />
                </View>
              )}
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile?.name || t.player}</Text>
              <Text style={styles.profileEmail}>{user?.email || ''}</Text>
              <View style={styles.profileTags}>
                <View style={styles.profileTag}>
                  <Text style={styles.profileTagText}>{positionLabel}</Text>
                </View>
                <View style={[styles.profileTag, isPro && styles.proTag]}>
                  <Text style={[styles.profileTagText, isPro && styles.proTagText]}>
                    {isPro ? t.pro.toUpperCase() : t.free}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {!isPro && (
            <TouchableOpacity 
              style={styles.upgradeCard}
              onPress={() => router.push('/paywall')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.accent, '#FF8C00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.upgradeGradient}
              >
                <View style={styles.upgradeContent}>
                  <Zap size={24} color="#000000" />
                  <View style={styles.upgradeText}>
                    <Text style={styles.upgradeTitle}>{t.upgradeToPro}</Text>
                    <Text style={styles.upgradeSubtitle}>{t.unlockAllFeatures}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#000000" />
              </LinearGradient>
            </TouchableOpacity>
          )}

          <View style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{t.account}</Text>
            
            <MenuItem 
              icon={<User size={20} color={colors.textSecondary} />}
              title={t.editProfile}
              onPress={() => router.push('/edit-profile')}
              colors={colors}
            />
            <MenuItem 
              icon={<Crown size={20} color={colors.accent} />}
              title={t.subscription}
              subtitle={isPro ? t.proPlan : t.freePlan}
              onPress={() => router.push('/paywall')}
              colors={colors}
            />
            <MenuItem 
              icon={<Bell size={20} color={colors.textSecondary} />}
              title={t.notifications}
              onPress={() => router.push('/notifications-settings')}
              colors={colors}
            />
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{t.support}</Text>
            
            <MenuItem 
              icon={<HelpCircle size={20} color={colors.textSecondary} />}
              title={t.helpCenter}
              onPress={() => router.push('/help-center')}
              colors={colors}
            />
            <MenuItem 
              icon={<Shield size={20} color={colors.textSecondary} />}
              title={t.privacyPolicy}
              onPress={() => Linking.openURL('https://factual-headstand-dcf.notion.site/Ronaldify-Privacy-Policy-2fbb9d755c118040aca3f5e890ab22a4')}
              colors={colors}
            />
            <MenuItem 
              icon={<FileText size={20} color={colors.textSecondary} />}
              title={t.termsOfService}
              onPress={() => Linking.openURL('https://factual-headstand-dcf.notion.site/Ronaldify-Terms-of-Service-2fbb9d755c11806fa894fcc080a8b8ea?pvs=73')}
              colors={colors}
            />
            <MenuItem 
              icon={<Settings size={20} color={colors.textSecondary} />}
              title={t.settings}
              onPress={() => router.push('/settings')}
              colors={colors}
            />
          </View>

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut size={20} color={colors.error} />
            <Text style={styles.signOutText}>{t.signOut}</Text>
          </TouchableOpacity>

          <View style={styles.versionContainer}>
            <Text style={styles.version}>Version 1.0.0</Text>
            <Text style={styles.madeBy}>Made By Arez :)</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MenuItem({ 
  icon, 
  title, 
  subtitle, 
  onPress,
  colors,
}: { 
  icon: React.ReactNode; 
  title: string; 
  subtitle?: string;
  onPress: () => void;
  colors: any;
}) {
  const menuStyles = createMenuItemStyles(colors);
  return (
    <TouchableOpacity style={menuStyles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={menuStyles.menuItemLeft}>
        {icon}
        <View>
          <Text style={menuStyles.menuItemTitle}>{title}</Text>
          {subtitle && <Text style={menuStyles.menuItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <ChevronRight size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const createMenuItemStyles = (colors: any) => StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 16,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  profileTags: {
    flexDirection: 'row',
    gap: 8,
  },
  profileTag: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  proTag: {
    backgroundColor: colors.accent,
  },
  profileTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  proTagText: {
    color: '#000000',
  },
  upgradeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  upgradeText: {
    gap: 2,
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  upgradeSubtitle: {
    fontSize: 13,
    color: '#000000',
    opacity: 0.8,
  },
  menuSection: {
    marginBottom: 24,
  },
  menuSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginBottom: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    gap: 4,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
  },
  madeBy: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
});
