# Mini Project 2 — Ứng dụng đặt phòng

Ứng dụng đặt phòng khách sạn viết bằng React Native + Expo (TypeScript, strict mode). Người dùng xem danh sách phòng, tìm kiếm, lọc nhiều tiêu chí, chọn ngày, đặt phòng, xem lại phòng đã đặt và quản lý hồ sơ cá nhân. Dữ liệu được lưu bằng SQLite ngay trên máy.

## Cài đặt và chạy

```bash
npm install
npx expo start -c
```

Yêu cầu Node 18 trở lên. Mở bằng Expo Go (quét mã QR) hoặc máy ảo Android/iOS.

Lần chạy đầu tiên, app tự tạo database `roombooking.db` và thêm sẵn 520 phòng mẫu. Muốn xoá sạch dữ liệu để tạo lại, gỡ app khỏi máy (hoặc emulator) rồi chạy lại.

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Framework | React Native + Expo (managed) |
| Ngôn ngữ | TypeScript (strict mode) |
| Điều hướng | React Navigation 7 (bottom tabs + native stack) |
| Quản lý state | Zustand (phía client) + TanStack Query (dữ liệu từ database) |
| Cơ sở dữ liệu | SQLite (`expo-sqlite`) |

## Chức năng và vị trí trong code

| Chức năng | Vị trí |
|---|---|
| Cơ sở dữ liệu (bảng users, rooms, bookings và index) | `src/db/database.ts` |
| Truy vấn phòng, đặt phòng, huỷ phòng, hồ sơ | `src/api/mockApi.ts` (giữ tên file cũ, bên trong chạy trên SQLite) |
| Tìm kiếm theo từ khoá (gõ không dấu vẫn tìm được) | `src/screens/HomeScreen.tsx`, `src/screens/RoomsListScreen.tsx`, `src/utils/text.ts` |
| Lọc nhiều tiêu chí: số khách, giá, view thành phố, hồ bơi, diện tích, trạng thái Available/Occupied, khoảng ngày | `src/store/filterStore.ts`, `src/screens/RoomsListScreen.tsx`, `src/components/DateRangeModal.tsx` |
| Thẻ phòng: ảnh, tên, địa điểm, diện tích, trạng thái Available/Occupied | `src/components/RoomCard.tsx` |
| Danh sách cuộn mượt (React.memo, getItemLayout, tối ưu FlatList) | `src/components/RoomCard.tsx`, `src/screens/RoomsListScreen.tsx` |
| Chọn ngày và chặn đặt trùng lịch | `src/screens/DatePickerScreen.tsx`, `src/utils/dateOverlap.ts` |
| Xác nhận đặt phòng, kiểm tra lại khi bấm "Xác nhận" | `src/screens/ConfirmBookingScreen.tsx`, `src/api/mockApi.ts` |
| Xử lý hai người đặt cùng lúc | `src/api/mockApi.ts`, `src/hooks/useCreateBooking.ts`, `src/screens/BookingErrorScreen.tsx` |
| Phòng đã đặt (sắp tới, đã qua, đã huỷ, nút huỷ đặt phòng) | `src/screens/MyBookingsScreen.tsx`, `src/hooks/useCancelBooking.ts` |
| Hồ sơ cá nhân (xem và sửa tên, email, số điện thoại, thống kê) | `src/screens/ProfileScreen.tsx`, `src/hooks/useProfile.ts` |
| Điều hướng: 4 tab (Trang chủ, Phòng, Đặt chỗ, Cá nhân) và stack đặt phòng | `src/navigation/RootNavigator.tsx`, `src/navigation/RoomsStackNavigator.tsx` |

## Cơ sở dữ liệu

Có 3 bảng:

- `users`: thông tin người dùng (tên, email, số điện thoại, ngày tham gia).
- `rooms`: 520 phòng (tên, địa điểm, diện tích, giá, số khách, tiện nghi, ảnh).
- `bookings`: các lượt đặt phòng (phòng, người đặt, ngày nhận, ngày trả, tổng tiền, trạng thái `confirmed` hoặc `cancelled`).

Trạng thái Available/Occupied của phòng **không lưu cố định**. App tính ra từ bảng `bookings` theo khoảng ngày đang lọc (nếu chưa chọn ngày thì tính cho đêm nay). Các index trên diện tích, giá, số khách và ngày đặt giúp việc lọc nhiều tiêu chí chạy nhanh.

## Hai người cùng đặt một phòng thì xử lý thế nào?

Quy tắc là **ai xác nhận trước thì được đặt** (first-commit-wins).

Việc kiểm tra trùng ngày và lưu booking nằm trong **một transaction độc quyền** của SQLite (`withExclusiveTransactionAsync`), nên các lần ghi được xếp hàng lần lượt. Người đến sau sẽ thấy booking đã tồn tại và nhận lỗi `BookingConflictError` (mã 409), sau đó được đưa tới màn hình "Đặt phòng không thành công" để chọn lại ngày.

Điều kiện trùng lịch là `ngàyNhậnA < ngàyTrảB và ngàyNhậnB < ngàyTrảA`. Vì vậy đặt nối ngày (người này trả phòng đúng hôm người kia nhận phòng) **không** bị coi là trùng.

## Lưu ý khi chỉnh sửa

- Khi sửa dữ liệu mẫu (tên phòng, giá, ảnh...) trong `src/data/mockRooms.ts`, cần tăng `SCHEMA_VERSION` trong `src/db/database.ts` để app tạo lại database. Các booking đã đặt thử sẽ bị xoá.
- Dữ liệu mẫu dùng bộ sinh số ngẫu nhiên cố định (`mulberry32`) nên mỗi lần seed đều ra cùng một bộ phòng. Danh sách `NAMES` phải giữ đúng 12 tên để dữ liệu không bị lệch.
- Database nằm riêng trên từng máy, hai điện thoại khác nhau không thấy booking của nhau. Muốn nhiều người dùng chung dữ liệu thật, cần thêm backend (Firebase, Supabase hoặc server riêng).
- Phí bữa sáng và thuế 8% trong `ConfirmBookingScreen` chỉ mang tính minh hoạ, bạn chỉnh theo yêu cầu đề bài.
- Chưa cấu hình chạy SQLite trên web, nên hãy thử trên điện thoại hoặc máy ảo.