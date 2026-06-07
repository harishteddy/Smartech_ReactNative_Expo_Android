import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Platform, Alert, Switch,
} from 'react-native';
import SmartechBaseReact from 'smartech-base-react-native';
import SmartechPushReact from 'smartech-push-react-native';

const NC_RED = '#E11D48';

export default function SettingsScreen({ navigation }) {
  const [pushOpt, setPushOpt]   = useState(true);
  const [inAppOpt, setInAppOpt] = useState(true);
  const [trackOpt, setTrackOpt] = useState(true);
  const [guid, setGuid]         = useState('—');
  const [pushToken, setPushToken] = useState('—');
  const [identity, setIdentity] = useState('—');

  useEffect(() => {
    SmartechPushReact.hasOptedPushNotification((err, v) => { if (!err) setPushOpt(v); });
    SmartechBaseReact.hasOptedInAppMessage((err, v) => { if (!err) setInAppOpt(v); });
    SmartechBaseReact.hasOptedTracking((err, v) => { if (!err) setTrackOpt(v); });
    SmartechBaseReact.getDeviceGuid((err, g) => { if (!err && g) setGuid(g); });
    SmartechPushReact.getDevicePushToken((err, t) => { if (!err && t) setPushToken(t); });
    SmartechBaseReact.getUserIdentity((err, id) => { if (!err && id) setIdentity(id); });
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor="#374151" barStyle="light-content" />
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 60 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Device Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Device Info</Text>

          <Text style={styles.fieldLabel}>User Identity</Text>
          <Text style={styles.fieldValue} selectable numberOfLines={1}>{identity}</Text>

          <View style={styles.divider} />

          <Text style={styles.fieldLabel}>Device GUID</Text>
          <Text style={styles.fieldValue} selectable numberOfLines={1}>{guid}</Text>
          <TouchableOpacity style={styles.viewBtn} onPress={() => Alert.alert('Device GUID', guid)}>
            <Text style={styles.viewBtnText}>View Full GUID</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.fieldLabel}>Push Token</Text>
          <Text style={styles.fieldValue} selectable numberOfLines={2}>{pushToken}</Text>
          <TouchableOpacity style={styles.viewBtn} onPress={() => Alert.alert('Push Token', pushToken)}>
            <Text style={styles.viewBtnText}>View Full Token</Text>
          </TouchableOpacity>
        </View>

        {/* SDK Preferences */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>SDK Preferences</Text>
          {[
            { label: 'Push Notifications', sub: 'Receive push alerts',   value: pushOpt,   onToggle: (v) => { setPushOpt(v);   SmartechPushReact.optPushNotification(v); } },
            { label: 'In-App Messages',    sub: 'Show in-app banners',   value: inAppOpt,  onToggle: (v) => { setInAppOpt(v);  SmartechBaseReact.optInAppMessage(v); } },
            { label: 'Analytics Tracking', sub: 'Track user behaviour',  value: trackOpt,  onToggle: (v) => { setTrackOpt(v);  SmartechBaseReact.optTracking(v); } },
          ].map(({ label, sub, value, onToggle }) => (
            <View key={label} style={styles.prefRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.prefLabel}>{label}</Text>
                <Text style={styles.prefSub}>{sub}</Text>
              </View>
              <Switch
                value={value ?? false}
                onValueChange={onToggle}
                trackColor={{ false: '#E5E5E5', true: NC_RED + '60' }}
                thumbColor={value ? NC_RED : '#9CA3AF'}
              />
            </View>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>App Info</Text>
          {[
            { label: 'App Name',     value: 'Smartech Expo Demo' },
            { label: 'Platform',     value: Platform.OS === 'android' ? 'Android' : 'iOS' },
            { label: 'Architecture', value: 'New Arch (Fabric + TurboModules)' },
          ].map(({ label, value }) => (
            <View key={label} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{label}</Text>
              <Text style={styles.infoValue}>{value}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.dangerBtn}
          onPress={() => Alert.alert('Clear Data', 'Clear all Smartech local data?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: () => { SmartechBaseReact.clearUserIdentity(); Alert.alert('Done', 'User data cleared'); } },
          ])}
        >
          <Text style={styles.dangerText}>Clear User Identity</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: '#374151', paddingHorizontal: 20, paddingBottom: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  back: { color: '#fff', fontSize: 22, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, elevation: 2 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#6C757D', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  fieldValue: { fontSize: 13, color: '#1A1A2E', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', lineHeight: 18 },
  viewBtn: { alignSelf: 'flex-start', backgroundColor: '#F0F0F0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5, marginTop: 6 },
  viewBtnText: { fontSize: 12, fontWeight: '700', color: '#374151' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#F0F0F0', marginVertical: 14 },
  prefRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0F0F0' },
  prefLabel: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  prefSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0F0F0' },
  infoLabel: { fontSize: 13, color: '#6C757D' },
  infoValue: { fontSize: 13, fontWeight: '700', color: '#1A1A2E', flex: 1, textAlign: 'right' },
  dangerBtn: { backgroundColor: '#FEE2E2', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  dangerText: { color: '#EF4444', fontSize: 14, fontWeight: '800' },
});
