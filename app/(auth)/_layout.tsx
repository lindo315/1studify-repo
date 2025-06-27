import { Stack } from 'expo-router/stack';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="tutorial" />
      <Stack.Screen name="role-selection" />
      <Stack.Screen name="basic-info" />
      <Stack.Screen name="academic-details" />
      <Stack.Screen name="create-account" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="subject-selection" />
    </Stack>
  );
}