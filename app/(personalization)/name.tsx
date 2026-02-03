import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { usePersonalization } from '@/contexts/PersonalizationContext';

export default function NameScreen() {
  const router = useRouter();
  const { data, updatePersonalization } = usePersonalization();
  const [name, setName] = useState(data.name || '');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleContinue = async () => {
    if (name.trim()) {
      await updatePersonalization({ name: name.trim() });
      router.push('/(personalization)/age');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A1628', '#0F0F1A', '#1A1A2E']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <View style={styles.header}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '20%' }]} />
                  </View>
                  <Text style={styles.stepText}>Step 1 of 5</Text>
                </View>

                <View style={styles.main}>
                  <View style={styles.iconContainer}>
                    <User size={32} color={Colors.primary} />
                  </View>
                  
                  <Text style={styles.title}>What&apos;s your name?</Text>
                  <Text style={styles.subtitle}>
                    Your AI coach will use this to personalize your experience
                  </Text>

                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter your name"
                      placeholderTextColor={Colors.textMuted}
                      autoCapitalize="words"
                      autoComplete="name"
                      returnKeyType="done"
                      onSubmitEditing={handleContinue}
                    />
                  </View>
                </View>

                <View style={styles.footer}>
                  <Button
                    title="Continue"
                    onPress={handleContinue}
                    disabled={!name.trim()}
                    size="large"
                    testID="name-continue-button"
                  />
                </View>
              </Animated.View>
            </ScrollView>
          </TouchableWithoutFeedback>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    minHeight: '100%',
  },
  header: {
    paddingTop: 16,
    marginBottom: 40,
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
    paddingTop: 40,
    justifyContent: 'flex-start',
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
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 18,
    color: Colors.text,
    borderWidth: 2,
    borderColor: Colors.border,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 20,
  },
});
