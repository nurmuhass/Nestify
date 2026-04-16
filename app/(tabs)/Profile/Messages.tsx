
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
import { Conversation, useInbox } from '@/hooks/useChat';
import PricingModal from '@/components/PricingModal';

const formatTime = (d: string | null) => {
  if (!d) return '';
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60)     return 'Now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

export default function MessagesScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<number>(0);
  const { conversations, totalUnread, loading, refresh } = useInbox();
  const [isPremium, setIsPremium] = useState(false);
    const [pricingVisible, setPricingVisible] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
  AsyncStorage.getItem('authUser').then(j => {
    if (j) {
      const user = JSON.parse(j);
      setUserId(user.id);
      setIsPremium(user.planType === 'premium');

      // Always fetch raw unread count — no premium gate
      if (user.planType !== 'premium') {
        fetchPendingCount();
      }
    }
  });
}, []);

const fetchPendingCount = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const res = await fetch(
      'https://insighthub.com.ng/NestifyAPI/chat_unread.php',
      { headers: { Authorization: `Token ${token ?? ''}` } }
    );
    const result = await res.json();
    if (result.status === 'success') setPendingCount(result.count);
  } catch {}
};

  useFocusEffect(useCallback(() => { refresh(); }, []));

  const getOtherParty = (conv: Conversation) => {
    const isBuyer = conv.buyer_id === userId;
    return {
      name:   isBuyer ? (conv.seller_company || conv.seller_name) : conv.buyer_name,
      avatar: isBuyer ? conv.seller_avatar : conv.buyer_avatar,
      role:   isBuyer ? 'Seller' : 'Buyer',
    };
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    const other   = getOtherParty(item);
    const hasUnread = item.unread_count > 0;

    return (
      <TouchableOpacity
        style={[styles.convItem, hasUnread && styles.convItemUnread]}
        activeOpacity={0.8}
        onPress={() =>
          router.push({
            pathname: '../Home/ChatRoom',
            params: { conversation_id: item.id, property_name: item.propertyName,property_id:item.property_id, },
            
          })

        }
      >
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          {other.avatar ? (
            <Image source={{ uri: other.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>
                {(other.name ?? '?')[0].toUpperCase()}
              </Text>
            </View>
          )}
          {/* Online indicator placeholder */}
          <View style={styles.onlineDot} />
        </View>

        {/* Content */}
        <View style={styles.convContent}>
          <View style={styles.convTop}>
            <Text style={[styles.convName, hasUnread && styles.convNameBold]} numberOfLines={1}>
              {other.name}
            </Text>
            <Text style={styles.convTime}>{formatTime(item.last_message_at)}</Text>
          </View>

          <Text style={styles.convProperty} numberOfLines={1}>
            🏠 {item.propertyName}
          </Text>

          <View style={styles.convBottom}>
            <Text
              style={[styles.lastMessage, hasUnread && styles.lastMessageBold]}
              numberOfLines={1}
            >
              {item.last_message ?? 'Start a conversation'}
            </Text>
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {item.unread_count > 99 ? '99+' : item.unread_count}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}      onPress={() =>
          router.push({
            pathname: "../Profile",
          })
        }>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Messages</Text>
          {totalUnread > 0 && (
            <Text style={styles.headerSub}>{totalUnread} unread</Text>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={refresh}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
    ListEmptyComponent={
  <View style={styles.empty}>
    <View style={styles.emptyIcon}>
      <Ionicons
        name={!isPremium && totalUnread > 0 ? 'lock-closed-outline' : 'chatbubbles-outline'}
        size={44}
        color="#ccc"
      />
    </View>

    {!isPremium && pendingCount > 0 ? (
      // Freemium user with pending messages
      <>
        <Text style={styles.emptyTitle}>You have a message waiting</Text>
        <Text style={styles.emptySub}>
          A potential client has reached out. Upgrade to Premium to read and
          reply to messages.
        </Text>
        <TouchableOpacity
          style={styles.upgradeBtn}
          onPress={() => setPricingVisible(true)}
        > 
          <Text style={styles.upgradeBtnText}>⭐ Upgrade to Premium</Text>
        </TouchableOpacity>
      </>
    ) : !isPremium ? (
      // Freemium user, no messages yet
      <>
        <Text style={styles.emptyTitle}>Messaging is a Premium feature</Text>
        <Text style={styles.emptySub}>
          Upgrade to Premium to chat with sellers and receive messages from
          potential buyers.
        </Text>
        <TouchableOpacity
          style={styles.upgradeBtn}
          onPress={() => setPricingVisible(true)}
        >
          <Text style={styles.upgradeBtnText}>⭐ Upgrade to Premium</Text>
        </TouchableOpacity>
      </>
    ) : (
      // Premium user, no messages yet
      <>
        <Text style={styles.emptyTitle}>No conversations yet</Text>
        <Text style={styles.emptySub}>
          Tap Chat With Seller on any property to start a conversation
        </Text>
      </>
    )}
  </View>
}
        />
      )}
        <PricingModal
              visible={pricingVisible}
              onSelectPlan={(planKey) => {
                setPricingVisible(false);
                // navigate to your payment/upgrade flow, passing planKey
                // router.push(`./upgrade?plan=${planKey}`);
                switch (planKey) {
                  case "freemium":
                    setPricingVisible(false);
                    break;
                  case "single":
                    router.push("/upgrade/single");
                    break;
                  case "monthly":
                    router.push("/upgrade/monthly");
                    break;
                  case "semi":
                    router.push("/upgrade/semiannual");
                    break;
                  case "annual":
                    router.push("/upgrade/annual");
                    break;
                  default:
                    router.push("/upgrade");
                }
              }}
              onClose={() => setPricingVisible(false)}
            />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: getStatusBarHeight(),
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderColor: '#e5e7eb',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#111' },
  headerSub:   { fontSize: 12, color: '#007bff', marginTop: 1 },

  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  convItemUnread: { backgroundColor: '#F0F7FF' },
  separator: { height: 0.5, backgroundColor: '#f3f4f6', marginLeft: 80 },

  avatarWrap: { position: 'relative' },
  avatar:     { width: 52, height: 52, borderRadius: 26 },
  avatarFallback: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#B5D4F4',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { fontSize: 20, fontWeight: '700', color: '#0C447C' },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2, borderColor: '#fff',
  },

  convContent: { flex: 1 },
  convTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  convName:      { fontSize: 15, fontWeight: '500', color: '#111', flex: 1 },
  convNameBold:  { fontWeight: '700' },
  convTime:      { fontSize: 11, color: '#aaa' },
  convProperty:  { fontSize: 11, color: '#007bff', marginBottom: 3 },
  convBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage:     { fontSize: 13, color: '#888', flex: 1 },
  lastMessageBold: { color: '#333', fontWeight: '600' },
  unreadBadge: {
    minWidth: 20, height: 20, borderRadius: 10,
    backgroundColor: '#007bff',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 5, marginLeft: 8,
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '700' },
upgradeBtn: {
  marginTop: 8,
  backgroundColor: '#007bff',
  paddingHorizontal: 24,
  paddingVertical: 12,
  borderRadius: 24,
},
upgradeBtnText: {
  color: '#fff',
  fontWeight: '700',
  fontSize: 14,
},
  empty: {
    alignItems: 'center', paddingTop: 80, gap: 12, paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#f3f4f6',
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontSize: 15, fontWeight: 'bold', color: '#111' },
  emptySub:   { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },
});
