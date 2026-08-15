import React from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { cn, timeAgo } from '../../utils';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const { getNotificationsByUser, markNotificationRead, markAllNotificationsRead, getUnreadCount } = useData();
  if (!user) return null;

  const notifications = getNotificationsByUser(user.uid);
  const unread = getUnreadCount(user.uid);

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-black text-gray-800">Notifications</h1>
          <p className="text-gray-400 text-sm">{unread} unread</p>
        </div>
        {unread > 0 && (
          <button
            onClick={() => markAllNotificationsRead(user.uid)}
            className="flex items-center gap-1.5 text-xs text-[#082b63] font-semibold hover:underline"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Bell size={36} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400">No notifications</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 card-shadow divide-y divide-gray-50">
          {notifications.map(n => (
            <div
              key={n.notificationId}
              onClick={() => markNotificationRead(n.notificationId)}
              className={cn('flex gap-3 px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors', !n.isRead && 'bg-blue-50/40')}
            >
              <div className={cn('w-2 h-2 rounded-full mt-2 flex-shrink-0', !n.isRead ? 'bg-blue-500' : 'bg-transparent')} />
              <div>
                <div className="text-sm font-semibold text-gray-800">{n.title}</div>
                <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</div>
                <div className="text-[10px] text-gray-300 mt-1">{timeAgo(n.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
