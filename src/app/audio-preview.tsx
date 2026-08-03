import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
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

export default function AudioPreview() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams();

  const track = String(params.track || params.trackName || 'Unknown Track');
  const artist = String(params.artist || params.artistName || 'Unknown Artist');
  const coverUrl = String(params.cover_url || params.artworkUrl100 || 'https://via.placeholder.com/300');
  const previewUrl = String(params.preview_url || params.previewUrl || '');

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [isLiked, setIsLiked] = useState(false);

  const player = useVideoPlayer(previewUrl, (p) => {
    p.loop = true;
    p.play();
  });

  useEffect(() => {
    if (!player) return;
    const interval = setInterval(() => {
      if (player) {
        setIsPlaying(player.playing);
        setCurrentTime(player.currentTime || 0);
        if (player.duration && player.duration > 0) {
          setDuration(player.duration);
        }
      }
    }, 250);
    return () => clearInterval(interval);
  }, [player]);

  const togglePlayPause = () => {
    if (!player) return;
    if (isPlaying) player.pause();
    else player.play();
  };

  const imageSize = Math.min(width * 0.72, 300);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerCategory}>NOW PLAYING</Text>
        <TouchableOpacity activeOpacity={0.7}><Text style={styles.moreIcon}>⋮</Text></TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {/* Cover Image & Hidden Audio Engine */}
        <View style={[styles.artContainer, { width: imageSize, height: imageSize }]}>
          <View style={[styles.artGlow, { width: imageSize, height: imageSize }]} />
          <Image
            style={[styles.albumArt, { width: imageSize, height: imageSize }]}
            source={{ uri: coverUrl }}
            resizeMode="cover"
          />
          <VideoView style={styles.hiddenAudio} player={player} nativeControls={false} />
        </View>

        {/* Info */}
        <View style={styles.infoRow}>
          <View style={styles.textDetails}>
            <Text style={styles.trackTitle} numberOfLines={1}>{track}</Text>
            <Text style={styles.artistName} numberOfLines={1}>{artist}</Text>
          </View>
          <TouchableOpacity onPress={() => setIsLiked(!isLiked)} activeOpacity={0.7}>
            <Text style={[styles.heartIcon, isLiked && styles.heartActive]}>{isLiked ? '♥' : '♡'}</Text>
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.max(0, (currentTime / (duration || 1)) * 100))}%` }]} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>-{formatTime(Math.max(0, duration - currentTime))}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsRow}>
   
          <TouchableOpacity><Text style={styles.mainControlIcon}>⏮</Text></TouchableOpacity>
          <TouchableOpacity style={styles.playPauseBtn} onPress={togglePlayPause} activeOpacity={0.85}>
            <Text style={styles.playPauseIcon}>{isPlaying ? '❚❚' : '▶'}</Text>
          </TouchableOpacity>
          <TouchableOpacity><Text style={styles.mainControlIcon}>⏭</Text></TouchableOpacity>
        
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070204' },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  backBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)' },
  backIcon: { color: '#FA233B', fontSize: 20, marginTop: -2, marginRight: 4 },
  backText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  headerCategory: { color: '#71717A', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  moreIcon: { color: '#D4D4D8', fontSize: 20, fontWeight: 'bold' },
  mainContent: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16 },
  artContainer: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  artGlow: { position: 'absolute', borderRadius: 24, backgroundColor: '#FA233B', opacity: 0.25, transform: [{ scale: 1.05 }] },
  albumArt: { borderRadius: 20, backgroundColor: '#1C1917' },
  hiddenAudio: { width: 1, height: 1, opacity: 0, position: 'absolute' },
  infoRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  textDetails: { flex: 1, marginRight: 12 },
  trackTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  artistName: { color: '#A1A1AA', fontSize: 14, fontWeight: '500', marginTop: 2 },
  heartIcon: { color: '#52525B', fontSize: 26 },
  heartActive: { color: '#FA233B' },
  progressSection: { width: '100%' },
  progressBarBg: { width: '100%', height: 4, backgroundColor: '#27272A', borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#FA233B' },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  timeText: { color: '#71717A', fontSize: 11, fontWeight: '600' },
  controlsRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subControlIcon: { color: '#71717A', fontSize: 18 },
  mainControlIcon: { color: '#FFFFFF', fontSize: 22 },
  playPauseBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  playPauseIcon: { color: '#070204', fontSize: 18, fontWeight: 'bold', marginLeft: 2 },
});