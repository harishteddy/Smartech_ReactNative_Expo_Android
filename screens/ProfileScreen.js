import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Platform, Alert, Switch,
} from 'react-native';
import SmartechBaseReact from 'smartech-base-react-native';
import SmartechPushReact from 'smartech-push-react-native';
import { HanselUserRn } from 'smartech-reactnative-nudges';
import { clearSession } from '../utils/authSession';

const NC_RED = '#E11D48';

export default function ProfileScreen({ navigation }) {
  const [pushOpt, setPushOpt] = useState(true);
  const [inAppOpt, setInAppOpt] = useState(true);
  const [trackOpt, setTrackOpt] = useState(true);
  const [guid, setGuid] = useState('—');

  useEffect(() => {
    SmartechBaseReact.trackEvent('screen_load', { screen: 'profile' });
    SmartechBaseReact.getDeviceGuid((err, g) => { if (!err && g) setGuid(g); });
    SmartechPushReact.hasOptedPushNotification((err, val) => { if (!err) setPushOpt(val); });
    SmartechBaseReact.hasOptedInAppMessage((err, val) => { if (!err) setInAppOpt(val); });
    SmartechBaseReact.hasOptedTracking((err, val) => { if (!err) setTrackOpt(val); });
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive', onPress: () => {
          SmartechBaseReact.logoutAndClearUserIdentity(true);
          HanselUserRn.clear();
          clearSession();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={NC_RED} barStyle="light-content" />
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 60 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}><Text style={styles.avatarText}>👤</Text></View>
          <Text style={styles.guidLabel}>GUID</Text>
          <Text style={styles.guidValue} selectable numberOfLines={1}>{guid}</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('UpdateProfile')}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Opt-in toggles */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          {[
            {
              label: 'Push Notifications', value: pushOpt,
              onToggle: (v) => { setPushOpt(v); SmartechPushReact.optPushNotification(v); },
            },
            {
              label: 'In-App Messages', value: inAppOpt,
              onToggle: (v) => { setInAppOpt(v); SmartechBaseReact.optInAppMessage(v); },
            },
            {
              label: 'Analytics Tracking', value: trackOpt,
              onToggle: (v) => { setTrackOpt(v); SmartechBaseReact.optTracking(v); },
            },
          ].map(({ label, value, onToggle }) => (
            <View key={label} style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>{label}</Text>
              <Switch
                value={value ?? false}
                onValueChange={onToggle}
                trackColor={{ false: '#E5E5E5', true: NC_RED + '60' }}
                thumbColor={value ? NC_RED : '#9CA3AF'}
              />
            </View>
          ))}
        </View>

        {/* Quick links */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          {[
            { label: '📱 Device Info', screen: 'DeviceInfo' },
            { label: '⚙️ Settings', screen: 'Settings' },
            { label: '⚡ Events', screen: 'Events' },
          ].map(({ label, screen }) => (
            <TouchableOpacity key={label} style={styles.linkRow} onPress={() => navigation.navigate(screen)}>
              <Text style={styles.linkText}>{label}</Text>
              <Text style={{ color: '#9CA3AF' }}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
  avatarSection: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 24, marginBottom: 14, elevation: 2 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: NC_RED + '18', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { fontSize: 36 },
  guidLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 },
  guidValue: { fontSize: 12, color: '#6C757D', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginTop: 4, textAlign: 'center' },
  editBtn: { marginTop: 12, backgroundColor: NC_RED, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 8 },
  editBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, elevation: 2 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#6C757D', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0F0F0' },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: '#1A1A2E' },
  linkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0F0F0' },
  linkText: { fontSize: 14, fontWeight: '600', color: '#1A1A2E' },
  logoutBtn: { backgroundColor: '#FEE2E2', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  logoutText: { color: '#EF4444', fontSize: 15, fontWeight: '800' },
});
