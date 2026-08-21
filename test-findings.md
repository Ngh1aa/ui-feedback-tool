# Báo cáo audit UI Feedback Tool

Ngày kiểm tra: 2026-08-21
Phiên bản sau sửa: `0.12.0`

## Phạm vi

- Đọc toàn bộ source, demo, test, tài liệu và GitHub Actions.
- Kiểm tra logic shortcut, picker/inspector, marker, comment CRUD, CSS editor, image editor, export, GitHub Issue, update runtime và lifecycle cleanup.
- Kiểm tra UI responsive, theme, keyboard/focus và thông báo lỗi.
- Build lại bundle triển khai `src/ui-feedback.js` từ source module.

## Lỗi chính đã xử lý

| Mức độ | Khu vực | Vấn đề trước sửa | Kết quả |
|---|---|---|---|
| Critical | Marker | Marker được append vào `document.body` nhưng CSS nằm trong Shadow DOM nên style không áp dụng | Marker chuyển vào layer riêng trong Shadow DOM, dùng tọa độ fixed và hỗ trợ bàn phím |
| Critical | Shortcut | Gõ nhanh `qwe` trong input/textarea có thể bật hoặc tắt tool | Bỏ qua shortcut trong mọi vùng editable; chuỗi nhanh phải đúng thứ tự |
| Critical | Update | Bundle không giữ banner version nên runtime update không đọc được phiên bản | Build thêm banner version và parser có fallback qua `TOOL_VERSION` |
| High | CSS editor | Opacity 0–1 bị hiển thị thành 0–1%, rồi ghi giá trị sai | Quy đổi đúng giữa CSS 0–1 và UI 0–100% |
| High | Export | Export xóa sạch session ngay, không có đường khôi phục | Lưu snapshot vào undo stack và cho phép Hoàn tác |
| High | Sync workflow | Workflow dùng API `listForOrg` cho owner là tài khoản cá nhân | Chuyển sang `listForAuthenticatedUser` và lọc đúng owner |
| High | Multi-page/SPA | Marker có thể trùng giữa các page; thay đổi DOM của SPA làm selector/marker cũ | Chỉ hiện marker của pathname hiện tại và reapply có throttle qua MutationObserver |
| High | Image editor | Restore có thể đổi URL tương đối thành `currentSrc`; zoom làm mất transform khác; giới hạn 1 MB tính sai | Giữ nguyên thuộc tính `src`, loại riêng scale, kiểm tra đúng byte size |
| Medium | Theme | Visual override ép accent trắng và dark surface, làm `theme`/`accent` không còn đúng | Bỏ ép accent, thêm light-theme correction và giữ custom accent |
| Medium | Accessibility | Modal thiếu nút đóng ở header/focus trap; tabs thiếu `aria-selected`; card không thao tác được bằng keyboard | Bổ sung close, focus restore/trap, tab semantics, keyboard card navigation |
| Medium | Responsive | Toolbar/panel có thể tràn màn hình nhỏ; cửa sổ kéo được gần như ra khỏi viewport | Toolbar scroll ngang an toàn; panel full-width hợp lý; drag clamp theo kích thước thật |

## Kiểm thử đã chạy

- `node --check` cho toàn bộ JavaScript trong `src/`, `demo/`, `scripts/` và `test/`: đạt.
- `node --test test/*.test.js`: 10/10 test đạt.
- `node scripts/build.js`: đạt; bundle có banner `UI Feedback Tool v0.12.0`.
- `git diff --check`: đạt, không có lỗi whitespace.
- Static HTTP smoke test: `/`, `/demo/`, CSS, demo JS và bundle đều trả HTTP 200 với MIME type phù hợp.

Môi trường kiểm tra không tải được Chromium từ CDN nên không chạy được screenshot/E2E bằng Playwright. Các luồng browser quan trọng được bảo vệ bằng unit/regression test và static smoke test; sau khi PR merge, workflow Pages cung cấp demo công khai để kiểm tra trực quan trên trình duyệt thật.
