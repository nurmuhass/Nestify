import React from 'react';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { Notification, useNotifications } from '../../../hooks/useNotifications';
import { useToast } from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';

const COLORS = {
  bg: '#091530',
  card: '#0f2044',
  gold: '#c9a84c',
  goldLight: '#f0d98a',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  border: 'rgba(255,255,255,0.06)',
  danger: '#ef4444'
};

// ── Icon per notification type ────────────────────────────────────────────────
const typeConfig: Record<
  string,
  { icon: string; bg: string; color: string }
> = {
  review: { icon: 'star', bg: 'rgba(201, 168, 76, 0.15)', color: COLORS.gold },
  message: { icon: 'chatbubble', bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
  purchase: { icon: 'bag-check', bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' },
  favorite: { icon: 'heart', bg: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' },
  approval: { icon: 'checkmark-circle', bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
  rejection: { icon: 'close-circle', bg: 'rgba(239, 68, 68, 0.15)', color: COLORS.danger },
  system: { icon: 'notifications', bg: COLORS.border, color: COLORS.textSecondary },
};




const formatTime = (dateString: string): string => {
  const now = new Date();
  const then = new Date(dateString);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return then.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

const isToday = (dateString: string): boolean => {
  const d = new Date(dateString);
  const n = new Date();
  return d.getDate() === n.getDate() &&
    d.getMonth() === n.getMonth() &&
    d.getFullYear() === n.getFullYear();

};



export default function NotificationsScreen() {
  const { show } = useToast();

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

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<'one' | 'all' | null>(null);

  const handleDelete = (id: number) => {
    setSelectedId(id);
    setActionType('one');
    setConfirmVisible(true);
  };

  const handleClearAll = () => {
    setActionType('all');
    setConfirmVisible(true);
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


  const handleConfirm = async () => {
    try {
      if (actionType === 'one' && selectedId) {
        setDeleting(selectedId);
        await deleteOne(selectedId);

        show({
          type: 'success',
          title: 'Deleted',
          message: 'Notification removed',
        });

        setDeleting(null);
      }

      if (actionType === 'all') {
        await deleteAll();

        show({
          type: 'success',
          title: 'Cleared',
          message: 'All notifications removed',
        });
      }
    } catch (e) {
      show({
        type: 'error',
        title: 'Error',
        message: 'Something went wrong',
      });
    } finally {
      setConfirmVisible(false);
      setSelectedId(null);
      setActionType(null);
    }
  };

  const handleTap = async (item: Notification) => {
    if (!item.is_read) await markRead(item.id);
    // Navigate to related content
    if (item.related_id) {
      if (item.type === 'review' || item.type === 'purchase' ||
        item.type === 'favorite' || item.type === 'approval' ||
        item.type === 'rejection') {
        router.push({ pathname: '/Home/Properties/Details', params: { id: item.related_id } });
        //  router.push(`/Home/Company/Details?id=${item.id}`)

      } else if (item.type === 'message') {
        router.push('/Profile/Messages');
      }
    }
  };

  // Split into today / older
  const todayItems = notifications.filter(n => isToday(n.created_at));
  const olderItems = notifications.filter(n => !isToday(n.created_at));

  const renderItem = ({ item }: { item: Notification }) => {
    const cfg = typeConfig[item.type] ?? typeConfig.system;
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
              ? <ActivityIndicator size="small" color={COLORS.gold} />
              : <Ionicons name="trash-outline" size={16} color={COLORS.textSecondary} />
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
        <View style={[styles.center]}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      );
    }

    if (notifications.length === 0) {
      return (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="notifications-outline" size={36} color={COLORS.gold} />
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
          hasMore ? <ActivityIndicator style={{ marginVertical: 16 }} color={COLORS.gold} /> : null
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
          <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
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
              <MaterialIcons name="done-all" size={20} color={COLORS.gold} />
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity style={styles.headerBtn} onPress={handleClearAll}>
              <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <ConfirmModal
        visible={confirmVisible}
        title={actionType === 'all' ? 'Clear all notifications' : 'Delete notification'}
        message={
          actionType === 'all'
            ? 'This will remove all notifications permanently.'
            : 'This notification will be removed permanently.'
        }
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleConfirm}
        loading={deleting !== null}
      />


      {renderList()}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: getStatusBarHeight(),
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.textPrimary },
  headerSub: { fontSize: 12, color: COLORS.gold, marginTop: 1 },
  headerActions: { marginLeft: 'auto', flexDirection: 'row', gap: 6 },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section label
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.card,
    marginHorizontal: 12,
    marginVertical: 3,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemUnread: {
    backgroundColor: 'rgba(201, 168, 76, 0.08)',
    borderColor: COLORS.gold,
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
    borderColor: COLORS.card,
  },

  // Content
  content: { flex: 1 },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  titleUnread: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  message: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 5,
  },
  time: { fontSize: 11, color: COLORS.textSecondary, opacity: 0.7 },

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
    backgroundColor: COLORS.gold,
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
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.textPrimary },
  emptySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
