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
  TouchableOpacity,
  View
} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';


const mockNotifications = [
  {
    id: 1,
    type: 'review',
    user: 'Geraldo',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
    action: 'Just giving 5 Star review on your listing',
    property: 'Fairview Apartment',
    propertyImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=60&h=60&fit=crop',
    time: '40 mins ago',
    isToday: true
  },
  {
    id: 2,
    type: 'review',
    user: 'Walter Lindsey',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face',
    action: 'Just giving 5 Star review on your listing',
    property: 'Schoolview House',
    propertyImage: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=60&h=60&fit=crop',
    time: '2 Days ago',
    isToday: false
  },
  {
    id: 3,
    type: 'review',
    user: 'Samuel Ella',
    avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=50&h=50&fit=crop&crop=face',
    action: 'Just giving 4 Star review on your listing',
    property: 'Fairview Apartment',
    propertyImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=60&h=60&fit=crop',
    time: '7 Days ago',
    isToday: false
  },
  {
    id: 4,
    type: 'message',
    user: 'Emmett Perry',
    avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=50&h=50&fit=crop&crop=face',
    action: 'Just messaged you. Check the message in message tab.',
    time: '10 mins ago',
    isToday: true
  },
  {
    id: 5,
    type: 'purchase',
    user: 'Walter Lindsey',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face',
    action: 'Just buy your listing',
    property: 'Schoolview House',
    propertyImage: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=60&h=60&fit=crop',
    time: '4 hours ago',
    isToday: true
  },
  {
    id: 6,
    type: 'favorite',
    user: 'Velma Cole',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
    action: 'Just favorited your listing',
    property: 'Schoolview House',
    propertyImage: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=60&h=60&fit=crop',
    time: '2 Days ago',
    isToday: false
  }
];



// Notifications Screen Component
const NotificationsScreen = ({ onBack, onSwitchToMessages }) => {
  const [activeTab, setActiveTab] = useState('Review');
  const [notifications, setNotifications] = useState(mockNotifications);

  const filterNotifications = (type) => {
    switch (type) {
      case 'Review':
        return notifications.filter(n => n.type === 'review');
      case 'Sold':
        return notifications.filter(n => n.type === 'purchase');
      case 'House':
        return notifications.filter(n => n.type === 'favorite');
      default:
        return notifications;
    }
  };

  const deleteNotification = (id) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => setNotifications(notifications.filter(n => n.id !== id)) }
      ]
    );
  };

  const todayNotifications = filterNotifications(activeTab).filter(n => n.isToday);
  const olderNotifications = filterNotifications(activeTab).filter(n => !n.isToday);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
     
      </View>

    

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {['All', 'Review', 'Sold', 'House'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.filterTab,
              activeTab === tab && styles.activeFilterTab
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.filterTabText,
              activeTab === tab && styles.activeFilterTabText
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Today Section */}
        {todayNotifications.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Today</Text>
            {todayNotifications.map((notification, index) => (
              <View key={notification.id} style={styles.notificationItem}>
                <Image source={{ uri: notification.avatar }} style={styles.avatar} />
                <View style={styles.notificationContent}>
                  <Text style={styles.userName}>{notification.user}</Text>
                  <Text style={styles.notificationText}>{notification.action}</Text>
                  {notification.property && (
                    <Text style={styles.propertyName}>{notification.property}</Text>
                  )}
                  <Text style={styles.timeText}>{notification.time}</Text>
                </View>
                {notification.propertyImage && (
                  <Image source={{ uri: notification.propertyImage }} style={styles.propertyThumbnail} />
                )}
                {index === 1 && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteNotification(notification.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </>
        )}

        {/* Older Notifications Section */}
        {olderNotifications.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Older notifications</Text>
            {olderNotifications.map((notification) => (
              <View key={notification.id} style={styles.notificationItem}>
                <Image source={{ uri: notification.avatar }} style={styles.avatar} />
                <View style={styles.notificationContent}>
                  <Text style={styles.userName}>{notification.user}</Text>
                  <Text style={styles.notificationText}>{notification.action}</Text>
                  {notification.property && (
                    <Text style={styles.propertyName}>{notification.property}</Text>
                  )}
                  <Text style={styles.timeText}>{notification.time}</Text>
                </View>
                {notification.propertyImage && (
                  <Image source={{ uri: notification.propertyImage }} style={styles.propertyThumbnail} />
                )}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};


// Main App Component
const Notifications = () => {
  const [currentScreen, setCurrentScreen] = useState('notifications'); // 'notifications',


 const router = useRouter();
  const handleBack = () => {
    
    router.back();
  
  };

  const renderScreen = () => {
    switch (currentScreen) {
     
      case 'notifications':
      default:
        return (
          <NotificationsScreen
            onBack={handleBack}
            onSwitchToMessages={() => setCurrentScreen('messages')}
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