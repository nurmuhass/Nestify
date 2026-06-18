// hooks/useNotifications.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const BASE = 'https://insighthub.com.ng/NestifyAPI/get_notifications.php';

export interface Notification {
  id: number;
  type: 'review' | 'message' | 'purchase' | 'favorite' | 'approval' | 'rejection' | 'system';
  title: string;
  message: string;
  related_id: number | null;
  actor_id: number | null;
  actor_name: string | null;
  actor_image: string | null;
  is_read: number;   // 0 | 1
  created_at: string;
}

const getHeaders = async () => {
  const token = await AsyncStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Token ${token ?? ''}`,
  };
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(true);
  const [page, setPage]                   = useState(1);
  const [hasMore, setHasMore]             = useState(true);

  const fetchNotifications = useCallback(async (reset = false) => {
    try {
      if (reset) setLoading(true);
      const currentPage = reset ? 1 : page;
      const headers = await getHeaders();
      const res = await fetch(`${BASE}?action=all&page=${currentPage}`, { headers });
      const result = await res.json();

      if (result.status === 'success') {
        setNotifications(prev =>
          reset ? result.data : [...prev, ...result.data]
        );
        setUnreadCount(result.unread);
        setHasMore(currentPage < result.total_pages);
        if (!reset) setPage(p => p + 1);
        else setPage(2);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchNotifications(true);
  }, []);

  const markRead = async (id: number) => {
    // Optimistic
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
    );
    setUnreadCount(c => Math.max(0, c - 1));
    const headers = await getHeaders();
    await fetch(`${BASE}?action=mark_read`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ id }),
    });
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    setUnreadCount(0);
    const headers = await getHeaders();
    await fetch(`${BASE}?action=mark_all`, { method: 'POST', headers });
  };

  const deleteOne = async (id: number) => {
    const deleted = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (deleted && !deleted.is_read) setUnreadCount(c => Math.max(0, c - 1));
    const headers = await getHeaders();
    await fetch(`${BASE}?action=delete`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ id }),
    });
  };

  const deleteAll = async () => {
    setNotifications([]);
    setUnreadCount(0);
    const headers = await getHeaders();
    await fetch(`${BASE}?action=delete_all`, { method: 'POST', headers });
  };

  const refresh = () => fetchNotifications(true);

  return {
    notifications,
    unreadCount,
    loading,
    hasMore,
    markRead,
    markAllRead,
    deleteOne,
    deleteAll,
    refresh,
    loadMore: () => fetchNotifications(false),
  };
}

// Lightweight hook — just the unread count badge (for tab bar)
export function useUnreadCount() {
  const [count, setCount] = useState(0);

  const fetch_ = async () => {
    try {
      const headers = await getHeaders();
      const res = await fetch(`${BASE}?action=count`, { headers });
      const result = await res.json();
      if (result.status === 'success') setCount(result.count);
    } catch {}
  };

  useEffect(() => {
    fetch_();
    const interval = setInterval(fetch_, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  return count;
}