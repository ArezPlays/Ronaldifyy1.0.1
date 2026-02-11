import { Stack } from 'expo-router';
import Colors from '../../constants/colors';

export default function PersonalizationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="start" />
      <Stack.Screen name="name" />
      <Stack.Screen name="age" />
      <Stack.Screen name="position" />
      <Stack.Screen name="skill-level" />
      <Stack.Screen name="goals" />
    </Stack>
  );
}
