import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { X, ChevronDown, ChevronUp, MessageCircle, Mail, ExternalLink } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: '1',
    question: 'How does the AI Coach work?',
    answer: 'Our AI Coach analyzes your position, skill level, and goals to provide personalized training recommendations. It learns from your progress and adjusts suggestions over time to help you improve faster.',
  },
  {
    id: '2',
    question: 'What\'s included in the Pro subscription?',
    answer: 'Pro subscribers get access to all drills, unlimited AI coaching, video analysis, personalized training plans, and progress tracking. Free users have access to basic drills and limited AI interactions.',
  },
  {
    id: '3',
    question: 'How do I cancel my subscription?',
    answer: 'You can cancel your subscription anytime through your device\'s app store settings. Go to Settings > Subscriptions on iOS or Google Play Store > Subscriptions on Android.',
  },
  {
    id: '4',
    question: 'Can I use Ronaldify offline?',
    answer: 'Basic app features work offline, but AI coaching and video analysis require an internet connection. Your progress is synced when you reconnect.',
  },
  {
    id: '5',
    question: 'How accurate is the video analysis?',
    answer: 'Our video analysis uses advanced AI to detect movements and provide feedback. For best results, ensure good lighting and a clear view of your movements in the video.',
  },
  {
    id: '6',
    question: 'How do I restore my purchases?',
    answer: 'Go to Profile > Subscription and tap "Restore Purchases". Make sure you\'re signed in with the same account you used for the original purchase.',
  },
];

export default function HelpCenterScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:arezchess@gmail.com?subject=Support Request');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0F1A', '#1A1A2E', '#0F0F1A']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.closeButton}
          >
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help Center</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Need help?</Text>
            <Text style={styles.contactSubtitle}>
              Our team is here to assist you
            </Text>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={handleContactSupport}
            >
              <Mail size={20} color={Colors.black} />
              <Text style={styles.contactButtonText}>Contact Support</Text>
              <ExternalLink size={16} color={Colors.black} />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          <View style={styles.faqContainer}>
            {FAQ_ITEMS.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.faqItem}
                onPress={() => toggleExpand(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  {expandedId === item.id ? (
                    <ChevronUp size={20} color={Colors.textSecondary} />
                  ) : (
                    <ChevronDown size={20} color={Colors.textSecondary} />
                  )}
                </View>
                {expandedId === item.id && (
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.feedbackSection}>
            <MessageCircle size={24} color={Colors.primary} />
            <Text style={styles.feedbackText}>
              Have feedback or suggestions? We&apos;d love to hear from you!
            </Text>
          </View>
        </ScrollView>
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  contactSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  contactSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  faqContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  faqItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
    lineHeight: 22,
  },
  feedbackSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 12,
  },
  feedbackText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
