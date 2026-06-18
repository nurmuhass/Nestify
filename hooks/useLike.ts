// hooks/useLike.ts
// Reusable hook — use this on ANY page (details, feed, saved, etc.)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const BASE_URL = 'https://insighthub.com.ng/NestifyAPI';

interface LikeState {
  liked: boolean;
  likesCount: number;
  loading: boolean;
}


export function useLike(propertyId: number, initialLiked = false, initialCount = 0) {
  const [state, setState] = useState<LikeState>({
    liked: initialLiked,
    likesCount: initialCount,
    loading: false,
  });

  // Fetch current status from server on mount
  useEffect(() => {
    if (!propertyId) return;
    fetchStatus();
  }, [propertyId]);

  const fetchStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const res = await fetch(
        `${BASE_URL}/like_property.php?property_id=${propertyId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token ?? ''}`,
          },
        }
      );
      const result = await res.json();
      if (result.status === 'success') {
        setState(prev => ({
          ...prev,
          liked: result.data.liked,
          likesCount: result.data.likes_count,
        }));
      }
    } catch {
      // Silently fail — UI keeps initial state
    }
  };

  const toggleLike = useCallback(async () => {

    let previousLiked = false;
    let previousCount = 0;

    setState(prev => {

      previousLiked = prev.liked;
      previousCount = prev.likesCount;

      return {
        ...prev,
        liked: !prev.liked,
        likesCount: prev.liked
          ? prev.likesCount - 1
          : prev.likesCount + 1,
        loading: true,
      };
    });

    try {

      const token = await AsyncStorage.getItem('authToken');

      const res = await fetch(
        `${BASE_URL}/like_property.php?property_id=${propertyId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token ?? ''}`,
          },
        }
      );

      const result = await res.json();

      if (result.status === 'success') {

        setState({
          liked: result.data.liked,
          likesCount: result.data.likes_count,
          loading: false,
        });

      } else {

        setState({
          liked: previousLiked,
          likesCount: previousCount,
          loading: false,
        });

      }

    } catch {

      setState({
        liked: previousLiked,
        likesCount: previousCount,
        loading: false,
      });

    }

  }, [propertyId]);

  return { ...state, toggleLike };
}


// ─── Bulk version — for property lists/feeds ──────────────────────────────────
// Call once after fetching a list of properties to get liked status for all of them

export async function fetchBulkLikeStatus(
  propertyIds: number[]
): Promise<{ likedMap: Record<number, boolean>; countMap: Record<number, number> }> {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const res = await fetch(`${BASE_URL}/get_bulk_like_status.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token ?? ''}`,
      },
      body: JSON.stringify({ property_ids: propertyIds }),
    });
    const result = await res.json();
    if (result.status === 'success') {
      return {
        likedMap: result.data.liked_map,
        countMap: result.data.count_map,
      };
    }
  } catch { }
  return { likedMap: {}, countMap: {} };
}