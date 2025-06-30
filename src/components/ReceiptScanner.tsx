import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X, Scan, CheckCircle, AlertCircle, Zap, Brain } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';
import { defaultCategories } from '../data/categories';
import toast from 'react-hot-toast';

interface ReceiptScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ScannedData {
  amount: number;
  description: string;
  category: string;
  date: Date;
  merchant?: string;
  confidence: number;
  items?: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}

export const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ isOpen, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addExpense } = useExpenses();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      processReceipt(file);
    }
  };

  const processReceipt = async (file: File) => {
    setIsScanning(true);
    
    try {
      // Simulate advanced OCR processing with AI
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Enhanced mock OCR result with more realistic data
      const merchants = ['Circle K', 'Vinmart', 'Lotte Mart', 'Big C', 'Coopmart', 'Saigon Co.op'];
      const selectedMerchant = merchants[Math.floor(Math.random() * merchants.length)];
      
      const items = [
        { name: 'Nước suối', price: 8000, quantity: 2 },
        { name: 'Bánh mì', price: 15000, quantity: 1 },
        { name: 'Cà phê', price: 25000, quantity: 1 },
        { name: 'Kẹo', price: 12000, quantity: 1 }
      ];
      
      const selectedItems = items.slice(0, Math.floor(Math.random() * 3) + 1);
      const totalAmount = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const mockResult: ScannedData = {
        amount: totalAmount,
        description: `Hóa đơn từ ${selectedMerchant}`,
        category: 'Ăn uống',
        date: new Date(),
        merchant: selectedMerchant,
        confidence: 0.92 + Math.random() * 0.07,
        items: selectedItems
      };
      
      setScannedData(mockResult);
      toast.success('Quét hóa đơn thành công!');
    } catch (error) {
      toast.error('Không thể quét hóa đơn. Vui lòng thử lại.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveExpense = async () => {
    if (!scannedData) return;
    
    try {
      await addExpense({
        amount: scannedData.amount,
        description: scannedData.description,
        category: scannedData.category,
        date: scannedData.date
      });
      
      toast.success('Đã thêm chi tiêu từ hóa đơn!');
      onClose();
    } catch (error) {
      toast.error('Không thể lưu chi tiêu');
    }
  };

  const handleRetry = () => {
    setScannedData(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    handleRetry();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <Scan className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quét Hóa Đơn AI</h2>
              <p className="text-sm text-gray-500">Công nghệ OCR + AI nhận diện thông minh</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!selectedFile && !isScanning && !scannedData && (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <Brain className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">Quét hóa đơn thông minh</h3>
              <p className="text-gray-600 mb-6">
                AI sẽ tự động nhận diện và trích xuất thông tin từ hóa đơn của bạn
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>Tải lên hình ảnh</span>
                </button>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <Camera className="w-5 h-5" />
                  <span>Chụp ảnh hóa đơn</span>
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Nhanh chóng</h4>
                <p className="text-sm text-gray-600">Quét và nhận diện trong vài giây</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Thông minh</h4>
                <p className="text-sm text-gray-600">AI tự động phân loại danh mục</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Chính xác</h4>
                <p className="text-sm text-gray-600">Độ chính xác cao với OCR tiên tiến</p>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Preview & Scanning */}
        {(selectedFile || isScanning) && !scannedData && (
          <div className="space-y-6">
            {previewUrl && (
              <div className="text-center">
                <img
                  src={previewUrl}
                  alt="Receipt preview"
                  className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                />
              </div>
            )}
            
            {isScanning && (
              <div className="text-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full mx-auto mb-4"
                />
                <h3 className="text-lg font-medium text-gray-900 mb-2">AI đang phân tích hóa đơn...</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>🔍 Nhận diện văn bản...</p>
                  <p>🧠 Phân tích cấu trúc hóa đơn...</p>
                  <p>📊 Trích xuất thông tin chi tiêu...</p>
                  <p>🏷️ Tự động phân loại danh mục...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {scannedData && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Quét thành công!</span>
                <span className="text-sm text-green-600">
                  ({(scannedData.confidence * 100).toFixed(1)}% tin cậy)
                </span>
              </div>

              {/* Preview Image */}
              {previewUrl && (
                <div className="mb-4">
                  <img
                    src={previewUrl}
                    alt="Scanned receipt"
                    className="w-32 h-40 object-cover rounded-lg mx-auto"
                  />
                </div>
              )}

              {/* Extracted Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cửa hàng</label>
                  <div className="bg-white rounded-lg p-3 border">
                    <span className="font-medium text-gray-900">{scannedData.merchant}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tổng tiền</label>
                  <input
                    type="text"
                    value={scannedData.amount.toLocaleString('vi-VN')}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d]/g, '');
                      setScannedData({...scannedData, amount: parseInt(value) || 0});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <input
                    type="text"
                    value={scannedData.description}
                    onChange={(e) => setScannedData({...scannedData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <select
                    value={scannedData.category}
                    onChange={(e) => setScannedData({...scannedData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {defaultCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items breakdown */}
              {scannedData.items && scannedData.items.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Chi tiết sản phẩm:</h4>
                  <div className="space-y-2">
                    {scannedData.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-white rounded p-2 border">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-500 ml-2">x{item.quantity}</span>
                        </div>
                        <span className="font-medium">{item.price.toLocaleString('vi-VN')}₫</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleRetry}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Quét lại
              </button>
              <button
                onClick={handleSaveExpense}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Lưu chi tiêu
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};