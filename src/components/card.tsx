import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SongProps {
  song: {
    track: string;
    artist: string;
    album?: string;
    cover_url: string;
    preview_url: string;
    kind?: string;
  };
  mediaType: 'song' | 'musicVideo';
}

export default function Card({ song, mediaType }: SongProps) {
  const router = useRouter();

  const handlePress = () => {
    const isVideo =
      mediaType === 'musicVideo' ||
      song.kind === 'music-video' ||
      song.kind?.includes('video');

    if (isVideo) {
      router.push({
        pathname: '/video-preview',
        params: {
          track: song.track || '',
          artist: song.artist || '',
          preview_url: song.preview_url || '',
        },
      });
    } else {
      router.push({
        pathname: '/audio-preview',
        params: {
          track: song.track || '',
          artist: song.artist || '',
          cover_url: song.cover_url || '',
          preview_url: song.preview_url || '',
        },
      });
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: song.cover_url }} style={styles.cover} />
        {mediaType === 'musicVideo' && (
          <View style={styles.videoBadge}>
            <Text style={styles.videoBadgeText}>▶ VIDEO</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {song.track || 'Untitled'}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {song.artist || 'Unknown Artist'}
        </Text>
        {song.album && (
          <Text style={styles.album} numberOfLines={1}>
            {song.album}
          </Text>
        )}
      </View>
      <View style={styles.actionBtn}>
        <Text style={styles.actionIcon}>
          {mediaType === 'musicVideo' ? '🎬' : '▶'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121216',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222228',
  },
  imageWrapper: {
    position: 'relative',
  },
  cover: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#27272A',
  },
  videoBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoBadgeText: {
    color: '#FA233B',
    fontSize: 8,
    fontWeight: '800',
  },
  info: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  artist: {
    color: '#A1A1AA',
    fontSize: 13,
    marginTop: 2,
  },
  album: {
    color: '#52525B',
    fontSize: 11,
    marginTop: 2,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1F1F24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 14,
  },
});