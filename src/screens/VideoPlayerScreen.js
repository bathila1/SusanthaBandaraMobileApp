import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {WebView} from 'react-native-webview';

export default function VideoPlayerScreen({route, navigation}) {
  const {url, title} = route.params;

  // Extract Vimeo ID from URL
  const getVimeoEmbed = (vimeoUrl) => {
    const match = vimeoUrl.match(/vimeo\.com\/(\d+)/);
    const id = match ? match[1] : vimeoUrl;
    return `https://player.vimeo.com/video/${id}`;
  };

  const embedUrl = getVimeoEmbed(url);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>

      <WebView
        source={{uri: embedUrl}}
        style={styles.player}
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, paddingTop: 50, backgroundColor: '#111', gap: 12,
  },
  back: {color: '#5cb85c', fontSize: 15},
  title: {color: '#fff', fontSize: 15, fontWeight: '600', flex: 1},
  player: {flex: 1},
});