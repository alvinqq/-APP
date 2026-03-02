import React, { useState, useEffect } from 'react';
import { Bell, X, FileText, Clock, CheckCircle } from 'lucide-react';
import { Notification, ReportType } from '../types';

interface NotificationSystemProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (notificationId: string) => void;
  onClearAll: () => void;
}

export function NotificationSystem({
  notifications,
  onNotificationClick,
  onMarkAsRead,
  onClearAll
}: NotificationSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick(notification);
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'REPORT':
        return <FileText size={16} className="text-blue-600" />;
      case 'TASK':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'ALERT':
        return <Bell size={16} className="text-red-600" />;
      default:
        return <Bell size={16} className="text-gray-600" />;
    }
  };

  const getReportTypeLabel = (type?: ReportType) => {
    if (!type) return '';
    switch (type) {
      case ReportType.DAILY:
        return '日报';
      case ReportType.WEEKLY:
        return '周报';
      case ReportType.MONTHLY:
        return '月报';
      default:
        return '';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell size={20} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">通知中心</h3>
              {notifications.length > 0 && (
                <button
                  onClick={() => {
                    onClearAll();
                    setIsOpen(false);
                  }}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  清空全部
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">暂无通知</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-800 truncate">
                            {notification.title}
                          </span>
                          {!notification.isRead && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                          {notification.content}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                          <Clock size={10} />
                          <span>{notification.timestamp}</span>
                          {notification.data?.reportType && (
                            <>
                              <span className="mx-1">•</span>
                              <span>{getReportTypeLabel(notification.data.reportType)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full text-xs text-center text-gray-600 hover:text-gray-800"
                >
                  关闭通知
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}