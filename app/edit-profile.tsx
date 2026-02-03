import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { X, User, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { useUser } from '@/contexts/UserContext';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { POSITIONS, POSITION_CATEGORIES } from '@/constants/positions';
import { SKILL_LEVELS } from '@/constants/skills';
import { Position, SkillLevel } from '@/types/user';

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useUser();
  const { data: personalizationData, updatePersonalization } = usePersonalization();
  
  const [name, setName] = useState(profile?.name || personalizationData.name || '');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    profile?.position || personalizationData.position
  );
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<SkillLevel | null>(
    profile?.skillLevel || personalizationData.skillLevel
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        position: selectedPosition,
        skillLevel: selectedSkillLevel,
      });
      await updatePersonalization({
        name: name.trim(),
        position: selectedPosition,
        skillLevel: selectedSkillLevel,
      });
      router.back();
    } catch (error) {
      console.log('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getPositionsByCategory = (categoryId: string) => {
    return POSITIONS.filter(p => p.category === categoryId);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0F1A', '#1A1A2E', '#0F0F1A']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.closeButton}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.avatarSection}>
              <View style={styles.avatar}>
                <User size={40} color={Colors.textSecondary} />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Position</Text>
              {POSITION_CATEGORIES.map(category => (
                <View key={category.id} style={styles.categoryContainer}>
                  <Text style={[styles.categoryTitle, { color: category.color }]}>
                    {category.label}
                  </Text>
                  <View style={styles.optionsRow}>
                    {getPositionsByCategory(category.id).map(position => (
                      <TouchableOpacity
                        key={position.id}
                        style={[
                          styles.optionChip,
                          selectedPosition === position.id && { 
                            borderColor: category.color, 
                            backgroundColor: `${category.color}15` 
                          },
                        ]}
                        onPress={() => setSelectedPosition(position.id)}
                      >
                        <Text style={[
                          styles.optionChipText,
                          selectedPosition === position.id && { color: category.color },
                        ]}>
                          {position.shortLabel}
                        </Text>
                        {selectedPosition === position.id && (
                          <Check size={14} color={category.color} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skill Level</Text>
              <View style={styles.optionsRow}>
                {SKILL_LEVELS.map(level => (
                  <TouchableOpacity
                    key={level.id}
                    style={[
                      styles.skillChip,
                      selectedSkillLevel === level.id && styles.skillChipSelected,
                    ]}
                    onPress={() => setSelectedSkillLevel(level.id as SkillLevel)}
                  >
                    <Text style={styles.skillEmoji}>{level.icon}</Text>
                    <Text style={[
                      styles.skillChipText,
                      selectedSkillLevel === level.id && styles.skillChipTextSelected,
                    ]}>
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title={isSaving ? "Saving..." : "Save Changes"}
                onPress={handleSave}
                disabled={isSaving || !name.trim()}
                size="large"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  optionChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 8,
  },
  skillChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}15`,
  },
  skillEmoji: {
    fontSize: 20,
  },
  skillChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  skillChipTextSelected: {
    color: Colors.primary,
  },
  buttonContainer: {
    paddingTop: 16,
  },
});
