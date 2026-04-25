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

const FILTERS = [
  { label: 'All',  value: null },
  { label: '5 ★',  value: 5 },
  { label: '4 ★',  value: 4 },
  { label: '3 ★',  value: 3 },
  { label: '2 ★',  value: 2 },
  { label: '1 ★',  value: 1 },
];

const formatTime = (d: string) => {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60)     return 'Just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export default function UserReviewsScreen() {
  const router = useRouter();
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
        <Text style={styles.ratingBarStar}>{star}</Text>
        <MaterialIcons name="star" size={12} color="#F59E0B" />
        <View style={styles.ratingBarTrack}>
          <View style={[styles.ratingBarFill, { width: `${pct}%` as any }]} />
        </View>
        <Text style={styles.ratingBarCount}>{count}</Text>
      </TouchableOpacity>
    );
  };

  // ── Summary card ────────────────────────────────────────────────────────────
  const Summary = ({ s }: { s: ReviewSummary }) => (
    <View style={styles.summaryCard}>
      <View style={styles.summaryLeft}>
        <Text style={styles.avgScore}>{s.average.toFixed(1)}</Text>
        <View style={styles.summaryStars}>
          {[1, 2, 3, 4, 5].map(i => (
            <MaterialIcons
              key={i}
              name="star"
              size={18}
              color={i <= Math.round(s.average) ? '#F59E0B' : '#E5E7EB'}
            />
          ))}
        </View>
        <Text style={styles.summaryTotal}>{s.total} review{s.total !== 1 ? 's' : ''}</Text>
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
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          {item.reviewer_avatar ? (
            <Image
              source={{ uri: item.reviewer_avatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>
                {(item.reviewer_name ?? '?')[0].toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.reviewerInfo}>
            <Text style={styles.reviewerName}>{item.reviewer_name}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(i => (
                <MaterialIcons
                  key={i}
                  name="star"
                  size={13}
                  color={i <= item.rating ? '#F59E0B' : '#E5E7EB'}
                />
              ))}
              <Text style={styles.reviewTime}> · {formatTime(item.created_at)}</Text>
            </View>
          </View>

          {/* Star badge */}
          <View style={[
            styles.starBadge,
            { backgroundColor: item.rating >= 4 ? '#FEF9C3' : item.rating === 3 ? '#FEF3C7' : '#FEE2E2' }
          ]}>
            <MaterialIcons
              name="star"
              size={13}
              color={item.rating >= 4 ? '#D97706' : item.rating === 3 ? '#F59E0B' : '#DC2626'}
            />
            <Text style={[
              styles.starBadgeText,
              { color: item.rating >= 4 ? '#92400E' : item.rating === 3 ? '#B45309' : '#991B1B' }
            ]}>
              {item.rating}.0
            </Text>
          </View>
        </View>

        <Text style={styles.reviewComment}>
          {isLong && !expanded
            ? item.comment.slice(0, 120) + '...'
            : item.comment}
        </Text>
        {isLong && (
          <TouchableOpacity onPress={() => setExpanded(e => !e)}>
            <Text style={styles.readMore}>{expanded ? 'Show less' : 'Read more'}</Text>
          </TouchableOpacity>
        )}

        {item.images?.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewImgs}>
                  {item.images.map((img, i) => (
                <Image
                  key={`${img}-${i}`}
                  source={{ uri: `https://insighthub.com.ng/${img}` }}
                  style={styles.reviewImg}
                  resizeMode="cover"
                />
              ))}
          </ScrollView>
        )}
      </View>
    );
  };

  if (!userId) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>My Reviews</Text>
          {userName ? (
            <Text style={styles.headerSub} numberOfLines={1}>{userName}</Text>
          ) : null}
        </View>
        {summary && summary.total > 0 && (
          <View style={styles.headerBadge}>
            <MaterialIcons name="star" size={14} color="#F59E0B" />
            <Text style={styles.headerBadgeText}>
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
                    style={[styles.filterPill, active && styles.filterPillActive]}
                    onPress={() => applyFilter(f.value)}
                  >
                    <Text style={[styles.filterText, active && styles.filterTextActive]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

            {reviews.length > 0 && (
              <Text style={styles.sectionLabel}>
                {filterRating
                  ? `${filterRating}-star reviews (${summary?.breakdown?.[filterRating] ?? 0})`
                  : `All reviews (${summary?.total ?? 0})`}
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={{ marginTop: 60 }} color="#007bff" />
          ) : (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <MaterialIcons name="star-border" size={40} color="#ccc" />
              </View>
              <Text style={styles.emptyTitle}>No reviews yet</Text>
              <Text style={styles.emptySub}>
                Reviews from clients will appear here once they interact with your listings
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          hasMore
            ? <ActivityIndicator style={{ marginVertical: 20 }} color="#007bff" />
            : reviews.length > 0
            ? <Text style={styles.endText}>You have seen all reviews</Text>
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
    backgroundColor: '#f7f8fa',
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
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderColor: '#e5e7eb',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  headerSub:   { fontSize: 12, color: '#888', marginTop: 1 },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  headerBadgeText: { fontSize: 13, fontWeight: '700', color: '#92400E' },

  // Summary
  summaryCard: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
  },
  summaryLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  avgScore:     { fontSize: 44, fontWeight: '800', color: '#111', lineHeight: 50 },
  summaryStars: { flexDirection: 'row', gap: 2, marginVertical: 4 },
  summaryTotal: { fontSize: 12, color: '#888' },
  summaryRight: { flex: 1, gap: 6, justifyContent: 'center' },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ratingBarStar: { fontSize: 12, color: '#555', width: 10, textAlign: 'right' },
  ratingBarTrack: {
    flex: 1, height: 6, backgroundColor: '#f3f4f6',
    borderRadius: 3, overflow: 'hidden',
  },
  ratingBarFill: { height: '100%', backgroundColor: '#F59E0B', borderRadius: 3 },
  ratingBarCount: { fontSize: 11, color: '#888', width: 24, textAlign: 'right' },

  // Filters
  filterList: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  filterPill: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 20, backgroundColor: '#f3f4f6',
    borderWidth: 0.5, borderColor: '#e5e7eb',
  },
  filterPillActive: { backgroundColor: '#007bff', borderColor: '#007bff' },
  filterText:       { fontSize: 13, color: '#555', fontWeight: '500' },
  filterTextActive: { color: '#fff' },

  sectionLabel: {
    fontSize: 13, fontWeight: '700', color: '#888',
    marginHorizontal: 16, marginTop: 4, marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },

  // Review card
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 14, padding: 14,
    marginHorizontal: 16, marginBottom: 10,
    borderWidth: 0.5, borderColor: '#e5e7eb',
  },
  reviewHeader: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: 10, marginBottom: 8,
  },
  avatar: { width: 42, height: 42, borderRadius: 21 },
  avatarFallback: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#B5D4F4',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial:  { fontSize: 16, fontWeight: '600', color: '#0C447C' },
  reviewerInfo:   { flex: 1 },
  reviewerName:   { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 3 },
  starsRow:       { flexDirection: 'row', alignItems: 'center' },
  reviewTime:     { fontSize: 11, color: '#aaa' },
  starBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  starBadgeText: { fontSize: 12, fontWeight: '700' },
  reviewComment:  { fontSize: 13, color: '#444', lineHeight: 20 },
  readMore:       { fontSize: 12, color: '#007bff', marginTop: 4, fontWeight: '600' },
  reviewImgs:     { marginTop: 10 },
  reviewImg:      { width: 80, height: 80, borderRadius: 8, marginRight: 8 },

  // Empty state
  empty: {
    alignItems: 'center',
    paddingTop: 70, gap: 12, paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#f3f4f6',
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontSize: 15, fontWeight: 'bold', color: '#111' },
  emptySub: {
    fontSize: 13, color: '#888',
    textAlign: 'center', lineHeight: 20,
  },
  endText: {
    fontSize: 12, color: '#ccc',
    textAlign: 'center', marginVertical: 20,
  },
});
