# Chi Tiêu AI - Ứng dụng Quản lý Chi tiêu Thông minh

Ứng dụng quản lý chi tiêu cá nhân được tích hợp AI Gemini để phân tích thông minh và đưa ra khuyến nghị tài chính.

## 🚀 Tính năng chính

- **AI Gemini Integration**: Phân tích chi tiêu thông minh với AI
- **Dashboard trực quan**: Biểu đồ và thống kê chi tiết
- **Quản lý mục tiêu**: Thiết lập và theo dõi mục tiêu tài chính
- **Phân tích nâng cao**: Báo cáo xu hướng và dự đoán
- **Đồng bộ real-time**: Firebase Firestore
- **Authentication**: Đăng nhập với email/Google
- **Responsive design**: Tối ưu cho mọi thiết bị

## 🛠️ Công nghệ sử dụng

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Functions)
- **AI**: Google Gemini AI
- **Charts**: Recharts
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Form Handling**: React Hook Form

## 📋 Yêu cầu hệ thống

- Node.js 18+
- npm hoặc yarn
- Firebase project
- Gemini AI API key

## 🔧 Cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd expense-tracker
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình environment variables**

Tạo file `.env.local` trong thư mục root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Gemini AI Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key
```

4. **Khởi chạy ứng dụng**
```bash
npm run dev
```

## 🔐 Bảo mật

- Tất cả thông tin nhạy cảm được lưu trong environment variables
- Firebase Security Rules được cấu hình để bảo vệ dữ liệu người dùng
- Authentication được xử lý bởi Firebase Auth
- Dữ liệu được mã hóa trong quá trình truyền tải

## 📱 Tính năng

### Dashboard
- Tổng quan chi tiêu tháng
- Biểu đồ phân bổ theo danh mục
- Xu hướng chi tiêu 6 tháng
- AI insights và khuyến nghị

### Quản lý Chi tiêu
- Thêm/sửa/xóa giao dịch
- Phân loại theo danh mục
- Ghi chú và vị trí
- Voice input cho mô tả

### Phân tích AI
- Phân tích thói quen chi tiêu
- Dự đoán chi tiêu tháng tới
- Khuyến nghị tối ưu ngân sách
- Cảnh báo rủi ro tài chính

### Mục tiêu & Thành tích
- Thiết lập mục tiêu tài chính
- Theo dõi tiến độ
- Hệ thống thành tích
- Thử thách tiết kiệm

## 🚀 Deployment

### Netlify
```bash
npm run build
# Upload dist folder to Netlify
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📞 Liên hệ

- Email: support@chitieu-ai.com
- Website: https://chitieu-ai.com

---

**Chi Tiêu AI** - Quản lý tài chính thông minh với công nghệ AI tiên tiến 🚀