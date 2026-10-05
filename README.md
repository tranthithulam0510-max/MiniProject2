# Mini Project 2 — Ứng dụng đặt phòng học

Ứng dụng di động cho phép tìm và đặt phòng học (phòng học nhóm, tự học, thảo luận, seminar...) theo ngày.
Xây dựng bằng React Native + Expo (TypeScript, strict mode).

## Cài đặt và chạy

```bash
npm install
npx expo start -c
```

Yêu cầu Node 18 trở lên. Mở bằng ứng dụng **Expo Go** (quét mã QR) hoặc máy ảo Android/iOS.

Nếu điện thoại và máy tính không chung mạng Wi-Fi, chạy bằng tunnel:

```bash
npx expo start --tunnel
```

> Ảnh phòng được tải từ internet (link ảnh), nên thiết bị cần có kết nối mạng để hiện ảnh.

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Framework | React Native + Expo (managed) |
| Ngôn ngữ | TypeScript (strict mode) |
| Điều hướng | React Navigation 7 (bottom tabs + native stack) |
| Quản lý trạng thái | Zustand (client) + TanStack Query (dữ liệu từ "server") |
| Lưu trữ | `expo-sqlite` (dữ liệu phòng, đặt chỗ, tài khoản) + AsyncStorage (phiên đăng nhập, bộ lọc, bản nháp đặt phòng) |
| Mã hoá mật khẩu | `expo-crypto` (SHA-256 + salt ngẫu nhiên) |

## Chức năng

| Chức năng | Vị trí trong code |
|---|---|
| Đăng ký, đăng nhập, đăng xuất, giữ phiên đăng nhập | `src/screens/LoginScreen.tsx`, `RegisterScreen.tsx`, `src/store/authStore.ts`, `src/api/mockApi.ts` (phần Auth) |
| Tìm kiếm (không phân biệt dấu) + lọc nhiều tiêu chí: số người, giá, yên tĩnh, máy chiếu, diện tích, còn trống/đã kín, khoảng ngày | `src/store/filterStore.ts`, `src/screens/RoomsListScreen.tsx`, `src/components/DateRangeModal.tsx` |
| Danh sách phòng cuộn mượt (FlatList, 520 phòng mẫu) | `src/components/RoomCard.tsx`, `RoomsListScreen.tsx` |
| Chọn ngày, chặn ngày đã có người đặt | `src/screens/DatePickerScreen.tsx`, `src/utils/dateOverlap.ts` |
| Xác nhận đặt phòng, tính tiền (tiền phòng, nước uống, phí dịch vụ) | `src/screens/ConfirmBookingScreen.tsx` |
| Xử lý hai người đặt cùng lúc | `src/api/mockApi.ts`, `src/hooks/useCreateBooking.ts`, `src/screens/BookingErrorScreen.tsx` |
| Đặt chỗ của tôi (sắp tới / đã qua / đã huỷ, nút huỷ) | `src/screens/MyBookingsScreen.tsx` |
| Hồ sơ cá nhân (xem và sửa tên, email, số điện thoại) | `src/screens/ProfileScreen.tsx` |
| Trang chủ: tìm kiếm nhanh + phòng nổi bật | `src/screens/HomeScreen.tsx` |
| Điều hướng 4 tab (Trang chủ, Phòng học, Đặt chỗ, Cá nhân) và stack đặt phòng | `src/navigation/RootNavigator.tsx`, `RoomsStackNavigator.tsx` |
| Cơ sở dữ liệu SQLite (users, rooms, bookings) | `src/db/database.ts` |

## Quản lý trạng thái và lưu dữ liệu

| Dữ liệu | Lưu ở đâu | Còn lại khi |
|---|---|---|
| Phiên đăng nhập | Zustand + AsyncStorage (`auth-v1`) | Tắt hẳn app rồi mở lại vẫn đăng nhập, đến khi bấm Đăng xuất |
| Bộ lọc tìm kiếm | Zustand + AsyncStorage (`filter-store-v1`) | Chuyển trang, chuyển tab, tắt hẳn app rồi mở lại |
| Bản nháp đặt phòng (phòng, ngày, số người, nước uống) | Zustand + AsyncStorage (`booking-draft-v1`) | Chuyển trang, chuyển tab, tắt hẳn app rồi mở lại |
| Danh sách phòng, lịch đã đặt, đặt chỗ của tôi | TanStack Query (cache) | Chuyển trang, quay lại không phải tải lại từ đầu |
| Phòng, booking đã xác nhận, hồ sơ | SQLite (`roombooking.db`) | Luôn còn cho đến khi xoá dữ liệu app |

