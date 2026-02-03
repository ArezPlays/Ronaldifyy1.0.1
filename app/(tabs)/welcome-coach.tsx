import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Animated,
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Sparkles, ChevronRight, Crown, Play, Lock, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useUser } from '@/contexts/UserContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { POSITIONS } from '@/constants/positions';
import { TRAINING_GOALS } from '@/constants/skills';
import { getRecommendedDrills, Drill } from '@/mocks/drills';
import DrillCard from '@/components/DrillCard';

const { width } = Dimensions.get('window');

export default function WelcomeCoachScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useUser();
  const { isPro } = useSubscription();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const [typedText, setTypedText] = useState('');
  const [showDrills, setShowDrills] = useState(false);
  
  const positionLabel = profile?.position 
    ? POSITIONS.find(p => p.id === profile.position)?.label 
    : 'Player';
    
  const primaryGoal = profile?.goals?.[0];
  const goalLabel = primaryGoal 
    ? TRAINING_GOALS.find(g => g.id === primaryGoal)?.label 
    : 'improving';

  const welcomeMessage = `Welcome${profile?.name ? `, ${profile.name}` : ''}! As a ${positionLabel} focused on ${goalLabel?.toLowerCase()}, I've analyzed thousands of training sessions to create your personalized program.`;

  const recommendedDrills = getRecommendedDrills(
    profile?.position || null,
    profile?.goals || [],
    profile?.skillLevel || null,
    3
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    let index = 0;
    const interval = setInterval(() => {
      if (index < welcomeMessage.length) {
        setTypedText(welcomeMessage.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowDrills(true), 300);
      }
    }, 25);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = async () => {
    await updateProfile({ hasSeenWelcome: true } as any);
    router.replace('/(tabs)');
  };

  const handleStartDrill = (drill: Drill) => {
    if (drill.isPro && !isPro) {
      router.push('/(tabs)/profile');
    } else {
      router.push('/(tabs)/drills');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A1628', '#0F0F1A', '#1A0A28']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <View style={styles.glowContainer}>
        <View style={styles.glowOrb1} />
        <View style={styles.glowOrb2} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
          <X size={24} color={Colors.textMuted} />
        </TouchableOpacity>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              }
            ]}
          >
            <View style={styles.aiAvatarContainer}>
              <LinearGradient
                colors={['#00C853', '#00A844', '#007A33']}
                style={styles.aiAvatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Sparkles size={32} color={Colors.white} />
              </LinearGradient>
              <View style={styles.aiPulse} />
            </View>
            
            <Text style={styles.aiTitle}>Your AI Coach</Text>
            <Text style={styles.aiSubtitle}>Powered by advanced football intelligence</Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.messageCard,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <Text style={styles.messageText}>
              {typedText}
              <Text style={styles.cursor}>|</Text>
            </Text>
          </Animated.View>

          {showDrills && (
            <Animated.View style={[styles.drillsSection, { opacity: fadeAnim }]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your First Training Plan</Text>
                <View style={styles.sectionBadge}>
                  <Sparkles size={12} color={Colors.primary} />
                  <Text style={styles.sectionBadgeText}>AI Selected</Text>
                </View>
              </View>

              <View style={styles.drillsList}>
                {recommendedDrills.map((drill, index) => (
                  <TouchableOpacity
                    key={drill.id}
                    style={styles.drillItem}
                    onPress={() => handleStartDrill(drill)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.drillNumber}>
                      <Text style={styles.drillNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.drillInfo}>
                      <View style={styles.drillTitleRow}>
                        <Text style={styles.drillTitle}>{drill.title}</Text>
                        {drill.isPro && (
                          <View style={styles.proBadge}>
                            {!isPro && <Lock size={10} color={Colors.black} />}
                            <Text style={styles.proBadgeText}>PRO</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.drillMeta}>
                        {drill.duration} min • {drill.difficulty.charAt(0).toUpperCase() + drill.difficulty.slice(1)}
                      </Text>
                    </View>
                    <View style={styles.drillAction}>
                      <Play size={16} color={Colors.primary} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {!isPro && (
                <TouchableOpacity 
                  style={styles.proCard}
                  onPress={() => router.push('/(tabs)/profile')}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#FFD700', '#FFA502']}
                    style={styles.proCardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <View style={styles.proCardContent}>
                      <Crown size={24} color={Colors.black} />
                      <View style={styles.proCardText}>
                        <Text style={styles.proCardTitle}>Unlock Pro Features</Text>
                        <Text style={styles.proCardSubtitle}>
                          AI video analysis, advanced drills & more
                        </Text>
                      </View>
                      <ChevronRight size={20} color={Colors.black} />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleDismiss}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={Colors.gradient.primary}
              style={styles.startButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.startButtonText}>Start Training</Text>
              <ChevronRight size={20} color={Colors.black} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  glowContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glowOrb1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primary,
    opacity: 0.08,
  },
  glowOrb2: {
    position: 'absolute',
    bottom: 100,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#6B4EFF',
    opacity: 0.05,
  },
  safeArea: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  aiAvatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  aiAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiPulse: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: Colors.primary,
    opacity: 0.3,
  },
  aiTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  aiSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  messageCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageText: {
    fontSize: 17,
    color: Colors.text,
    lineHeight: 26,
  },
  cursor: {
    color: Colors.primary,
    fontWeight: '300' as const,
  },
  drillsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  drillsList: {
    gap: 12,
    marginBottom: 20,
  },
  drillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  drillNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drillNumberText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  drillInfo: {
    flex: 1,
  },
  drillTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  drillTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: Colors.black,
  },
  drillMeta: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  drillAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  proCardGradient: {
    padding: 16,
  },
  proCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proCardText: {
    flex: 1,
  },
  proCardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.black,
    marginBottom: 2,
  },
  proCardSubtitle: {
    fontSize: 13,
    color: Colors.black,
    opacity: 0.7,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 16,
    backgroundColor: 'transparent',
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.black,
  },
});
