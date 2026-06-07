import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Platform, Alert, TextInput,
} from 'react-native';
import SmartechBaseReact from 'smartech-base-react-native';

const NC_RED = '#E11D48';

const PRESET_EVENTS = [
  { name: 'page_viewed', payload: { page: 'home', source: 'organic' }, icon: '👁️', color: '#3B82F6' },
  { name: 'product_viewed', payload: { product_id: 'P001', name: 'Headphones', price: '2999' }, icon: '🛍️', color: '#10B981' },
  { name: 'add_to_cart', payload: { product_id: 'P001', qty: '1', price: '2999' }, icon: '🛒', color: '#F59E0B' },
  { name: 'purchase', payload: { order_id: 'ORD001', amount: '2999', currency: 'INR' }, icon: '💳', color: '#8B5CF6' },
  { name: 'search', payload: { query: 'wireless headphones', results: '12' }, icon: '🔍', color: '#EC4899' },
  { name: 'wishlist_add', payload: { product_id: 'P002', name: 'Smart Watch' }, icon: '❤️', color: '#EF4444' },
  { name: 'notification_received', payload: { campaign_id: 'C001', type: 'push' }, icon: '🔔', color: '#06B6D4' },
  { name: 'app_open', payload: { source: 'push', campaign: 'summer_sale' }, icon: '📱', color: '#6B7280' },
];

export default function EventsScreen({ navigation }) {
  const [customEvent, setCustomEvent] = useState('');
  const [log, setLog] = useState([]);

  const fire = (name, payload) => {
    SmartechBaseReact.trackEvent(name, payload);
    const entry = { name, time: new Date().toLocaleTimeString(), id: Date.now() };
    setLog(prev => [entry, ...prev.slice(0, 9)]);
    Alert.alert('Event Fired ✓', `"${name}" sent to Smartech CE`);
  };

  const fireCustom = () => {
    if (!customEvent.trim()) { Alert.alert('Error', 'Enter event name'); return; }
    fire(customEvent.trim(), { source: 'manual', platform: Platform.OS });
    setCustomEvent('');
  };

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={NC_RED} barStyle="light-content" />
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 60 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Event Tracking</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Custom event */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Custom Event</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input} placeholder="event_name"
              value={customEvent} onChangeText={setCustomEvent}
              autoCapitalize="none" placeholderTextColor="#aaa"
            />
            <TouchableOpacity style={styles.fireBtn} onPress={fireCustom}>
              <Text style={styles.fireBtnText}>Fire</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preset events */}
        <Text style={styles.sectionTitle}>Preset Events</Text>
        {PRESET_EVENTS.map(evt => (
          <TouchableOpacity key={evt.name} style={styles.eventRow} onPress={() => fire(evt.name, evt.payload)} activeOpacity={0.75}>
            <View style={[styles.eventIcon, { backgroundColor: evt.color + '18' }]}>
              <Text style={{ fontSize: 20 }}>{evt.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventName}>{evt.name}</Text>
              <Text style={styles.eventPayload}>{JSON.stringify(evt.payload).slice(0, 50)}…</Text>
            </View>
            <Text style={{ color: evt.color, fontSize: 18 }}>▶</Text>
          </TouchableOpacity>
        ))}

        {/* Event log */}
        {log.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Recent Events</Text>
            {log.map(e => (
              <View key={e.id} style={styles.logRow}>
                <Text style={styles.logDot}>●</Text>
                <Text style={styles.logName}>{e.name}</Text>
                <Text style={styles.logTime}>{e.time}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: NC_RED, paddingHorizontal: 20, paddingBottom: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  back: { color: '#fff', fontSize: 22, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#6C757D', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, elevation: 2 },
  row: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1, borderWidth: 1.5, borderColor: '#E5E5E5', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1A1A2E',
  },
  fireBtn: { backgroundColor: NC_RED, borderRadius: 10, paddingHorizontal: 18, justifyContent: 'center' },
  fireBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  eventRow: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 1,
  },
  eventIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  eventName: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  eventPayload: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0F0F0' },
  logDot: { color: '#10B981', fontSize: 10 },
  logName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#1A1A2E' },
  logTime: { fontSize: 11, color: '#9CA3AF' },
});