Quy tắc xử lý:
- Chọn sang phòng khác thì ngày và số người của phòng cũ bị xoá.
- Ngày đã chọn mà đã qua thì tự bỏ khi mở lại app.
- Đặt xong thì bản nháp được xoá và nút Back quay về danh sách phòng (không quay lại bước điền thông tin).

> Dữ liệu SQLite và AsyncStorage nằm **trong điện thoại/máy ảo**, không nằm trong thư mục project. Mỗi thiết bị có một bản dữ liệu riêng.

## Đăng nhập

- Màn hình đầu tiên khi chưa đăng nhập là **Đăng nhập**; có thể chuyển sang **Đăng ký**. Đăng ký xong sẽ tự đăng nhập.
- **Tài khoản dùng thử:** `thulam@example.com` / mật khẩu `123456`.
- Mật khẩu **không được lưu dạng gốc**: lưu `salt:hash` (SHA-256 của salt + mật khẩu) trong bảng `users`. Email không phân biệt hoa thường và không được trùng.
- Mỗi tài khoản có danh sách đặt chỗ và hồ sơ riêng. Đăng xuất ở tab **Cá nhân**; khi đăng xuất, cache dữ liệu và bản nháp đặt phòng của người dùng đó bị xoá.
- Phiên đăng nhập lưu bằng AsyncStorage (`auth-v1`). Mỗi lần mở app, ứng dụng kiểm tra tài khoản đã lưu còn tồn tại trong database không, nếu không còn thì quay về màn hình đăng nhập.
- Đây là đăng nhập **cục bộ** (tài khoản nằm trong SQLite của thiết bị), chưa có server xác thực.

## Hai người cùng đặt một phòng

Ai xác nhận trước thì được đặt (first-commit-wins). Việc kiểm tra trùng ngày và ghi booking nằm trong một exclusive transaction của SQLite nên các lần ghi được xếp hàng. Người đến sau nhận `BookingConflictError` rồi được đưa tới `BookingErrorScreen`, tại đây có nút "Chọn lại ngày".

Đặt nối ngày (ngày kết thúc của booking này là ngày bắt đầu của booking khác) không bị coi là trùng.

## Tuỳ chỉnh dữ liệu

### Đổi ảnh phòng

Mở `src/data/mockRooms.ts`, thêm hoặc sửa link trong `IMAGE_URLS`:

```ts
const IMAGE_URLS = [
  "https://i.pinimg.com/....jpg",
  "https://i.pinimg.com/....jpg",
];
```

Link phải là link ảnh trực tiếp (kết thúc bằng `.jpg`/`.png`), không phải link trang web. Các phòng sẽ xoay vòng qua toàn bộ ảnh trong danh sách.

### Đổi tên phòng, vị trí, giá

Cũng trong `src/data/mockRooms.ts`:
- `NAMES`: tên các loại phòng.
- `CITIES`: vị trí (tòa nhà, khu). Tên biến giữ là `city` để không phải sửa logic tìm kiếm.
- `price`: giá mỗi ngày (hiện tại 50.000đ – 300.000đ).

### Tạo lại dữ liệu sau khi sửa

Dữ liệu phòng được lưu vào database ở lần chạy đầu, nên sau khi sửa `mockRooms.ts` cần tạo lại dữ liệu:

1. Mở `src/db/database.ts`, tăng `SCHEMA_VERSION` lên 1 đơn vị.
2. Chạy lại `npx expo start -c` và mở lại app.

Cách khác: vào Cài đặt điện thoại, chọn Expo Go, bấm **Xoá dữ liệu**. Cả hai cách đều xoá các booking đã đặt thử.

## Ghi chú

- Tên các trường trong code (`city`, `hasCityView`, `hasPool`, `breakfast`...) được giữ nguyên từ bản đầu. Trên giao diện chúng hiển thị lần lượt là vị trí, yên tĩnh, máy chiếu, nước uống.
- `src/api/mockApi.ts` giữ tên cũ nhưng chạy trên SQLite, đóng vai "server" của ứng dụng.
- Lịch chọn ngày được viết tay trong `DatePickerScreen.tsx`, không dùng thư viện lịch bên ngoài.
- Phí nước uống (30.000đ/ngày) và phí dịch vụ (8%) trong `ConfirmBookingScreen.tsx` chỉ mang tính minh hoạ, chỉnh theo yêu cầu đề bài nếu cần.
- Cảnh báo `baseUrl` trong `tsconfig.json` không ảnh hưởng khi chạy app. Bỏ dòng `baseUrl` và dùng `"@/*": ["./src/*"]` trong `paths` để hết cảnh báo.