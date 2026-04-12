// app/Profile/CompanyReviews.tsx
// Navigated to from the agent card on details page
// Pass company_id as param: router.push({ pathname: '/Profile/CompanyReviews', params: { company_id: X, company_name: Y } })

import WriteReviewModal from '@/components/WriteReviewModal';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { CompanyReview, useCompanyReviews } from '@/hooks/useCompanyReviews';

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
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function CompanyReviewsScreen() {
  const router = useRouter();
  const { company_id, company_name } = useLocalSearchParams() as {
    company_id: string;
    company_name: string;
  };
  const companyId = Number(company_id);

  const [modalVisible,   setModalVisible]   = useState(false);
  const [editingReview,  setEditingReview]  = useState<CompanyReview | null>(null);

  const {
    reviews, summary, loading, submitting,
    myReview, hasReviewed, filterRating,
    hasMore, applyFilter, submitReview,
    updateReview, deleteReview, loadMore, refresh,
  } = useCompanyReviews(companyId);

  const handleDelete = (reviewId: number) => {
    Alert.alert('Delete review', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const r = await deleteReview(reviewId);
          if (!r.success) Alert.alert('Error', r.msg);
        },
      },
    ]);
  };

  // ── Rating bar ────────────────────────────────────────────────────────────
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

  // ── Summary block ─────────────────────────────────────────────────────────
  const Summary = () => (
    <View style={styles.summaryCard}>
      <View style={styles.summaryLeft}>
        <Text style={styles.avgScore}>{summary?.average?.toFixed(1) ?? '—'}</Text>
        <View style={styles.summaryStars}>
          {[1, 2, 3, 4, 5].map(i => (
            <MaterialIcons
              key={i}
              name="star"
              size={18}
              color={i <= Math.round(summary?.average ?? 0) ? '#F59E0B' : '#E5E7EB'}
            />
          ))}
        </View>
        <Text style={styles.summaryTotal}>{summary?.total ?? 0} reviews</Text>
      </View>
      <View style={styles.summaryRight}>
        {[5, 4, 3, 2, 1].map(s => (
          <RatingBar
            key={s}
            star={s}
            count={summary?.breakdown?.[s] ?? 0}
            total={summary?.total ?? 0}
          />
        ))}
      </View>
    </View>
  );

  // ── Review card ───────────────────────────────────────────────────────────
  const ReviewItem = ({ item, isOwn }: { item: CompanyReview; isOwn: boolean }) => {
    const [expanded, setExpanded] = useState(false);
    const isLong = item.comment.length > 120;

    return (
      <View style={[styles.reviewCard, isOwn && styles.reviewCardOwn]}>
        {isOwn && (
          <View style={styles.ownBadge}>
            <Text style={styles.ownBadgeText}>Your review</Text>
          </View>
        )}
        <View style={styles.reviewHeader}>
          {item.reviewer_avatar ? (
            <Image source={{ uri: item.reviewer_avatar }} style={styles.avatar} />
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
          {isOwn && (
            <View style={styles.reviewActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => { setEditingReview(item); setModalVisible(true); }}
              >
                <Ionicons name="pencil-outline" size={15} color="#007bff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleDelete(item.id)}
              >
                <Ionicons name="trash-outline" size={15} color="#dc3545" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.reviewComment}>
          {isLong && !expanded ? item.comment.slice(0, 120) + '...' : item.comment}
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
                key={i}
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Reviews</Text>
          {company_name && (
            <Text style={styles.headerSub} numberOfLines={1}>{company_name}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.writeBtn}
          onPress={() => { setEditingReview(null); setModalVisible(true); }}
        >
          <Ionicons name={hasReviewed ? 'pencil-outline' : 'add'} size={17} color="#007bff" />
          <Text style={styles.writeBtnText}>{hasReviewed ? 'Edit' : 'Review'}</Text>
        </TouchableOpacity>
      </View>

         <View style={styles.ownerSection}>
        <Image source={require('@/assets/images/anderson.jpg')} style={styles.ownerImage} />
        <View>
          <Text style={styles.ownerName}>Mandella</Text>
          <Text style={{ color: 'gray' }}>Owner</Text>
        </View>
        <Ionicons name="chatbubble-ellipses-outline" size={24} style={{ marginLeft: 'auto' }} />
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
            {summary && <Summary />}

            {/* Filter pills */}
            <FlatList
              data={FILTERS}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `${item.value}-${index}`}
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

            {/* Own review pinned at top */}
            {hasReviewed && myReview && (
              <ReviewItem item={myReview} isOwn />
            )}

            <Text style={styles.sectionLabel}>
              {filterRating ? `${filterRating}-star reviews` : 'All reviews'} ({summary?.total ?? 0})
            </Text>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={{ marginTop: 40 }} color="#007bff" />
          ) : (
            <View style={styles.empty}>
              <Ionicons name="star-outline" size={44} color="#ccc" />
              <Text style={styles.emptyTitle}>No reviews yet</Text>
              <Text style={styles.emptySub}>
                Be the first to share your experience with this agent
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => { setEditingReview(null); setModalVisible(true); }}
              >
                <Text style={styles.emptyBtnText}>Write a review</Text>
              </TouchableOpacity>
            </View>
          )
        }
        ListFooterComponent={
          hasMore
            ? <ActivityIndicator style={{ marginVertical: 20 }} color="#007bff" />
            : null
        }
        renderItem={({ item }) => {
          if (myReview && item.id === myReview.id) return null;
          return <ReviewItem item={item} isOwn={false} />;
        }}
      />

      <WriteReviewModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setEditingReview(null); }}
        onSubmit={submitReview}
        onUpdate={updateReview}
        existing={editingReview}
        submitting={submitting}
        entityLabel="agent"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa', paddingTop: getStatusBarHeight() },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#fff', borderBottomWidth: 0.5, borderColor: '#e5e7eb',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  headerSub:   { fontSize: 12, color: '#888', marginTop: 1 },
  writeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: '#007bff',
  },
  writeBtnText: { fontSize: 13, fontWeight: '600', color: '#007bff' },

  summaryCard: {
    flexDirection: 'row', gap: 16,
    backgroundColor: '#fff', margin: 16, borderRadius: 16,
    padding: 16, borderWidth: 0.5, borderColor: '#e5e7eb',
  },
  summaryLeft:  { alignItems: 'center', justifyContent: 'center', minWidth: 80 },
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

  filterList: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  filterPill: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#f3f4f6', borderWidth: 0.5, borderColor: '#e5e7eb',
  },
  filterPillActive: { backgroundColor: '#007bff', borderColor: '#007bff' },
  filterText:       { fontSize: 13, color: '#555', fontWeight: '500' },
  filterTextActive: { color: '#fff' },

  sectionLabel: {
    fontSize: 13, fontWeight: '700', color: '#888',
    marginHorizontal: 16, marginTop: 8, marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  ownerSection: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef6ff',
    padding: 10, borderRadius: 12, marginBottom: 20,marginTop: 10, marginHorizontal: 16,
  },
  ownerImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  ownerName: { fontWeight: 'bold', fontSize: 16 },
  reviewCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    marginHorizontal: 16, marginBottom: 10,
    borderWidth: 0.5, borderColor: '#e5e7eb',
  },
  reviewCardOwn: { borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' },
  ownBadge: {
    alignSelf: 'flex-start', backgroundColor: '#DBEAFE',
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8,
  },
  ownBadgeText: { fontSize: 11, fontWeight: '700', color: '#1D4ED8' },
  reviewHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#B5D4F4', alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial:  { fontSize: 16, fontWeight: '600', color: '#0C447C' },
  reviewerInfo:   { flex: 1 },
  reviewerName:   { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 3 },
  starsRow:       { flexDirection: 'row', alignItems: 'center' },
  reviewTime:     { fontSize: 11, color: '#aaa' },
  reviewActions:  { flexDirection: 'row', gap: 6 },
  actionBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center',
  },
  reviewComment: { fontSize: 13, color: '#444', lineHeight: 20 },
  readMore:      { fontSize: 12, color: '#007bff', marginTop: 4, fontWeight: '600' },
  reviewImgs:    { marginTop: 10 },
  reviewImg:     { width: 80, height: 80, borderRadius: 8, marginRight: 8 },

  empty: { alignItems: 'center', paddingTop: 60, gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 15, fontWeight: 'bold', color: '#111' },
  emptySub:   { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    marginTop: 4, paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: 20, backgroundColor: '#007bff',
  },
  emptyBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
