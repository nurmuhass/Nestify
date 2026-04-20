
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Message, useMessages } from '@/hooks/useChat';

const BASE_URL = 'https://insighthub.com.ng/';

const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

// ── Inspection request bubble ─────────────────────────────────────────────────
const InspectionBubble = ({
  msg,
  isMine,
  onRespond,
}: {
  msg: Message;
  isMine: boolean;
  onRespond: (id: number, status: 'confirmed' | 'declined') => void;
}) => {
  const statusColor = {
    pending:   '#F59E0B',
    confirmed: '#22C55E',
    declined:  '#EF4444',
  }[msg.inspection_status];

  const statusLabel = {
    pending:   '⏳ Awaiting response',
    confirmed: '✅ Confirmed',
    declined:  '❌ Declined',
  }[msg.inspection_status];

  return (
    <View style={[styles.inspectionCard, isMine && styles.inspectionCardMine]}>
      <View style={styles.inspectionHeader}>
        <MaterialIcons name="event" size={18} color="#007bff" />
        <Text style={styles.inspectionTitle}>Inspection Request</Text>
      </View>
      <View style={styles.inspectionRow}>
        <MaterialIcons name="calendar-today" size={14} color="#555" />
        <Text style={styles.inspectionText}>
          {msg.inspection_date ? formatDate(msg.inspection_date) : '—'}
        </Text>
      </View>
      <View style={styles.inspectionRow}>
        <MaterialIcons name="access-time" size={14} color="#555" />
        <Text style={styles.inspectionText}>{msg.inspection_time ?? '—'}</Text>
      </View>
      {msg.inspection_note ? (
        <View style={styles.inspectionRow}>
          <MaterialIcons name="notes" size={14} color="#555" />
          <Text style={styles.inspectionText}>{msg.inspection_note}</Text>
        </View>
      ) : null}
      <View style={[styles.inspectionStatus, { backgroundColor: statusColor + '20' }]}>
        <Text style={[styles.inspectionStatusText, { color: statusColor }]}>{statusLabel}</Text>
      </View>
      {/* Seller can confirm/decline pending requests */}
      {!isMine && msg.inspection_status === 'pending' && (
        <View style={styles.inspectionActions}>
          <TouchableOpacity
            style={styles.declineBtn}
            onPress={() => onRespond(msg.id, 'declined')}
          >
            <Text style={styles.declineBtnText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => onRespond(msg.id, 'confirmed')}
          >
            <Text style={styles.confirmBtnText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// ── Inspection request modal ──────────────────────────────────────────────────
const InspectionModal = ({
  visible,
  onClose,
  onSend,
}: {
  visible:  boolean;
  onClose:  () => void;
  onSend:   (date: string, time: string, note: string) => void;
}) => {
  const [date,    setDate]    = useState(new Date());
  const [time,    setTime]    = useState(new Date());
  const [note,    setNote]    = useState('');
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const handleSend = () => {
    const d = date.toISOString().split('T')[0];
    const t = time.toTimeString().slice(0, 5);
    onSend(d, t, note);
    onClose();
    setNote('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Book Inspection</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalClose}>
              <Ionicons name="close" size={20} color="#555" />
            </TouchableOpacity>
          </View>

          {/* Date picker */}
          <Text style={styles.modalLabel}>Preferred date</Text>
          <TouchableOpacity
            style={styles.datePickerBtn}
            onPress={() => setShowDate(true)}
          >
            <MaterialIcons name="calendar-today" size={18} color="#007bff" />
            <Text style={styles.datePickerText}>
              {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
          </TouchableOpacity>
          {showDate && (
            <DateTimePicker
              value={date}
              mode="date"
              minimumDate={new Date()}
              onChange={(_, d) => { setShowDate(false); if (d) setDate(d); }}
            />
          )}

          {/* Time picker */}
          <Text style={styles.modalLabel}>Preferred time</Text>
          <TouchableOpacity
            style={styles.datePickerBtn}
            onPress={() => setShowTime(true)}
          >
            <MaterialIcons name="access-time" size={18} color="#007bff" />
            <Text style={styles.datePickerText}>
              {time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
          {showTime && (
            <DateTimePicker
              value={time}
              mode="time"
              onChange={(_, t) => { setShowTime(false); if (t) setTime(t); }}
            />
          )}

          {/* Note */}
          <Text style={styles.modalLabel}>Additional note (optional)</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="e.g. I'll be coming with my partner..."
            placeholderTextColor="#aaa"
            multiline
            numberOfLines={3}
            value={note}
            onChangeText={setNote}
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.sendInspectionBtn} onPress={handleSend}>
            <MaterialIcons name="send" size={18} color="#fff" />
            <Text style={styles.sendInspectionText}>Send Request</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ── Main ChatRoom ─────────────────────────────────────────────────────────────
export default function ChatRoom() {
  const router = useRouter();
  const { conversation_id, property_name,property_id  } = useLocalSearchParams() as {
    conversation_id: string;
    property_name:   string;
    property_id:     string;  
  };
  const conversationId = Number(conversation_id);

  const [userId,       setUserId]       = useState<number>(0);
  const [inputText,    setInputText]    = useState('');
  const [inspModalVisible, setInspModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    AsyncStorage.getItem('authUser').then(j => {
      if (j) setUserId(JSON.parse(j).id);
    });
  }, []);

  const {
    messages, loading, sending,
    sendText, sendImage, sendInspection, respondInspection, deleteMessage,
  } = useMessages(conversationId, userId);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleDeleteMessage = (messageId: number, isMine: boolean) => {
  if (!isMine) return; // can only delete own messages
  Alert.alert(
    'Delete message',
    'Delete this message? It will be removed for everyone.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMessage(messageId),
      },
    ]
  );
};


  const handleSend = async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    await sendText(text);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow photo library access.'); return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      await sendImage({
        uri:  asset.uri,
        name: asset.fileName ?? `chat_${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      });
    }
  };

  // ── Date separator helper ─────────────────────────────────────────────────
  const shouldShowDate = (messages: Message[], index: number) => {
    if (index === 0) return true;
    const curr = new Date(messages[index].created_at).toDateString();
    const prev = new Date(messages[index - 1].created_at).toDateString();
    return curr !== prev;
  };

  // ── Render a single message ───────────────────────────────────────────────
const renderMessage = ({ item, index }: { item: Message; index: number }) => {
  const isMine   = item.sender_id === userId;
  const showDate = shouldShowDate(messages, index);

  return (
    <>
      {showDate && (
        <View style={styles.dateSeparator}>
          <Text style={styles.dateSeparatorText}>
            {new Date(item.created_at).toLocaleDateString('en-GB', {
              weekday: 'short', day: '2-digit', month: 'short',
            })}
          </Text>
        </View>
      )}

      <View style={[styles.messageRow, isMine && styles.messageRowMine]}>
        {/* Avatar for received messages */}
        {!isMine && (
          item.sender_avatar ? (
            <Image source={{ uri: item.sender_avatar }} style={styles.msgAvatar} />
          ) : (
            <View style={[styles.msgAvatar, styles.msgAvatarFallback]}>
              <Text style={styles.msgAvatarInitial}>
                {(item.sender_name ?? '?')[0].toUpperCase()}
              </Text>
            </View>
          )
        )}

        {/* ── Long press wrapper — only on own messages ── */}
        <TouchableOpacity
          activeOpacity={1}
          onLongPress={() => isMine && handleDeleteMessage(item.id, isMine)}
          delayLongPress={400}
          style={[styles.messageWrap, isMine && { alignItems: 'flex-end' }]}
        >
          {/* Inspection request */}
          {item.type === 'inspection_request' && (
            <InspectionBubble
              msg={item}
              isMine={isMine}
              onRespond={respondInspection}
            />
          )}

          {/* Image */}
          {item.type === 'image' && item.image_path && (
            <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs, { padding: 4 }]}>
              <Image
                source={{ uri: BASE_URL + item.image_path }}
                style={styles.chatImage}
                resizeMode="cover"
              />
              <Text style={[styles.msgTime, isMine && { color: 'rgba(255,255,255,0.7)' }]}>
                {formatTime(item.created_at)}
              </Text>
            </View>
          )}

          {/* Text */}
          {item.type === 'text' && (
            <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
              <Text style={[styles.msgText, isMine && styles.msgTextMine]}>
                {item.message}
              </Text>
              <View style={styles.msgMeta}>
                <Text style={[styles.msgTime, isMine && { color: 'rgba(255,255,255,0.7)' }]}>
                  {formatTime(item.created_at)}
                </Text>
                {isMine && (
                  <Ionicons
                    name={item.is_read ? 'checkmark-done' : 'checkmark'}
                    size={13}
                    color={item.is_read ? '#93C5FD' : 'rgba(255,255,255,0.6)'}
                    style={{ marginLeft: 3 }}
                  />
                )}
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
};

  return (
     <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
  >
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() =>  router.push({
            pathname: "../Profile/Messages",
          })}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </TouchableOpacity> 

{property_id ? (
  <TouchableOpacity
    style={{ flex: 1 }}
    onPress={() =>
      router.push({
        pathname: '/Home/Company/Details',
        params: { id: property_id },
      })
    }
  >
    <Text style={styles.headerTitle} numberOfLines={1}>
      {property_name ?? 'Chat'}
    </Text>
    <Text style={styles.headerSub}>Tap to view property →</Text>
  </TouchableOpacity>
) : (
  <View style={{ flex: 1 }}>
    <Text style={styles.headerTitle} numberOfLines={1}>
      {property_name ?? 'General Enquiry'}
    </Text>
    <Text style={styles.headerSub}>General enquiry</Text>
  </View>
)}
        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => setInspModal(true)}
        >
          <MaterialIcons name="event" size={20} color="#007bff" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Ionicons name="chatbubble-outline" size={40} color="#ddd" />
              <Text style={styles.emptyChatText}>Say hello to get started!</Text>
            </View>
          }
        />
      )}

      <View style={styles.hintRow}>
        <Text style={styles.hintText}>Hold a sent message to delete it.</Text>
      </View>

      {/* Input bar */}
        <View style={styles.inputBar}>
          {/* Camera / image button */}
          <TouchableOpacity style={styles.inputAction} onPress={handlePickImage}>
            <Ionicons name="image-outline" size={22} color="#888" />
          </TouchableOpacity>

          {/* Calendar / inspection button */}
          <TouchableOpacity style={styles.inputAction} onPress={() => setInspModal(true)}>
            <MaterialIcons name="event" size={22} color="#888" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#aaa"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            onSubmitEditing={handleSend}
          />

          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="send" size={18} color="#fff" />
            }
          </TouchableOpacity>
        </View>
     

      {/* Inspection modal */}
      <InspectionModal
        visible={inspModalVisible}
        onClose={() => setInspModal(false)}
        onSend={sendInspection}
      />
    </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    paddingTop: getStatusBarHeight(),
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5, borderColor: '#e5e7eb',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle:  { fontSize: 15, fontWeight: 'bold', color: '#111' },
  headerSub:    { fontSize: 11, color: '#007bff', marginTop: 1 },
  headerAction: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center',
  },

  // Messages list
  messagesList: { paddingHorizontal: 12, paddingVertical: 10, paddingBottom: 20 },

  dateSeparator: { alignItems: 'center', marginVertical: 12 },
  dateSeparatorText: {
    fontSize: 11, color: '#888',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20,
  },

  messageRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    marginBottom: 6, gap: 6,
  },
  messageRowMine: { flexDirection: 'row-reverse' },

  msgAvatar: { width: 30, height: 30, borderRadius: 15, marginBottom: 4 },
  msgAvatarFallback: {
    backgroundColor: '#B5D4F4', alignItems: 'center', justifyContent: 'center',
  },
  msgAvatarInitial: { fontSize: 12, fontWeight: '700', color: '#0C447C' },

  messageWrap: { maxWidth: '75%' },

  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 2,
  },
  bubbleMine: {
    backgroundColor: '#007bff',
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
  },
  msgText:     { fontSize: 14, color: '#111', lineHeight: 20 },
  msgTextMine: { color: '#fff' },
  msgMeta: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'flex-end', marginTop: 3, gap: 2,
  },
  msgTime: { fontSize: 10, color: '#aaa' },

  chatImage: {
    width: 200, height: 150, borderRadius: 12, marginBottom: 4,
  },

  // Inspection bubble
  inspectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    maxWidth: 260,
    marginBottom: 2,
  },
  inspectionCardMine: { borderColor: '#93C5FD' },
  inspectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, marginBottom: 10,
  },
  inspectionTitle: { fontSize: 14, fontWeight: '700', color: '#1D4ED8' },
  inspectionRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: 6, marginBottom: 5,
  },
  inspectionText:  { fontSize: 13, color: '#444', flex: 1 },
  inspectionStatus: {
    borderRadius: 8, padding: 6, marginTop: 6, alignItems: 'center',
  },
  inspectionStatusText: { fontSize: 12, fontWeight: '700' },
  inspectionActions: {
    flexDirection: 'row', gap: 8, marginTop: 10,
  },
  declineBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: '#EF4444',
    alignItems: 'center',
  },
  declineBtnText: { color: '#EF4444', fontWeight: '600', fontSize: 13 },
  confirmBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    backgroundColor: '#22C55E', alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#fff', gap: 8,
    borderTopWidth: 0.5, borderColor: '#e5e7eb',
  },
  inputAction: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#f3f4f6',
    alignItems: 'center', justifyContent: 'center',
  },
  input: {
    flex: 1, minHeight: 38, maxHeight: 100,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 9,
    fontSize: 14, color: '#111',
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#007bff',
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#93C5FD' },

  hintRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  hintText: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
  },

  // Inspection modal
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 36,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center', marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: '#111' },
  modalClose: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center', justifyContent: 'center',
  },
  modalLabel: {
    fontSize: 13, fontWeight: '600', color: '#555',
    marginBottom: 8, marginTop: 12,
  },
  datePickerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F0F7FF',
    borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  datePickerText: { fontSize: 14, color: '#1D4ED8', fontWeight: '600' },
  modalInput: {
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, padding: 12,
    fontSize: 14, color: '#111',
    minHeight: 80,
  },
  sendInspectionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#007bff',
    borderRadius: 12, paddingVertical: 14,
    marginTop: 20,
  },
  sendInspectionText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  emptyChat: { alignItems: 'center', marginTop: 80, gap: 10 },
  emptyChatText: { fontSize: 14, color: '#ccc' },
});
