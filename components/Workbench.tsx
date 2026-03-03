import React, { useState } from 'react';
import {
  ShoppingBag,
  Store,
  Package,
  BookOpen,
  MoreHorizontal,
  Edit,
  ChevronRight,
  Star,
  // 销售类图标
  Tag,
  ClipboardList,
  AlertTriangle,
  FileText,
  Smartphone,
  CreditCard,
  Monitor,
  // 进销存类图标
  Truck,
  ArrowLeftRight,
  Utensils,
  Trash2,
  ClipboardCheck,
  Box,
  // 店务类图标
  Wrench,
  CreditCard as PaymentIcon,
  Wrench as ToolIcon,
  UserCheck,
  Headphones,
  // 培训&巡检类图标
  GraduationCap,
  FileCheck,
  BarChart3,
  ListChecks,
  Search,
  // 其他类图标
  Settings,
  HelpCircle
} from 'lucide-react';

interface WorkbenchProps {
  onModuleClick: (module: string, subAction?: string) => void;
}

interface WorkbenchModule {
  id: string;
  name: string;
  count?: number;
  icon: React.ReactNode;
  subModules?: {
    id: string;
    name: string;
    icon: React.ReactNode;
    iconBg: string;
    module: string;
    subAction?: string;
  }[];
}

const Workbench: React.FC<WorkbenchProps> = ({ onModuleClick }) => {
  const [favoriteItems, setFavoriteItems] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // 格式化名称，最多拆分为两行
  const formatName = (name: string) => {
    if (name.length <= 3) return name;
    
    const firstLine = name.slice(0, 3);
    const secondLine = name.slice(3);
    return `${firstLine}\n${secondLine}`;
  };

  const modules: WorkbenchModule[] = [
    {
      id: 'sales',
      name: '销售类',
      icon: <ShoppingBag size={20} className="text-blue-600" />,
      subModules: [
        {
          id: 'promotion',
          name: '临期促销',
          icon: <Tag size={18} className="text-white" />,
          iconBg: 'bg-gradient-to-br from-amber-400 to-amber-500',
          module: 'sales',
          subAction: 'promotion'
        },
        {
          id: 'order',
          name: '订单管理',
          icon: <ClipboardList size={18} className="text-white" />,
          iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
          module: 'sales',
          subAction: 'order'
        },
        {
          id: 'products',
          name: '商品上下架',
          icon: <ShoppingBag size={18} className="text-white" />,
          iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
          module: 'sales',
          subAction: 'products'
        },
        {
          id: 'abnormal',
          name: '异常流水',
          icon: <AlertTriangle size={18} className="text-white" />,
          iconBg: 'bg-gradient-to-br from-cyan-400 to-cyan-500',
          module: 'sales',
          subAction: 'abnormal'
        },
        {
          id: 'pos',
          name: 'POS登录',
          icon: <Monitor size={18} className="text-white" />,
          iconBg: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
          module: 'sales',
          subAction: 'pos'
        },
        {
          id: 'report',
          name: 'POS报表',
          icon: <FileText size={18} className="text-white" />,
          iconBg: 'bg-gradient-to-br from-blue-400 to-blue-500',
          module: 'sales',
          subAction: 'report'
        },
        {
          id: 'mobile',
          name: '移动收银',
          icon: <Smartphone size={18} className="text-white" />,
          iconBg: 'bg-gradient-to-br from-red-400 to-red-500',
          module: 'sales',
          subAction: 'mobile'
        },
        {
          id: 'coupon',
          name: '扫码核券',
          icon: <CreditCard size={18} className="text-white" />,
          iconBg: 'bg-gradient-to-br from-orange-400 to-orange-500',
          module: 'sales',
          subAction: 'coupon'
        }
      ]
    },
    {
      id: 'inventory',
      name: '店务类',
      icon: <Package size={20} className="text-purple-600" />,
      subModules: [
        {
          id: 'baoshoutou',
          name: '报收投',
          icon: <Truck size={18} className="text-white" />,
          iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
          module: 'inventory',
          subAction: 'baoshoutou'
        },
        {
          id: 'unpack',
          name: '门店拆包',
          icon: <Box size={18} className="text-white" />,
          iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
          module: 'inventory',
          subAction: 'unpack'
        },
        {
          id: 'transfer',
          name: '调拨',
          icon: <ArrowLeftRight size={18} className="text-white" />,
          iconBg: 'bg-gradient-to-br from-blue-400 to-blue-500',
          module: 'inventory',
          subAction: 'transfer'
        },
        {
          id: 'damage',
          name: '报损',
          icon: <Trash2 size={18} className="text-white" />,
          iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
          module: 'inventory',
          subAction: 'damage'
        },
        {
          id: 'tasting',
          name: '试吃',
          icon: <Utensils size={18} className="text-white" />,
          iconBg: 'bg-gradient-to-br from-orange-400 to-orange-500',
          module: 'inventory',
          subAction: 'tasting'
        },
        {
          id: 'stockCheck',
          name: '库存盘点',
          icon: <ClipboardCheck size={18} className="text-white" />,
          iconBg: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
          module: 'inventory',
          subAction: 'stockCheck'
        }
      ]
    },
    {
      id: 'store',
      name: '系统功能',
      icon: <Store size={20} className="text-green-600" />,
      subModules: [
        {
          id: 'pos',
          name: 'POS登录',
          icon: <Monitor size={18} className="text-white" />,
          iconBg: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
          module: 'sales',
          subAction: 'pos'
        },
        {
          id: 'itservice',
          name: 'IT服务',
          icon: <Headphones size={18} className="text-white" />,
          iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
          module: 'store',
          subAction: 'itservice'
        }
      ]
    },
    {
      id: 'other',
      name: '其他类',
      icon: <MoreHorizontal size={20} className="text-gray-600" />,
      subModules: [
        {
          id: 'other',
          name: '其他',
          icon: <HelpCircle size={18} className="text-white" />,
          iconBg: 'bg-gradient-to-br from-gray-500 to-gray-600',
          module: 'other',
          subAction: 'other'
        }
      ]
    }
  ];

  // 所有可添加到常用的子模块
  const allSubModules = modules.flatMap(module => 
    module.subModules?.filter(sub => sub.id !== 'edit') || []
  );

  // 常用模块列表
  const commonModules = [
    ...allSubModules.filter(sub => favoriteItems.includes(`${sub.module}-${sub.subAction || sub.id}`)),
    {
      id: 'edit',
      name: '操作编辑',
      icon: <Edit size={18} className="text-white" />,
      iconBg: 'bg-gradient-to-br from-blue-400 to-blue-500',
      module: 'common',
      subAction: 'edit'
    }
  ];

  // 切换收藏状态
  const toggleFavorite = (subModule: any) => {
    const itemId = `${subModule.module}-${subModule.subAction || subModule.id}`;
    setFavoriteItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // 完整的模块列表（包含常用）
  const allModules = [
    {
      id: 'common',
      name: '常用',
      icon: <Star size={20} className="text-yellow-500" />,
      subModules: commonModules
    },
    ...modules
  ];

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col">
      {/* 模块列表 */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {allModules.map((module) => (
          <div key={module.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* 模块标题 */}
            <div className="w-full px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {module.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-gray-800">{module.name}</h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {module.id === 'common' && (
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs text-gray-600 hover:text-red-600 transition-colors"
                  >
                    {isEditing ? '完成' : '编辑'}
                  </button>
                )}
              </div>
            </div>

            {/* 子模块 */}
            {module.subModules && (
              <div className="border-t border-gray-100 p-4">
                <div className="grid grid-cols-5 gap-4">
                  {module.subModules.map((subModule) => (
                    <div key={subModule.id} className="relative">
                      <button
                        onClick={() => {
                          if (subModule.subAction === 'edit') {
                            setIsEditing(!isEditing);
                          } else {
                            onModuleClick(subModule.module, subModule.subAction);
                          }
                        }}
                        className="flex flex-col items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className={`w-12 h-12 ${subModule.iconBg} rounded-2xl flex items-center justify-center text-white shadow-sm`}>
                          {subModule.icon}
                        </div>
                        <span className="text-[10px] text-gray-700 text-center leading-tight whitespace-pre-line">
                          {formatName(subModule.name)}
                        </span>
                      </button>
                      
                      {/* 编辑模式下的添加/移除按钮 */}
                      {isEditing && subModule.subAction !== 'edit' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(subModule);
                          }}
                          className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            module.id === 'common'
                              ? 'bg-red-500' // 移除按钮
                              : 'bg-green-500' // 添加按钮
                          }`}
                        >
                          {module.id === 'common' ? '−' : '+'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
};

export default Workbench;