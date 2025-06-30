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

Sao chép file `.env.example` thành `.env.local`:

```bash
cp .env.example .env.local
```

Sau đó chỉnh sửa file `.env.local` với thông tin thực tế:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_actual_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Gemini AI Configuration
VITE_GEMINI_API_KEY=your_actual_gemini_api_key
```

4. **Thiết lập Firebase**

- Tạo project mới trên [Firebase Console](https://console.firebase.google.com/)
- Kích hoạt Authentication (Email/Password và Google)
- Tạo Firestore Database
- Sao chép configuration vào file `.env.local`

5. **Thiết lập Gemini AI**

- Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)
- Tạo API key mới
- Thêm vào file `.env.local`

6. **Khởi chạy ứng dụng**
```bash
npm run dev
```

## 🔐 Bảo mật

- **Environment Variables**: Tất cả API keys được lưu trong `.env.local` (không commit vào git)
- **Firebase Security Rules**: Bảo vệ dữ liệu người dùng
- **Authentication**: Xác thực qua Firebase Auth
- **Data Encryption**: Mã hóa dữ liệu trong quá trình truyền tải

### ⚠️ Lưu ý bảo mật quan trọng:

1. **KHÔNG BAO GIỜ** commit file `.env.local` vào git
2. **KHÔNG** chia sẻ API keys công khai
3. Sử dụng Firebase Security Rules để bảo vệ Firestore
4. Thường xuyên rotate API keys
5. Kiểm tra logs để phát hiện truy cập bất thường

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
# Đặt environment variables trong Netlify dashboard
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### Environment Variables cho Production

Khi deploy, đảm bảo thiết lập các environment variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_GEMINI_API_KEY`

## 🔒 Firebase Security Rules

Đảm bảo cấu hình Firestore Security Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
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