# 🧩 Advanced Sudoku Solver (SAT-Based)

Một ứng dụng web giải Sudoku hiện đại, sử dụng sức mạnh của logic toán học **SAT (Satisfiability)** kết hợp với kỹ thuật tối ưu **Sequential Counter (AMO/ALO)** để tìm lời giải tức thì cho mọi cấp độ đố vui.

---

## ✨ Tính năng nổi bật
* 🚀 **Siêu tốc độ:** Giải các bảng Sudoku khó nhất trong tích tắc bằng SAT Solver thay vì Backtracking truyền thống.
* 🎨 **Giao diện Hi-Tech:** Tông màu Indigo/Violet hiện đại, hỗ trợ đầy đủ **Dark / Light / High Contrast Mode**.
* 📱 **Đa nền tảng:** Responsive hoàn hảo, trải nghiệm mượt mà trên cả Desktop và Mobile.
* 🔄 **Xử lý thông minh:** Phân biệt số người dùng nhập (**Màu Đen**) và số máy giải (**Màu Xanh**), kèm hệ thống Random đề bài đa dạng.
* 📜 **History:** Tự động lưu lại lịch sử các lần giải thành công vào Local Storage của trình duyệt.
* 🔳 **Multi-Grid:** Hỗ trợ đa dạng kích thước bảng linh hoạt từ 4x4 đến 9x9.

---

## 🛠️ Công nghệ sử dụng
* **Frontend:** Next.js 15 (App Router), Tailwind CSS v4, Lucide Icons.
* **Backend:** Python FastAPI, Sequential Counter Logic (SAT Encoding).
* **Deployment:** Vercel (Frontend) & Render (Backend).

---

## 🚀 Hướng dẫn cài đặt và Chạy thử

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```
### 2. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Truy cập ứng dụng tại địa chỉ: http://localhost:3000

## 🧠 Chi tiết thuật toán (SAT Encoding)

Dự án này không đi theo lối mòn Backtracking (thử và sai). Chúng tôi chuyển đổi Sudoku thành bài toán **Boolean Satisfiability (SAT)** để đạt hiệu suất tối ưu:

*   **Cell Constraints:** Đảm bảo mỗi ô có ít nhất một số (**ALO**) và duy nhất một số (**AMO**).
*   **Region Constraints:** Đảm bảo mỗi con số xuất hiện đúng 1 lần trong mỗi hàng, cột và khối 3x3 (hoặc 2x2 cho bảng 4x4).
*   **Sequential Counter:** Kỹ thuật mã hóa hiện đại giúp giảm thiểu tối đa số lượng mệnh đề logic (clauses), tăng tốc độ xử lý vượt trội cho Solver ngay cả với những bảng khó nhất.
t.
---

## 📈 Định hướng phát triển

*   Hoàn thiện **Tabs** cho bảng 4x4 và 16x16.
*   Tích hợp **Computer Vision (OCR)** để giải Sudoku qua camera.
*   Chế độ giải từng bước (**Step-by-step Visualization**).
---

**Author:** Nguyễn Hải Anh  
*Project được phát triển với tinh thần Vibe Coding & AI Collaboration.*


