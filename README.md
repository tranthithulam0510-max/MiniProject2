# Mini Project 2 — Room Booking App

React Native + Expo (TypeScript, strict) app built from the two reference
screenshots: the visual design/flow from the booking-app mockup, and the
requirements table from "Mini-Project 2 Requirements & Tech Stack".

## Setup

```bash
npm install
npx expo start
```

Requires Node 18+. Open in Expo Go (scan QR) or an iOS/Android simulator.

## Tech stack (as required)

| Layer | Technology |
|---|---|
| Framework | React Native + Expo (managed) |
| Language | TypeScript (strict mode) |
| Navigation | React Navigation 7 (bottom tabs + native stack) |
| State | Zustand (client) + TanStack Query (server) |

## Requirement → implementation map

| Requirement | Where it's implemented |
|---|---|
| Search + multi-criteria filter chips | `src/store/filterStore.ts` (Zustand) + `src/screens/RoomsListScreen.tsx`. Text search is debounced 350 ms via a local `useState` + `setTimeout` before it touches the store/query key. Chips (2 khách, ≤10tr, View thành phố, Hồ bơi) toggle independent filter fields, all combined in `api/mockApi.fetchRooms`. |
| 60fps FlatList feed with room cards | `src/components/RoomCard.tsx` wrapped in `React.memo`; `RoomsListScreen` uses `keyExtractor`, `getItemLayout` (fixed-height cards → O(1) layout), `useCallback` for `renderItem`/`keyExtractor`, `initialNumToRender`/`maxToRenderPerBatch`/`windowSize` tuning, and `removeClippedSubviews`. `src/data/mockRooms.ts` seeds **520** rooms (deterministic PRNG) so scroll performance is actually exercised. |
| Date picker with conflict prevention | `src/screens/DatePickerScreen.tsx` + `src/utils/dateOverlap.ts`. Core check is the classic interval overlap `startA < endB && startB < endA` (`rangesOverlap`). Already-booked days are locked (struck-through, untappable) from `useAvailability` (TanStack Query). The tentative range is re-validated against booked ranges the moment the second day is tapped, showing an inline warning on conflict. |
| Re-check on "Xác nhận" | `src/api/mockApi.ts` → `createBooking` re-validates the range against the live server-side `serverBookedRanges` map (not just client state) before committing, and also injects a random "someone just booked it" race about 1 in 6 confirmations so the conflict path is reachable in testing without two devices. |
| Handle two people booking at once | `createBooking` throws `BookingConflictError` (409-style). `src/hooks/useCreateBooking.ts` catches it in `onError`, invalidates the `availability` query so the calendar reflects the new lock, and `ConfirmBookingScreen` routes to `BookingErrorScreen` (new screen, not in the original mockup) with a retry-to-datepicker action. |
| Stack + Tabs navigation | `src/navigation/RootNavigator.tsx` (4 bottom tabs: Trang chủ, Phòng, Đặt chỗ, Cá nhân) and `src/navigation/RoomsStackNavigator.tsx` (RoomsList → RoomDetail → DatePicker → ConfirmBooking → BookingSuccess/BookingError, all as a stack with back navigation). |
| Server data via TanStack Query | `src/hooks/useRooms.ts`, `useAvailability.ts`, `useCreateBooking.ts`, `useMyBookings.ts` — all with `isLoading`/`isError` states surfaced in the screens (spinners + retry links). `src/api/mockApi.ts` is the mock backend (simulated latency, in-memory state). |

## Screens added beyond the mockup

The mockup only showed 6 screens with no "conflict" state. Two screens were
added to satisfy the requirements table:

- **BookingErrorScreen** — shown on a 409 double-booking conflict, with a
  "Chọn lại ngày" action that clears the draft and sends the user back to
  the (now-refreshed) calendar.
- Loading/error states are inline on `RoomsListScreen` and
  `MyBookingsScreen` rather than separate screens, since TanStack Query
  already exposes `isLoading`/`isError` cleanly.

## Notes / things you may want to change

- The calendar is hand-rolled (`DatePickerScreen.tsx`) instead of pulling in
  `react-native-calendars`, to keep dependencies minimal — swap it in if you
  want month paging.
- `mockRooms.ts` uses a seeded PRNG (`mulberry32`) so the dataset is
  identical on every run — useful for consistent FlatList perf testing.
- Pricing (breakfast fee, 8% tax) in `ConfirmBookingScreen` is illustrative;
  adjust to match whatever your assignment spec expects.


## Cập nhật: SQLite + lọc nâng cao + chống đặt trùng

Chạy lại: `npm install` rồi `npx expo start -c`. Dữ liệu lưu bằng `expo-sqlite` (file `roombooking.db`, tự tạo và seed 520 phòng ở lần chạy đầu). Muốn reset dữ liệu: xoá app khỏi máy/emulator rồi chạy lại.

| Chức năng | Vị trí |
| --- | --- |
| Database (users, rooms, bookings + index) | `src/db/database.ts` |
| Truy vấn, đặt/huỷ phòng, profile | `src/api/mockApi.ts` (giữ tên file cũ, nay chạy trên SQLite) |
| Lọc: từ khoá (không dấu), khách, giá, view, hồ bơi, diện tích, Available/Occupied, khoảng ngày | `src/store/filterStore.ts`, `RoomsListScreen.tsx`, `DateRangeModal.tsx` |
| Thẻ phòng: ảnh, tên, location, m², badge Available/Occupied | `RoomCard.tsx` |
| Trang chủ: tìm kiếm thật + phòng nổi bật từ DB | `HomeScreen.tsx` |
| Phòng đã đặt (sắp tới / đã qua / đã huỷ, nút huỷ) | `MyBookingsScreen.tsx` |
| Profile (xem/sửa tên, email, SĐT, thống kê) | `ProfileScreen.tsx` |

### Hai người cùng đặt một phòng
Ai xác nhận trước thì được (first-commit-wins). Việc kiểm tra trùng ngày và INSERT nằm trong một exclusive transaction (`withExclusiveTransactionAsync`) nên các lần ghi được xếp hàng. Người đến sau thấy booking đã tồn tại và nhận `BookingConflictError` (409) rồi được đưa tới `BookingErrorScreen`. Đặt nối ngày (trả phòng hôm nay, nhận phòng hôm nay) không bị coi là trùng.

Đã bỏ cơ chế giả lập "1/6 lần bị đặt trước" cũ vì giờ xung đột là thật, do database quyết định.
