# Thêm repository vào đồng bộ UI Feedback

Repository `Ngh1aa/ui-feedback-tool` là nguồn canonical của file `src/ui-feedback.js`. Workflow nguồn tự quét các repository thuộc organization `Ngh1aa` và chỉ gửi bản cập nhật tới repository có file đăng ký sau:

```text
.github/ui-feedback-sync.json
```

Cách này là **opt-in**: repository mới không bị thay đổi cho tới khi bạn chủ động thêm file đăng ký và workflow nhận.

## Bước 1 — Thêm workflow nhận

Trong repository mới, tạo file:

```text
.github/workflows/sync-ui-feedback.yml
```

Sao chép nội dung từ:

```text
templates/sync-ui-feedback.yml
```

Workflow này sẽ nhận event `ui-feedback-updated`, tải đúng commit của bản canonical và copy file đến các đường dẫn khai báo trong registration file.

## Bước 2 — Thêm file đăng ký

Tạo:

```text
.github/ui-feedback-sync.json
```

Ví dụ nếu project mới dùng file ở root:

```json
{
  "enabled": true,
  "source": "Ngh1aa/ui-feedback-tool",
  "targetPaths": ["ui-feedback.js"],
  "storageKey": "new-project-ui-feedback",
  "githubRepo": "Ngh1aa/NewProject"
}
```

Nếu project import file từ `src/` và đồng thời có bản sao root:

```json
{
  "enabled": true,
  "source": "Ngh1aa/ui-feedback-tool",
  "targetPaths": ["src/ui-feedback.js", "ui-feedback.js"],
  "storageKey": "new-project-ui-feedback",
  "githubRepo": "Ngh1aa/NewProject"
}
```

`targetPaths` phải là danh sách đường dẫn tương đối từ root của repository. Workflow luôn lấy nguồn từ `src/ui-feedback.js` của `ui-feedback-tool`.

## Bước 3 — Thêm secret

Trong repository mới, mở:

```text
Settings
→ Secrets and variables
→ Actions
→ Repository secrets
→ New repository secret
```

Tạo secret với tên:

```text
SYNC_TOKEN
```

Giá trị là Personal Access Token đã cấp cho organization `Ngh1aa`, có quyền repository `Contents: Read and write`.

## Bước 4 — Bootstrap trong project

Workflow chỉ đồng bộ file JavaScript; nó không tự đoán cách khởi tạo tool trong HTML hoặc entry JavaScript của project. Bạn vẫn cần gọi:

```js
import { createUIFeedback } from './ui-feedback.js';

createUIFeedback({
  storageKey: 'new-project-ui-feedback',
  githubRepo: 'Ngh1aa/NewProject',
});
```

Nên dùng `storageKey` riêng cho từng project để dữ liệu feedback không bị trộn giữa các domain.

## Vô hiệu hóa hoặc gỡ repository

Để tạm dừng đồng bộ, đổi:

```json
"enabled": false
```

Để gỡ hoàn toàn, xóa file `.github/ui-feedback-sync.json` hoặc xóa workflow nhận. Repository nguồn sẽ bỏ qua repository không có file đăng ký hoặc có `enabled` khác `true`.

## Cách kiểm tra

Sau khi push file đăng ký và workflow, hãy sửa một dòng nhỏ trong `src/ui-feedback.js` rồi push vào `main`. Workflow nguồn sẽ quét danh sách repository, gửi event đến các repository đã đăng ký, và workflow nhận sẽ tự commit bản cập nhật.
