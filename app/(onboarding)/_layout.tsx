import { Stack } from 'expo-router';
import Colors from '../../constants/colors';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="position" />
      <Stack.Screen name="skill-level" />
      <Stack.Screen name="goals" />
    </Stack>
  );
}
