# UI Feedback Tool

Công cụ ghi nhận feedback UI/UX trực tiếp trên trang web. Công cụ được bật hoặc tắt bằng cách **nhấn nhanh Q → W → E theo đúng thứ tự** hoặc giữ đồng thời ba phím. Phím tắt được bỏ qua khi người dùng đang nhập liệu để không làm gián đoạn website.

[Mở demo GitHub Pages](https://ngh1aa.github.io/ui-feedback-tool/)

## Tính năng

Công cụ có một **floating action dock** dạng pill ở đáy màn hình, gồm danh sách feedback, thêm note, sửa nội dung UI, **Bộ CSS** và **Thay ảnh**. Dock có nhãn rõ ràng, trạng thái active, nút thu gọn thành bubble, hỗ trợ kéo để di chuyển và tự co gọn trên màn hình nhỏ. Khi chọn thao tác, người dùng đưa chuột lên phần tử cần xử lý rồi bấm chọn. Dữ liệu feedback được lưu trong `localStorage` theo `storageKey`, vì vậy có thể refresh trang mà không mất feedback trong cùng project và cùng origin.

Chế độ **Bộ CSS** mở editor bên phải có preset, tab nâng cao, màu HEX, font Google Fonts, border radius, opacity và điều khiển vị trí 2D bằng pad/sliders. Mọi thao tác kéo, nhập hoặc chọn giá trị đều cập nhật trực tiếp phần tử đang chọn; **Lưu** xác nhận thay đổi, còn **Hủy** khôi phục trạng thái ban đầu. Editor và drawer Feedback đều có thể kéo từ thanh tiêu đề; vị trí cửa sổ được giữ trong suốt các lần re-render. Tọa độ CSS X/Y có cả pad kéo-thả, slider, ô nhập số px và phím mũi tên; các cách điều khiển luôn đồng bộ và có fallback tương thích cho `translate`/`transform`. Chế độ **Thay ảnh** áp dụng được cho cả thẻ `<img>` và phần tử có `background-image`, nhận URL website, file `image/*` hoặc ảnh từ clipboard, có preview, kéo-thả căn vị trí, zoom 30–300%, khôi phục và undo. File upload được giới hạn 1 MB để tránh làm đầy `localStorage`.

Phiên bản v0.14 tập trung cho quy trình cá nhân: **chọn công cụ → bấm phần tử → chỉnh trực tiếp → lưu → xuất `.md`**. Danh sách được nhóm theo trang và chỉ giữ các thao tác cần thiết: xem phần tử, sửa ghi chú, xóa và xuất Markdown. File xuất ra được cấu trúc để AI hiểu ngay vị trí, trạng thái hiện tại và kết quả mong muốn; CSS chỉ liệt kê những thuộc tính thực sự thay đổi. Xuất file không tự xóa phiên làm việc. Các thay đổi edit/image/CSS vẫn được tự áp dụng lại khi ứng dụng SPA render lại DOM.

## Tích hợp dạng ES module

```html
<script type="module">
  import { createUIFeedback } from './ui-feedback.js';

  createUIFeedback({
    storageKey: 'atelier-ui-feedback',
    accent: '#ffffff',
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

Công cụ không yêu cầu React, Vue, Tailwind hoặc thư viện icon bên ngoài. Accent mặc định là **trắng (`#ffffff`)**; có thể ghi đè bằng `accent` khi cần. `githubRepo` mặc định để trống để tool không vô tình tạo Issue vào sai project. Nếu project không dùng module, có thể copy file bundle vào thư mục public rồi nạp bằng `type="module"`.

## Kiến trúc source v0.14

Source phát triển nằm trong `src/index.js` và các module con; `src/ui-feedback.js` là bundle ESM một file được tạo bởi `npm run build` để giữ tương thích với GitHub Pages và workflow đồng bộ hiện tại. Không nên sửa trực tiếp bundle nếu thay đổi cần tồn tại lâu dài.

```text
src/
├── core/                 # config, state/persistence, DOM utilities
├── features/             # danh sách thay đổi, Markdown AI-ready và các editor
├── ui/                   # toolbar, panel/modal drag controller, toast và icons
├── stylesheet.js         # stylesheet Shadow DOM
├── index.js              # createUIFeedback() và lifecycle orchestration
└── ui-feedback.js       # generated deploy artifact
```

Sau khi sửa module, chạy `npm run check:all`, `npm test` và `npm run build`. Commit luôn `src/ui-feedback.js` sau khi build vì workflow downstream lấy chính artifact này để copy sang các project.

## Luồng sử dụng

1. Trên trang preview, nhấn Q + W + E để bật công cụ.
2. Bấm Comment, Edit, Bộ giao diện hoặc Thay ảnh rồi chọn phần tử cần xử lý. Ở chế độ Thay ảnh, nếu click vào wrapper chứa duy nhất một ảnh, tool sẽ chọn đúng thẻ `<img>` bên trong.
3. Tool mở ngay đúng editor của công cụ đã chọn. Nhập feedback và chọn phân loại, chỉnh các control của Bộ CSS, hoặc nhập URL/chọn file/dán ảnh trong Thay ảnh. Kéo thanh tiêu đề để di chuyển drawer/editor; trong Bộ CSS có thể kéo pad 2D, dùng slider hoặc nhập trực tiếp X/Y theo px. Kéo trực tiếp trên preview để căn ảnh vào khung; dùng zoom hoặc pad 2D khi cần tinh chỉnh. Các thay đổi chỉ tác động lên bản preview hiện tại cho đến khi bấm Lưu; Hủy hoặc tắt tool sẽ khôi phục preview chưa lưu.
4. Mở Danh sách để kiểm tra các thay đổi được nhóm theo trang. Nút Hoàn tác áp dụng cho sửa chữ, CSS và hình ảnh.
5. Bấm **Xuất .md** để tạo tài liệu yêu cầu AI-ready có timestamp. Danh sách vẫn được giữ nguyên sau khi xuất.

## Đồng bộ tự động giữa các repository

`Ngh1aa/ui-feedback-tool` là repository nguồn canonical của source modules và bundle `src/ui-feedback.js`. Mỗi khi file này được push lên nhánh `main`, workflow nguồn sẽ quét các repository do owner `Ngh1aa` sở hữu và gửi event cập nhật **chỉ tới những repository đã đăng ký opt-in**.

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

Cuối cùng, thêm repository secret `SYNC_TOKEN` trong **Settings → Secrets and variables → Actions → Repository secrets** của repository đích. Token cần quyền `Contents: Read and write` trên các repository của tài khoản `Ngh1aa`.

Hướng dẫn đầy đủ nằm tại [docs/ADD-REPOSITORY.md](docs/ADD-REPOSITORY.md).

## Vô hiệu hóa đồng bộ

Để tạm dừng đồng bộ một project, đổi giá trị sau trong `.github/ui-feedback-sync.json`:

```json
"enabled": false
```

Để gỡ hoàn toàn, xóa file đăng ký hoặc workflow nhận. Repository nguồn sẽ bỏ qua repository không có file đăng ký hoặc có `enabled` khác `true`.

## Cấu trúc Markdown xuất ra

Mỗi file có URL, ngày xuất, số lượng feedback, selector CSS, nội dung phần tử, mức độ ưu tiên và trạng thái xử lý. Phần sửa nội dung, Bộ giao diện và thay ảnh được ghi ở các section riêng; image item nêu rõ ảnh cũ, ảnh mới và nguồn là URL website hay upload từ máy.

## Lưu ý triển khai

Đây là công cụ cá nhân cho môi trường thiết kế, preview hoặc staging. Không nên bật mặc định trong production cho khách truy cập cuối. Khi tích hợp nhiều project, mỗi project nên dùng `storageKey` riêng để dữ liệu thay đổi không bị trộn lẫn. Bundle được cập nhật trong repository thông qua workflow đồng bộ; runtime không tự tải hoặc thay thế code từ GitHub Pages bên ngoài.

Demo được tách thành `demo/index.html`, `demo/styles.css` và `demo/demo.js`; workflow Pages tự deploy từ `main`. Source module là nguồn chỉnh sửa, còn `src/ui-feedback.js` là artifact được tạo bởi `npm run build`.
