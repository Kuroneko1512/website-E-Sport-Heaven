# Quy tắc đặt tên và quản lý nhánh Git

Tài liệu này mô tả các quy tắc và hướng dẫn về việc đặt tên nhánh, commit message và quy trình Merge Request (MR) / Pull Request (PR) để đảm bảo sự nhất quán và hiệu quả trong quá trình phát triển dự án.

## 1. Quy tắc đặt tên nhánh

Việc đặt tên nhánh rõ ràng và nhất quán giúp dễ dàng quản lý và theo dõi các tính năng, sửa lỗi hoặc các công việc khác nhau.

*   **Nhánh chính (Main branches):**
    *   `main`: Nhánh chứa mã nguồn chính, ổn định, đã được kiểm thử và sẵn sàng cho việc phát hành production.
    *   `stable`: Nhánh chứa phiên bản đã được phát hành và đang chạy trên production. Thường được tạo từ `main` khi có release.

*   **Nhánh phát triển (Development branch):**
    *   `develop`: Nhánh tích hợp các tính năng đang được phát triển. Tất cả các nhánh `feature` sẽ được merge vào nhánh này.

*   **Nhánh tính năng (Feature branches):**
    *   `feature/tên-tính-năng` (ví dụ: `feature/user-authentication`, `feature/shopping-cart`): Nhánh cho việc phát triển một tính năng mới. Tên tính năng nên ngắn gọn, dễ hiểu và sử dụng dấu gạch ngang (-) để phân tách các từ.

*   **Nhánh sửa lỗi (Bugfix branches) (tùy chọn):**
    *   `bugfix/mô-tả-lỗi` (ví dụ: `bugfix/fix-login-error`): Nhánh cho việc sửa một lỗi cụ thể. Có thể tạo từ `develop` hoặc `main` tùy vào mức độ khẩn cấp.

*   **Nhánh hotfix (Hotfix branches) (tùy chọn):**
    *   `hotfix/mô-tả-lỗi` (ví dụ: `hotfix/critical-security-vulnerability`): Nhánh cho việc sửa lỗi khẩn cấp trực tiếp trên `stable`. Sau khi sửa xong sẽ merge vào cả `main` và `develop`.

**Ví dụ:**

*   Đúng: `feature/add-user-profile`
*   Sai: `FeatureUserProfile`, `add user profile`, `featureAddUserProfile`

## 2. Quy tắc commit message (Conventional Commits)

Commit message cần rõ ràng và mô tả ngắn gọn về những thay đổi đã được thực hiện. Sử dụng định dạng sau:
<Loại thay đổi>: <Mô tả ngắn gọn>

[Nội dung chi tiết (tùy chọn)]

[Issue được giải quyết (tùy chọn), ví dụ: Fixes #123]

*   **Loại thay đổi:**
    *   `feat`: Thêm tính năng mới.
    *   `fix`: Sửa lỗi.
    *   `docs`: Thay đổi tài liệu.
    *   `style`: Thay đổi về định dạng code (ví dụ: whitespace, formatting).
    *   `refactor`: Tái cấu trúc code mà không thay đổi chức năng.
    *   `test`: Thêm hoặc sửa test.
    *   `chore`: Các thay đổi khác (ví dụ: cập nhật dependencies, cấu hình build).
    *   `perf`: Cải thiện hiệu suất.
    *   `ci`: Thay đổi cấu hình CI.
    *   `build`: Thay đổi hệ thống build.
    *   Ví dụ
         feat: Add user authentication
         
         Implement login and registration functionality.
         
         Fixes #42

## 3. Quy trình Merge Request (MR) / Pull Request (PR)

Quy trình MR/PR đảm bảo chất lượng mã nguồn và giúp các thành viên trong nhóm review code trước khi được tích hợp vào nhánh chính.

1.  **Tạo nhánh:** `git checkout -b feature/tên-tính-năng` (từ `develop`)
2.  **Thực hiện thay đổi:** Thực hiện các thay đổi và commit: `git commit -m "Loại thay đổi: Mô tả ngắn gọn"`
3.  **Push nhánh:** `git push origin feature/tên-tính-năng`
4.  **Tạo MR/PR:** Trên nền tảng Git (GitHub, GitLab, Bitbucket), tạo MR/PR từ nhánh `feature` đến `develop`.
5.  **Review code:** Các thành viên review, đưa ra nhận xét.
6.  **Sửa đổi (nếu cần):** Chỉnh sửa và `git push` lại.
7.  **Approve:** Sau khi được approve, merge.
8.  **Merge vào `develop`:** Trên nền tảng Git, merge MR/PR.
9.  **Release:** Tạo `stable` từ `main`, merge `develop` vào `main`.
10. **Hotfix:** Tạo `hotfix` từ `stable`, sau khi sửa merge vào `main` và `develop`.
11. **Xóa nhánh:** `git branch -d feature/tên-tính-năng` (local), `git push origin --delete feature/tên-tính-năng` (remote)

**Hướng dẫn tạo MR/PR trên GitHub (tương tự trên GitLab/Bitbucket):**

1.  Truy cập repository trên GitHub.
2.  Chọn nhánh của bạn.
3.  Click vào "Compare & pull request".
4.  Điền thông tin cho MR/PR (tiêu đề, mô tả).
5.  Click "Create pull request".

## 4. Protected Branches (Nhánh được bảo vệ)

Nên thiết lập protected branches cho `main`, `develop` và `stable`.

**Thiết lập trên GitHub:**

1.  Vào `Settings` -> `Branches`.
2.  Tìm nhánh cần bảo vệ và click `Edit`.
3.  Tick vào `Require pull requests before merging`.
4.  Có thể tick thêm `Require approvals` và đặt số lượng approvals cần thiết.
5.  Có thể tick thêm `Include administrators`.

## 5. Giải quyết Conflict (Xung đột)

Khi merge, có thể xảy ra xung đột.

**Cách giải quyết:**

1.  Mở file bị xung đột.
2.  Tìm các đoạn code được đánh dấu xung đột (`<<<<<<<`, `=======`, `>>>>>>>`).
3.  Chỉnh sửa code để giải quyết xung đột.
4.  Lưu file và `git add`, `git commit`.

**Ví dụ:**
<<<<<<< HEAD Đây là code ở nhánh main.
Đây là code ở nhánh feature.

feature/add-payment-gateway

Sau khi giải quyết:

Đây là code đã được chỉnh sửa để giải quyết xung đột.


## Kết luận

Việc tuân thủ các quy tắc này giúp dự án được quản lý tốt hơn, giảm thiểu lỗi và tăng hiệu quả là
