import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
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
import { useToast } from './Toast';
import { colorWithAlpha } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface ExistingReview {
  id: number;
  rating: number;
  comment: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string, images: any[]) => Promise<{ success: boolean; msg: string }>;
  onUpdate?: (reviewId: number, rating: number, comment: string) => Promise<{ success: boolean; msg: string }>;
  existing?: ExistingReview | null;
  submitting: boolean;
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
  const { show } = useToast();
  const { colors } = useTheme();
  const isEdit = !!existing;
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [images, setImages] = useState<any[]>([]);

  // Sync state when modal re-opens with existing data
  const handleShow = () => {
    setRating(existing?.rating ?? 0);
    setComment(existing?.comment ?? '');
    setImages([]);
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      show({
        type: 'error',
        title: 'Permission required',
        message: 'Please allow access to your photo library.',
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      const picked = result.assets.map(a => ({
        uri: a.uri,
        name: a.fileName ?? `review_${Date.now()}.jpg`,
        type: a.mimeType ?? 'image/jpeg',
      }));
      setImages(prev => [...prev, ...picked].slice(0, 4));
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      show({
        type: 'warning',
        title: 'Rating required',
        message: 'Please tap a star to rate.',
      });
      return;
    }
    if (comment.trim().length < 10) {
      show({
        type: 'warning',
        title: 'Too short',
        message: 'Please write at least 10 characters.',
      });
      return;
    }

    const result = isEdit && existing && onUpdate
      ? await onUpdate(existing.id, rating, comment)
      : await onSubmit(rating, comment, images);

    if (result.success) {
      show({
        type: 'success',
        title: 'Done!',
        message: result.msg,
      });
      onClose();
      setRating(0);
      setComment('');
      setImages([]);
    } else {
      show({
        type: 'error',
        title: 'Error',
        message: result.msg,
      });
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
        style={[
          styles.overlay,
          { backgroundColor: colorWithAlpha(colors.shadow, 0.7) },
        ]}
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
            },
          ]}
        >

          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {isEdit ? 'Edit your review' : `Review this ${entityLabel}`}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: colorWithAlpha(colors.text, 0.08) },
              ]}
            >
              <Ionicons name="close" size={20} color={colors.mutedText} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Stars */}
            <Text style={[styles.label, { color: colors.buttonBackground }]}>
              Your rating
            </Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(i => (
                <TouchableOpacity key={i} onPress={() => setRating(i)} activeOpacity={0.7}>
                  <MaterialIcons
                    name={i <= rating ? 'star' : 'star-border'}
                    size={42}
                    color={i <= rating ? colors.buttonBackground : colors.border}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <Text
                style={[styles.ratingLabel, { color: colors.buttonBackground }]}
              >
                {STAR_LABELS[rating]}
              </Text>
            )}

            {/* Comment */}
            <Text style={[styles.label, { color: colors.buttonBackground }]}>
              Your experience
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.inputBackground,
                },
              ]}
              placeholder={`Share your experience with this ${entityLabel}...`}
              placeholderTextColor={colors.mutedText}
              multiline
              numberOfLines={5}
              value={comment}
              onChangeText={setComment}
              maxLength={1000}
              textAlignVertical="top"
            />
            <Text style={[styles.charCount, { color: colors.mutedText }]}>
              {comment.length}/1000
            </Text>

            {/* Images — only on new review */}
            {!isEdit && (
              <>
                <Text style={[styles.label, { color: colors.buttonBackground }]}>
                  Add photos (optional, max 4)
                </Text>
                <View style={styles.imagesRow}>
                  {images.map((img, i) => (
                    <View key={i} style={styles.imgWrap}>
                      <Image
                        source={{ uri: img.uri }}
                        style={[
                          styles.previewImg,
                          { borderColor: colors.border },
                        ]}
                      />
                      <TouchableOpacity
                        style={styles.removeImg}
                        onPress={() => setImages(prev => prev.filter((_, j) => j !== i))}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Ionicons name="close-circle" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {images.length < 4 && (
                    <TouchableOpacity
                      style={[
                        styles.addImgBtn,
                        {
                          borderColor: colors.border,
                          backgroundColor: colorWithAlpha(colors.text, 0.02),
                        },
                      ]}
                      onPress={pickImages}
                    >
                      <Ionicons
                        name="camera-outline"
                        size={26}
                        color={colors.buttonBackground}
                      />
                      <Text style={[styles.addImgText, { color: colors.mutedText }]}>
                        Add photo
                      </Text>
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
              { backgroundColor: colors.buttonBackground },
              (submitting || rating === 0) && {
                backgroundColor: colors.mutedText,
              },
            ]}
            onPress={handleSubmit}
            disabled={submitting || rating === 0}
          >
            {submitting
              ? <ActivityIndicator color={colors.background} />
              : <Text style={[styles.submitText, { color: colors.background }]}>
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
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    maxHeight: '92%',
    borderTopWidth: 1,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: 16,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  title: { fontSize: 17, fontWeight: 'bold' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  label: {
    fontSize: 14, fontWeight: '600',
    marginBottom: 8, marginTop: 14,
  },
  starsRow: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  ratingLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  textInput: {
    borderWidth: 1, borderRadius: 12,
    padding: 12, fontSize: 14, minHeight: 110,
  },
  charCount: { fontSize: 11, textAlign: 'right', marginTop: 4 },
  imagesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  imgWrap: { position: 'relative' },
  previewImg: { width: 74, height: 74, borderRadius: 10, borderWidth: 1 },
  removeImg: { position: 'absolute', top: -8, right: -8 },
  addImgBtn: {
    width: 74, height: 74, borderRadius: 10,
    borderWidth: 1.5, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  addImgText: { fontSize: 11 },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 16,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { fontSize: 15, fontWeight: '700' },
});
