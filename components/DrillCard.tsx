import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, Flame, Lock, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Drill } from '@/mocks/drills';

interface DrillCardProps {
  drill: Drill;
  isPro: boolean;
  onPress?: () => void;
  compact?: boolean;
}

export default function DrillCard({ drill, isPro, onPress, compact = false }: DrillCardProps) {
  const isLocked = drill.isPro && !isPro;
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return Colors.success;
      case 'medium': return Colors.warning;
      case 'hard': return Colors.error;
      default: return Colors.textMuted;
    }
  };

  if (compact) {
    return (
      <TouchableOpacity 
        style={[styles.compactCard, isLocked && styles.cardLocked]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>{drill.title}</Text>
          <View style={styles.compactMeta}>
            <Clock size={12} color={Colors.textMuted} />
            <Text style={styles.compactMetaText}>{drill.duration} min</Text>
            {drill.isPro && (
              <View style={styles.proBadgeSmall}>
                {isLocked && <Lock size={8} color={Colors.black} />}
                <Text style={styles.proBadgeSmallText}>PRO</Text>
              </View>
            )}
          </View>
        </View>
        <ChevronRight size={16} color={Colors.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.card, isLocked && styles.cardLocked]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{drill.title}</Text>
          {drill.isPro && (
            <View style={styles.proBadge}>
              {isLocked && <Lock size={10} color={Colors.black} />}
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.description} numberOfLines={2}>{drill.description}</Text>
        
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Clock size={14} color={Colors.textMuted} />
            <Text style={styles.metaText}>{drill.duration} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Flame size={14} color={getDifficultyColor(drill.difficulty)} />
            <Text style={[styles.metaText, { color: getDifficultyColor(drill.difficulty) }]}>
              {drill.difficulty.charAt(0).toUpperCase() + drill.difficulty.slice(1)}
            </Text>
          </View>
        </View>
      </View>
      
      <ChevronRight size={20} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  cardLocked: {
    opacity: 0.7,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    flex: 1,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 10,
    lineHeight: 18,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.black,
  },
  meta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactMetaText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  proBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
    marginLeft: 4,
  },
  proBadgeSmallText: {
    fontSize: 8,
    fontWeight: '800' as const,
    color: Colors.black,
  },
});
