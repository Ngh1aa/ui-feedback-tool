# Báo cáo audit flow UI Feedback Tool

Ngày kiểm tra: 2026-08-22
Phiên bản sau sửa: `0.13.0`

## Phạm vi

- Kiểm tra flow bật/tắt Q → W → E, chọn công cụ, chọn phần tử, mở/hủy/lưu editor và quay lại picking.
- Kiểm tra Note, sửa text nhiều dòng, Bộ CSS, thay ảnh, undo, persistence, panel, export Markdown và tạo GitHub Issue.
- Kiểm tra bundle local, lifecycle cleanup, SPA reapply, shortcut trong vùng nhập liệu và responsive CSS.
- Build lại artifact `src/ui-feedback.js` từ source module.

## Lỗi flow đã xử lý

| Mức độ | Khu vực | Vấn đề trước sửa | Kết quả |
|---|---|---|---|
| Critical | Chọn phần tử | Sau khi chọn Note/Sửa text/CSS/Thay ảnh, người dùng còn phải đi qua Inspector rồi chọn lại hành động | Luồng rút gọn thành **chọn công cụ → bấm phần tử → mở đúng editor** |
| High | Hủy/tắt tool | Tắt tool khi đang preview CSS hoặc ảnh có thể để lại thay đổi chưa lưu trên trang | Tắt hoặc dispose tool hoạt động như Cancel và khôi phục snapshot |
| High | Kiến trúc bundle | Nút Update tự tải và thay runtime từ GitHub/GitHub Pages, trái với mô hình bundle nằm trong project | Loại bỏ runtime update; phiên bản được cập nhật qua repository/workflow và cache-busting |
| High | Dữ liệu ảnh | Ảnh upload base64 bị lưu lặp trong `value` và `newImageState`, đồng thời bị đưa nguyên chuỗi vào panel/Markdown/Issue | Chỉ lưu một nguồn canonical, không render hoặc export base64; bundle giảm từ 229.561 xuống 194.432 byte |
| High | GitHub Issue | Handoff thiếu page và selector nên dev khó xác định vị trí; ảnh upload làm URL Issue quá lớn | Bổ sung URL/page/selector và thay base64 bằng hướng dẫn đính kèm thủ công |
| Medium | Sửa text | Input một dòng và giới hạn ngầm 500 ký tự có thể cắt mất nội dung dài/nhiều dòng | Chuyển sang textarea và giữ nguyên toàn bộ text khi mở editor |
| Medium | Shortcut | `q`, phím khác, `w`, `e` vẫn có thể kích hoạt; vùng `contenteditable` không có `="true"` chưa được nhận diện | Phím ngoài chuỗi reset sequence; hỗ trợ mọi contenteditable trừ `false` |
| Medium | Toolbar | Debounce 500 ms dùng để chặn pointerdown/click làm thao tác bấm nhanh cùng nút bị bỏ qua | Chỉ xử lý action ở sự kiện click, không còn debounce giả |
| Medium | Persistence | Tool luôn báo “đã lưu” kể cả khi localStorage đầy hoặc bị chặn | Hiển thị rõ thay đổi chỉ còn trong phiên hiện tại khi persistence thất bại |
| Low | Export | Export khi danh sách trống vẫn tạo file và xóa undo history | Chặn export trống và giữ nguyên undo stack |

## Kiểm thử đã chạy

- `node --check` cho toàn bộ JavaScript trong `src/`, `demo/`, `scripts/` và `test/`: đạt.
- `node --test test/*.test.js`: 13/13 test đạt.
- `node scripts/build.js`: đạt; bundle có banner `UI Feedback Tool v0.13.0`.
- `git diff --check`: đạt.
- Static HTTP smoke test: `/`, `/demo/`, demo JS/CSS và bundle đều HTTP 200 đúng MIME type.

Môi trường local không có binary Chromium để chạy Playwright trực tiếp; Cloud Browser cũng chặn URL preview từ CDN/raw host. Vì vậy browser E2E chưa chạy được trong môi trường này. Các flow quan trọng được bảo vệ bằng 13 unit/regression test, static HTTP smoke test và CI của PR trước khi merge.
