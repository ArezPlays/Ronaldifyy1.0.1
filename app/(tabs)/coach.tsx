import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bot, Send, Sparkles, Lock, Flame, Trophy, Target, Zap, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useUser } from '@/contexts/UserContext';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTraining } from '@/contexts/TrainingContext';
import { useRouter } from 'expo-router';
import { useRorkAgent, createRorkTool } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function CoachScreen() {
  const router = useRouter();
  const { isPro } = useSubscription();
  const { profile } = useUser();
  const { colors } = useTheme();
  const { data: personalizationData } = usePersonalization();
  const { t } = useLanguage();
  const { progress, dailyWorkout } = useTraining();
  
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [hasStartedChat, setHasStartedChat] = useState(false);

  const styles = createStyles(colors);

  const userName = personalizationData?.name || profile?.name || 'Champion';
  const userPosition = personalizationData?.position || profile?.position || 'Not specified';
  const userSkillLevel = personalizationData?.skillLevel || profile?.skillLevel || 'beginner';
  const userGoals = (personalizationData?.goals || profile?.goals || []).join(', ') || 'General improvement';

  const getPersonalizedPrompts = useCallback(() => {
    const basePrompts = [
      t.improveShootingTip,
      t.warmUpRoutineTip,
      t.ballControlTip,
      t.increaseSpeedTip,
    ];
    
    const personalizedPrompts = [];
    
    if (progress.streak > 0) {
      personalizedPrompts.push(`How can I maintain my ${progress.streak} day streak?`);
    }
    
    if (userPosition && userPosition !== 'Not specified') {
      personalizedPrompts.push(`Best drills for a ${userPosition}?`);
    }
    
    if (userGoals.includes('shooting')) {
      personalizedPrompts.push('Finishing tips for strikers');
    } else if (userGoals.includes('dribbling')) {
      personalizedPrompts.push('Best skill moves to learn');
    } else if (userGoals.includes('passing')) {
      personalizedPrompts.push('How to improve my vision');
    }
    
    return [...personalizedPrompts.slice(0, 2), ...basePrompts.slice(0, 2)];
  }, [progress.streak, userPosition, userGoals, t]);

  const QUICK_PROMPTS = getPersonalizedPrompts();

  const userContext = `User profile: 
- Name: ${userName}
- Position: ${userPosition}
- Skill Level: ${userSkillLevel}
- Goals: ${userGoals}
- Current Level: ${progress.level}
- Total XP: ${progress.xp}
- Training Streak: ${progress.streak} days
- Drills Completed: ${progress.completedDrills.length}
- Total Training Time: ${progress.totalTrainingMinutes} minutes

You are Ronaldify AI Coach, an elite, hype, and motivating football coach who gets players EXCITED to train.

RESPONSE FORMAT RULES (CRITICAL):
• Keep responses SHORT and PUNCHY (max 150 words)
• Use **bold** for key terms, drill names, and important tips
• Use bullet points (•) for lists and steps
• Add 1-2 relevant emojis per response (⚽🔥💪🎯🚀)
• Structure: Hook → Key Point → Action Step
• End with a HYPE one-liner that makes them want to train NOW

TONE:
• Be direct, confident, like a real coach on the pitch
• Celebrate their progress (mention streak/level if relevant)
• Make them feel like a future pro
• No long paragraphs - scannable content only

EXAMPLE FORMAT:
"🔥 **Great question!**

• **Key tip**: [short tip]
• **Try this**: [specific drill]
• **Pro move**: [advanced variation]

💪 Now get out there and dominate!"

If they ask about drills, tell them to check the Drills tab.`;

  const { messages, sendMessage, status, error } = useRorkAgent({
    tools: {
      suggestDrill: createRorkTool({
        description: "Suggest a specific drill for the user based on their position, skill level, and goals",
        zodSchema: z.object({
          drillName: z.string().describe("Name of the drill"),
          duration: z.number().describe("Duration in minutes"),
          description: z.string().describe("Brief description of the drill"),
        }),
        execute: (input) => {
          console.log('Suggested drill:', input);
          return `Drill suggested: ${input.drillName}`;
        },
      }),
    },
  });

  useEffect(() => {
    if (error) {
      console.log('AI Coach error:', error);
    }
  }, [error]);

  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (messages.length > 0) {
      const newMessages: ChatMessage[] = messages.map((m, idx) => {
        let content = m.parts?.filter(p => p.type === 'text').map(p => (p as { type: 'text'; text: string }).text).join('') || '';
        
        // Filter out system context from first user message display
        if (m.role === 'user' && content.includes('User profile:')) {
          const userMessageMatch = content.match(/User: (.+)$/s);
          if (userMessageMatch) {
            content = userMessageMatch[1].trim();
          }
        }
        
        return {
          id: m.id || `msg-${idx}`,
          role: m.role as 'user' | 'assistant',
          content,
          timestamp: new Date(),
        };
      });
      setChatHistory(newMessages);
    }
  }, [messages]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [chatHistory]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setHasStartedChat(true);

    console.log('Sending message to AI Coach:', userMessage);

    const messageWithContext = hasStartedChat 
      ? userMessage 
      : `${userContext}\n\nUser: ${userMessage}`;

    try {
      await sendMessage(messageWithContext);
      console.log('Message sent successfully');
    } catch (err) {
      console.log('Error sending message:', err);
    }
  }, [input, isLoading, sendMessage, userContext, hasStartedChat]);

  const handleQuickPrompt = useCallback(async (prompt: string) => {
    if (isLoading) return;
    
    setHasStartedChat(true);
    console.log('Sending quick prompt to AI Coach:', prompt);

    const messageWithContext = `${userContext}\n\nUser: ${prompt}`;

    try {
      await sendMessage(messageWithContext);
      console.log('Quick prompt sent successfully');
    } catch (err) {
      console.log('Error sending quick prompt:', err);
    }
  }, [isLoading, sendMessage, userContext]);

  const renderFormattedText = useCallback((text: string, isUser: boolean) => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      
      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) {
          parts.push(
            <Text key={key++} style={[styles.messageText, isUser && styles.userMessageText]}>
              {remaining.slice(0, boldMatch.index)}
            </Text>
          );
        }
        parts.push(
          <Text key={key++} style={[styles.messageText, styles.boldText, isUser && styles.userMessageText]}>
            {boldMatch[1]}
          </Text>
        );
        remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      } else {
        parts.push(
          <Text key={key++} style={[styles.messageText, isUser && styles.userMessageText]}>
            {remaining}
          </Text>
        );
        break;
      }
    }

    return parts;
  }, [styles.messageText, styles.boldText, styles.userMessageText]);

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    
    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Bot size={20} color={colors.primary} />
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}>
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {renderFormattedText(message.content, isUser)}
          </Text>
        </View>
      </View>
    );
  };

  const handleSendFromInput = useCallback(() => {
    if (!input.trim() || isLoading) return;
    handleSend();
  }, [input, isLoading, handleSend]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMiddle, colors.gradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {!hasStartedChat && chatHistory.length === 0 ? (
            <ScrollView 
              style={styles.welcomeScroll}
              contentContainerStyle={styles.welcomeContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Hero Card with personalized greeting */}
              <View style={styles.heroCard}>
                <LinearGradient
                  colors={['#00C853', '#00A844']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.heroGradient}
                >
                  <View style={styles.heroIconContainer}>
                    <Bot size={40} color="#000000" />
                  </View>
                  <Text style={styles.heroTitle}>{t.aiCoach}</Text>
                  <Text style={styles.heroSubtitle}>
                    Hey {userName}! Ready to level up?
                  </Text>
                </LinearGradient>
              </View>

              {/* User Stats Card */}
              <View style={styles.statsCard}>
                <View style={styles.statsHeader}>
                  <TrendingUp size={18} color={colors.primary} />
                  <Text style={styles.statsTitle}>Your Progress</Text>
                </View>
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Trophy size={18} color={colors.accent} />
                    <Text style={styles.statBoxValue}>Level {progress.level}</Text>
                    <Text style={styles.statBoxLabel}>Current Level</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Flame size={18} color="#FF6B35" />
                    <Text style={styles.statBoxValue}>{progress.streak}</Text>
                    <Text style={styles.statBoxLabel}>Day Streak</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Zap size={18} color={colors.primary} />
                    <Text style={styles.statBoxValue}>{progress.xp}</Text>
                    <Text style={styles.statBoxLabel}>Total XP</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Target size={18} color={colors.success} />
                    <Text style={styles.statBoxValue}>{progress.completedDrills.length}</Text>
                    <Text style={styles.statBoxLabel}>Drills Done</Text>
                  </View>
                </View>
              </View>

              {/* Info Card */}
              <View style={styles.infoCard}>
                <Sparkles size={20} color={colors.primary} />
                <Text style={styles.infoText}>
                  {t.personalCoachInfo}
                </Text>
              </View>

              {/* Quick Prompts */}
              <Text style={styles.quickPromptsTitle}>{t.quickStartPrompts}</Text>
              <View style={styles.quickPrompts}>
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.quickPromptButton}
                    onPress={() => handleQuickPrompt(prompt)}
                  >
                    <Text style={styles.quickPromptText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Today's Focus */}
              {dailyWorkout && (
                <View style={styles.focusCard}>
                  <View style={styles.focusHeader}>
                    <Target size={16} color={colors.primary} />
                    <Text style={styles.focusTitle}>Todays Focus: {dailyWorkout.title}</Text>
                  </View>
                  <Text style={styles.focusText}>
                    Ask me about {dailyWorkout.focusArea} tips or how to improve!
                  </Text>
                </View>
              )}

              {/* Pro Card */}
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
                    <Lock size={20} color="#000000" />
                    <View style={styles.proContent}>
                      <Text style={styles.proTitle}>{t.unlockProFeatures}</Text>
                      <Text style={styles.proSubtitle}>{t.videoAnalysisAdvanced}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </ScrollView>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              style={styles.chatScroll}
              contentContainerStyle={styles.chatContent}
              showsVerticalScrollIndicator={false}
            >
              {chatHistory.map(renderMessage)}
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <View style={styles.avatarContainer}>
                    <Bot size={20} color={colors.primary} />
                  </View>
                  <View style={styles.loadingBubble}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.loadingText}>{t.thinking}</Text>
                  </View>
                </View>
              )}
            </ScrollView>
          )}

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder={t.askCoachAnything}
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={handleSendFromInput}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!input.trim() || isLoading) && styles.sendButtonDisabled,
                ]}
                onPress={handleSendFromInput}
                disabled={!input.trim() || isLoading}
              >
                <Send size={20} color={input.trim() && !isLoading ? '#000000' : colors.textMuted} />
              </TouchableOpacity>
            </View>
            
            {hasStartedChat && (
              <Text style={styles.salesText}>
                💡 Surprise your friends after only one month of Ronaldify — train smarter, play better, dominate the field!
              </Text>
            )}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  welcomeScroll: {
    flex: 1,
  },
  welcomeContent: {
    padding: 20,
    paddingBottom: 100,
  },
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
  },
  heroGradient: {
    padding: 28,
    alignItems: 'center',
  },
  heroIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: '#000000',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#000000',
    opacity: 0.85,
    textAlign: 'center',
    lineHeight: 22,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  statBoxValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: colors.text,
  },
  statBoxLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  quickPromptsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  quickPrompts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  quickPromptButton: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickPromptText: {
    fontSize: 14,
    color: colors.text,
  },
  focusCard: {
    backgroundColor: `${colors.primary}15`,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  focusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  focusTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  focusText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  proCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  proGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  proContent: {
    flex: 1,
  },
  proTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000000',
  },
  proSubtitle: {
    fontSize: 13,
    color: '#000000',
    opacity: 0.75,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 18,
    padding: 14,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
  boldText: {
    fontWeight: '700' as const,
    color: colors.primary,
  },
  userMessageText: {
    color: '#000000',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 14,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  inputContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 90,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    maxHeight: 100,
    minHeight: 40,
    paddingVertical: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceLight,
  },
  salesText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
});
