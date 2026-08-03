import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import {
    GestureResponderEvent,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export default function VideoPreview() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams();
  const videoViewRef = useRef<VideoView>(null);

  const track = String(params.track || params.trackName || 'ไม่รัก...ไม่ต้อง');
  const artist = String(params.artist || params.artistName || 'New & Jiew');
  const previewUrl = String(params.preview_url || params.previewUrl || '');

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  const player = useVideoPlayer(previewUrl, (p) => {
    p.loop = true;
    p.volume = 0.8;
    p.play();
  });

  useEffect(() => {
    if (!player) return;

    const playingSub = player.addListener('playingChange', (event) => {
      setIsPlaying(event.isPlaying);
    });

    const volumeSub = player.addListener('volumeChange', (event) => {
      setVolume(event.volume);
      setIsMuted(event.isMuted);
    });

    const interval = setInterval(() => {
      if (player && !isSeeking) {
        setCurrentTime(player.currentTime || 0);
        if (player.duration && player.duration > 0) {
          setDuration(player.duration);
        }
      }
    }, 200);

    return () => {
      playingSub.remove();
      volumeSub.remove();
      clearInterval(interval);
    };
  }, [player, isSeeking]);

  // Handle Safe Navigation
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const togglePlayPause = () => {
    if (!player) return;
    if (isPlaying) player.pause();
    else player.play();
  };

  // Direct Seek functionality
  const handleSeekPress = (e: GestureResponderEvent, barWidth: number) => {
    if (!player || duration <= 0) return;
    const clickX = e.nativeEvent.locationX;
    const newRatio = Math.max(0, Math.min(1, clickX / barWidth));
    const newTime = newRatio * duration;
    setCurrentTime(newTime);
    player.currentTime = newTime;
  };

  // Direct Volume adjustment functionality
  const handleVolumePress = (e: GestureResponderEvent, barWidth: number) => {
    if (!player) return;
    const clickX = e.nativeEvent.locationX;
    const newVol = Math.max(0, Math.min(1, clickX / barWidth));
    player.volume = newVol;
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      player.muted = false;
    }
  };

  const changeVolumeByStep = (delta: number) => {
    if (!player) return;
    const nextVol = Math.min(1, Math.max(0, volume + delta));
    player.volume = nextVol;
    setVolume(nextVol);
  };

  const toggleMute = () => {
    if (!player) return;
    player.muted = !player.muted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (videoViewRef.current) {
      videoViewRef.current.enterFullscreen();
    }
  };

  const videoWidth = Math.min(width - 32, 360);
  const videoHeight = (videoWidth * 9) / 16;
  const progressRatio = duration > 0 ? Math.min(1, currentTime / duration) : 0;
  const activeVolume = isMuted ? 0 : volume;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>MUSIC VIDEO</Text>
        </View>

        <TouchableOpacity style={styles.moreBtn} activeOpacity={0.7}>
          <Text style={styles.moreIcon}>•••</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Video Player Box */}
        <View style={[styles.videoContainer, { width: videoWidth, height: videoHeight }]}>
          <VideoView
            ref={videoViewRef}
            style={styles.videoPlayer}
            player={player}
            nativeControls={false}
            allowsFullscreen
            allowsPictureInPicture
          />
          <TouchableOpacity 
            style={styles.fullscreenBadgeBtn} 
            onPress={handleFullscreen} 
            activeOpacity={0.8}
          >
            <Text style={styles.fullscreenBadgeIcon}>⛶</Text>
          </TouchableOpacity>
        </View>

        {/* Track Title */}
        <View style={styles.infoRow}>
          <Text style={styles.trackTitle} numberOfLines={1}>{track}</Text>
          <Text style={styles.artistName} numberOfLines={1}>{artist}</Text>
        </View>

        {/* Interactive Progress Bar (กดเพื่อ Seek ได้) */}
        <View style={styles.progressSection}>
          <TouchableOpacity 
            activeOpacity={1}
            style={styles.progressTouchArea}
            onPress={(e) => handleSeekPress(e, videoWidth)}
          >
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressRatio * 100}%` }]} />
              <View style={[styles.progressThumb, { left: `${progressRatio * 100}%` }]} />
            </View>
          </TouchableOpacity>
          
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>-{formatTime(Math.max(0, duration - currentTime))}</Text>
          </View>
        </View>

        {/* Play Control */}
        <TouchableOpacity style={styles.playPauseBtn} onPress={togglePlayPause} activeOpacity={0.85}>
          <Text style={styles.playPauseIcon}>{isPlaying ? '❚❚' : '▶'}</Text>
        </TouchableOpacity>

        {/* Interactive Volume Controls (กด/ปรับเสียงได้จริง) */}
        <View style={styles.volumeContainer}>
          <TouchableOpacity onPress={toggleMute} activeOpacity={0.7} style={styles.muteBtn}>
            <Text style={styles.volumeIconText}>
              {isMuted || activeVolume === 0 ? '🔇' : activeVolume < 0.5 ? '🔉' : '🔊'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.volStepBtn} onPress={() => changeVolumeByStep(-0.1)} activeOpacity={0.7}>
            <Text style={styles.volStepText}>−</Text>
          </TouchableOpacity>

          {/* Interactive Volume Bar */}
          <TouchableOpacity 
            activeOpacity={1} 
            style={styles.volBarTouchArea}
            onPress={(e) => handleVolumePress(e, 140)}
          >
            <View style={styles.volMeterBg}>
              <View style={[styles.volMeterFill, { width: `${activeVolume * 100}%` }]} />
              <View style={[styles.volThumb, { left: `${activeVolume * 100}%` }]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.volStepBtn} onPress={() => changeVolumeByStep(0.1)} activeOpacity={0.7}>
            <Text style={styles.volStepText}>+</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0C' },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#18181B',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  backIcon: { color: '#FF3B30', fontSize: 16, fontWeight: '700', marginRight: 4 },
  backText: { color: '#F2F2F7', fontSize: 13, fontWeight: '600' },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#8E8E93', fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  moreBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justify: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  moreIcon: { color: '#F2F2F7', fontSize: 10, letterSpacing: 1 },
  scrollContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 24,
  },
  videoContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    position: 'relative',
  },
  videoPlayer: { width: '100%', height: '100%' },
  fullscreenBadgeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justify: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  fullscreenBadgeIcon: { color: '#FFF', fontSize: 12 },
  infoRow: { width: '100%', alignItems: 'center', gap: 4 },
  trackTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  artistName: { color: '#98989D', fontSize: 15, fontWeight: '500', textAlign: 'center' },
  progressSection: { width: '100%', gap: 8 },
  progressTouchArea: { paddingVertical: 8, width: '100%' },
  progressBarBg: { width: '100%', height: 6, backgroundColor: '#2C2C2E', borderRadius: 3, position: 'relative' },
  progressBarFill: { height: '100%', backgroundColor: '#FF3B30', borderRadius: 3 },
  progressThumb: {
    position: 'absolute',
    top: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    marginLeft: -6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 },
  timeText: { color: '#8E8E93', fontSize: 12, fontWeight: '600' },
  playPauseBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FF3B30',
    justify: 'center',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  playPauseIcon: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginLeft: 2 },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    gap: 12,
  },
  muteBtn: { padding: 2 },
  volumeIconText: { fontSize: 16 },
  volStepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2C2C2E',
    justify: 'center',
    alignItems: 'center',
  },
  volStepText: { color: '#F2F2F7', fontSize: 16, fontWeight: '600' },
  volBarTouchArea: { width: 140, paddingVertical: 10 },
  volMeterBg: { width: '100%', height: 4, backgroundColor: '#3A3A3C', borderRadius: 2, position: 'relative' },
  volMeterFill: { height: '100%', backgroundColor: '#F2F2F7', borderRadius: 2 },
  volThumb: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    marginLeft: -6,
  },
});