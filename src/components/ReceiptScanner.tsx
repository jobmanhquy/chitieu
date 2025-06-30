import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X, Scan, CheckCircle, AlertCircle } from 'lucide-react';
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
}

export const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ isOpen, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addExpense } = useExpenses();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      processReceipt(file);
    }
  };

  const processReceipt = async (file: File) => {
    setIsScanning(true);
    
    try {
      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock OCR result
      const mockResult: ScannedData = {
        amount: Math.floor(Math.random() * 500000) + 50000,
        description: 'Hóa đơn từ ' + ['Circle K', 'Vinmart', 'Lotte Mart', 'Big C'][Math.floor(Math.random() * 4)],
        category: defaultCategories[Math.floor(Math.random() * defaultCategories.length)].name,
        date: new Date(),
        merchant: ['Circle K', 'Vinmart', 'Lotte Mart', 'Big C'][Math.floor(Math.random() * 4)],
        confidence: 0.85 + Math.random() * 0.1
      };
      
      setScannedData(mockResult);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <Scan className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quét Hóa Đơn</h2>
              <p className="text-sm text-gray-500">AI sẽ tự động nhận diện thông tin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!selectedFile && !isScanning && !scannedData && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chọn hóa đơn</h3>
              <p className="text-gray-500 mb-4">Chụp ảnh hoặc tải lên hình ảnh hóa đơn</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>Tải lên hình ảnh</span>
                </button>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <Camera className="w-5 h-5" />
                  <span>Chụp ảnh</span>
                </button>
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

        {/* Scanning */}
        {isScanning && (
          <div className="text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full mx-auto mb-4"
            />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Đang quét hóa đơn...</h3>
            <p className="text-gray-500">AI đang phân tích và nhận diện thông tin</p>
          </div>
        )}

        {/* Results */}
        {scannedData && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Quét thành công!</span>
                <span className="text-sm text-green-600">
                  ({(scannedData.confidence * 100).toFixed(0)}% tin cậy)
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền</label>
                  <input
                    type="text"
                    value={scannedData.amount.toLocaleString('vi-VN')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    readOnly
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