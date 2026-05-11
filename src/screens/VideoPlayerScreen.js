import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar, SafeAreaView} from 'react-native';
import {WebView} from 'react-native-webview';

export default function VideoPlayerScreen({route, navigation}) {
  const {embedUrl, title} = route.params;
  const [loading, setLoading] = useState(true);

  const encoded = btoa(unescape(encodeURIComponent(embedUrl)));
  const playerUrl = `https://susanthabandara.com/player.php?e=${encoded}`;

  useEffect(() => {
    StatusBar.setHidden(true);
    return () => StatusBar.setHidden(false);
  }, []);

  return (
    <View style={styles.container}>
      {/* Back button overlay on top of video */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

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
  backBtn: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  back: {color: '#fff', fontSize: 14, fontWeight: '600'},
  player: {flex: 1, backgroundColor: '#000'},
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    backgroundColor: '#000',
  },
});