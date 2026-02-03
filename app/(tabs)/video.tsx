import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Upload, Video, Lock, Sparkles, CheckCircle, AlertCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { File } from 'expo-file-system';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'expo-router';
import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';

interface VideoAnalysis {
  id: string;
  videoUri: string;
  status: 'uploading' | 'processing' | 'analyzing' | 'completed' | 'error';
  progress: number;
  analysis: {
    coachGreeting: string;
    overall: string;
    coachMotivation: string;
    isFootballVideo: boolean;
    visibleCategories: string[];
    dribbling: number | null;
    passing: number | null;
    shooting: number | null;
    positioning: number | null;
    movement: number | null;
    tips: string[];
    recommendedSkillPaths: string[];
    strengthAreas: string[];
    weaknessAreas: string[];
  } | null;
  createdAt: Date;
}

type SkillCategory = 'dribbling' | 'shooting' | 'passing' | 'speed' | 'defense' | 'fitness';

const SKILL_CATEGORY_INFO: Record<SkillCategory, { emoji: string; title: string; color: string }> = {
  dribbling: { emoji: '⚡', title: 'Dribbling Mastery', color: '#FF6B35' },
  shooting: { emoji: '🎯', title: 'Shooting Mastery', color: '#E74C3C' },
  passing: { emoji: '🎪', title: 'Passing Mastery', color: '#3498DB' },
  speed: { emoji: '💨', title: 'Speed Training', color: '#9B59B6' },
  defense: { emoji: '🛡️', title: 'Defensive Skills', color: '#27AE60' },
  fitness: { emoji: '💪', title: 'Fitness Program', color: '#F39C12' },
};

const analysisSchema = z.object({
  isFootballVideo: z.boolean().describe('Is this football/soccer training or gameplay footage?'),
  visibleCategories: z.array(z.enum(['dribbling', 'passing', 'shooting', 'positioning', 'movement'])).describe('Which skills are demonstrated in this footage'),
  coachGreeting: z.string().describe('A short, energetic coach greeting with emoji. Example: "Oi mate! 🔥" or "Let\'s break this down! ⚽" or "Great effort champion! 💪"'),
  overall: z.string().describe('Coach feedback in 3-4 punchy sentences. Talk like a real football coach - direct, motivating, specific. Use football terminology. Mention body mechanics, technique details, timing. Be encouraging but honest. Example: "That\'s what I\'m talking about - you\'re attacking the ball with intent! Your body shape on approach is solid, but watch that standing foot - it\'s drifting too far back which is killing your accuracy. The power is there mate, now let\'s dial in the precision."'),
  coachMotivation: z.string().describe('A short motivational closing line with emoji. Example: "Keep grinding, the goals will come! ⚽🔥" or "You\'re on the right track - trust the process! 💯"'),
  dribbling: z.number().nullable().describe('Rate 0-100 ONLY if ball control/dribbling is shown, otherwise null'),
  passing: z.number().nullable().describe('Rate 0-100 ONLY if passing/distribution is shown, otherwise null'),
  shooting: z.number().nullable().describe('Rate 0-100 ONLY if shooting/finishing is shown, otherwise null'),
  positioning: z.number().nullable().describe('Rate 0-100 ONLY if tactical positioning is visible, otherwise null'),
  movement: z.number().nullable().describe('Rate 0-100 ONLY if off-ball movement or running technique is shown, otherwise null'),
  tips: z.array(z.string()).describe('4 specific coaching tips as direct commands. Use "you" language. Example: "Lock that ankle when you strike - no wobble!" or "Get your head over the ball to keep it down"'),
  recommendedSkillPaths: z.array(z.enum(['dribbling', 'shooting', 'passing', 'speed', 'defense', 'fitness'])).describe('1-2 skill training paths from our app that would help this player improve based on weaknesses. Choose from: dribbling, shooting, passing, speed, defense, fitness'),
  strengthAreas: z.array(z.string()).describe('2-3 specific things done well with emoji prefix. Example: "💪 Strong shooting power" or "✨ Excellent first touch"'),
  weaknessAreas: z.array(z.string()).describe('2-3 specific areas to improve with emoji prefix. Example: "📍 Body positioning during shots" or "🎯 Ball control under pressure"'),
});

