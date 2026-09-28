import React from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { TabParamList } from "./types";
import { theme } from "@/theme/theme";

import HomeScreen from "@/screens/HomeScreen";
import RoomsStackNavigator from "./RoomsStackNavigator";
import MyBookingsScreen from "@/screens/MyBookingsScreen";
import ProfileScreen from "@/screens/ProfileScreen";

const Tab = createBottomTabNavigator<TabParamList>();

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
  RoomsTab: "Phòng",
  BookingsTab: "Đặt chỗ",
  ProfileTab: "Cá nhân",
};

export default function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
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
    </NavigationContainer>
  );
}
