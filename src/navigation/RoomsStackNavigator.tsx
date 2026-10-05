import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RoomsStackParamList } from "./types";
import { theme } from "@/theme/theme";

import RoomsListScreen from "@/screens/RoomsListScreen";
import RoomDetailScreen from "@/screens/RoomDetailScreen";
import DatePickerScreen from "@/screens/DatePickerScreen";
import ConfirmBookingScreen from "@/screens/ConfirmBookingScreen";
import BookingSuccessScreen from "@/screens/BookingSuccessScreen";
import BookingErrorScreen from "@/screens/BookingErrorScreen";

const Stack = createNativeStackNavigator<RoomsStackParamList>();

export default function RoomsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.bg },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: theme.colors.bg },
      }}
    >
      <Stack.Screen name="RoomsList" component={RoomsListScreen} options={{ title: "Chọn phòng" }} />
      <Stack.Screen name="RoomDetail" component={RoomDetailScreen} options={{ title: "" }} />
      <Stack.Screen name="DatePicker" component={DatePickerScreen} options={{ title: "Chọn ngày học" }} />
      <Stack.Screen
        name="ConfirmBooking"
        component={ConfirmBookingScreen}
        options={{ title: "Xác nhận đặt phòng học" }}
      />
      <Stack.Screen
        name="BookingSuccess"
        component={BookingSuccessScreen}
        options={{ title: "", headerBackVisible: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="BookingError"
        component={BookingErrorScreen}
        options={{ title: "", headerBackVisible: false }}
      />
    </Stack.Navigator>
  );
}
