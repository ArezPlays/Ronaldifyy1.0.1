import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { POSITIONS, POSITION_CATEGORIES, PositionOption } from '@/constants/positions';
import { Position } from '@/types/user';

export default function PositionScreen() {
  const router = useRouter();
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  const handleContinue = () => {
    if (selectedPosition) {
      router.push({
        pathname: '/(onboarding)/skill-level',
        params: { position: selectedPosition },
      });
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
        <View style={styles.header}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '33%' }]} />
          </View>
          <Text style={styles.stepText}>Step 1 of 3</Text>
          <Text style={styles.title}>What&apos;s your position?</Text>
          <Text style={styles.subtitle}>This helps us personalize your training</Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {POSITION_CATEGORIES.map(category => (
            <View key={category.id} style={styles.categoryContainer}>
              <Text style={[styles.categoryTitle, { color: category.color }]}>
                {category.label}
              </Text>
              <View style={styles.positionsGrid}>
                {getPositionsByCategory(category.id).map(position => (
                  <PositionCard
                    key={position.id}
                    position={position}
                    isSelected={selectedPosition === position.id}
                    onSelect={() => setSelectedPosition(position.id)}
                    categoryColor={category.color}
                  />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedPosition}
            size="large"
            testID="position-continue-button"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function PositionCard({
  position,
  isSelected,
  onSelect,
  categoryColor,
}: {
  position: PositionOption;
  isSelected: boolean;
  onSelect: () => void;
  categoryColor: string;
}) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      style={[
        styles.positionCard,
        isSelected && { borderColor: categoryColor, backgroundColor: `${categoryColor}15` },
      ]}
      activeOpacity={0.7}
    >
      <Text style={[styles.positionShortLabel, isSelected && { color: categoryColor }]}>
        {position.shortLabel}
      </Text>
      <Text style={styles.positionLabel}>{position.label}</Text>
    </TouchableOpacity>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
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
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  positionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  positionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    minWidth: 100,
    alignItems: 'center',
  },
  positionShortLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  positionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
});
