// hooks/useChat.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

const BASE = 'https://insighthub.com.ng/NestifyAPI/chat.php';

export interface Message {
  id:                 number;
  conversation_id:    number;
  sender_id:          number;
  type:               'text' | 'image' | 'inspection_request';
  message:            string | null;
  image_path:         string | null;
  inspection_date:    string | null;
  inspection_time:    string | null;
  inspection_note:    string | null;
  inspection_status:  'pending' | 'confirmed' | 'declined';
  is_read:            number;
  sender_name:        string;
  sender_avatar:      string | null;
  created_at:         string;
}

export interface Conversation {
  id:               number;
  buyer_id:         number;
  seller_id:        number;
  property_id:      number;
  propertyName:     string;
  property_image:   string | null;
  buyer_name:       string;
  buyer_avatar:     string | null;
  seller_name:      string;
  seller_company:   string | null;
  seller_avatar:    string | null;
  last_message:     string | null;
  last_message_at:  string | null;
  unread_count:     number;
}

const getHeaders = async (multipart = false) => {
  const token = await AsyncStorage.getItem('authToken');
  const h: Record<string, string> = { Authorization: `Token ${token ?? ''}` };
  if (!multipart) h['Content-Type'] = 'application/json';
  return h;
};

// ── Initiate chat from details page ──────────────────────────────────────────
export async function initiateChat(
  sellerId:   number,
  propertyId: number,
  message:    string = ''
): Promise<{ success: boolean; conversationId?: number; msg?: string; notPremium?: boolean }> {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${BASE}?action=initiate`, {
      method:  'POST',
      headers,
      body:    JSON.stringify({ seller_id: sellerId, property_id: propertyId, message }),
    });
    const result = await res.json();
    if (result.status === 'success') {
      return { success: true, conversationId: result.conversation_id };
    }
    if (result.code === 'NOT_PREMIUM') {
      return { success: false, notPremium: true, msg: result.msg };
    }
    return { success: false, msg: result.msg };
  } catch (e: any) {
    return { success: false, msg: e.message };
  }
}

// ── Inbox hook ────────────────────────────────────────────────────────────────
export function useInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [totalUnread,   setTotalUnread]   = useState(0);
  const [loading,       setLoading]       = useState(true);

  const fetch_ = useCallback(async () => {
    try {
      const headers = await getHeaders();
      const res     = await fetch(`${BASE}?action=inbox`, { headers });
      const result  = await res.json();
      if (result.status === 'success') {
        setConversations(result.data);
        setTotalUnread(result.total_unread);
      }
    } catch (e) {
      console.error('[useInbox]', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, []);

  return { conversations, totalUnread, loading, refresh: fetch_ };
}

// ── Single chat hook ──────────────────────────────────────────────────────────
export function useMessages(conversationId: number, currentUserId: number) {
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [sending,   setSending]   = useState(false);
  const lastIdRef = useRef(0);
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initial load
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const headers = await getHeaders();
      const res     = await fetch(
        `${BASE}?action=messages&conversation_id=${conversationId}`,
        { headers }
      );
      const result = await res.json();
      if (result.status === 'success' && result.data.length > 0) {
        setMessages(result.data);
        lastIdRef.current = result.data[result.data.length - 1].id;
      }
    } catch (e) {
      console.error('[useMessages] load', e);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Poll for new messages every 4 seconds
  const startPolling = useCallback(() => {
    pollRef.current = setInterval(async () => {
      try {
        const headers = await getHeaders();
        const res     = await fetch(
          `${BASE}?action=poll&conversation_id=${conversationId}&after_id=${lastIdRef.current}`,
          { headers }
        );
        const result = await res.json();
        if (result.status === 'success' && result.data.length > 0) {
          setMessages(prev => [...prev, ...result.data]);
          lastIdRef.current = result.data[result.data.length - 1].id;
        }
      } catch {}
    }, 4000);
  }, [conversationId]);

  useEffect(() => {
    loadMessages().then(startPolling);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [conversationId]);

  const sendText = async (text: string): Promise<boolean> => {
    if (!text.trim()) return false;
    setSending(true);
    // Optimistic
    const temp: Message = {
      id: Date.now(), conversation_id: conversationId,
      sender_id: currentUserId, type: 'text',
      message: text, image_path: null,
      inspection_date: null, inspection_time: null,
      inspection_note: null, inspection_status: 'pending',
      is_read: 0, sender_name: 'You', sender_avatar: null,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, temp]);
    try {
      const headers = await getHeaders();
      const res = await fetch(`${BASE}?action=send_text`, {
        method: 'POST', headers,
        body: JSON.stringify({ conversation_id: conversationId, message: text }),
      });
      const result = await res.json();
      if (result.status === 'success') {
        // Replace temp with real message
        setMessages(prev => [...prev.filter(m => m.id !== temp.id), result.data]);
        lastIdRef.current = result.data.id;
        return true;
      }
      setMessages(prev => prev.filter(m => m.id !== temp.id));
      return false;
    } catch {
      setMessages(prev => prev.filter(m => m.id !== temp.id));
      return false;
    } finally {
      setSending(false);
    }
  };

  const sendImage = async (imageAsset: { uri: string; name: string; type: string }): Promise<boolean> => {
    setSending(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const form  = new FormData();
      form.append('conversation_id', String(conversationId));
      form.append('image', imageAsset as any);
      const res = await fetch(`${BASE}?action=send_image`, {
        method:  'POST',
        headers: { Authorization: `Token ${token ?? ''}` },
        body:    form,
      });
      const result = await res.json();
      if (result.status === 'success') {
        setMessages(prev => [...prev, result.data]);
        lastIdRef.current = result.data.id;
        return true;
      }
      return false;
    } catch { return false; }
    finally  { setSending(false); }
  };

  const sendInspection = async (date: string, time: string, note: string): Promise<boolean> => {
    setSending(true);
    try {
      const headers = await getHeaders();
      const res = await fetch(`${BASE}?action=inspection`, {
        method: 'POST', headers,
        body: JSON.stringify({ conversation_id: conversationId, date, time, note }),
      });
      const result = await res.json();
      if (result.status === 'success') {
        setMessages(prev => [...prev, result.data]);
        lastIdRef.current = result.data.id;
        return true;
      }
      return false;
    } catch { return false; }
    finally  { setSending(false); }
  };

  const respondInspection = async (messageId: number, status: 'confirmed' | 'declined'): Promise<boolean> => {
    try {
      const headers = await getHeaders();
      const res = await fetch(`${BASE}?action=inspection_status`, {
        method: 'POST', headers,
        body: JSON.stringify({ message_id: messageId, status }),
      });
      const result = await res.json();
      if (result.status === 'success') {
        setMessages(prev =>
          prev.map(m => m.id === messageId
            ? { ...m, inspection_status: status }
            : m
          )
        );
        return true;
      }
      return false;
    } catch { return false; }
  };

  return {
    messages, loading, sending,
    sendText, sendImage, sendInspection, respondInspection,
    refresh: loadMessages,
  };
}

// ── Unread badge count (for tab bar) ─────────────────────────────────────────
export function useUnreadChatCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const headers = await getHeaders();
        const res     = await fetch(`${BASE}?action=unread`, { headers });
        const result  = await res.json();
        if (result.status === 'success') setCount(result.count);
      } catch {}
    };
    fetch_();
    const interval = setInterval(fetch_, 30000);
    return () => clearInterval(interval);
  }, []);

  return count;
}