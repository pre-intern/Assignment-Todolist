# 📝 To-Do App – Preliminary Assignment Submission  

👀 Please Check **ASSIGNMENT.md** file in this repository for assignment requirements.  

---

## 🚀 Project Setup & Usage  
How to install and run your project:  

```bash
# 1. Clone repository
git clone https://github.com/pre-intern/Assignment-Todolist.git

cd Assignment-Todolist

# 2. Install dependencies
npm install

# 3. Run in development
npm run dev

Deployed Web URL or APK file

✍️ [Paste your deployed web link or APK file here]

🎥 Demo Video

Demo video link (≤ 2 minutes):
✍️ [Paste your YouTube Unlisted video link here]

💻 Project Introduction
a. Overview

✍️ Đây là ứng dụng Study Flow Web giúp sinh viên quản lý công việc và nhiệm vụ hằng ngày, tập trung vào việc tối ưu thời gian học tập, làm việc nhóm và cá nhân. Ứng dụng đơn giản, trực quan, chạy trên nền web.

b. Key Features & Function Manual

✍️ Thêm nhiệm vụ (Add Task): nhập nội dung công việc và gán tag (ví dụ: học tập, công việc, cá nhân).

✍️ Chỉnh sửa nhiệm vụ (Edit Task): cập nhật thông tin công việc.

✍️ Đánh dấu hoàn thành (Complete Task): tick ✅ để theo dõi tiến độ.

✍️ Xóa nhiệm vụ (Delete Task): loại bỏ nhiệm vụ không cần thiết.

✍️Description (Optional): mô tả chi tiết task.

✍️Category: dropdown (Class, Project, Work, Personal, …).

✍️Priority: dropdown (Low / Medium / High).

✍️Estimated Time (minutes): input số phút (vd: 30).

✍️Deadline: picker thời gian + ngày.
✍️Tags: chọn tag có sẵn hoặc thêm tag tùy chỉnh rồi click Add.

✍️ Lưu trữ trên Supabase: dữ liệu bền vững, truy cập từ nhiều thiết bị.

c. Unique Features (What’s special about this app?)

✍️Kết hợp task management + focus mode + analytics trong 1 giao diện tối (dark, focus-first).

✍️Tags + custom tags cho phép người dùng phân loại linh hoạt.

✍️Analytics đơn giản nhưng hữu dụng: giúp xác định giờ hiệu quả nhất và tỷ lệ trì hoãn.

d. Technology Stack and Implementation Methods

Frontend: React + Vite + TypeScript

Styling: Tailwind CSS

Backend/Database: Supabase (PostgreSQL + Auth)

Build Tool: Vite

Version Control: Git + GitHub

e. Service Architecture & Database structure (when used)

✍️Architecture: Client (React) ↔ API (Supabase) ↔ Database (PostgreSQL).

✍️Client (React) ↔ Supabase (Auth + Postgres)

✍️DB schema (Postgres / Supabase) — table tasks

🧠 Reflection
a. If you had more time, what would you expand?

✍️ Thêm lịch nhắc nhở (reminder calendar), thống kê biểu đồ (tasks hoàn thành theo tuần/tháng), và offline mode (localStorage sync).
✍️Bảo mật keys

✍️UX: Tag handling

✍️Hiện UI cho phép custom tag → cần validate duplicate và giới hạn số tag.

✍️Analytics độ tin cậy

✍️Most Productive Hours dựa trên lịch sử nhỏ sẽ dễ bị lệch — cần threshold (ít nhất N tasks) trước khi hiển thị.

✍️Offline / Sync

✍️Cân nhắc caching tasks local để app vẫn dùng được tạm khi mất mạng, rồi sync khi reconnect.

✍️Testing

✍️Thêm unit tests cho logic tính toán analytics + E2E test flow tạo, chỉnh sửa, xóa task.

b. If you integrate AI APIs more for your app, what would you do?

✍️ Tích hợp AI Task Assistant: gợi ý cách ưu tiên công việc, phân loại tự động (Work/Study/Personal), và natural language input (người dùng chỉ cần gõ "Làm báo cáo 8h tối mai", hệ thống tự parse deadline + category).

✅ Checklist

 Code runs without errors

 All required features implemented (add/edit/delete/complete tasks)

 All ✍️ sections are filled