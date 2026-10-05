import { NavigatorScreenParams } from "@react-navigation/native";

export type RoomsStackParamList = {
  RoomsList: { query?: string; nonce?: number } | undefined;
  RoomDetail: { roomId: string };
  DatePicker: { roomId: string };
  ConfirmBooking: { roomId: string };
  BookingSuccess: { bookingId: string };
  BookingError: { roomId: string; message: string };
};

export type BookingsStackParamList = {
  MyBookings: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  RoomsTab: NavigatorScreenParams<RoomsStackParamList>;
  BookingsTab: NavigatorScreenParams<BookingsStackParamList>;
  ProfileTab: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};
