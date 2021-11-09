import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'react-native';
export const Loading = () => (
  <View style={styles.container}>
    <View style={styles.overlay} />
    <Image
    source={require('~/assets/images/loading.gif')}
    style={[{ alignSelf: 'center', width: 100, height: 100 }]}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,

    alignItems: 'center',
    justifyContent: 'center',
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    opacity: 0.0,
  },

  img: {
    width: 45,
    height: 45,
  },
});
