// components/WriteReviewModal.tsx
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface ExistingReview {
  id:      number;
  rating:  number;
  comment: string;
}

interface Props {
  visible:      boolean;
  onClose:      () => void;
  onSubmit:     (rating: number, comment: string, images: any[]) => Promise<{ success: boolean; msg: string }>;
  onUpdate?:    (reviewId: number, rating: number, comment: string) => Promise<{ success: boolean; msg: string }>;
  existing?:    ExistingReview | null;
  submitting:   boolean;
  entityLabel?: string; // 'agent', 'company', 'property' — defaults to 'agent'
}

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

export default function WriteReviewModal({
  visible,
  onClose,
  onSubmit,
  onUpdate,
  existing,
  submitting,
  entityLabel = 'agent',
}: Props) {
  const isEdit = !!existing;
  const [rating,  setRating]  = useState(existing?.rating  ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [images,  setImages]  = useState<any[]>([]);

  // Sync state when modal re-opens with existing data
  const handleShow = () => {
    setRating(existing?.rating   ?? 0);
    setComment(existing?.comment ?? '');
    setImages([]);
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      const picked = result.assets.map(a => ({
        uri:  a.uri,
        name: a.fileName ?? `review_${Date.now()}.jpg`,
        type: a.mimeType ?? 'image/jpeg',
      }));
      setImages(prev => [...prev, ...picked].slice(0, 4));
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating required', 'Please tap a star to rate.');
      return;
    }
    if (comment.trim().length < 10) {
      Alert.alert('Too short', 'Please write at least 10 characters.');
      return;
    }

    const result = isEdit && existing && onUpdate
      ? await onUpdate(existing.id, rating, comment)
      : await onSubmit(rating, comment, images);

    if (result.success) {
      Alert.alert('Done!', result.msg);
      onClose();
      setRating(0);
      setComment('');
      setImages([]);
    } else {
      Alert.alert('Error', result.msg);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onShow={handleShow}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.sheet}>

          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {isEdit ? 'Edit your review' : `Review this ${entityLabel}`}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#555" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Stars */}
            <Text style={styles.label}>Your rating</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(i => (
                <TouchableOpacity key={i} onPress={() => setRating(i)} activeOpacity={0.7}>
                  <MaterialIcons
                    name={i <= rating ? 'star' : 'star-border'}
                    size={42}
                    color={i <= rating ? '#F59E0B' : '#D1D5DB'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <Text style={styles.ratingLabel}>{STAR_LABELS[rating]}</Text>
            )}

            {/* Comment */}
            <Text style={styles.label}>Your experience</Text>
            <TextInput
              style={styles.textInput}
              placeholder={`Share your experience with this ${entityLabel}...`}
              placeholderTextColor="#aaa"
              multiline
              numberOfLines={5}
              value={comment}
              onChangeText={setComment}
              maxLength={1000}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{comment.length}/1000</Text>

            {/* Images — only on new review */}
            {!isEdit && (
              <>
                <Text style={styles.label}>Add photos (optional, max 4)</Text>
                <View style={styles.imagesRow}>
                  {images.map((img, i) => (
                    <View key={i} style={styles.imgWrap}>
                      <Image source={{ uri: img.uri }} style={styles.previewImg} />
                      <TouchableOpacity
                        style={styles.removeImg}
                        onPress={() => setImages(prev => prev.filter((_, j) => j !== i))}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Ionicons name="close-circle" size={20} color="#dc3545" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {images.length < 4 && (
                    <TouchableOpacity style={styles.addImgBtn} onPress={pickImages}>
                      <Ionicons name="camera-outline" size={26} color="#888" />
                      <Text style={styles.addImgText}>Add photo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}

          </ScrollView>

          {/* Submit */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              (submitting || rating === 0) && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting || rating === 0}
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitText}>
                  {isEdit ? 'Update review' : 'Submit review'}
                </Text>
            }
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    maxHeight: '92%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center', marginBottom: 16,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  title:    { fontSize: 17, fontWeight: 'bold', color: '#111' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
  },
  label: {
    fontSize: 14, fontWeight: '600', color: '#333',
    marginBottom: 8, marginTop: 14,
  },
  starsRow:    { flexDirection: 'row', gap: 4, marginBottom: 4 },
  ratingLabel: { fontSize: 13, color: '#F59E0B', fontWeight: '600', marginBottom: 4 },
  textInput: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 12, fontSize: 14, color: '#111', minHeight: 110,
  },
  charCount: { fontSize: 11, color: '#aaa', textAlign: 'right', marginTop: 4 },
  imagesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  imgWrap:   { position: 'relative' },
  previewImg: { width: 74, height: 74, borderRadius: 10 },
  removeImg:  { position: 'absolute', top: -8, right: -8 },
  addImgBtn: {
    width: 74, height: 74, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#E5E7EB', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  addImgText:  { fontSize: 11, color: '#888' },
  submitBtn: {
    backgroundColor: '#007bff', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 16,
  },
  submitBtnDisabled: { backgroundColor: '#93C5FD' },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