const ANALYSIS_CATEGORIES = [
  { id: 'dribbling', label: 'Dribbling', emoji: '⚡' },
  { id: 'passing', label: 'Passing', emoji: '🎯' },
  { id: 'shooting', label: 'Shooting', emoji: '💥' },
  { id: 'positioning', label: 'Positioning', emoji: '📍' },
  { id: 'movement', label: 'Movement', emoji: '🏃' },
];

export default function VideoScreen() {
  const router = useRouter();
  const { isPro } = useSubscription();
  const { profile } = useUser();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [analyses, setAnalyses] = useState<VideoAnalysis[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const updateAnalysisProgress = useCallback((analysisId: string, status: VideoAnalysis['status'], progress: number) => {
    setAnalyses(prev => prev.map(a => 
      a.id === analysisId ? { ...a, status, progress } : a
    ));
  }, []);

  const extractFramesFromVideo = useCallback(async (videoUri: string): Promise<string[]> => {
    const frames: string[] = [];
    const frameTimestamps = [0, 2000, 5000, 10000, 15000, 20000, 30000, 45000];
    
    console.log('Extracting frames from video:', videoUri);
    
    for (const time of frameTimestamps) {
      try {
        const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
          time,
          quality: 0.7,
        });
        
        if (Platform.OS === 'web') {
          frames.push(uri);
        } else {
          const file = new File(uri);
          const base64 = await file.base64();
          frames.push(`data:image/jpeg;base64,${base64}`);
        }
        console.log(`Extracted frame at ${time}ms`);
      } catch (error) {
        console.log(`Failed to extract frame at ${time}ms:`, error);
      }
    }
    
    return frames;
  }, []);

  const analyzeVideo = useCallback(async (videoUri: string) => {
    const analysisId = `analysis_${Date.now()}`;
    
    const newAnalysis: VideoAnalysis = {
      id: analysisId,
      videoUri,
      status: 'uploading',
      progress: 0,
      analysis: null,
      createdAt: new Date(),
    };

    setAnalyses(prev => [newAnalysis, ...prev]);
    setIsUploading(true);

    try {
      updateAnalysisProgress(analysisId, 'uploading', 10);
      
      updateAnalysisProgress(analysisId, 'processing', 20);
      console.log('Starting frame extraction...');
      
      const frames = await extractFramesFromVideo(videoUri);
      
      if (frames.length === 0) {
        throw new Error('Could not extract frames from video');
      }
      
      console.log(`Extracted ${frames.length} frames for analysis`);
      updateAnalysisProgress(analysisId, 'processing', 50);

      updateAnalysisProgress(analysisId, 'analyzing', 60);

      const userContext = `Position: ${profile?.position || 'Not specified'}, Skill Level: ${profile?.skillLevel || 'beginner'}, Goals: ${(profile?.goals || []).join(', ') || 'General improvement'}`;
      
      const imageContent = frames.map(frame => ({
        type: 'image' as const,
        image: frame,
      }));

      const analysisPrompt = `You are a REAL professional football coach - think Guardiola's attention to detail mixed with Klopp's energy and passion. You're watching a player's training clip and giving feedback like you're right there on the pitch with them.

YOUR COACHING PERSONALITY:
- You're passionate, direct, and genuinely invested in this player's development
- Use football terminology naturally ("strike through the ball", "get your body over it", "plant foot", "follow through")
- Mix praise with constructive criticism - sandwich method works
- Use emojis sparingly but effectively to add energy 🔥⚽💪
- Be specific about mechanics: foot position, hip rotation, head position, balance, timing
- Sound like a real coach, not a textbook

EXAMPLE TONE:
"Oi, that's the aggression I want to see! 🔥 You're really attacking that ball. Now look - your standing foot is pointing away from target, that's why the ball is going wide. Plant it towards goal, get your hips through, and that same power becomes a rocket into the corner. The technique is 80% there mate, we just need to tighten up that base."

CRITICAL RULES:
1. If this is NOT football content, mark isFootballVideo as false
2. ONLY rate skills actually demonstrated - null for anything not shown
3. For recommendedSkillPaths: suggest 1-2 training paths from our app that would help based on what you see needs work. Options are: dribbling, shooting, passing, speed, defense, fitness
4. Be specific and actionable - they should know exactly what to work on tomorrow

Player Info: ${userContext}

Watch carefully and give your honest, energetic coaching assessment!`;

      updateAnalysisProgress(analysisId, 'analyzing', 75);

      console.log('Sending frames to AI for analysis...');
      
      const analysisData = await generateObject({
        messages: [{ 
          role: 'user', 
          content: [
            { type: 'text', text: analysisPrompt },
            ...imageContent,
          ]
        }],
        schema: analysisSchema,
      });

      console.log('AI Analysis complete:', analysisData);
      updateAnalysisProgress(analysisId, 'analyzing', 95);

      if (!analysisData.isFootballVideo) {
        setAnalyses(prev => prev.map(a => 
          a.id === analysisId 
            ? { 
                ...a, 
                status: 'completed', 
                progress: 100, 
                analysis: {
                  ...analysisData,
                  overall: `⚠️ This doesn't appear to be a football/soccer video. ${analysisData.overall} Please upload a video of football training or gameplay for proper analysis.`,
                }
              }
            : a
        ));
      } else {
        updateAnalysisProgress(analysisId, 'completed', 100);
        setAnalyses(prev => prev.map(a => 
          a.id === analysisId 
            ? { ...a, status: 'completed', progress: 100, analysis: analysisData }
            : a
        ));
      }
    } catch (error) {
      console.log('Error analyzing video:', error);
      setAnalyses(prev => prev.map(a => 
        a.id === analysisId 
          ? { ...a, status: 'error', progress: 0 }
          : a
      ));
    } finally {
      setIsUploading(false);
    }
  }, [profile, updateAnalysisProgress, extractFramesFromVideo]);

  const pickVideo = useCallback(async () => {
    if (!isPro) {
      Alert.alert(
        'Pro Feature',
        'Video analysis is a Pro feature. Upgrade to unlock AI-powered analysis of your football clips.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/paywall') },
        ]
      );
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant access to your media library to upload videos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets[0]) {
        await analyzeVideo(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking video:', error);
      Alert.alert('Error', 'Failed to select video. Please try again.');
    }
  }, [isPro, router, analyzeVideo]);

  const renderScoreBar = (score: number | null, label: string, emoji: string) => {
    if (score === null) return null;
    
    const barColor = score >= 80 ? '#4CAF50' : score >= 60 ? '#FF9800' : '#F44336';
    
    return (
      <View style={styles.scoreItem} key={label}>
        <View style={styles.scoreHeader}>
          <Text style={styles.scoreEmoji}>{emoji}</Text>
          <Text style={styles.scoreLabel}>{label}</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <View style={styles.scoreBarBg}>
          <View style={[styles.scoreBarFill, { width: `${score}%`, backgroundColor: barColor }]} />
        </View>
      </View>
    );
  };

  const getStatusText = (status: VideoAnalysis['status'], progress: number) => {
    switch (status) {
      case 'uploading': return `Uploading video... ${progress}%`;
      case 'processing': return `Processing frames... ${progress}%`;
      case 'analyzing': return `AI analyzing technique... ${progress}%`;
      default: return 'Processing...';
    }
  };

  const renderAnalysis = (analysis: VideoAnalysis) => {
    if (['uploading', 'processing', 'analyzing'].includes(analysis.status)) {
      return (
        <View key={analysis.id} style={styles.analysisCard}>
          <View style={styles.analysisHeader}>
            <Video size={20} color={colors.primary} />
            <Text style={styles.analysisTitle}>
              {analysis.status === 'uploading' ? 'Uploading...' : 
               analysis.status === 'processing' ? 'Processing...' : 'Analyzing...'}
            </Text>
          </View>
          <View style={styles.analyzingContent}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${analysis.progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{analysis.progress}%</Text>
            </View>
            <Text style={styles.analyzingText}>
              {getStatusText(analysis.status, analysis.progress)}
            </Text>
            <View style={styles.processingSteps}>
              <View style={[styles.processingStep, analysis.progress >= 30 && styles.processingStepComplete]}>
                <Text style={styles.processingStepText}>📤 Upload</Text>
              </View>
              <View style={[styles.processingStep, analysis.progress >= 60 && styles.processingStepComplete]}>
                <Text style={styles.processingStepText}>🎬 Process</Text>
              </View>
              <View style={[styles.processingStep, analysis.progress >= 90 && styles.processingStepComplete]}>
                <Text style={styles.processingStepText}>🤖 Analyze</Text>
              </View>
            </View>
          </View>
        </View>
      );
    }

    if (analysis.status === 'error') {
      return (
        <View key={analysis.id} style={styles.analysisCard}>
          <View style={styles.analysisHeader}>
            <AlertCircle size={20} color="#F44336" />
            <Text style={styles.analysisTitle}>Analysis Failed</Text>
          </View>
          <Text style={styles.errorText}>
            We couldn&apos;t analyze this video. Please try uploading again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={pickVideo}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!analysis.analysis) return null;

    return (
      <View key={analysis.id} style={styles.analysisCard}>
        <View style={styles.analysisHeader}>
          <CheckCircle size={20} color={colors.primary} />
          <Text style={styles.analysisTitle}>Coach Analysis ⚽</Text>
        </View>

        {/* Coach Greeting */}
        <View style={styles.coachGreetingContainer}>
          <Text style={styles.coachGreeting}>{analysis.analysis.coachGreeting}</Text>
        </View>

        {/* Main Feedback */}
        <View style={styles.coachFeedbackContainer}>
          <Text style={styles.overallText}>{analysis.analysis.overall}</Text>
        </View>

        {/* Coach Motivation */}
        <View style={styles.coachMotivationContainer}>
          <Text style={styles.coachMotivation}>{analysis.analysis.coachMotivation}</Text>
        </View>

        {/* Strengths & Weaknesses */}
        {(analysis.analysis.strengthAreas || analysis.analysis.weaknessAreas) && (
          <View style={styles.strengthWeaknessContainer}>
            {analysis.analysis.strengthAreas && analysis.analysis.strengthAreas.length > 0 && (
              <View style={styles.strengthSection}>
                <Text style={styles.strengthTitle}>What&apos;s Working</Text>
                {analysis.analysis.strengthAreas.map((area, idx) => (
                  <Text key={idx} style={styles.strengthItem}>{area}</Text>
                ))}
              </View>
            )}
            {analysis.analysis.weaknessAreas && analysis.analysis.weaknessAreas.length > 0 && (
              <View style={styles.weaknessSection}>
                <Text style={styles.weaknessTitle}>Work On This</Text>
                {analysis.analysis.weaknessAreas.map((area, idx) => (
                  <Text key={idx} style={styles.weaknessItem}>{area}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {analysis.analysis.visibleCategories && analysis.analysis.visibleCategories.length > 0 && (
          <View style={styles.scoresContainer}>
            <Text style={styles.scoresTitle}>📊 Performance Ratings</Text>
            {ANALYSIS_CATEGORIES.map(cat => {
              const score = analysis.analysis![cat.id as keyof typeof analysis.analysis];
              if (typeof score !== 'number') return null;
              return renderScoreBar(score, cat.label, cat.emoji);
            })}
          </View>
        )}

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>🎯 Coach&apos;s Tips</Text>
          {analysis.analysis.tips.map((tip, idx) => (
            <View key={idx} style={styles.tipItem}>
              <Text style={styles.tipNumber}>{idx + 1}</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Recommended Skill Training Paths */}
        {analysis.analysis.recommendedSkillPaths && analysis.analysis.recommendedSkillPaths.length > 0 && (
          <View style={styles.skillPathsContainer}>
            <Text style={styles.skillPathsTitle}>🚀 Recommended Training</Text>
            <Text style={styles.skillPathsSubtitle}>Tap to start your training journey</Text>
            {analysis.analysis.recommendedSkillPaths.map((skillId, idx) => {
              const skillInfo = SKILL_CATEGORY_INFO[skillId as SkillCategory];
              if (!skillInfo) return null;
              return (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.skillPathItem, { borderLeftColor: skillInfo.color }]}
                  onPress={() => router.push({ pathname: '/(tabs)/drills', params: { openSkill: skillId } })}
                >
                  <View style={[styles.skillPathIcon, { backgroundColor: `${skillInfo.color}20` }]}>
                    <Text style={styles.skillPathEmoji}>{skillInfo.emoji}</Text>
                  </View>
                  <View style={styles.skillPathContent}>
                    <Text style={styles.skillPathName}>{skillInfo.title}</Text>
                    <Text style={styles.skillPathCta}>Start training →</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMiddle, colors.gradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.uploadCard}>
            <LinearGradient
              colors={isPro ? ['#1E3A5F', '#0F2744'] : ['#2A2A3E', '#1A1A2E']}
              style={styles.uploadGradient}
            >
              <View style={styles.uploadIconContainer}>
                <Video size={40} color={isPro ? colors.primary : colors.textMuted} />
              </View>
              <Text style={styles.uploadTitle}>{t.videoAnalysis}</Text>
              <Text style={styles.uploadSubtitle}>
                {isPro 
                  ? t.selectVideo
                  : t.unlockProFeatures}
              </Text>
              <TouchableOpacity 
                style={[styles.uploadButton, !isPro && styles.uploadButtonLocked]}
                onPress={pickVideo}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <>
                    {!isPro && <Lock size={18} color="#000000" />}
                    <Upload size={20} color="#000000" />
                    <Text style={styles.uploadButtonText}>
                      {isPro ? t.uploadVideo : t.goPro}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {analyses.length > 0 ? (
            <View style={styles.analysesSection}>
              <Text style={styles.sectionTitle}>Your Analyses</Text>
              {analyses.map(renderAnalysis)}
            </View>
          ) : (
            <>
              <View style={styles.featuresSection}>
                <Text style={styles.sectionTitle}>What We Analyze</Text>
                <View style={styles.featuresGrid}>
                  {ANALYSIS_CATEGORIES.map(cat => (
                    <View key={cat.id} style={styles.featureCard}>
                      <Text style={styles.featureEmoji}>{cat.emoji}</Text>
                      <Text style={styles.featureLabel}>{cat.label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.howItWorks}>
                <Text style={styles.sectionTitle}>How It Works</Text>
                <View style={styles.stepsList}>
                  <StepItem 
                    number={1} 
                    title="Upload" 
                    description="Record or select a video from your gallery (up to 60 seconds)"
                    colors={colors}
                  />
                  <StepItem 
                    number={2} 
                    title="Analyze" 
                    description="Our AI reviews your technique, movement, and positioning"
                    colors={colors}
                  />
                  <StepItem 
                    number={3} 
                    title="Improve" 
                    description="Get personalized tips and drills added to your training plan"
                    colors={colors}
                  />
                  <StepItem 
                    number={4} 
                    title="Important" 
                    description="Only upload football-related clips. Otherwise, the AI may provide incorrect analysis."
                    colors={colors}
                    isWarning={true}
                  />
                </View>
              </View>
            </>
          )}

          {!isPro && (
            <TouchableOpacity 
              style={styles.proCard}
              onPress={() => router.push('/paywall')}
            >
              <LinearGradient
                colors={['#FFD700', '#FF8C00']}
                style={styles.proGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Sparkles size={24} color="#000000" />
                <View style={styles.proContent}>
                  <Text style={styles.proTitle}>Unlock Video Analysis</Text>
                  <Text style={styles.proSubtitle}>
                    Get AI-powered feedback on your technique
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function StepItem({ number, title, description, colors, isWarning }: { number: number; title: string; description: string; colors: any; isWarning?: boolean }) {
  const stepStyles = createStepStyles(colors);
  return (
    <View style={[stepStyles.stepItem, isWarning && stepStyles.stepItemWarning]}>
      <View style={[stepStyles.stepNumber, isWarning && stepStyles.stepNumberWarning]}>
        <Text style={[stepStyles.stepNumberText, isWarning && stepStyles.stepNumberTextWarning]}>
          {isWarning ? '⚠️' : number}
        </Text>
      </View>
      <View style={stepStyles.stepContent}>
        <Text style={[stepStyles.stepTitle, isWarning && stepStyles.stepTitleWarning]}>{title}</Text>
        <Text style={[stepStyles.stepDescription, isWarning && stepStyles.stepDescriptionWarning]}>{description}</Text>
      </View>
    </View>
  );
}

const createStepStyles = (colors: any) => StyleSheet.create({
  stepItem: {
    flexDirection: 'row',
    gap: 14,
  },
  stepItemWarning: {
    backgroundColor: `${colors.warning}15`,
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberWarning: {
    backgroundColor: `${colors.warning}30`,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: '#000000',
  },
  stepNumberTextWarning: {
    fontSize: 16,
    color: colors.warning,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  stepTitleWarning: {
    color: colors.warning,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  stepDescriptionWarning: {
    color: colors.text,
  },
});

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  uploadCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  uploadGradient: {
    padding: 32,
    alignItems: 'center',
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
  },
  uploadButtonLocked: {
    backgroundColor: colors.accent,
  },
  uploadButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  analysesSection: {
    marginBottom: 24,
  },
  analysisCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  analyzingContent: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 16,
  },
  analyzingText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  overallText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 20,
  },
  scoresContainer: {
    gap: 14,
    marginBottom: 20,
  },
  scoresTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  scoreItem: {
    gap: 6,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreEmoji: {
    fontSize: 16,
  },
  scoreLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  scoreBarBg: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  tipsContainer: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.primary,
    marginTop: 8,
  },
  processingSteps: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  processingStep: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
  },
  processingStepComplete: {
    backgroundColor: `${colors.primary}30`,
  },
  processingStepText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 16,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  strengthWeaknessContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  strengthSection: {
    flex: 1,
    backgroundColor: `${colors.success}15`,
    borderRadius: 12,
    padding: 12,
  },
  weaknessSection: {
    flex: 1,
    backgroundColor: `${colors.warning}15`,
    borderRadius: 12,
    padding: 12,
  },
  strengthTitle: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: colors.success,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  weaknessTitle: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: colors.warning,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  strengthItem: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 6,
    lineHeight: 18,
  },
  weaknessItem: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 6,
    lineHeight: 18,
  },
  coachGreetingContainer: {
    marginBottom: 12,
  },
  coachGreeting: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.primary,
  },
  coachFeedbackContainer: {
    backgroundColor: `${colors.primary}08`,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  coachMotivationContainer: {
    backgroundColor: `${colors.accent}15`,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  coachMotivation: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.accent,
    textAlign: 'center',
  },
  tipNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    color: '#000000',
    fontSize: 12,
    fontWeight: '700' as const,
    textAlign: 'center',
    lineHeight: 22,
    marginRight: 10,
    overflow: 'hidden',
  },
  skillPathsContainer: {
    backgroundColor: `${colors.primary}10`,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  skillPathsTitle: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: colors.text,
    marginBottom: 4,
  },
  skillPathsSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  skillPathItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  skillPathIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  skillPathEmoji: {
    fontSize: 22,
  },
  skillPathContent: {
    flex: 1,
  },
  skillPathName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 2,
  },
  skillPathCta: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    width: '30%',
    gap: 6,
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  howItWorks: {
    marginBottom: 24,
  },
  stepsList: {
    gap: 16,
  },
  proCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  proGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 14,
  },
  proContent: {
    flex: 1,
  },
  proTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
  },
  proSubtitle: {
    fontSize: 13,
    color: '#000000',
    opacity: 0.75,
  },
});
