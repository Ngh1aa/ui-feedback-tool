# UI Feedback Tool

Công cụ ghi nhận feedback UI/UX trực tiếp trên trang web. Công cụ được bật hoặc tắt bằng cách **nhấn đồng thời Q + W + E**.

## Tính năng phiên bản 0.1

Công cụ có một thanh nút nổi ở bên phải màn hình, gồm danh sách feedback, thêm comment và sửa nội dung UI. Khi chọn một trong hai thao tác sau, người dùng đưa chuột lên phần tử cần xử lý rồi bấm chọn:

- **Comment:** mở modal để ghi nhận xét, chọn mức độ ưu tiên và lưu vào phiên làm việc.
- **Sửa nội dung:** thay trực tiếp nội dung text của phần tử đang chọn trong phiên preview; thay đổi được ghi vào lịch sử sửa nội dung.
- **Danh sách:** xem số lượng feedback, sửa/xóa comment và xuất file Markdown.

Dữ liệu comment được lưu trong `localStorage` theo `storageKey`, vì vậy có thể refresh trang mà không mất feedback trong cùng project và cùng origin.

## Tích hợp dạng ES module

```html
<script type="module">
  import { createUIFeedback } from '/ui-feedback/src/ui-feedback.js';
  createUIFeedback({
    storageKey: 'atelier-ui-feedback',
    accent: '#f5a623'
  });
</script>
```

Hoặc trong JavaScript của app:

```js
import { createUIFeedback } from './ui-feedback.js';

createUIFeedback({
  storageKey: 'my-project-ui-feedback'
});
```

## Tích hợp bằng script bundle

Nếu project không dùng module, có thể build hoặc copy module này vào thư mục public rồi nạp bằng `type="module"`. Công cụ không yêu cầu React, Vue, Tailwind hay thư viện icon bên ngoài.

## Luồng sử dụng

1. Trên trang preview, nhấn giữ **Q + W + E** cùng lúc để bật công cụ.
2. Bấm nút **comment** để chọn một phần tử và ghi feedback.
3. Bấm nút **bút chì** để thay nội dung text tạm thời trên bản preview.
4. Mở **clipboard** để xem, sửa, xóa hoặc xuất feedback.
5. Bấm nút tải xuống trong panel để tải `ui-feedback-YYYY-MM-DD.md`.

## Cấu trúc Markdown xuất ra

Mỗi file có URL, ngày xuất, số lượng feedback, selector CSS, nội dung phần tử, mức độ ưu tiên và trạng thái xử lý. Phần chỉnh sửa nội dung được ghi ở cuối file trong mục **Lịch sử sửa nội dung**.

## Lưu ý triển khai

Đây là công cụ cho môi trường thiết kế, preview hoặc staging. Không nên bật mặc định trong production cho khách truy cập cuối. Khi đưa vào ba project, nên dùng `storageKey` khác nhau để feedback của các project không bị trộn lẫn.
