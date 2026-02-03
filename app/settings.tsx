import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, Linking, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { X, Moon, Volume2, Vibrate, Globe, Trash2, RefreshCw, Shield, FileText, Check, ChevronRight } from 'lucide-react-native';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage, languages, LanguageCode } from '@/contexts/LanguageContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { resetPersonalization } = usePersonalization();
  const { signOut } = useAuth();
  const { isDark, colors, setTheme } = useTheme();
  const { languageCode, currentLanguage, setLanguage, t, isRTL } = useLanguage();
  
  const [soundEffects, setSoundEffects] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleThemeChange = (value: boolean) => {
    setTheme(value ? 'dark' : 'light');
  };

  const handleLanguageSelect = (code: LanguageCode) => {
    setLanguage(code);
    setShowLanguageModal(false);
  };

  const handleResetData = () => {
    Alert.alert(
      t.resetAppData,
      t.clearLocalData,
      [
        { text: t.cancel, style: 'cancel' },
        { 
          text: t.reset, 
          style: 'destructive',
          onPress: async () => {
            await resetPersonalization();
            await signOut();
            router.replace('/(personalization)/start');
          }
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t.deleteAccount,
      t.permanentlyDelete,
      [
        { text: t.cancel, style: 'cancel' },
        { 
          text: t.delete, 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              t.deleteAccount,
              t.contactSupport
            );
          }
        },
      ]
    );
  };

  const styles = createStyles(colors, isRTL);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMiddle, colors.gradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.closeButton}
          >
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.settings}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>{t.appearance}</Text>
          <View style={styles.settingsGroup}>
            <SettingRow
              colors={colors}
              isRTL={isRTL}
              icon={<Moon size={20} color={colors.textSecondary} />}
              title={t.darkMode}
              description={t.useDarkTheme}
              trailing={
                <Switch
                  value={isDark}
                  onValueChange={handleThemeChange}
                  trackColor={{ false: colors.surfaceLight, true: colors.primary }}
                  thumbColor={colors.text}
                />
              }
            />
          </View>

          <Text style={styles.sectionTitle}>{t.soundHaptics}</Text>
          <View style={styles.settingsGroup}>
            <SettingRow
              colors={colors}
              isRTL={isRTL}
              icon={<Volume2 size={20} color={colors.textSecondary} />}
              title={t.soundEffects}
              description={t.playSounds}
              trailing={
                <Switch
                  value={soundEffects}
                  onValueChange={setSoundEffects}
                  trackColor={{ false: colors.surfaceLight, true: colors.primary }}
                  thumbColor={colors.text}
                />
              }
            />
            <SettingRow
              colors={colors}
              isRTL={isRTL}
              icon={<Vibrate size={20} color={colors.textSecondary} />}
              title={t.hapticFeedback}
              description={t.vibration}
              trailing={
                <Switch
                  value={hapticFeedback}
                  onValueChange={setHapticFeedback}
                  trackColor={{ false: colors.surfaceLight, true: colors.primary }}
                  thumbColor={colors.text}
                />
              }
            />
          </View>

          <Text style={styles.sectionTitle}>{t.language}</Text>
          <View style={styles.settingsGroup}>
            <SettingRow
              colors={colors}
              isRTL={isRTL}
              icon={<Globe size={20} color={colors.textSecondary} />}
              title={t.language}
              description={currentLanguage.nativeName}
              onPress={() => setShowLanguageModal(true)}
              trailing={<ChevronRight size={20} color={colors.textSecondary} />}
            />
          </View>

          <Text style={styles.sectionTitle}>{t.legal}</Text>
          <View style={styles.settingsGroup}>
            <SettingRow
              colors={colors}
              isRTL={isRTL}
              icon={<Shield size={20} color={colors.textSecondary} />}
              title={t.privacyPolicy}
              description={t.viewPrivacyPolicy}
              onPress={() => Linking.openURL('https://factual-headstand-dcf.notion.site/Ronaldify-Privacy-Policy-2fbb9d755c118040aca3f5e890ab22a4')}
            />
            <SettingRow
              colors={colors}
              isRTL={isRTL}
              icon={<FileText size={20} color={colors.textSecondary} />}
              title={t.termsOfService}
              description={t.viewTerms}
              onPress={() => Linking.openURL('https://factual-headstand-dcf.notion.site/Ronaldify-Terms-of-Service-2fbb9d755c11806fa894fcc080a8b8ea?pvs=73')}
            />
          </View>

          <Text style={styles.sectionTitle}>{t.data}</Text>
          <View style={styles.settingsGroup}>
            <SettingRow
              colors={colors}
              isRTL={isRTL}
              icon={<RefreshCw size={20} color={colors.accent} />}
              title={t.resetAppData}
              description={t.clearLocalData}
              onPress={handleResetData}
            />
            <SettingRow
              colors={colors}
              isRTL={isRTL}
              icon={<Trash2 size={20} color={colors.error} />}
              title={t.deleteAccount}
              description={t.permanentlyDelete}
              onPress={handleDeleteAccount}
              destructive
            />
          </View>

          <Text style={styles.versionText}>{t.version} 1.0.0</Text>
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t.selectLanguage}</Text>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  { borderBottomColor: colors.border },
                  languageCode === lang.code && { backgroundColor: colors.primaryLight }
                ]}
                onPress={() => handleLanguageSelect(lang.code)}
              >
                <View style={styles.languageInfo}>
                  <Text style={[styles.languageName, { color: colors.text }]}>{lang.name}</Text>
                  <Text style={[styles.languageNative, { color: colors.textSecondary }]}>{lang.nativeName}</Text>
                </View>
                {languageCode === lang.code && (
                  <Check size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: colors.surfaceLight }]}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={[styles.modalCloseText, { color: colors.text }]}>{t.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SettingRow({
  icon,
  title,
  description,
  trailing,
  onPress,
  destructive,
  colors,
  isRTL,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  colors: any;
  isRTL: boolean;
}) {
  const rowStyles = createRowStyles(colors, isRTL);
  
  const content = (
    <View style={rowStyles.settingRow}>
      <View style={rowStyles.settingIcon}>{icon}</View>
      <View style={rowStyles.settingContent}>
        <Text style={[rowStyles.settingTitle, destructive && { color: colors.error }]}>
          {title}
        </Text>
        <Text style={rowStyles.settingDescription}>{description}</Text>
      </View>
      {trailing}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const createRowStyles = (colors: any, isRTL: boolean) => StyleSheet.create({
  settingRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: isRTL ? 0 : 14,
    marginLeft: isRTL ? 14 : 0,
  },
  settingContent: {
    flex: 1,
    alignItems: isRTL ? 'flex-end' : 'flex-start',
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
    textAlign: isRTL ? 'right' : 'left',
  },
  settingDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: isRTL ? 'right' : 'left',
  },
});

const createStyles = (colors: any, isRTL: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textMuted,
    marginBottom: 12,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: isRTL ? 'right' : 'left',
  },
  settingsGroup: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginBottom: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderRadius: 12,
    marginBottom: 8,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  languageNative: {
    fontSize: 14,
  },
  modalCloseButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
