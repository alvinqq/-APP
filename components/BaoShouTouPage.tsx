import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  ChevronRight,
  Package,
  Truck,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface OrderRecord {
  id: string;
  orderNo: string;
  createTime: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  totalAmount: number;
  itemCount: number;
}

interface ReceiveRecord {
  id: string;
  receiveNo: string;
  orderNo: string;
  receiveTime: string;
  status: 'pending' | 'received' | 'exception';
  itemCount: number;
}

interface ComplaintRecord {
  id: string;
  complaintNo: string;
  type: 'quality' | 'quantity' | 'delivery' | 'other';
  createTime: string;
  status: 'pending' | 'processing' | 'resolved';
  description: string;
}

interface BaoShouTouPageProps {
  onBack: () => void;
}

const BaoShouTouPage: React.FC<BaoShouTouPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'order' | 'receive' | 'complaint'>('order');
  const [searchTerm, setSearchTerm] = useState('');

  // 模拟报货单数据
  const orderRecords: OrderRecord[] = [
    {
      id: '1',
      orderNo: 'ORD20260301001',
      createTime: '2026-03-01 10:30',
      status: 'completed',
      totalAmount: 2580.5,
      itemCount: 15
    },
    {
      id: '2',
      orderNo: 'ORD20260301002',
      createTime: '2026-03-01 14:20',
      status: 'processing',
      totalAmount: 1568.8,
      itemCount: 8
    },
    {
      id: '3',
      orderNo: 'ORD20260228001',
      createTime: '2026-02-28 09:15',
      status: 'pending',
      totalAmount: 3200.0,
      itemCount: 22
    }
  ];

  // 模拟收货单数据
  const receiveRecords: ReceiveRecord[] = [
    {
      id: '1',
      receiveNo: 'REC20260301001',
      orderNo: 'ORD20260301001',
      receiveTime: '2026-03-01 16:45',
      status: 'received',
      itemCount: 15
    },
    {
      id: '2',
      receiveNo: 'REC20260228001',
      orderNo: 'ORD20260228001',
      receiveTime: '2026-02-28 11:30',
      status: 'exception',
      itemCount: 20
    }
  ];

  // 模拟投诉单数据
  const complaintRecords: ComplaintRecord[] = [
    {
      id: '1',
      complaintNo: 'COM20260301001',
      type: 'quality',
      createTime: '2026-03-01 15:20',
      status: 'processing',
      description: '鸭脖保质期不足3天'
    },
    {
      id: '2',
      complaintNo: 'COM20260228001',
      type: 'quantity',
      createTime: '2026-02-28 10:10',
      status: 'resolved',
      description: '实际收货数量与订单不符'
    }
  ];

  const getStatusBadge = (status: string, type: 'order' | 'receive' | 'complaint') => {
    if (type === 'order') {
      switch (status) {
        case 'completed':
          return <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">已完成</span>;
        case 'processing':
          return <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">处理中</span>;
        case 'pending':
          return <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">待处理</span>;
        case 'cancelled':
          return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">已取消</span>;
        default:
          return null;
      }
    } else if (type === 'receive') {
      switch (status) {
        case 'received':
          return <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">已收货</span>;
        case 'pending':
          return <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">待收货</span>;
        case 'exception':
          return <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">异常</span>;
        default:
          return null;
      }
    } else {
      switch (status) {
        case 'resolved':
          return <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">已解决</span>;
        case 'processing':
          return <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">处理中</span>;
        case 'pending':
          return <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">待处理</span>;
        default:
          return null;
      }
    }
  };

  const getComplaintTypeLabel = (type: string) => {
    switch (type) {
      case 'quality':
        return '质量问题';
      case 'quantity':
        return '数量问题';
      case 'delivery':
        return '配送问题';
      case 'other':
        return '其他';
      default:
        return type;
    }
  };

  return (
    <div className="w-full max-w-[430px] mx-auto bg-[#F8FAFC] min-h-screen flex flex-col">
      {/* 头部 */}
      <header className="bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-base font-bold text-gray-800">报收投管理</h1>
        </div>
        <button className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-full font-medium hover:bg-red-700 transition-colors flex items-center gap-1">
          <Plus size={14} />
          新增报货
        </button>
      </header>

      {/* 搜索栏 */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索单号"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 页签 */}
      <div className="bg-white border-b border-gray-100 px-4">
        <div className="flex">
          <button
            onClick={() => setActiveTab('order')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'order'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            报货
          </button>
          <button
            onClick={() => setActiveTab('receive')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'receive'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            收货
          </button>
          <button
            onClick={() => setActiveTab('complaint')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'complaint'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            投诉
          </button>
        </div>
      </div>

      {/* 内容区 */}
      <main className="flex-1 overflow-y-auto p-4">
        {/* 报货单记录 */}
        {activeTab === 'order' && (
          <div className="space-y-3">
            {orderRecords.map((record) => (
              <div key={record.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-blue-600" />
                    <span className="text-sm font-bold text-gray-800">{record.orderNo}</span>
                  </div>
                  {getStatusBadge(record.status, 'order')}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{record.createTime}</span>
                  </div>
                  <span>{record.itemCount} 项商品</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-red-600">¥{record.totalAmount.toFixed(2)}</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 收货单记录 */}
        {activeTab === 'receive' && (
          <div className="space-y-3">
            {receiveRecords.map((record) => (
              <div key={record.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-green-600" />
                    <span className="text-sm font-bold text-gray-800">{record.receiveNo}</span>
                  </div>
                  {getStatusBadge(record.status, 'receive')}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{record.receiveTime}</span>
                  </div>
                  <span>{record.itemCount} 项商品</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">关联订单: {record.orderNo}</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 投诉单记录 */}
        {activeTab === 'complaint' && (
          <div className="space-y-3">
            {complaintRecords.map((record) => (
              <div key={record.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-orange-600" />
                    <span className="text-sm font-bold text-gray-800">{record.complaintNo}</span>
                  </div>
                  {getStatusBadge(record.status, 'complaint')}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{record.createTime}</span>
                  </div>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {getComplaintTypeLabel(record.type)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{record.description}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BaoShouTouPage;