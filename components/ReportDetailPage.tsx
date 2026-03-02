import React from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, DollarSign, Users, ShoppingCart, Target, Calendar } from 'lucide-react';
import { ReportData, ReportType } from '../types';

interface ReportDetailPageProps {
  report: ReportData;
  onBack: () => void;
}

export default function ReportDetailPage({ report, onBack }: ReportDetailPageProps) {
  const getReportTypeLabel = (type: ReportType) => {
    switch (type) {
      case ReportType.DAILY:
        return '日报';
      case ReportType.WEEKLY:
        return '周报';
      case ReportType.MONTHLY:
        return '月报';
      default:
        return '报表';
    }
  };

  const formatCurrency = (value: number) => {
    return `¥${value.toLocaleString()}`;
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-3 py-2.5 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors active:scale-95">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="font-bold text-gray-800 text-sm flex-1">{getReportTypeLabel(report.reportType)}详情</h1>
        <div className="flex items-center gap-1 text-[11px] text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          <Calendar size={12} />
          <span>{report.reportDate}</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 pb-24 no-scrollbar smooth-scroll" style={{ maxHeight: 'calc(100vh - 4rem - 4rem)', minHeight: 'calc(100vh - 4rem - 4rem)' }}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-xs">汇总指标</h2>
          </div>
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <DollarSign size={14} className="text-red-600" />
                  <span className="text-[11px] text-gray-600">总营收</span>
                </div>
                <div className="text-base font-bold text-gray-800">{formatCurrency(report.totalRevenue)}</div>
                <div className={`text-[11px] flex items-center gap-0.5 mt-0.5 ${
                  report.revenueTrend >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {report.revenueTrend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {formatPercent(report.revenueTrend)}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ShoppingCart size={14} className="text-blue-600" />
                  <span className="text-[11px] text-gray-600">订单数</span>
                </div>
                <div className="text-base font-bold text-gray-800">{report.totalOrderCount}</div>
                <div className={`text-[11px] flex items-center gap-0.5 mt-0.5 ${
                  report.orderTrend >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {report.orderTrend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {formatPercent(report.orderTrend)}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Users size={14} className="text-purple-600" />
                  <span className="text-[11px] text-gray-600">客流量</span>
                </div>
                <div className="text-base font-bold text-gray-800">{report.totalCustomerCount}</div>
                <div className={`text-[11px] flex items-center gap-0.5 mt-0.5 ${
                  report.customerTrend >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {report.customerTrend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {formatPercent(report.customerTrend)}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Target size={14} className="text-green-600" />
                  <span className="text-[11px] text-gray-600">毛利率</span>
                </div>
                <div className="text-base font-bold text-gray-800">{report.grossMarginRate.toFixed(1)}%</div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  毛利额: {formatCurrency(report.grossMargin)}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-2.5">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] text-gray-600">客单价</span>
                <span className="text-xs font-bold text-gray-800">{formatCurrency(report.avgOrderValue)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 h-1.5 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-xs">门店详情</h2>
          </div>
          <div className="p-3 space-y-2.5">
            {report.storeMetrics.map((store) => (
              <div key={store.storeId} className="border border-gray-100 rounded-lg p-2.5 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-xs text-gray-800">{store.storeName}</h3>
                  {store.alerts.length > 0 && (
                    <div className="flex items-center gap-1 text-amber-600">
                      <AlertTriangle size={12} />
                      <span className="text-[11px]">{store.alerts.length}个异常</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-4 gap-1.5">
                  <div>
                    <div className="text-[10px] text-gray-500">营收</div>
                    <div className="text-[11px] font-semibold text-gray-800">{formatCurrency(store.revenue)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500">订单</div>
                    <div className="text-[11px] font-semibold text-gray-800">{store.orderCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500">客流</div>
                    <div className="text-[11px] font-semibold text-gray-800">{store.customerCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500">毛利率</div>
                    <div className="text-[11px] font-semibold text-gray-800">{store.grossMarginRate.toFixed(1)}%</div>
                  </div>
                </div>

                {store.alerts.length > 0 && (
                  <div className="bg-amber-50 rounded-md p-2">
                    {store.alerts.map((alert, idx) => (
                      <div key={idx} className="text-[11px] text-amber-700 flex items-start gap-1">
                        <AlertTriangle size={10} className="mt-0.5 flex-shrink-0" />
                        <span>{alert}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-xs">关键洞察</h2>
          </div>
          <div className="p-3">
            <div className="space-y-2">
              {report.keyInsights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-gray-700">{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-xs">改进建议</h2>
          </div>
          <div className="p-3">
            <div className="space-y-2">
              {report.recommendations.map((recommendation, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-gray-700">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-xs">总结</h2>
          </div>
          <div className="p-3">
            <p className="text-xs text-gray-700 leading-relaxed">{report.summary}</p>
          </div>
        </div>
      </main>
    </div>
  );
}