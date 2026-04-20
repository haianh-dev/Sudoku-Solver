🧩 Advanced Sudoku Solver (SAT-Based)
Một ứng dụng web giải Sudoku hiện đại, sử dụng sức mạnh của logic toán học SAT (Satisfiability) với kỹ thuật Sequential Counter (AMO/ALO) để tìm lời giải tức thì cho mọi cấp độ đố vui.

✨ Tính năng nổi bật
🚀 Siêu tốc độ: Sử dụng SAT Solver (AMO/ALO constraints) giúp giải quyết các bảng Sudoku khó nhất trong tích tắc.
🎨 Giao diện Hi-Tech: Thiết kế với tông màu Indigo/Violet chủ đạo, hỗ trợ Dark Mode và High Contrast.
📱 Đa nền tảng: Responsive hoàn hảo trên cả Desktop và Mobile.
🔄 Thông minh:
 Phân biệt số người dùng nhập (Đen) và số máy giải (Xanh).
 Hệ thống Random đa dạng (không trùng lặp).
 Validation cực chặt: Báo lỗi nếu bảng trống hoặc không hợp lệ.
📜 History: Lưu lại lịch sử các lần giải thành công (Local Storage).
🔳 Multi-Grid (In Progress): Hỗ trợ kích thước 9x9.

🛠️ Công nghệ sử dụng
Frontend
 Framework: Next.js 15 (App Router)
 Styling: Tailwind CSS v4 (Modern UI)
 State Management: React Hooks
 Icons: Lucide React
Backend
 Language: Python 3.10+
 API Framework: FastAPI
 Core Logic: Sequential Counter (At-Most-One / At-Least-One) SAT encoding.
 Deployment: Render (Backend) & Vercel (Frontend).

🚀 Cài đặt và Chạy thử
1. Backend (FastAPI)
bash
 cd backend
 python -m venv venv
 source venv/bin/activate  # Hoặc venv\Scripts\activate trên Windows
 pip install -r requirements.txt
 uvicorn main:app --reload

2. Frontend (Next.js)
bash
 cd frontend
 npm install
 npm run dev

Truy cập địa chỉ: http://localhost:3000

🧩 Logic giải thuật (SAT Encoding)
Dự án này không sử dụng Backtracking truyền thống. Thay vào đó, nó chuyển đổi bảng Sudoku thành một bài toán Boolean Satisfiability (SAT):
Cell Constraints: Mỗi ô phải có ít nhất một số (ALO) và tối đa một số (AMO).
Row/Column/Block Constraints: Mỗi số từ 1-9 phải xuất hiện đúng một lần trong mỗi vùng.
Sử dụng Sequential Counter để tối ưu hóa số lượng mệnh đề (clauses), giúp Solver hoạt động cực kỳ hiệu quả.

📈 Định hướng phát triển
Hoàn thiện Tabs cho bảng 4x4 và 16x16.
Tích hợp Computer Vision (OCR) để giải Sudoku qua camera.
Chế độ giải từng bước (Step-by-step Visualization).

Author: Nguyễn Hải Anh
Project được phát triển với tinh thần Vibe Coding & AI Collaboration.
