import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Platform, Alert,
} from 'react-native';
import SmartechBaseReact from 'smartech-base-react-native';
import SmartechPushReact from 'smartech-push-react-native';

const NC_RED = '#E11D48';

export default function DeviceInfoScreen({ navigation }) {
  const [guid, setGuid] = useState('Loading…');
  const [token, setToken] = useState('N/A');

  useEffect(() => {
    SmartechBaseReact.getDeviceGuid((err, g) => { if (!err && g) setGuid(g); else setGuid('Not available'); });
    SmartechPushReact.getDevicePushToken((err, t) => { if (!err && t) setToken(t); else setToken('Not available'); });
  }, []);

  const InfoRow = ({ label, value }) => (
    <TouchableOpacity style={styles.infoRow} onLongPress={() => Alert.alert(label, value)} activeOpacity={0.7}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2} selectable>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={NC_RED} barStyle="light-content" />
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 60 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Device Info</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Smartech Identifiers</Text>
          <InfoRow label="Device GUID" value={guid} />
          <InfoRow label="Push Token" value={token} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Device Details</Text>
          <InfoRow label="Platform" value={Platform.OS} />
          <InfoRow label="OS Version" value={String(Platform.Version)} />
          <InfoRow label="Architecture" value="New Arch (Fabric + TurboModules)" />
        </View>

        <View style={styles.tip}>
          <Text style={styles.tipText}>💡 Long press any row to copy the value</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: NC_RED, paddingHorizontal: 20, paddingBottom: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  back: { color: '#fff', fontSize: 22, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, elevation: 2 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#6C757D', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  infoRow: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0F0F0' },
  infoLabel: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 13, color: '#1A1A2E', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginTop: 4, lineHeight: 18 },
  tip: { alignItems: 'center', paddingTop: 8 },
  tipText: { fontSize: 12, color: '#9CA3AF' },
});
