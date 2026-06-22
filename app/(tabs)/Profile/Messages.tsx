
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useToast } from '@/components/Toast';
import { colorWithAlpha } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const formatTime = (d: string | null) => {
  if (!d) return '';
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return 'Now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

const COLORS = {
  bg: '#091530',          // main background
  card: '#0f2044',        // cards / list items
  gold: '#c9a84c',        // primary accent
  goldLight: '#f0d98a',   // highlight
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  border: 'rgba(255,255,255,0.06)',
  danger: '#ef4444'
};

export default function MessagesScreen() {
  const { show } = useToast();
  const { colors } = useTheme();
  const router = useRouter();
  const [userId, setUserId] = useState<number>(0);
  const { conversations, totalUnread, loading, deleteConversation, refresh } = useInbox();

  const [pricingVisible, setPricingVisible] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const openSwipeable = useRef<Swipeable | null>(null);
  const rowRefs = useRef(new Map<number, Swipeable | null>());

  const [user, setUser] = useState<any>(null);

  const isPremium = user?.plan_type === "premium";
  const isSeller = user?.is_seller === "1";



  useEffect(() => {
    AsyncStorage.getItem('authUser').then(j => {
      if (j) {
        const user = JSON.parse(j);
        setUserId(user.id);
        setUser(user);


        // Always fetch raw unread count — no premium gate
        if (user.plan_type !== 'premium') {
          fetchPendingCount();
        }
      }
    });
  }, []);

  const handleDeleteConversation = (id: number, name: string) => {
    show({
      type: 'warning',
      title: 'Delete conversation',
      message: `Delete your conversation with ${name}? This cannot be undone.`,
      action: {
        label: 'Delete',
        onPress: () => deleteConversation(id),
      },
    });
  };


  const fetchPendingCount = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const res = await fetch(
        'https://insighthub.com.ng/NestifyAPI/chat_unread.php',
        { headers: { Authorization: `Token ${token ?? ''}` } }
      );
      const result = await res.json();
      if (result.status === 'success') setPendingCount(result.count);
    } catch { }
  };

  useFocusEffect(useCallback(() => { refresh(); }, []));

  const getOtherParty = (conv: Conversation) => {
    const isBuyer = conv.buyer_id === userId;

    return {
      name: isBuyer ? (conv.seller_company || conv.seller_name) : conv.buyer_name,
      avatar: isBuyer ? conv.seller_avatar : conv.buyer_avatar,
      role: isBuyer ? 'Seller' : 'Buyer',
      company_id: isBuyer ? conv.seller_id : conv.buyer_id,
    };

  };


  const renderItem = ({ item }: { item: Conversation }) => {
    const other = getOtherParty(item);
    const hasUnread = item.unread_count > 0;

    const renderRightActions = () => (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleDeleteConversation(item.id, other.name ?? 'this person')}
      >
        <Ionicons name="trash-outline" size={22} color={colors.background} />

        <Text style={[styles.deleteActionText, { color: colors.background }]}>Delete</Text>
      </TouchableOpacity>
    );

    const setRowRef = (ref: Swipeable | null) => {
      rowRefs.current.set(item.id, ref);
    };

    return (
      <Swipeable
        ref={setRowRef}
        renderRightActions={renderRightActions}
        overshootRight={false}
        onSwipeableOpen={() => {
          const currentRef = rowRefs.current.get(item.id);
          if (openSwipeable.current && openSwipeable.current !== currentRef) {
            openSwipeable.current.close();
          }
          openSwipeable.current = currentRef ?? null;
        }}
        onSwipeableClose={() => {
          if (openSwipeable.current === rowRefs.current.get(item.id)) {
            openSwipeable.current = null;
          }
        }}
      >
        <TouchableOpacity
          style={[
            styles.convItem,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
            hasUnread && { backgroundColor: colorWithAlpha(colors.buttonBackground, 0.12) },
          ]}
          activeOpacity={0.8}
          onPress={() =>
            router.push({
              pathname: '../Home/ChatRoom',
              params: { conversation_id: item.id, property_name: item.propertyName, property_id: item.property_id, CompanyName: other.name, company_id: other.company_id },
            })
          }
        >
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            {other.avatar ? (
              <Image source={{ uri: other.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: colors.buttonBackground }]}>
                <Text style={[styles.avatarInitial, { color: colors.background }]}>
                  {(other.name ?? '?')[0].toUpperCase()}
                </Text>
              </View>
            )}
            {/* Online indicator placeholder */}
            <View style={[styles.onlineDot, { backgroundColor: colors.success, borderColor: colors.background }]} />
          </View>

          {/* Content */}
          <View style={styles.convContent}>
            <View style={styles.convTop}>
              <Text style={[styles.convName, { color: colors.text }, hasUnread && styles.convNameBold]} numberOfLines={1}>
                {other.name}
              </Text>
              <Text style={[styles.convTime, { color: colors.mutedText }]}>{formatTime(item.last_message_at)}</Text>
            </View>

            <Text style={[styles.convProperty, { color: colors.buttonBackground }]} numberOfLines={1}>
              {item.propertyName ? `🏠 ${item.propertyName}` : '💬 General enquiry'}
            </Text>


            <View style={styles.convBottom}>
              <Text
                style={[styles.lastMessage, { color: hasUnread ? colors.text : colors.mutedText }, hasUnread && styles.lastMessageBold]}
                numberOfLines={1}
              >
                {item.last_message ?? 'Start a conversation'}
              </Text>
              {hasUnread && (
                <View style={[styles.unreadBadge, { backgroundColor: colors.buttonBackground }]}>
                  <Text style={[styles.unreadText, { color: colors.background }]}>
                    {item.unread_count > 99 ? '99+' : item.unread_count}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderColor: colors.border }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.inputBackground }]} onPress={() =>
          router.push({
            pathname: "../Profile",
          })
        }>
          <Ionicons name="chevron-back" size={22} color={colors.icon} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
          {totalUnread > 0 && (
            <Text style={[styles.headerSub, { color: colors.buttonBackground }]}>{totalUnread} unread</Text>
          )}
        </View>
      </View>
      {isPremium && conversations.length > 0 &&
        <View style={styles.swipeHintRow}>
          <Text style={[styles.swipeHintText, { color: colors.mutedText }]}>Swipe left on a conversation to delete it.</Text>
        </View>

      }


      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.buttonBackground} />
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
              <View style={[styles.emptyIcon, { backgroundColor: colors.inputBackground }]}>
                <Ionicons
                  name={!isPremium && totalUnread > 0 ? 'lock-closed-outline' : 'chatbubbles-outline'}
                  size={44}
                  color={colors.mutedText}
                />
              </View>

              {!isPremium && pendingCount > 0 ? (
                // Freemium user with pending messages
                <>
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>You have a message waiting</Text>
                  <Text style={[styles.emptySub, { color: colors.mutedText }]}>
                    A potential client has reached out. Upgrade to Premium to read and
                    reply to messages.
                  </Text>
                  <TouchableOpacity
                    style={[styles.upgradeBtn, { backgroundColor: colors.buttonBackground }]}
                    onPress={() => setPricingVisible(true)}
                  >
                    <Text style={[styles.upgradeBtnText, { color: colors.background }]}>⭐ Upgrade to Premium</Text>
                  </TouchableOpacity>
                </>
              ) : !isPremium ? (
                // Freemium user, no messages yet
                <>
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>Messaging is a Premium feature</Text>
                  <Text style={[styles.emptySub, { color: colors.mutedText }]}>
                    Upgrade to Premium to chat with sellers and receive messages from
                    potential buyers.
                  </Text>
                  <TouchableOpacity
                    style={[styles.upgradeBtn, { backgroundColor: colors.buttonBackground }]}
                    onPress={() => setPricingVisible(true)}
                  >
                    <Text style={[styles.upgradeBtnText, { color: colors.background }]}>⭐ Upgrade to Premium</Text>
                  </TouchableOpacity>
                </>
              ) : (
                // Premium user, no messages yet
                <>
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No conversations yet</Text>
                  <Text style={[styles.emptySub, { color: colors.mutedText }]}>
                    Tap Chat With Seller on any property to start a conversation
                  </Text>
                </>
              )}
            </View>
          }
        />
      )}
      {isSeller && (

        <PricingModal
          visible={pricingVisible}
          mode="seller"
          onClose={() =>
            setPricingVisible(false)
          }
          onSelectPlan={(planKey) => {
            switch (planKey) {
              case "seller_monthly":
                router.push(
                  "../../../upgrade/payment?plan=seller_monthly"
                );
                break;

              case "seller_semi":
                router.push(
                  "../../../upgrade/payment?plan=seller_semi"
                );
                break;

              case "seller_annual":
                router.push(
                  "../../../upgrade/payment?plan=seller_annual"
                );
                break;
            }
          }}
        />
      )}

      {!isSeller && !isPremium &&
        (

          <PricingModal
            visible={pricingVisible}
            mode="buyer"
            onClose={() => setPricingVisible(false)}
            onSelectPlan={(planKey) => {

              switch (planKey) {

                case "buyer_monthly":
                  router.push("/upgrade/payment?plan=buyer_monthly");
                  break;

                case "buyer_annual":
                  router.push("/upgrade/payment?plan=buyer_annual");
                  break;
              }
            }}
          />
        )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: getStatusBarHeight(),
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderColor: COLORS.border,
  },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  headerSub: {
    fontSize: 12,
    color: COLORS.gold,
    marginTop: 2,
  },

  swipeHintRow: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },

  swipeHintText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 0.5,
    borderColor: COLORS.border,
  },

  convItemUnread: {
    backgroundColor: '#132a5c', // slightly brighter navy
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },

  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.bg,
  },

  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.goldLight,
    borderWidth: 2,
    borderColor: COLORS.bg,
  },

  convContent: { flex: 1 },

  convTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  convName: {
    fontSize: 15,
    color: COLORS.textPrimary,
    flex: 1,
  },

  convNameBold: {
    fontWeight: '700',
  },

  convTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },

  convProperty: {
    fontSize: 11,
    color: COLORS.gold,
    marginVertical: 2,
  },

  lastMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  avatarWrap: { position: 'relative' },
  lastMessageBold: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },

  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginLeft: 8,
  },

  unreadText: {
    color: COLORS.bg,
    fontSize: 11,
    fontWeight: '700',
  },

  deleteAction: {
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  convBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deleteActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },

  empty: {
    alignItems: 'center',
    paddingTop: 100,
    gap: 12,
    paddingHorizontal: 40,
  },

  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  emptySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  upgradeBtn: {
    marginTop: 12,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
  },

  upgradeBtnText: {
    color: COLORS.bg,
    fontWeight: '700',
    fontSize: 14,
  },

  separator: {
    height: 0,
  },
});
