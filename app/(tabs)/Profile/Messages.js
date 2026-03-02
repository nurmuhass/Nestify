import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

// Mock data
const mockMessages = [
  {
    id: 1,
    name: 'Milano',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
    isOnline: true,
    lastMessage: 'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
    time: '10:45',
    unread: 2,
    property: {
      name: 'Sky Dandelions Apartment',
      rating: 4.9,
      location: 'Jakarta, Indonesia',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&h=200&fit=crop'
    }
  }
];



const mockChats = [
  {
    id: 1,
    name: 'Milano',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
    lastMessage: 'tempor incididunt ut labore et dolore',
    time: '10:45',
    unread: 2
  },
  {
    id: 2,
    name: 'Samuel Ella',
    avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=50&h=50&fit=crop&crop=face',
    lastMessage: 'Lorem ipsum dolor sit amet',
    time: '11:00',
    unread: 0
  },
  {
    id: 3,
    name: 'Emmet Perry',
    avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=50&h=50&fit=crop&crop=face',
    lastMessage: 'Excepteur sint occaecat cupidatat non',
    time: '12:30',
    unread: 0
  },
  {
    id: 4,
    name: 'Walter Lindsey',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face',
    lastMessage: 'Quis nostrud exercitation ullamco',
    time: '1 Day ago',
    unread: 0
  },
  {
    id: 5,
    name: 'Velma Cole',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
    lastMessage: 'Excepteur sint occaecat cupidatat non',
    time: '2 Days ago',
    unread: 0
  }
];

// Chat Screen Component
const ChatScreen = ({ contact, onBack }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod?',
      isSent: false,
      time: '10:45'
    },
    {
      id: 2,
      text: 'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
      isSent: true,
      time: '10:46'
    }
  ]);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message,
        isSent: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.contactInfo}>
          <Image source={{ uri: contact.avatar }} style={styles.headerAvatar} />
          <View>
            <Text style={styles.contactName}>{contact.name}</Text>
            <Text style={styles.onlineStatus}>Online</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.callButton}>
          <Ionicons name="call-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Date Separator */}
      <View style={styles.dateSeparator}>
        <Text style={styles.dateText}>December 12, 2022</Text>
      </View>

      {/* Property Card */}
      <View style={styles.propertyCard}>
        <Image source={{ uri: contact.property?.image }} style={styles.propertyImage} />
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyName}>{contact.property?.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.rating}>{contact.property?.rating}</Text>
          </View>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={12} color="#666" />
            <Text style={styles.location}>{contact.property?.location}</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        {messages.map((msg) => (
          <View key={msg.id} style={[
            styles.messageWrapper,
            msg.isSent ? styles.sentMessageWrapper : styles.receivedMessageWrapper
          ]}>
            <View style={[
              styles.messageBubble,
              msg.isSent ? styles.sentMessage : styles.receivedMessage
            ]}>
              <Text style={[
                styles.messageText,
                msg.isSent ? styles.sentMessageText : styles.receivedMessageText
              ]}>
                {msg.text}
              </Text>
            </View>
            <Text style={styles.messageTime}>{msg.time}</Text>
            {msg.isSent && (
              <Ionicons name="checkmark-done" size={16} color="#4CAF50" style={styles.checkmark} />
            )}
          </View>
        ))}
      </ScrollView>

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="camera-outline" size={24} color="#666" />
        </TouchableOpacity>
        <TextInput
          style={styles.messageInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Say something"
          multiline
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


// Messages List Screen Component
const MessagesScreen = ({ onBack, onChatSelect}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState(mockChats);

  const deleteChat = (chatId) => {
    Alert.alert(
      "Delete Chat",
      "Are you sure you want to delete this chat?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => setChats(chats.filter(chat => chat.id !== chatId)) }
      ]
    );
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
       
      </View>



      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>All chats</Text>
        
        {filteredChats.map((chat, index) => (
          <TouchableOpacity
            key={chat.id}
            style={[
              styles.chatItem,
              index === 2 && styles.highlightedChatItem
            ]}
            onPress={() => onChatSelect(chat)}
          >
            <Image source={{ uri: chat.avatar }} style={styles.avatar} />
            <View style={styles.chatContent}>
              <View style={styles.chatHeader}>
                <Text style={styles.chatName}>{chat.name}</Text>
                <Text style={styles.chatTime}>{chat.time}</Text>
              </View>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {chat.lastMessage}
              </Text>
            </View>
            {chat.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{chat.unread}</Text>
              </View>
            )}
            {index === 2 && (
              <TouchableOpacity
                style={styles.deleteChatButton}
                onPress={() => deleteChat(chat.id)}
              >
                <Ionicons name="trash-outline" size={20} color="white" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// Main App Component
const Notifications = () => {
  const [currentScreen, setCurrentScreen] = useState('messages'); // 'notifications', 'messages', 'chat'
  const [selectedContact, setSelectedContact] = useState(null);

  const handleChatSelect = (contact) => {
    const fullContact = {
      ...contact,
      property: mockMessages[0].property // Add property info for demo
    };
    setSelectedContact(fullContact);
    setCurrentScreen('chat');
  };
  const router = useRouter();
  const handleBack = () => {
    if (currentScreen === 'chat') {
      setCurrentScreen('messages');
    } else {
        router.back();
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'chat':
        return (
          <ChatScreen
            contact={selectedContact}
            onBack={handleBack}
          />
        );
      case 'messages':
        return (
          <MessagesScreen
            onBack={handleBack}
            onChatSelect={handleChatSelect}
          
          />
        );

    }
  };

  return renderScreen();
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop:getStatusBarHeight()
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
  },
  backButton: {
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  onlineStatus: {
    fontSize: 14,
    color: '#4CAF50',
  },
  callButton: {
    padding: 8,
  },
  tabSwitcher: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#e3f2fd',
    borderRadius: 25,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 22,
  },
  activeTab: {
    backgroundColor: '#1976d2',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#e0e0e0',
  },
  activeFilterTab: {
    backgroundColor: '#2196F3',
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    position: 'relative',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    position: 'relative',
  },
  highlightedChatItem: {
    backgroundColor: '#e3f2fd',
    marginHorizontal: -20,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
    marginRight: 10,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  notificationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  propertyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
  },
  propertyThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  deleteButton: {
    position: 'absolute',
    right: -80,
    top: 15,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteChatButton: {
    position: 'absolute',
    right: -80,
    top: 20,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dateText: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    fontSize: 12,
    color: '#666',
  },
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  propertyInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  rating: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messageWrapper: {
    marginBottom: 15,
  },
  sentMessageWrapper: {
    alignItems: 'flex-end',
  },
  receivedMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  sentMessage: {
    backgroundColor: '#2196F3',
    borderBottomRightRadius: 4,
  },
  receivedMessage: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  sentMessageText: {
    color: 'white',
  },
  receivedMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  checkmark: {
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
    },
})