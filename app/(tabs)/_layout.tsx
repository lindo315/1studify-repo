import { Tabs } from 'expo-router';
import { Heart, MessageCircle, BookOpen, User, Calendar, Users } from 'lucide-react-native';
import { Platform, Dimensions, TouchableOpacity, View, Text } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function TabLayout() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const isStudent = profile?.role === 'student';
  
  // Calculate responsive sizing
  const isSmallScreen = width < 375;
  const tabIconSize = isSmallScreen ? 22 : 24;
  const tabFontSize = isSmallScreen ? 11 : 12;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
          paddingHorizontal: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: tabFontSize,
          fontFamily: 'Inter-SemiBold',
          marginTop: 4,
          marginBottom: 4,
          letterSpacing: 0.3,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
          paddingHorizontal: 4,
          height: 52,
        },
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: isStudent ? 'Discover' : 'Requests',
          tabBarIcon: ({ size, color, focused }) => {
            const IconComponent = isStudent ? Heart : Users;
            return (
              <IconComponent 
                size={tabIconSize} 
                color={color}
                fill={focused && isStudent ? color : 'none'}
                strokeWidth={focused ? 2.5 : 2}
              />
            );
          },
          tabBarAccessibilityLabel: isStudent ? 'Discover tutors' : 'View student requests',
        }}
      />
      
      <Tabs.Screen
        name="study-plans"
        options={{
          title: 'Plans',
          tabBarIcon: ({ size, color, focused }) => (
            <BookOpen 
              size={tabIconSize} 
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          tabBarAccessibilityLabel: 'Study plans',
        }}
      />
      
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ size, color, focused }) => (
            <Calendar 
              size={tabIconSize} 
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          tabBarAccessibilityLabel: 'Tutoring sessions',
        }}
      />
      
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ size, color, focused }) => (
            <MessageCircle 
              size={tabIconSize} 
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          tabBarAccessibilityLabel: 'Messages',
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color, focused }) => (
            <User 
              size={tabIconSize} 
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          tabBarAccessibilityLabel: 'User profile',
        }}
      />
    </Tabs>
  );
}