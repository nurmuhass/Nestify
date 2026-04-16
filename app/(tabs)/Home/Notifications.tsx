import React from 'react';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter,useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { Notification, useNotifications } from '../../../hooks/useNotifications';


// ── Icon per notification type ────────────────────────────────────────────────
const typeConfig: Record<
  string,
  { icon: string; bg: string; color: string }
> = {
  review:    { icon: 'star',               bg: '#FFF9C4', color: '#F59E0B' },
  message:   { icon: 'chatbubble',         bg: '#E3F2FD', color: '#1976D2' },
  purchase:  { icon: 'bag-check',          bg: '#E8F5E9', color: '#2E7D32' },
  favorite:  { icon: 'heart',              bg: '#FCE4EC', color: '#E91E63' },
  approval:  { icon: 'checkmark-circle',   bg: '#E8F5E9', color: '#059669' },
  rejection: { icon: 'close-circle',       bg: '#FEECEC', color: '#DC2626' },
  system:    { icon: 'notifications',      bg: '#F3F4F6', color: '#6B7280' },
};




const formatTime = (dateString: string): string => {
  const now  = new Date();
  const then = new Date(dateString);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diff < 60)   return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return then.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

const isToday = (dateString: string): boolean => {
  const d = new Date(dateString);
  const n = new Date();
  return d.getDate() === n.getDate() &&
    d.getMonth()     === n.getMonth() &&
    d.getFullYear()  === n.getFullYear();
};

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    markRead,
    markAllRead,
    deleteOne,
    deleteAll,
    refresh,
    loadMore,
  } = useNotifications();

  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    Alert.alert('Delete notification', 'Remove this notification?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(id);
          await deleteOne(id);
          setDeleting(null);
        },
      },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert('Clear all', 'Remove all notifications?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear all', style: 'destructive', onPress: deleteAll },
    ]);
  };

useFocusEffect(
  useCallback(() => {
    return () => {
      
      if (unreadCount > 0) {
        markAllRead();
      }
    };
  }, [unreadCount])
);

  const handleTap = async (item: Notification) => {
    if (!item.is_read) await markRead(item.id);
    // Navigate to related content
    if (item.related_id) {
      if (item.type === 'review' || item.type === 'purchase' ||
          item.type === 'favorite' || item.type === 'approval' ||
          item.type === 'rejection') {
        // router.push({ pathname: './Home/Company/Details/[id]', params: { id: item.related_id } });
        //  router.push(`/Home/Company/Details?id=${item.id}`)
        
      } else if (item.type === 'message') {
        router.push('/Profile/Messages');
      }
    }
  };

  // Split into today / older
  const todayItems  = notifications.filter(n => isToday(n.created_at));
  const olderItems  = notifications.filter(n => !isToday(n.created_at));

  const renderItem = ({ item }: { item: Notification }) => {
    const cfg    = typeConfig[item.type] ?? typeConfig.system;
    const unread = !item.is_read;

    return (
      <TouchableOpacity
        style={[styles.item, unread && styles.itemUnread]}
        activeOpacity={0.8}
        onPress={() => handleTap(item)}
      >
        {/* Left: actor avatar or type icon */}
        <View style={styles.avatarWrap}>
          {item.actor_image ? (
            <Image source={{ uri: item.actor_image }} style={styles.avatar} />
          ) : (
            <View style={[styles.iconCircle, { backgroundColor: cfg.bg }]}>
              <Ionicons name={cfg.icon as any} size={20} color={cfg.color} />
            </View>
          )}
          {/* type badge overlay when avatar present */}
          {item.actor_image && (
            <View style={[styles.typeBadge, { backgroundColor: cfg.bg }]}>
              <Ionicons name={cfg.icon as any} size={10} color={cfg.color} />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.title, unread && styles.titleUnread]}>
            {item.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.time}>{formatTime(item.created_at)}</Text>
        </View>

        {/* Right: unread dot + delete */}
        <View style={styles.right}>
          {unread && <View style={styles.unreadDot} />}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {deleting === item.id
              ? <ActivityIndicator size="small" color="#ccc" />
              : <Ionicons name="trash-outline" size={16} color="#ccc" />
            }
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = (label: string) => (
    <Text style={styles.sectionLabel}>{label}</Text>
  );

  const renderList = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      );
    }

    if (notifications.length === 0) {
      return (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="notifications-outline" size={36} color="#ccc" />
          </View>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptySub}>
            You will see updates releated to your account here
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={[]}
        renderItem={null}
        keyExtractor={(_, i) => i.toString()}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={refresh}
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          hasMore ? <ActivityIndicator style={{ marginVertical: 16 }} color="#007bff" /> : null
        }
        ListHeaderComponent={
          <>
            {todayItems.length > 0 && (
              <>
                {renderSectionHeader('Today')}
                {todayItems.map(item => (
  <React.Fragment key={item.id}>
    {renderItem({ item })}
  </React.Fragment>
))}
              </>
            )}
            {olderItems.length > 0 && (
              <>
                {renderSectionHeader('Earlier')}
                {olderItems.map(item => (
  <React.Fragment key={item.id}>
    {renderItem({ item })}
  </React.Fragment>
))}
              </>
            )}
          </>
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSub}>{unreadCount} unread</Text>
          )}
        </View>

        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.headerBtn} onPress={markAllRead}>
              <MaterialIcons name="done-all" size={20} color="#007bff" />
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity style={styles.headerBtn} onPress={handleClearAll}>
              <Ionicons name="trash-outline" size={18} color="#dc3545" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {renderList()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
    paddingTop: getStatusBarHeight(),
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#111' },
  headerSub:   { fontSize: 12, color: '#007bff', marginTop: 1 },
  headerActions: { marginLeft: 'auto', flexDirection: 'row', gap: 6 },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section label
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Notification item
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 3,
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
  },
  itemUnread: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },

  // Avatar
  avatarWrap: { position: 'relative', marginRight: 12 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },

  // Content
  content: { flex: 1 },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 2,
  },
  titleUnread: {
    fontWeight: '700',
    color: '#111',
  },
  message: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 5,
  },
  time: { fontSize: 11, color: '#aaa' },

  // Right side
  right: {
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007bff',
  },
  deleteBtn: { padding: 2 },

  // Empty state
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 15, fontWeight: 'bold', color: '#111' },
  emptySub: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
