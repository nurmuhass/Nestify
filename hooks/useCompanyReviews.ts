// hooks/useCompanyReviews.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const BASE = 'https://insighthub.com.ng/NestifyAPI/company_reviews.php';

export interface ReviewSummary {
  total:     number;
  average:   number;
  breakdown: Record<number, number>;
}

export interface CompanyReview {
  id:              number;
  company_id:      number;
  reviewer_id:     number;
  rating:          number;
  comment:         string;
  images:          string[];
  reviewer_name:   string;
  reviewer_avatar: string | null;
  created_at:      string;
}

const getHeaders = async (multipart = false) => {
  const token = await AsyncStorage.getItem('authToken');
  const h: Record<string, string> = { Authorization: `Token ${token ?? ''}` };
  if (!multipart) h['Content-Type'] = 'application/json';
  return h;
};

export function useCompanyReviews(companyId: number) {
  const [reviews, setReviews]           = useState<CompanyReview[]>([]);
  const [summary, setSummary]           = useState<ReviewSummary | null>(null);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [myReview, setMyReview]         = useState<CompanyReview | null>(null);
  const [hasReviewed, setHasReviewed]   = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [page, setPage]                 = useState(1);
  const [hasMore, setHasMore]           = useState(true);

  const fetchReviews = useCallback(async (reset = false, rating: number | null = filterRating) => {
    try {
      if (reset) setLoading(true);
      const currentPage = reset ? 1 : page;
      const headers = await getHeaders();
      let url = `${BASE}?action=list&company_id=${companyId}&page=${currentPage}&limit=10`;
      if (rating !== null) url += `&rating=${rating}`;

      const res    = await fetch(url, { headers });
      const result = await res.json();

      if (result.status === 'success') {
        setReviews(prev => reset ? result.data : [...prev, ...result.data]);
        setSummary(result.summary);
        setHasMore(currentPage < result.total_pages);
        if (!reset) setPage(p => p + 1);
        else setPage(2);
      }
    } catch (e) {
      console.error('[useCompanyReviews]', e);
    } finally {
      setLoading(false);
    }
  }, [companyId, page, filterRating]);

  const fetchMyReview = useCallback(async () => {
    try {
      const headers = await getHeaders();
      const res = await fetch(
        `${BASE}?action=my_review&company_id=${companyId}`,
        { headers }
      );
      const result = await res.json();
      if (result.status === 'success') {
        setHasReviewed(result.has_reviewed);
        setMyReview(result.review ?? null);
      }
    } catch {}
  }, [companyId]);

  useEffect(() => {
    if (!companyId) return;
    fetchReviews(true);
    fetchMyReview();
  }, [companyId]);

  const applyFilter = (rating: number | null) => {
    setFilterRating(rating);
    fetchReviews(true, rating);
  };

  const submitReview = async (
    rating:  number,
    comment: string,
    images?: { uri: string; name: string; type: string }[]
  ): Promise<{ success: boolean; msg: string }> => {
    setSubmitting(true);
    try {
      let body: FormData | string;
      let headers: Record<string, string>;

      if (images && images.length > 0) {
        const form = new FormData();
        form.append('company_id', String(companyId));
        form.append('rating',     String(rating));
        form.append('comment',    comment);
        images.forEach(img => form.append('images', img as any));
        body    = form;
        headers = await getHeaders(true);
      } else {
        body    = JSON.stringify({ company_id: companyId, rating, comment });
        headers = await getHeaders();
      }

      const res    = await fetch(`${BASE}?action=submit`, { method: 'POST', headers, body });
      const result = await res.json();

      if (result.status === 'success') {
        await fetchReviews(true);
        await fetchMyReview();
        return { success: true, msg: 'Review submitted!' };
      }
      return { success: false, msg: result.msg ?? 'Failed to submit' };
    } catch (e: any) {
      return { success: false, msg: e.message ?? 'Something went wrong' };
    } finally {
      setSubmitting(false);
    }
  };

  const updateReview = async (
    reviewId: number,
    rating:   number,
    comment:  string
  ): Promise<{ success: boolean; msg: string }> => {
    setSubmitting(true);
    try {
      const headers = await getHeaders();
      const res = await fetch(`${BASE}?action=update`, {
        method:  'POST',
        headers,
        body:    JSON.stringify({ review_id: reviewId, rating, comment }),
      });
      const result = await res.json();
      if (result.status === 'success') {
        await fetchReviews(true);
        await fetchMyReview();
        return { success: true, msg: 'Review updated!' };
      }
      return { success: false, msg: result.msg ?? 'Failed to update' };
    } catch (e: any) {
      return { success: false, msg: e.message };
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async (reviewId: number): Promise<{ success: boolean; msg: string }> => {
    try {
      const headers = await getHeaders();
      const res = await fetch(`${BASE}?action=delete`, {
        method:  'POST',
        headers,
        body:    JSON.stringify({ review_id: reviewId }),
      });
      const result = await res.json();
      if (result.status === 'success') {
        await fetchReviews(true);
        await fetchMyReview();
        return { success: true, msg: 'Deleted' };
      }
      return { success: false, msg: result.msg ?? 'Failed' };
    } catch (e: any) {
      return { success: false, msg: e.message };
    }
  };

  return {
    reviews,
    summary,
    loading,
    submitting,
    myReview,
    hasReviewed,
    filterRating,
    hasMore,
    applyFilter,
    submitReview,
    updateReview,
    deleteReview,
    loadMore: () => fetchReviews(false),
    refresh:  () => fetchReviews(true),
  };
}