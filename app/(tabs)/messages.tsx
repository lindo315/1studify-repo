import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Dimensions, Platform, KeyboardAvoidingView } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Search, MessageCircle, User, Phone, Video, MoveHorizontal as MoreHorizontal, Send, ArrowLeft, Paperclip, Smile, CheckCheck, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConversations, useMessages } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isTablet = width > 768;

export default function MessagesScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const { conversations, loading: conversationsLoading, error: conversationsError } = useConversations();
  const { messages, loading: messagesLoading, error: messagesError, sendMessage } = useMessages(selectedConversation?.id);

  const filteredConversations = conversations.filter(conversation => {
    if (!conversation.match) return false;
    const match = conversation.match;
    const otherUser = profile?.role === 'student' ? match?.tutor : match?.student;
    if (!otherUser) return false;
    const otherUserName = `${otherUser?.first_name || ''} ${otherUser?.last_name || ''}`.toLowerCase();
    
    return otherUserName.includes(searchQuery.toLowerCase());
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const formatLastSeen = (lastSeen: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Online';
    if (diffInHours < 24) return `Last seen ${diffInHours}h ago`;
    return `Last seen ${Math.floor(diffInHours / 24)}d ago`;
  };

  const ConversationItem = ({ conversation }: { conversation: any }) => {
    const match = conversation.match;
    const otherUser = profile?.role === 'student' ? match?.tutor : match?.student;
    const lastMessage = conversation.messages && conversation.messages.length > 0 
      ? conversation.messages[conversation.messages.length - 1] 
      : null;
    
    if (!otherUser) return null;
    
    return (
      <TouchableOpacity 
        style={styles.conversationItem}
        onPress={() => setSelectedConversation(conversation)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Image 
            source={{ 
              uri: otherUser?.avatar_url || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
            }} 
            style={styles.avatar} 
          />
          <View style={styles.onlineIndicator} />
        </View>
        
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <View style={styles.nameContainer}>
              <Text style={styles.conversationName}>
                {otherUser?.first_name} {otherUser?.last_name}
              </Text>
              <Text style={styles.subjectTag}>Study Partner</Text>
            </View>
            <View style={styles.timestampContainer}>
              <Text style={styles.timestamp}>
                {lastMessage ? formatTimestamp(lastMessage.created_at) : formatTimestamp(conversation.created_at)}
              </Text>
            </View>
          </View>
          <View style={styles.conversationFooter}>
            <Text 
              style={styles.lastMessage}
              numberOfLines={2}
            >
              {lastMessage?.content || 'Start a conversation...'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const MessageBubble = ({ message }: { message: any }) => {
    const isOwnMessage = message.sender_id === profile?.id;
    
    return (
      <View style={[
        styles.messageBubbleContainer,
        isOwnMessage ? styles.studentMessageContainer : styles.tutorMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.studentMessage : styles.tutorMessage
        ]}>
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.studentMessageText : styles.tutorMessageText
          ]}>
            {message.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              isOwnMessage ? styles.studentMessageTime : styles.tutorMessageTime
            ]}>
              {new Date(message.created_at).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </Text>
            {isOwnMessage && (
              <View style={styles.messageStatus}>
                <Check size={14} color="rgba(255,255,255,0.7)" />
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const handleSendMessage = async () => {
    if (messageText.trim() && selectedConversation) {
      try {
        await sendMessage(messageText.trim());
        setMessageText('');
        // Auto scroll to bottom
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  useEffect(() => {
    // Auto scroll to bottom when conversation loads
    if (selectedConversation && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 300);
    }
  }, [selectedConversation, messages]);

  // Loading state
  if (conversationsLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.loadingContainer}>
          <MessageCircle size={64} color="#fff" />
          <Text style={styles.loadingTitle}>Loading conversations...</Text>
          <Text style={styles.loadingSubtitle}>Getting your messages ready</Text>
        </LinearGradient>
      </View>
    );
  }

  // Error state
  if (conversationsError) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.loadingContainer}>
          <Text style={styles.loadingTitle}>Error loading conversations</Text>
          <Text style={styles.loadingSubtitle}>{conversationsError}</Text>
        </LinearGradient>
      </View>
    );
  }

  if (selectedConversation) {
    const match = selectedConversation.match;
    const otherUser = profile?.role === 'student' ? match?.tutor : match?.student;
    
    return (
      <KeyboardAvoidingView 
        style={[styles.container, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Enhanced Chat Header */}
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.chatHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedConversation(null)}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.chatHeaderInfo} activeOpacity={0.8}>
            <View style={styles.chatAvatarContainer}>
              <Image 
                source={{ 
                  uri: otherUser?.avatar_url || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
                }} 
                style={styles.chatAvatar} 
              />
              <View style={styles.chatOnlineIndicator} />
            </View>
            <View style={styles.chatHeaderText}>
              <Text style={styles.chatHeaderName}>
                {otherUser?.first_name} {otherUser?.last_name}
              </Text>
              <Text style={styles.chatHeaderStatus}>Online</Text>
              <Text style={styles.chatHeaderSubject}>Study Partner</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.chatHeaderActions}>
            <TouchableOpacity style={styles.chatHeaderButton} activeOpacity={0.7}>
              <Phone size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.chatHeaderButton} activeOpacity={0.7}>
              <Video size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.chatHeaderButton} activeOpacity={0.7}>
              <MoreHorizontal size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Enhanced Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer} 
          contentContainerStyle={[
            styles.messagesContent, 
            { paddingBottom: Math.max(insets.bottom + 16, 24) }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sessionInfo}>
            <LinearGradient 
              colors={['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)']} 
              style={styles.sessionInfoContainer}
            >
              <Text style={styles.sessionInfoText}>
                🎯 Study Partnership
              </Text>
              <Text style={styles.sessionInfoSubtext}>
                Keep your conversation focused and productive
              </Text>
            </LinearGradient>
          </View>
          
          {messagesLoading ? (
            <View style={styles.messagesLoading}>
              <Text style={styles.messagesLoadingText}>Loading messages...</Text>
            </View>
          ) : (
            messages.map(message => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
        </ScrollView>

        {/* Enhanced Message Input */}
        <View style={[
          styles.messageInputContainer, 
          { paddingBottom: Math.max(insets.bottom + 8, 16) }
        ]}>
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.attachButton} activeOpacity={0.7}>
              <Paperclip size={20} color="#667eea" />
            </TouchableOpacity>
            
            <TextInput
              style={[styles.messageInput, messageText.length > 0 && styles.messageInputActive]}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={1000}
            />
            
            <TouchableOpacity style={styles.emojiButton} activeOpacity={0.7}>
              <Smile size={20} color="#999" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.sendButton, 
                messageText.trim() && styles.sendButtonActive
              ]}
              onPress={handleSendMessage}
              activeOpacity={0.8}
            >
              <Send size={18} color={messageText.trim() ? '#fff' : '#999'} />
            </TouchableOpacity>
          </View>
          
          {messageText.length > 800 && (
            <Text style={styles.characterCount}>
              {messageText.length}/1000
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Messages</Text>
            <Text style={styles.headerSubtitle}>
              {filteredConversations.length} conversations
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.searchToggle}
            onPress={() => setIsSearchVisible(!isSearchVisible)}
            activeOpacity={0.7}
          >
            <Search size={isSmallScreen ? 18 : 20} color="#667eea" />
          </TouchableOpacity>
        </View>
      </View>

      {(isSearchVisible || searchQuery) && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={18} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search conversations..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={isSearchVisible}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearSearch}
                activeOpacity={0.7}
              >
                <Text style={styles.clearSearchText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={[
          styles.contentContainer, 
          { paddingBottom: Math.max(insets.bottom + 100, 120) }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filteredConversations.length > 0 ? (
          filteredConversations.map(conversation => (
            <ConversationItem key={conversation.id} conversation={conversation} />
          ))
        ) : searchQuery ? (
          <View style={styles.emptySearch}>
            <Search size={48} color="#ccc" />
            <Text style={styles.emptySearchTitle}>No results found</Text>
            <Text style={styles.emptySearchText}>
              Try searching for a different name
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.emptyStateGradient}>
              <MessageCircle size={64} color="#fff" />
              <Text style={styles.emptyStateTitle}>No messages yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Start matching with tutors to begin conversations and get the help you need
              </Text>
              <TouchableOpacity style={styles.browseButton} activeOpacity={0.8}>
                <Text style={styles.browseButtonText}>Find Tutors</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: isSmallScreen ? 16 : 24,
    borderRadius: 24,
    padding: isSmallScreen ? 32 : 40,
  },
  loadingTitle: {
    fontSize: isSmallScreen ? 20 : 24,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: isSmallScreen ? 14 : 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: isSmallScreen ? 16 : 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: isSmallScreen ? 24 : 28,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: isSmallScreen ? 13 : 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  searchToggle: {
    width: isSmallScreen ? 36 : 40,
    height: isSmallScreen ? 36 : 40,
    borderRadius: isSmallScreen ? 18 : 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    paddingHorizontal: isSmallScreen ? 16 : 24,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  clearSearch: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#667eea',
    borderRadius: 8,
  },
  clearSearchText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: isSmallScreen ? 12 : 16,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: isSmallScreen ? 16 : 20,
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginBottom: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: isSmallScreen ? 44 : 48,
    height: isSmallScreen ? 44 : 48,
    borderRadius: isSmallScreen ? 22 : 24,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    backgroundColor: '#10b981',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  nameContainer: {
    flex: 1,
  },
  conversationName: {
    fontSize: isSmallScreen ? 15 : 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  subjectTag: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  timestampContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    flex: 1,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    marginTop: 40,
  },
  emptyStateGradient: {
    alignItems: 'center',
    padding: isSmallScreen ? 32 : 40,
    borderRadius: 24,
    width: '100%',
  },
  emptyStateTitle: {
    fontSize: isSmallScreen ? 18 : 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  browseButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  browseButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  emptySearch: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptySearchTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySearchText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
  // Chat Screen Styles
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  chatHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  chatAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  chatOnlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    backgroundColor: '#10b981',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#667eea',
  },
  chatHeaderText: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  chatHeaderStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.8)',
  },
  chatHeaderSubject: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  chatHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  chatHeaderButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 18,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  messagesContent: {
    padding: 16,
  },
  messagesLoading: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  messagesLoadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  sessionInfo: {
    marginBottom: 20,
  },
  sessionInfoContainer: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  sessionInfoText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#667eea',
    marginBottom: 4,
  },
  sessionInfoSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
    textAlign: 'center',
  },
  messageBubbleContainer: {
    marginBottom: 12,
    maxWidth: '85%',
  },
  studentMessageContainer: {
    alignSelf: 'flex-end',
  },
  tutorMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  studentMessage: {
    backgroundColor: '#667eea',
    borderBottomRightRadius: 6,
  },
  tutorMessage: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  studentMessageText: {
    color: '#fff',
  },
  tutorMessageText: {
    color: '#333',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  studentMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  tutorMessageTime: {
    color: '#999',
  },
  messageStatus: {
    marginLeft: 8,
  },
  messageInputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    maxHeight: 100,
    backgroundColor: '#fff',
  },
  messageInputActive: {
    borderColor: '#667eea',
  },
  emojiButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#667eea',
  },
  characterCount: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
});