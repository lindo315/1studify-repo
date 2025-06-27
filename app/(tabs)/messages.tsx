import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Search, ArrowLeft, Send } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConversations, useMessages } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';

export default function MessagesScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messageText, setMessageText] = useState('');

  const { conversations } = useConversations();
  const { messages, sendMessage } = useMessages(selectedConversation?.id);

  const filteredConversations = conversations.filter(conversation => {
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
    
    if (diffInHours < 1) return 'Now';
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSendMessage = async () => {
    if (messageText.trim() && selectedConversation) {
      try {
        await sendMessage(messageText.trim());
        setMessageText('');
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  const ConversationItem = ({ conversation }: { conversation: any }) => {
    const match = conversation.match;
    const otherUser = profile?.role === 'student' ? match?.tutor : match?.student;
    const lastMessage = conversation.messages?.[conversation.messages.length - 1];
    
    if (!otherUser) return null;
    
    return (
      <TouchableOpacity 
        style={styles.conversationItem}
        onPress={() => setSelectedConversation(conversation)}
        activeOpacity={0.7}
      >
        <Image 
          source={{ 
            uri: otherUser?.avatar_url || 'https://via.placeholder.com/50'
          }} 
          style={styles.avatar} 
        />
        
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationName}>
              {otherUser?.first_name} {otherUser?.last_name}
            </Text>
            <Text style={styles.timestamp}>
              {lastMessage ? formatTimestamp(lastMessage.created_at) : ''}
            </Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {lastMessage?.content || 'Start a conversation...'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (selectedConversation) {
    const match = selectedConversation.match;
    const otherUser = profile?.role === 'student' ? match?.tutor : match?.student;
    
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedConversation(null)}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatHeaderName}>
              {otherUser?.first_name} {otherUser?.last_name}
            </Text>
            <Text style={styles.chatHeaderStatus}>Online</Text>
          </View>
          
          <Image 
            source={{ 
              uri: otherUser?.avatar_url || 'https://via.placeholder.com/40'
            }} 
            style={styles.chatAvatar} 
          />
        </View>

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer} 
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(message => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.sender_id === profile?.id ? styles.sentMessage : styles.receivedMessage
              ]}
            >
              <Text style={[
                styles.messageText,
                message.sender_id === profile?.id ? styles.sentMessageText : styles.receivedMessageText
              ]}>
                {message.content}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Message Input */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <View style={[styles.messageInputContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.messageInput}
                placeholder="Type a message..."
                placeholderTextColor="#9CA3AF"
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={1000}
              />
              <TouchableOpacity 
                style={[styles.sendButton, messageText.trim() && styles.sendButtonActive]}
                onPress={handleSendMessage}
                disabled={!messageText.trim()}
                activeOpacity={0.7}
              >
                <Send size={20} color={messageText.trim() ? '#fff' : '#9CA3AF'} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Conversations */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {filteredConversations.length > 0 ? (
          filteredConversations.map(conversation => (
            <ConversationItem key={conversation.id} conversation={conversation} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No messages yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Start matching with tutors to begin conversations
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  lastMessage: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
  },
  // Chat Screen Styles
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  chatHeaderStatus: {
    fontSize: 12,
    fontWeight: '400',
    color: '#10B981',
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  messagesContent: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#7C3AED',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  sentMessageText: {
    color: '#fff',
  },
  receivedMessageText: {
    color: '#1F2937',
  },
  messageInputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '400',
    maxHeight: 100,
    color: '#1F2937',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#7C3AED',
  },
});