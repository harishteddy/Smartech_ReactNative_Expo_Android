import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { getSession } from '../utils/authSession';

export default function SplashScreen({ navigation }) {
  const scale = new Animated.Value(0.6);
  const opacity = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60 }),
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    const checkSession = async () => {
      const session = await getSession();
      navigation.replace(session ? 'Main' : 'Login');
    };

    const t = setTimeout(checkSession, 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, { transform: [{ scale }], opacity }]}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>N</Text>
        </View>
        <Text style={styles.title}>Netcore CE</Text>
        <Text style={styles.subtitle}>Expo Demo App</Text>
      </Animated.View>
      <Text style={styles.powered}>Powered by Smartech SDK</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E11D48', justifyContent: 'center', alignItems: 'center' },
  logoWrap: { alignItems: 'center' },
  logoCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  logoLetter: { color: '#fff', fontSize: 44, fontWeight: '900' },
  title: { color: '#fff', fontSize: 30, fontWeight: '900', letterSpacing: 1 },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 6 },
  powered: { position: 'absolute', bottom: 40, color: 'rgba(255,255,255,0.6)', fontSize: 12 },
});
