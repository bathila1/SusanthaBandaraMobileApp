import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import {WebView} from 'react-native-webview';

export default function VideoPlayerScreen({route, navigation}) {
  const {embedUrl, title} = route.params;
  const [loading, setLoading] = useState(true);

  const encoded = btoa(unescape(encodeURIComponent(embedUrl)));
  const playerUrl = `https://susanthabandara.com/player.php?e=${encoded}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#5cb85c" />
        </View>
      )}

      <WebView
        source={{uri: playerUrl}}
        style={styles.player}
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        originWhitelist={['*']}
        setSupportMultipleWindows={false}
        onShouldStartLoadWithRequest={(request) => {
          // only allow susanthabandara.com and vimeo player
          const url = request.url;
          if (
            url.startsWith('https://susanthabandara.com') ||
            url.startsWith('https://player.vimeo.com') ||
            url.startsWith('about:blank')
          ) {
            return true;
          }
          return false;
        }}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, paddingTop: 50,
    backgroundColor: '#111', gap: 12,
  },
  back: {color: '#5cb85c', fontSize: 15},
  title: {color: '#fff', fontSize: 15, fontWeight: '600', flex: 1},
  player: {flex: 1, backgroundColor: '#000'},
  loadingOverlay: {
    position: 'absolute', top: 100, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', zIndex: 10,
  },
});