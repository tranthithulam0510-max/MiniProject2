import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { TabParamList, AuthStackParamList } from "./types";
import { useAuthStore, waitForAuthHydration } from "@/store/authStore";
import { userExists } from "@/api/mockApi";
import { theme } from "@/theme/theme";

import HomeScreen from "@/screens/HomeScreen";
import RoomsStackNavigator from "./RoomsStackNavigator";
import MyBookingsScreen from "@/screens/MyBookingsScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import LoginScreen from "@/screens/LoginScreen";
import RegisterScreen from "@/screens/RegisterScreen";

const Tab = createBottomTabNavigator<TabParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: theme.colors.bg,
    card: theme.colors.bg,
    text: theme.colors.text,
    border: theme.colors.border,
    primary: theme.colors.primary,
  },
};

const ICONS: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
  HomeTab: "home",
  RoomsTab: "grid",
  BookingsTab: "bag",
  ProfileTab: "person",
};

const LABELS: Record<keyof TabParamList, string> = {
  HomeTab: "Trang chủ",
  RoomsTab: "Phòng học",
  BookingsTab: "Đặt chỗ",
  ProfileTab: "Cá nhân",
};

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.bg } }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.bgAlt,
          borderTopColor: theme.colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textFaint,
        tabBarLabel: LABELS[route.name],
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={size - 2} color={color} />
        ),
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="RoomsTab" component={RoomsStackNavigator} />
      <Tab.Screen name="BookingsTab" component={MyBookingsScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const userId = useAuthStore((s) => s.userId);
  const [ready, setReady] = useState(false);

  // Khi mở app: khôi phục phiên đã lưu và kiểm tra tài khoản đó còn tồn tại không.
  useEffect(() => {
    (async () => {
      await waitForAuthHydration();
      const savedId = useAuthStore.getState().userId;
      if (savedId != null) {
        try {
          if (!(await userExists(savedId))) useAuthStore.getState().signOut();
        } catch {
          useAuthStore.getState().signOut();
        }
      }
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {userId == null ? <AuthNavigator /> : <MainTabs />}
    </NavigationContainer>
  );
}
