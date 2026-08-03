import Card from '@/components/card';
import { useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Index() {
  const [keyword, setKeyword] = useState('');
  const [songs, setSongs] = useState([]);
  const [mediaType, setMediaType] = useState<'song' | 'musicVideo'>('song');

  const searchMusic = (type = mediaType) => {
    if (!keyword.trim()) return;

    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
      keyword
    )}&entity=${type}&limit=25`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setSongs(data.results || []);
      })
      .catch((err) => console.error(err));
  };

  const handleTypeChange = (type: 'song' | 'musicVideo') => {
    setMediaType(type);
    if (keyword.trim()) {
      searchMusic(type);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Container */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.brandTitle}>iTunes</Text>
            <Text style={styles.headerTitle}>APPLE MUSIC</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{songs.length} ITEMS</Text>
          </View>
        </View>

        {/* Custom Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.tabButton, mediaType === 'song' && styles.activeTab]}
            onPress={() => handleTypeChange('song')}
          >
            <Text
              style={[
                styles.tabText,
                mediaType === 'song' && styles.activeTabText,
              ]}
            >
              🎵 Audio Tracks
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.tabButton,
              mediaType === 'musicVideo' && styles.activeTab,
            ]}
            onPress={() => handleTypeChange('musicVideo')}
          >
            <Text
              style={[
                styles.tabText,
                mediaType === 'musicVideo' && styles.activeTabText,
              ]}
            >
              🎬 Music Videos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <View style={styles.inputWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.input}
              placeholder={
                mediaType === 'song'
                  ? 'Search songs or artists...'
                  : 'Search music videos...'
              }
              placeholderTextColor="#52525B"
              value={keyword}
              onChangeText={setKeyword}
              onSubmitEditing={() => searchMusic()}
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.button}
            onPress={() => searchMusic()}
          >
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Music / Video List */}
      <FlatList
        data={songs}
        keyExtractor={(item: any) =>
          String(item.trackId || item.collectionId || Math.random())
        }
        contentContainerStyle={{ paddingVertical: 16 }}
        renderItem={({ item }) => {
          const song = {
            track: item.trackName,
            artist: item.artistName,
            album: item.collectionName,
            cover_url: item.artworkUrl100?.replace('100x100bb', '300x300bb'),
            preview_url: item.previewUrl,
            kind: item.kind,
          };
          return <Card song={song} mediaType={mediaType} />;
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <Text style={styles.emptyIcon}>
                {mediaType === 'song' ? '🎧' : '🎬'}
              </Text>
            </View>
            <Text style={styles.emptyText}>No Results Found</Text>
            <Text style={styles.emptySubtext}>
              Type a song, artist, or video name above and hit Search.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050507' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#0F0F12',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F24',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FA233B',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  countBadge: {
    backgroundColor: 'rgba(250, 35, 59, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(250, 35, 59, 0.3)',
  },
  countText: {
    color: '#FA233B',
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#18181C',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#FA233B',
    shadowColor: '#FA233B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: { color: '#71717A', fontWeight: '700', fontSize: 13 },
  activeTabText: { color: '#FFFFFF' },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181C',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  searchIcon: { fontSize: 14, marginRight: 6 },
  input: { flex: 1, height: 46, fontSize: 14, color: '#FFFFFF' },
  button: {
    height: 46,
    backgroundColor: '#27272A',
    paddingHorizontal: 20,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  emptyState: {
    alignItems: 'center',
    justify: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#18181C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  emptyIcon: { fontSize: 36 },
  emptyText: { color: '#F4F4F5', fontSize: 16, fontWeight: '700' },
  emptySubtext: {
    color: '#71717A',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
});