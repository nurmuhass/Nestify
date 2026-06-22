// app/Profile/UserReviews.tsx
// The company/agent views all reviews written about them
// Navigate to this from the profile page Reviews stat

import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { CompanyReview, ReviewSummary, useCompanyReviews } from '@/hooks/useCompanyReviews';
import PremiumLoader from '@/components/PremiumLoader';
import { useTheme } from '@/context/ThemeContext';

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

const FILTERS = [
  { label: 'All', value: null },
  { label: '5 ★', value: 5 },
  { label: '4 ★', value: 4 },
  { label: '3 ★', value: 3 },
  { label: '2 ★', value: 2 },
  { label: '1 ★', value: 1 },
];

const formatTime = (d: string) => {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export default function UserReviewsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState('');

  // Get logged in user from storage
  useEffect(() => {
    const load = async () => {
      const userJson = await AsyncStorage.getItem('authUser');
      if (userJson) {
        const u = JSON.parse(userJson);
        setUserId(u.id);
        setUserName(u.company_name ?? u.name ?? '');
      }
    };
    load();
  }, []);

  const {
    reviews,
    summary,
    loading,
    filterRating,
    hasMore,
    applyFilter,
    loadMore,
    refresh,
  } = useCompanyReviews(userId ?? 0);

  // ── Rating bar ──────────────────────────────────────────────────────────────
  const RatingBar = ({ star, count, total }: { star: number; count: number; total: number }) => {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
      <TouchableOpacity
        style={styles.ratingBarRow}
        onPress={() => applyFilter(filterRating === star ? null : star)}
      >
        <Text style={[styles.ratingBarStar, { color: colors.mutedText }]}>{star}</Text>
        <MaterialIcons name="star" size={12} color={colors.buttonBackground} />
        <View style={[styles.ratingBarTrack, { backgroundColor: colors.border }]}>
          <View style={[styles.ratingBarFill, { backgroundColor: colors.buttonBackground, width: `${pct}%` as any }]} />
        </View>
        <Text style={[styles.ratingBarCount, { color: colors.mutedText }]}>{count}</Text>
      </TouchableOpacity>
    );
  };

  // ── Summary card ────────────────────────────────────────────────────────────
  const Summary = ({ s }: { s: ReviewSummary }) => (
    <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      <View style={styles.summaryLeft}>
        <Text style={[styles.avgScore, { color: colors.buttonBackground }]}>{s.average.toFixed(1)}</Text>
        <View style={styles.summaryStars}>
          {[1, 2, 3, 4, 5].map(i => (
            <MaterialIcons
              key={i}
              name="star"
              size={18}
              color={i <= Math.round(s.average) ? colors.buttonBackground : colors.border}
            />
          ))}
        </View>
        <Text style={[styles.summaryTotal, { color: colors.mutedText }]}>{s.total} review{s.total !== 1 ? 's' : ''}</Text>
      </View>
      <View style={styles.summaryRight}>
        {[5, 4, 3, 2, 1].map(star => (
          <RatingBar
            key={star}
            star={star}
            count={s.breakdown?.[star] ?? 0}
            total={s.total}
          />
        ))}
      </View>
    </View>
  );

  // ── Single review item ──────────────────────────────────────────────────────
  const ReviewItem = ({ item }: { item: CompanyReview }) => {
    const [expanded, setExpanded] = useState(false);
    const isLong = item.comment.length > 120;

    return (
      <View style={[styles.reviewCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <View style={styles.reviewHeader}>
          {item.reviewer_avatar ? (
            <Image
              source={{ uri: item.reviewer_avatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: colors.buttonBackground }]}>
              <Text style={[styles.avatarInitial, { color: colors.background }]}>
                {(item.reviewer_name ?? '?')[0].toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.reviewerInfo}>
            <Text style={[styles.reviewerName, { color: colors.text }]}>{item.reviewer_name}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(i => (
                <MaterialIcons
                  key={i}
                  name="star"
                  size={13}
                  color={i <= item.rating ? colors.buttonBackground : colors.border}
                />
              ))}
              <Text style={[styles.reviewTime, { color: colors.mutedText }]}> · {formatTime(item.created_at)}</Text>
            </View>
          </View>

          {/* Star badge */}
          <View style={[
            styles.starBadge,
            { backgroundColor: colors.buttonBackground }
          ]}>
            <MaterialIcons
              name="star"
              size={13}
              color={colors.background}
            />
            <Text style={[
              styles.starBadgeText,
              { color: colors.background }
            ]}>
              {item.rating}.0
            </Text>
          </View>
        </View>

        <Text style={[styles.reviewComment, { color: colors.text }]}>
          {isLong && !expanded
            ? item.comment.slice(0, 120) + '...'
            : item.comment}
        </Text>
        {isLong && (
          <TouchableOpacity onPress={() => setExpanded(e => !e)}>
            <Text style={[styles.readMore, { color: colors.buttonBackground }]}>{expanded ? 'Show less' : 'Read more'}</Text>
          </TouchableOpacity>
        )}

        {item.images?.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewImgs}>
            {item.images.map((img, i) => (
              <Image
                key={`${img}-${i}`}
                source={{ uri: `https://insighthub.com.ng/${img}` }}
                style={[styles.reviewImg, { borderColor: colors.border }]}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}
      </View>
    );
  };


  if (!userId) {
    return <PremiumLoader />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.inputBackground }]} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.icon} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Reviews</Text>
          {userName ? (
            <Text style={[styles.headerSub, { color: colors.mutedText }]} numberOfLines={1}>{userName}</Text>
          ) : null}
        </View>
        {summary && summary.total > 0 && (
          <View style={[styles.headerBadge, { backgroundColor: colors.buttonBackground }]}>
            <MaterialIcons name="star" size={14} color={colors.background} />
            <Text style={[styles.headerBadgeText, { color: colors.background }]}>
              {summary.average.toFixed(1)}
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={refresh}
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <>
            {/* Summary */}
            {summary && summary.total > 0 && <Summary s={summary} />}

            {/* Filter pills */}
            <FlatList
              data={FILTERS}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={f => String(f.value)}
              contentContainerStyle={styles.filterList}
              renderItem={({ item: f }) => {
                const active = filterRating === f.value;
                return (
                  <TouchableOpacity
                    style={[
                      styles.filterPill,
                      { backgroundColor: colors.cardBackground, borderColor: colors.border },
                      active && { backgroundColor: colors.buttonBackground, borderColor: colors.buttonBackground },
                    ]}
                    onPress={() => applyFilter(f.value)}
                  >
                    <Text style={[
                      styles.filterText,
                      { color: colors.mutedText },
                      active && { color: colors.background },
                    ]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

            {reviews.length > 0 && (
              <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>
                {filterRating
                  ? `${filterRating}-star reviews (${summary?.breakdown?.[filterRating] ?? 0})`
                  : `All reviews (${summary?.total ?? 0})`}
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={{ marginTop: 60 }} color={colors.buttonBackground} />
          ) : (
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <MaterialIcons name="star-border" size={40} color={colors.mutedText} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No reviews yet</Text>
              <Text style={[styles.emptySub, { color: colors.mutedText }]}>
                Reviews from clients will appear here once they interact with your listings
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          hasMore
            ? <></>
            : reviews.length > 0
              ? <Text style={[styles.endText, { color: colors.mutedText }]}>You have seen all reviews</Text>
              : null
        }
        renderItem={({ item }) => <ReviewItem item={item} />}
      />

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
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
  headerSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  headerBadgeText: { fontSize: 13, fontWeight: '700', color: COLORS.bg },

  // Summary
  summaryCard: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: COLORS.card,
    margin: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  avgScore: { fontSize: 44, fontWeight: '800', color: COLORS.gold, lineHeight: 50 },
  summaryStars: { flexDirection: 'row', gap: 2, marginVertical: 4 },
  summaryTotal: { fontSize: 12, color: COLORS.textSecondary },
  summaryRight: { flex: 1, gap: 6, justifyContent: 'center' },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ratingBarStar: { fontSize: 12, color: COLORS.textSecondary, width: 10, textAlign: 'right' },
  ratingBarTrack: {
    flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3, overflow: 'hidden',
  },
  ratingBarFill: { height: '100%', backgroundColor: COLORS.gold, borderRadius: 3 },
  ratingBarCount: { fontSize: 11, color: COLORS.textSecondary, width: 24, textAlign: 'right' },

  // Filters
  filterList: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  filterPill: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 20, backgroundColor: COLORS.card,
    borderWidth: 1, borderColor: COLORS.border,
  },
  filterPillActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  filterText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  filterTextActive: { color: COLORS.bg, fontWeight: '600' },

  sectionLabel: {
    fontSize: 13, fontWeight: '700', color: COLORS.textSecondary,
    marginHorizontal: 16, marginTop: 4, marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },

  // Review card
  reviewCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14, padding: 14,
    marginHorizontal: 16, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  reviewHeader: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: 10, marginBottom: 8,
  },
  avatar: { width: 42, height: 42, borderRadius: 21 },
  avatarFallback: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { fontSize: 16, fontWeight: '600', color: COLORS.bg },
  reviewerInfo: { flex: 1 },
  reviewerName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 3 },
  starsRow: { flexDirection: 'row', alignItems: 'center' },
  reviewTime: { fontSize: 11, color: COLORS.textSecondary },
  starBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  starBadgeText: { fontSize: 12, fontWeight: '700' },
  reviewComment: { fontSize: 13, color: COLORS.textPrimary, lineHeight: 20 },
  readMore: { fontSize: 12, color: COLORS.gold, marginTop: 4, fontWeight: '600' },
  reviewImgs: { marginTop: 10 },
  reviewImg: { width: 80, height: 80, borderRadius: 8, marginRight: 8, borderColor: COLORS.border, borderWidth: 1 },

  // Empty state
  empty: {
    alignItems: 'center',
    paddingTop: 70, gap: 12, paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.card,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.textPrimary },
  emptySub: {
    fontSize: 13, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 20,
  },
  endText: {
    fontSize: 12, color: COLORS.textSecondary,
    textAlign: 'center', marginVertical: 20,
  },
});
