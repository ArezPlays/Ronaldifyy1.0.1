import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, ChevronLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { usePersonalization } from '@/contexts/PersonalizationContext';

const AGE_GROUPS = [
  { id: 'under12', label: 'Under 12', range: [6, 11], emoji: '👦' },
  { id: '12-15', label: '12-15', range: [12, 15], emoji: '🧑' },
  { id: '16-18', label: '16-18', range: [16, 18], emoji: '👨' },
  { id: '19-25', label: '19-25', range: [19, 25], emoji: '💪' },
  { id: '26-35', label: '26-35', range: [26, 35], emoji: '🏃' },
  { id: '35plus', label: '35+', range: [35, 99], emoji: '🎯' },
];

export default function AgeScreen() {
  const router = useRouter();
  const { data, updatePersonalization } = usePersonalization();
  const [selectedAge, setSelectedAge] = useState<string | null>(
    data.age ? AGE_GROUPS.find(g => data.age! >= g.range[0] && data.age! <= g.range[1])?.id || null : null
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleContinue = async () => {
    if (selectedAge) {
      const ageGroup = AGE_GROUPS.find(g => g.id === selectedAge);
      const age = ageGroup ? Math.floor((ageGroup.range[0] + ageGroup.range[1]) / 2) : 20;
      await updatePersonalization({ age });
      router.push('/(personalization)/position');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A1628', '#0F0F1A', '#1A1A2E']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ChevronLeft size={24} color={Colors.text} />
            </TouchableOpacity>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '40%' }]} />
            </View>
            <Text style={styles.stepText}>Step 2 of 5</Text>
          </View>

          <View style={styles.main}>
            <View style={styles.iconContainer}>
              <Calendar size={32} color={Colors.primary} />
            </View>
            
            <Text style={styles.title}>What&apos;s your age group?</Text>
            <Text style={styles.subtitle}>
              We&apos;ll adjust drill intensity and recommendations accordingly
            </Text>

            <ScrollView 
              style={styles.optionsScroll}
              contentContainerStyle={styles.optionsContainer}
              showsVerticalScrollIndicator={false}
            >
              {AGE_GROUPS.map(group => (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.optionCard,
                    selectedAge === group.id && styles.optionCardSelected,
                  ]}
                  onPress={() => setSelectedAge(group.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionEmoji}>{group.emoji}</Text>
                  <Text style={[
                    styles.optionLabel,
                    selectedAge === group.id && styles.optionLabelSelected,
                  ]}>
                    {group.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.footer}>
            <Button
              title="Continue"
              onPress={handleContinue}
              disabled={!selectedAge}
              size="large"
              testID="age-continue-button"
            />
          </View>
        </Animated.View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 16,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.surface,
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  stepText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  main: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 10,
    lineHeight: 24,
  },
  optionsScroll: {
    width: '100%',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  optionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    width: '45%',
    gap: 8,
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}15`,
  },
  optionEmoji: {
    fontSize: 32,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  optionLabelSelected: {
    color: Colors.primary,
  },
  footer: {
    paddingVertical: 20,
  },
});
