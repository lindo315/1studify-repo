import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Camera, RotateCcw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CallSession } from '@/types/enhancements';

interface VideoCallModalProps {
  visible: boolean;
  onClose: () => void;
  callSession: CallSession | null;
  onEndCall: () => void;
}

const { width, height } = Dimensions.get('window');

export default function VideoCallModal({ visible, onClose, callSession, onEndCall }: VideoCallModalProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (callSession && isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callSession, isConnected]);

  useEffect(() => {
    if (callSession) {
      // Simulate connection after 2 seconds
      setTimeout(() => {
        setIsConnected(true);
      }, 2000);
    }
  }, [callSession]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallDuration(0);
    setIsConnected(false);
    onEndCall();
  };

  if (!callSession) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Video Area */}
        <View style={styles.videoContainer}>
          {!isConnected ? (
            <View style={styles.connectingContainer}>
              <LinearGradient colors={['#667eea', '#764ba2']} style={styles.connectingGradient}>
                <Video size={64} color="#fff" />
                <Text style={styles.connectingText}>Connecting...</Text>
                <Text style={styles.participantText}>
                  Calling {callSession.participants.length} participant(s)
                </Text>
              </LinearGradient>
            </View>
          ) : (
            <>
              {/* Remote Video */}
              <View style={styles.remoteVideo}>
                <LinearGradient colors={['#667eea', '#764ba2']} style={styles.videoPlaceholder}>
                  <Video size={48} color="#fff" />
                  <Text style={styles.participantName}>Sarah Chen</Text>
                </LinearGradient>
              </View>

              {/* Local Video */}
              <View style={styles.localVideo}>
                <LinearGradient colors={['#333', '#555']} style={styles.localVideoContent}>
                  {isVideoEnabled ? (
                    <>
                      <Camera size={24} color="#fff" />
                      <Text style={styles.localVideoText}>You</Text>
                    </>
                  ) : (
                    <>
                      <VideoOff size={24} color="#fff" />
                      <Text style={styles.localVideoText}>Video Off</Text>
                    </>
                  )}
                </LinearGradient>
              </View>
            </>
          )}
        </View>

        {/* Call Info */}
        {isConnected && (
          <View style={styles.callInfo}>
            <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
            <Text style={styles.callStatus}>Connected</Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, !isAudioEnabled && styles.controlButtonDisabled]}
            onPress={() => setIsAudioEnabled(!isAudioEnabled)}
          >
            {isAudioEnabled ? (
              <Mic size={24} color="#fff" />
            ) : (
              <MicOff size={24} color="#fff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, !isVideoEnabled && styles.controlButtonDisabled]}
            onPress={() => setIsVideoEnabled(!isVideoEnabled)}
          >
            {isVideoEnabled ? (
              <Video size={24} color="#fff" />
            ) : (
              <VideoOff size={24} color="#fff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <RotateCcw size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.endCallButton}
            onPress={handleEndCall}
          >
            <PhoneOff size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Additional Features */}
        <View style={styles.additionalControls}>
          <TouchableOpacity style={styles.featureButton}>
            <Text style={styles.featureButtonText}>Share Screen</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.featureButton}>
            <Text style={styles.featureButtonText}>Whiteboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.featureButton}>
            <Text style={styles.featureButtonText}>Record</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  connectingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingGradient: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
  },
  connectingText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  participantText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.8)',
  },
  remoteVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    width: width * 0.8,
    height: height * 0.6,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantName: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginTop: 16,
  },
  localVideo: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
  },
  localVideoContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideoText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    marginTop: 8,
  },
  callInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  callDuration: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  callStatus: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#10b981',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
    gap: 20,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonDisabled: {
    backgroundColor: '#ef4444',
  },
  endCallButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  featureButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  featureButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#fff',
  },
});