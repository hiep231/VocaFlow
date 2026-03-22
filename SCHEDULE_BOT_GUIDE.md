# Hướng Dẫn Sử Dụng Tính Năng "Drip-Feed" Telegram Bot 🚀

Tính năng **Drip-Feed** cho phép bạn import một danh sách hàng trăm từ vựng cùng lúc vào VocaFlow, nhưng thay vì bắt bạn học hết ngay lập tức, Telegram Bot sẽ **nhỏ giọt** (drip-feed) một số lượng từ vựng nhất định cho bạn mỗi ngày vào một khung giờ do chính bạn chọn.

Bot sẽ tự động thêm thẻ vào hệ thống VocaFlow để bạn ôn tập, đồng thời gửi cho bạn một tin nhắn Telegram chứa toàn bộ từ vựng của ngày hôm đó kèm theo ví dụ, phiên âm và định nghĩa.

---

## Phần 1: Thiết Lập Lần Đầu (Dành Cho Cài Đặt Server)

*Lưu ý: Nếu bạn đã cấu hình xong theo hướng dẫn trước đó, có thể bỏ qua bước này.*

1. **Chuẩn bị Firebase Service Account:**
   - Truy cập **Firebase Console** -> **Project Settings** -> **Service accounts**.
   - Bấm **Generate new private key** để tải file `.json`. Đổi tên thành `serviceAccountKey.json`.
   - Lưu file này vào thư mục `bot/` trong source code VocaFlow `(VocaFlow/bot/serviceAccountKey.json)`.

2. **Cấu hình biến môi trường (`.env`):**
   - Mở file `.env` ở thư mục gốc của VocaFlow, đảm bảo bạn đã có Token của Bot:
     ```env
     TELEGRAM_BOT_TOKEN="123456789:ABCDefghIJKL..."
     ```

3. **Chạy Bot:**
   - Mở terminal, vào thư mục `bot`:
     ```bash
     cd bot
     npm run dev
     ```
   - Bot hiện chữ `🤖 VocaFlow Telegram Bot is running!` là thành công.

---

## Phần 2: Kết Nối Telegram Với Tài Khoản VocaFlow Của Bạn

Để Bot biết gửi từ vựng cho ai và lưu vào tài khoản VocaFlow nào, bạn cần liên kết tài khoản 1 lần duy nhất.

1. **Lấy UID VocaFlow:**
   - Truy cập Web VocaFlow, đăng nhập.
   - Bấm sang tab **Schedule** ở trang chủ. Tại phần *Connect Telegram Bot*, bạn sẽ thấy **UID** của mình (Ví dụ: `abcxyz123...`). Hãy copy đoạn mã này.

2. **Liên kết trên Telegram:**
   - Mở Telegram, tìm tên Bot VocaFlow của bạn.
   - Bấm `/start`.
   - Gõ lệnh: `/link <UID của bạn>` (Ví dụ: `/link abcxyz123`).
   - Bot sẽ thông báo: `✅ Liên kết thành công!`.

3. **Chọn giờ nhận từ vựng (Quan trọng):**
   - Bạn muốn nhận từ mới lúc mấy giờ? Hãy gõ lệnh `/settime` trên Telegram.
   - Bot sẽ hiện ra một bảng nút với 11 khung giờ phổ biến (Từ 6:00 sáng đến 22:00 đêm).
   - Bấm chọn một giờ phù hợp nhất với thói quen học tập của bạn. (Mặc định nếu quên chỉnh sẽ là 7:00 sáng).

---

## Phần 3: Tạo Lịch Trình (Schedule) Mới

1. Mở trang Web VocaFlow, vào Dashboard -> **Tab Schedule**.
2. Bấm nút **"New Schedule"**.
3. **Cấu hình thông tin:**
   - **Target Deck**: Chọn bộ thẻ bạn muốn lưu từ vựng vào (Ví dụ: `IELTS Vocab`).
   - **Words per day**: Số từ bạn muốn học *thêm* mỗi ngày (Khuyến nghị: 5 đến 10 từ/ngày để không bị quá tải thẻ ôn tập SRS).
   - **Vocabulary List**: Paste danh sách từ vựng của bạn vào. Hãy nhớ phải CHUẨN format sau (cách nhau bởi dấu `|`):
     ```text
     [Từ Vựng] | [Định Nghĩa] | [Phiên Âm] | [Collocation] | [Câu Ví Dụ]
     ```
     *Ví dụ mẫu:*
     ```text
     apple | quả táo | /ˈæp.əl/ | apple pie | I eat an apple every day.
     book | cuốn sách | /bʊk/ | a good book | She is reading a book.
     ```
4. Hệ thống sẽ **Preview** ở ngay bên dưới để báo cho bạn biết nó nhận diện được bao nhiêu từ và mất bao nhiêu ngày để đẩy hết.
5. Bấm **Create Schedule**. Lịch trình mới sẽ hiện trong mục **Active Schedules**.

---

## Phần 4: Vòng Lặp Học Tập Hàng Ngày

Kể từ lúc này, bạn không cần phải làm hệ thống thủ công nữa:

- **Đúng khung giờ bạn đã chọn (ví dụ 8:00 sáng):** Telegram Bot sẽ tự động gửi cho bạn một tin nhắn tóm tắt `N` từ vựng của ngày hôm đó để bạn đọc nhanh.
- **Trên Web VocaFlow:** Đồng thời, hệ thống VocaFlow đã tự động tạo `N` cái flashcards vào "Target Deck". Khi bạn mở app VocaFlow ra, bạn sẽ thấy ô nhắc học bài sáng đèn.
- Những thẻ cũ đã import hôm qua sẽ được VocaFlow áp dụng logic Spaced Repetition (SRS) để nhắc lại. Những thẻ hôm nay là thẻ "Mới tinh".
- Nếu thẻ của ngày mai (trong danh sách 100 từ) chưa tới lịch, nó sẽ được ẩn hoàn toàn trên VocaFlow, không bao giờ làm phiền bạn.

---

## Các Lệnh Hỗ Trợ Khác Của Bot

- `/status`: Xem tiến độ của các Lịch trình đang chạy (Ví dụ: Đã gửi 15/100 từ - Tiến độ 15%).
- `/settime`: Đổi lại giờ nhận nếu bạn có chu kì sinh hoạt mới.

**Chúc bạn học tập hiệu quả để không bao giờ bị "ngợp" khối lượng flashcard khổng lồ! 🚀**
