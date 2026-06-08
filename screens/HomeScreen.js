import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Platform,
} from 'react-native';
import SmartechBaseReact from 'smartech-base-react-native';
import { useShop } from '../store/ShopContext';

const NC_RED = '#E11D48';
const NC_DARK = '#1A1A2E';

const SDK_CARDS = [
  { id: 'ce', title: 'CE Dashboard', subtitle: 'Customer Engagement', icon: '📊', screen: 'CEDashboard', color: '#3B82F6' },
  { id: 'apppz', title: 'App Personalization', subtitle: 'Widget Content', icon: '🎯', screen: 'AppPZ', color: '#10B981' },
  { id: 'events', title: 'Event Tracking', subtitle: 'Track user actions', icon: '⚡', screen: 'Events', color: '#F59E0B' },
  { id: 'inbox', title: 'App Inbox', subtitle: 'In-app messages', icon: '📬', screen: 'CustomInbox', color: '#10B981' },
  { id: 'shop', title: 'Shop', subtitle: 'E-commerce tracking', icon: '🛍️', screen: 'Shop', color: '#EC4899' },
  { id: 'profile', title: 'Profile', subtitle: 'User management', icon: '👤', screen: 'Profile', color: '#06B6D4' },
  { id: 'settings', title: 'Settings', subtitle: 'SDK preferences', icon: '⚙️', screen: 'Settings', color: '#6B7280' },
  { id: 'device', title: 'Device Info', subtitle: 'GUID & tokens', icon: '📱', screen: 'DeviceInfo', color: '#EF4444' },
];

export default function HomeScreen({ navigation }) {
  const { cartCount } = useShop();

  useEffect(() => {
    SmartechBaseReact.trackEvent('screen_load', { screen: 'home' });
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={NC_RED} barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 60 }]}>
        <View>
          <Text style={styles.greeting}>Hello 👋</Text>
          <Text style={styles.headerTitle}>Netcore CE — Expo</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartBtn}>
          <Text style={styles.cartIcon}>🛒</Text>
          {cartCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{cartCount}</Text></View>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerEmoji}>🚀</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.bannerTitle}>SDK Integration Demo</Text>
            <Text style={styles.bannerSub}>Explore all Smartech CE features below</Text>
          </View>
        </View>

        {/* Grid */}
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.grid}>
          {SDK_CARDS.map(card => (
            <TouchableOpacity
              key={card.id}
              style={styles.card}
              onPress={() => {
                SmartechBaseReact.trackEvent('feature_tapped', { feature: card.id });
                navigation.navigate(card.screen);
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.iconWrap, { backgroundColor: card.color + '18' }]}>
                <Text style={styles.cardIcon}>{card.icon}</Text>
              </View>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardSub}>{card.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.powered}>
          <Text style={styles.poweredText}>Powered by Netcore Cloud • Expo SDK 56</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: NC_RED, paddingHorizontal: 20, paddingBottom: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 2 },
  cartBtn: { position: 'relative', padding: 4 },
  cartIcon: { fontSize: 24 },
  badge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: '#fff', borderRadius: 8, minWidth: 16, height: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: NC_RED },
  content: { padding: 16, paddingBottom: 40 },
  banner: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 20,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06,
  },
  bannerEmoji: { fontSize: 32 },
  bannerTitle: { fontSize: 15, fontWeight: '800', color: NC_DARK },
  bannerSub: { fontSize: 12, color: '#6C757D', marginTop: 2 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#6C757D', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47%', backgroundColor: '#fff', borderRadius: 16,
    padding: 16, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06,
  },
  iconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  cardIcon: { fontSize: 22 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: NC_DARK },
  cardSub: { fontSize: 11, color: '#6C757D', marginTop: 2 },
  powered: { alignItems: 'center', marginTop: 24 },
  poweredText: { fontSize: 11, color: '#9CA3AF' },
});
