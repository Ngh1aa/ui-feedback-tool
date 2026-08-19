# UI Feedback Tool

Công cụ ghi nhận feedback UI/UX trực tiếp trên trang web. Công cụ được bật hoặc tắt bằng cách **nhấn đồng thời Q + W + E**.

## Tính năng

Công cụ có một thanh nút nổi ở bên phải màn hình, gồm danh sách feedback, thêm comment, sửa nội dung UI và chỉnh CSS. Khi chọn thao tác, người dùng đưa chuột lên phần tử cần xử lý rồi bấm chọn. Dữ liệu feedback được lưu trong `localStorage` theo `storageKey`, vì vậy có thể refresh trang mà không mất feedback trong cùng project và cùng origin.

Phiên bản hiện tại hỗ trợ marker trên trang, undo, filter, resolve/unresolve, xuất Markdown và tạo GitHub Issue.

## Tích hợp dạng ES module

```html
<script type="module">
  import { createUIFeedback } from './ui-feedback.js';

  createUIFeedback({
    storageKey: 'atelier-ui-feedback',
    accent: '#f5a623',
    githubRepo: 'Ngh1aa/Atelier'
  });
</script>
```

Hoặc trong JavaScript của app:

```js
import { createUIFeedback } from './ui-feedback.js';

createUIFeedback({
  storageKey: 'my-project-ui-feedback',
  githubRepo: 'Ngh1aa/MyProject'
});
```

Công cụ không yêu cầu React, Vue, Tailwind hoặc thư viện icon bên ngoài. Nếu project không dùng module, có thể copy file vào thư mục public rồi nạp bằng `type="module"`.

## Luồng sử dụng

1. Trên trang preview, nhấn Q + W + E để bật công cụ.
2. Bấm Comment, Edit hoặc CSS rồi chọn phần tử cần xử lý.
3. Nhập feedback hoặc thay đổi nội dung tạm thời trên bản preview.
4. Mở Clipboard để xem, sửa, xóa, resolve hoặc xuất feedback.
5. Bấm nút tải xuống trong panel để tạo file `ui-feedback-YYYY-MM-DD.md`.

## Đồng bộ tự động giữa các repository

`Ngh1aa/ui-feedback-tool` là repository nguồn canonical của `src/ui-feedback.js`. Mỗi khi file này được push lên nhánh `main`, workflow nguồn sẽ quét các repository thuộc organization `Ngh1aa` và gửi event cập nhật **chỉ tới những repository đã đăng ký opt-in**.

Một repository được đăng ký bằng file:

```text
.github/ui-feedback-sync.json
```

Ví dụ nếu project dùng file UI Feedback ở root:

```json
{
  "enabled": true,
  "source": "Ngh1aa/ui-feedback-tool",
  "targetPaths": ["ui-feedback.js"],
  "storageKey": "my-project-ui-feedback",
  "githubRepo": "Ngh1aa/MyProject"
}
```

Nếu project import cả file trong `src/` và bản sao root:

```json
{
  "enabled": true,
  "source": "Ngh1aa/ui-feedback-tool",
  "targetPaths": ["src/ui-feedback.js", "ui-feedback.js"],
  "storageKey": "my-project-ui-feedback",
  "githubRepo": "Ngh1aa/MyProject"
}
```

Repository đích cũng cần có workflow nhận. Có thể sao chép mẫu:

```text
templates/sync-ui-feedback.yml
```

vào:

```text
.github/workflows/sync-ui-feedback.yml
```

Cuối cùng, thêm repository secret `SYNC_TOKEN` trong **Settings → Secrets and variables → Actions → Repository secrets** của repository đích. Token cần quyền `Contents: Read and write` trên organization `Ngh1aa`.

Hướng dẫn đầy đủ nằm tại [docs/ADD-REPOSITORY.md](docs/ADD-REPOSITORY.md).

## Vô hiệu hóa đồng bộ

Để tạm dừng đồng bộ một project, đổi giá trị sau trong `.github/ui-feedback-sync.json`:

```json
"enabled": false
```

Để gỡ hoàn toàn, xóa file đăng ký hoặc workflow nhận. Repository nguồn sẽ bỏ qua repository không có file đăng ký hoặc có `enabled` khác `true`.

## Cấu trúc Markdown xuất ra

Mỗi file có URL, ngày xuất, số lượng feedback, selector CSS, nội dung phần tử, mức độ ưu tiên và trạng thái xử lý. Phần chỉnh sửa nội dung và CSS được ghi ở các section riêng trong file Markdown.

## Lưu ý triển khai

Đây là công cụ cho môi trường thiết kế, preview hoặc staging. Không nên bật mặc định trong production cho khách truy cập cuối. Khi tích hợp nhiều project, mỗi project nên dùng `storageKey` và `githubRepo` riêng để dữ liệu feedback và GitHub Issue không bị trộn lẫn.
