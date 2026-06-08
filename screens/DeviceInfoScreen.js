import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Platform, Alert, Clipboard, ToastAndroid,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SmartechBaseReact from 'smartech-base-react-native';
import SmartechPushReact from 'smartech-push-react-native';
import { RN_SDK_VERSIONS, NATIVE_SDK_VERSIONS, PLATFORM_VERSIONS, APP_VERSION } from '../utils/sdkVersions';

const NC_RED   = '#E11D48';
const NC_DARK  = '#1A1A2E';
const NC_MUTED = '#6C757D';
const HEADER   = '#1F2937';

function copyToClipboard(value, label) {
  Clipboard.setString(value);
  if (Platform.OS === 'android') {
    ToastAndroid.show(`${label} copied!`, ToastAndroid.SHORT);
  } else {
    Alert.alert('Copied', `${label} copied to clipboard.`);
  }
}

function InfoField({ label, value, icon }) {
  const isLong  = value.length > 42;
  const display = isLong ? value.substring(0, 42) + '…' : value;
  const isEmpty = !value || value === '—' || value === 'Loading…' || value === 'Not available';

  return (
    <View style={styles.fieldWrap}>
      <View style={styles.fieldLabelRow}>
        {icon && <Ionicons name={icon} size={12} color={NC_MUTED} style={{ marginRight: 5 }} />}
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>
      <View style={styles.fieldValueRow}>
        <Text style={styles.fieldValue} selectable numberOfLines={2}>{display}</Text>
        <TouchableOpacity
          style={[styles.copyBtn, isEmpty && styles.copyBtnDisabled]}
          onPress={() => !isEmpty && copyToClipboard(value, label)}
          activeOpacity={isEmpty ? 1 : 0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="copy-outline" size={15} color={isEmpty ? '#D1D5DB' : NC_RED} />
        </TouchableOpacity>
      </View>
      {isLong && !isEmpty && (
        <TouchableOpacity
          style={styles.viewFullBtn}
          onPress={() => Alert.alert(label, value, [
            { text: 'Copy', onPress: () => copyToClipboard(value, label) },
            { text: 'Close', style: 'cancel' },
          ])}
          activeOpacity={0.7}
        >
          <Ionicons name="expand-outline" size={12} color={HEADER} style={{ marginRight: 4 }} />
          <Text style={styles.viewFullText}>View full value</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function SectionHeader({ icon, title }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={14} color={NC_RED} style={{ marginRight: 6 }} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

export default function DeviceInfoScreen({ navigation }) {
  const [guid,     setGuid]     = useState('Loading…');
  const [token,    setToken]    = useState('Loading…');
  const [identity, setIdentity] = useState('Loading…');
  const [sdkVer,   setSdkVer]   = useState('—');

  useEffect(() => {
    SmartechBaseReact.getDeviceGuid((err, g)     => setGuid((!err && g) ? g : 'Not available'));
    SmartechPushReact.getDevicePushToken((err, t) => setToken((!err && t) ? t : 'Not available'));
    SmartechBaseReact.getUserIdentity((err, id)  => setIdentity((!err && id) ? id : 'Not available'));
    SmartechBaseReact.getSDKVersion((err, v)     => { if (!err && v) setSdkVer(v); });
  }, []);

  const statusBarH = StatusBar.currentHeight ?? 0;

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={HEADER} barStyle="light-content" translucent={false} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? statusBarH + 10 : 54 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.headerTitle}>Device Info</Text>
          <Text style={styles.headerSub}>Identifiers · SDK Versions · Platform</Text>
        </View>
        <TouchableOpacity
          style={styles.copyAllBtn}
          onPress={() => {
            const info = `Identity: ${identity}\nGUID: ${guid}\nPush Token: ${token}`;
            copyToClipboard(info, 'All device info');
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="copy-outline" size={13} color={NC_RED} />
          <Text style={styles.copyAllText}>Copy All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Smartech Identifiers ────────────────────────────────────────── */}
        <SectionHeader icon="finger-print-outline" title="Smartech Identifiers" />
        <View style={styles.card}>
          <InfoField label="User Identity"  value={identity}  icon="person-outline" />
          <View style={styles.divider} />
          <InfoField label="Device GUID"    value={guid}      icon="hardware-chip-outline" />
          <View style={styles.divider} />
          <InfoField label="Push Token"     value={token}     icon="notifications-outline" />
        </View>

        {/* ── Device Details ──────────────────────────────────────────────── */}
        <SectionHeader icon="phone-portrait-outline" title="Device Details" />
        <View style={styles.card}>
          {[
            { label: 'Platform',      value: Platform.OS === 'android' ? 'Android' : 'iOS',    icon: 'logo-android' },
            { label: 'OS Version',    value: String(Platform.Version),                          icon: 'layers-outline' },
            { label: 'Architecture',  value: 'New Arch (Fabric + TurboModules)',                icon: 'settings-outline' },
            { label: 'Smartech SDK',  value: sdkVer,                                            icon: 'shield-checkmark-outline' },
          ].map(({ label, value, icon }, idx, arr) => (
            <View key={label} style={[styles.detailRow, idx === arr.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.detailLeft}>
                <Ionicons name={icon} size={14} color={NC_MUTED} style={{ marginRight: 10 }} />
                <Text style={styles.detailLabel}>{label}</Text>
              </View>
              <Text style={styles.detailValue} numberOfLines={1}>{value}</Text>
            </View>
          ))}
        </View>

        {/* ── Platform Versions ──────────────────────────────────────────── */}
        <SectionHeader icon="rocket-outline" title="Platform Versions" />
        <View style={styles.row2}>
          <View style={[styles.platformCard, { borderLeftColor: '#111827' }]}>
            <View style={[styles.platIconWrap, { backgroundColor: '#11182712' }]}>
              <Text style={styles.platEmoji}>⚡</Text>
            </View>
            <Text style={styles.platLabel}>Expo SDK</Text>
            <Text style={styles.platVer}>v{PLATFORM_VERSIONS.expo}</Text>
            <View style={[styles.platBadge, { backgroundColor: '#11182712' }]}>
              <Text style={[styles.platBadgeText, { color: '#374151' }]}>App v{APP_VERSION}</Text>
            </View>
          </View>
          <View style={[styles.platformCard, { borderLeftColor: '#0A7EA4' }]}>
            <View style={[styles.platIconWrap, { backgroundColor: '#0A7EA412' }]}>
              <Text style={styles.platEmoji}>📱</Text>
            </View>
            <Text style={[styles.platLabel, { color: '#0A7EA4' }]}>React Native</Text>
            <Text style={styles.platVer}>v{PLATFORM_VERSIONS.reactNative}</Text>
            <View style={[styles.platBadge, { backgroundColor: '#0A7EA412' }]}>
              <Text style={[styles.platBadgeText, { color: '#0A7EA4' }]}>New Arch</Text>
            </View>
          </View>
        </View>

        {/* ── React Native SDK ────────────────────────────────────────────── */}
        <SectionHeader icon="logo-react" title="React Native SDK (JS)" />
        <View style={styles.card}>
          <View style={styles.chipGrid}>
            {[
              { label: 'Base SDK',     value: `v${RN_SDK_VERSIONS.base}`,     color: '#3B82F6' },
              { label: 'Push SDK',     value: `v${RN_SDK_VERSIONS.push}`,     color: '#10B981' },
              { label: 'AppInbox SDK', value: `v${RN_SDK_VERSIONS.appinbox}`, color: '#8B5CF6' },
              { label: 'Nudges SDK',   value: `v${RN_SDK_VERSIONS.nudges}`,   color: '#F59E0B' },
            ].map(s => (
              <View key={s.label} style={[styles.chip, { borderColor: s.color }]}>
                <View style={[styles.chipDot, { backgroundColor: s.color }]} />
                <Text style={[styles.chipLabel, { color: s.color }]}>{s.label}</Text>
                <Text style={styles.chipValue}>{s.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Native Android SDK ──────────────────────────────────────────── */}
        <SectionHeader icon="logo-android" title="Native Android SDK" />
        <View style={styles.card}>
          <View style={styles.chipGrid}>
            {[
              { label: 'Base SDK',     value: `v${NATIVE_SDK_VERSIONS.base}`,     color: '#3B82F6' },
              { label: 'Push SDK',     value: `v${NATIVE_SDK_VERSIONS.push}`,     color: '#10B981' },
              { label: 'AppInbox SDK', value: `v${NATIVE_SDK_VERSIONS.appinbox}`, color: '#8B5CF6' },
              { label: 'Nudges (PX)',  value: `v${NATIVE_SDK_VERSIONS.nudges}`,   color: '#F59E0B' },
            ].map(s => (
              <View key={s.label} style={[styles.chip, { borderColor: s.color }]}>
                <View style={[styles.chipDot, { backgroundColor: s.color }]} />
                <Text style={[styles.chipLabel, { color: s.color }]}>{s.label}</Text>
                <Text style={styles.chipValue}>{s.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 10 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#F3F4F6' },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },

  // Header
  header: {
    backgroundColor: HEADER, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 14,
    elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6,
  },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  headerSub:    { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 1 },
  copyAllBtn:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 5 },
  copyAllText:  { fontSize: 12, fontWeight: '700', color: NC_RED },

  // Section headers
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 8, marginHorizontal: 2 },
  sectionTitle:  { fontSize: 12, fontWeight: '800', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.8 },

  // Card
  card:    { backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 6, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#F0F0F0', marginVertical: 2 },

  // Info field (copy)
  fieldWrap:     { paddingVertical: 12 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  fieldLabel:    { fontSize: 10, fontWeight: '800', color: NC_MUTED, textTransform: 'uppercase', letterSpacing: 0.7 },
  fieldValueRow: { flexDirection: 'row', alignItems: 'flex-start' },
  fieldValue:    { flex: 1, fontSize: 13, color: NC_DARK, lineHeight: 19, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
  copyBtn:       { marginLeft: 10, padding: 6, backgroundColor: NC_RED + '12', borderRadius: 8 },
  copyBtnDisabled: { backgroundColor: '#F3F4F6' },
  viewFullBtn:   { flexDirection: 'row', alignItems: 'center', marginTop: 6, alignSelf: 'flex-start', backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  viewFullText:  { fontSize: 11, fontWeight: '700', color: HEADER },

  // Detail rows
  detailRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F3F4F6' },
  detailLeft:  { flexDirection: 'row', alignItems: 'center' },
  detailLabel: { fontSize: 13, color: '#6B7280' },
  detailValue: { fontSize: 13, fontWeight: '700', color: NC_DARK, maxWidth: '55%', textAlign: 'right' },

  // Platform version cards (side by side)
  row2:         { flexDirection: 'row', gap: 10 },
  platformCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  platIconWrap: { width: 40, height: 40, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  platEmoji:    { fontSize: 20 },
  platLabel:    { fontSize: 11, fontWeight: '700', color: NC_MUTED, textTransform: 'uppercase', letterSpacing: 0.5 },
  platVer:      { fontSize: 18, fontWeight: '900', color: NC_DARK, marginTop: 2, marginBottom: 6 },
  platBadge:    { alignSelf: 'flex-start', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 },
  platBadgeText:{ fontSize: 10, fontWeight: '800' },

  // SDK version chips
  chipGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 10 },
  chip:      { width: '47%', borderWidth: 1.5, borderRadius: 12, padding: 12, flexDirection: 'column', gap: 4 },
  chipDot:   { width: 6, height: 6, borderRadius: 3, marginBottom: 2 },
  chipLabel: { fontSize: 11, fontWeight: '700' },
  chipValue: { fontSize: 15, fontWeight: '900', color: NC_DARK },
});
