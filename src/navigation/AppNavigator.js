import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../contexts/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import FeedScreen from '../screens/FeedScreen';
import CameraScreen from '../screens/CameraScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import CommentsScreen from '../screens/CommentsScreen';
import OtherProfileScreen from '../screens/OtherProfileScreen';
import ImageModalScreen from '../screens/ImageModalScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ emoji, focused }) {
  return (
    <Text style={{ fontSize: focused ? 26 : 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

function FeedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTitleStyle: { fontWeight: '700' } }}>
      <Stack.Screen
        name="Feed"
        component={FeedScreen}
        options={{ title: '😊 EmotionSocial' }}
      />
      <Stack.Screen
        name="Comments"
        component={CommentsScreen}
        options={{ title: 'Комментарии' }}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ title: 'Новый пост', presentation: 'modal' }}
      />
      <Stack.Screen
        name="OtherProfile"
        component={OtherProfileScreen}
        options={{ title: 'Профиль пользователя' }}
      />
      <Stack.Screen
        name="ImageModal"
        component={ImageModalScreen}
        options={{ presentation: 'fullScreenModal', headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function CameraStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTitleStyle: { fontWeight: '700' } }}>
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{ title: '📷 Распознать эмоцию', headerStyle: { backgroundColor: '#000' }, headerTintColor: '#fff' }}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ title: 'Новый пост', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTitleStyle: { fontWeight: '700' } }}>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Мой профиль' }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#F0F0F0',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#6C5CE7',
        tabBarInactiveTintColor: '#B2BEC3',
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={FeedStack}
        options={{
          tabBarLabel: 'Лента',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="CameraTab"
        component={CameraStack}
        options={{
          tabBarLabel: 'Камера',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📷" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Профиль',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingEmoji}>😊</Text>
        <ActivityIndicator color="#6C5CE7" size="large" style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C5CE7',
  },
  loadingEmoji: { fontSize: 64 },
});
