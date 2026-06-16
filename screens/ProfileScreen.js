import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Platform, Alert, ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SmartechBaseReact from 'smartech-base-react-native';
import { clearSession } from '../utils/authSession';

const NC_RED   = '#E11D48';
const NC_DARK  = '#1A1A2E';
const NC_MUTED = '#9CA3AF';
const BG       = '#F4F6F9';

// ── Stat pill ─────────────────────────────────────────────────────────────────
function StatPill({ icon, label, value, color }) {
  return (
    <View style={[statStyles.pill, { borderColor: color + '30', backgroundColor: color + '08' }]}>
      <View style={[statStyles.iconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}
const statStyles = StyleSheet.create({
  pill:     { flex: 1, alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  value:    { fontSize: 16, fontWeight: '900' },
  label:    { fontSize: 10, fontWeight: '700', color: NC_MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
});

// ── Menu row ──────────────────────────────────────────────────────────────────
function MenuRow({ icon, iconColor, label, badge, onPress, danger }) {
  return (
    <TouchableOpacity style={menuStyles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[menuStyles.iconWrap, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={[menuStyles.label, danger && { color: '#EF4444' }]}>{label}</Text>
      {badge ? (
        <View style={menuStyles.badge}><Text style={menuStyles.badgeText}>{badge}</Text></View>
      ) : (
        <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
      )}
    </TouchableOpacity>
  );
}
const menuStyles = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 16 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  label:    { flex: 1, fontSize: 14, fontWeight: '600', color: NC_DARK },
  badge:    { backgroundColor: NC_RED, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText:{ color: '#fff', fontSize: 11, fontWeight: '800' },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }) {
  const [guid, setGuid]         = useState('—');
  const [identity, setIdentity] = useState('Guest User');

  useEffect(() => {
    SmartechBaseReact.trackEvent('screen_load', { screen: 'profile' });
    SmartechBaseReact.getDeviceGuid((err, g)    => { if (!err && g)  setGuid(g); });
    SmartechBaseReact.getUserIdentity((err, id) => { if (!err && id) setIdentity(id); });
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout', style: 'destructive', onPress: () => {
            SmartechBaseReact.logoutAndClearUserIdentity(true);
            clearSession();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          },
        },
      ],
    );
  };

  const statusBarH = StatusBar.currentHeight ?? 0;
  const initials   = identity && identity !== 'Guest User'
    ? identity.substring(0, 2).toUpperCase()
    : 'GU';

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor="transparent" barStyle="light-content" translucent />

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <View style={[styles.hero, { paddingTop: statusBarH + 12 }]}>
        {/* Header row */}
        <View style={styles.heroHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.heroTitle}>My Profile</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="settings-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Avatar + name */}
        <View style={styles.avatarRow}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          </View>
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={styles.userName} numberOfLines={1}>{identity}</Text>
            <View style={styles.memberBadge}>
              <Ionicons name="star" size={11} color="#F59E0B" />
              <Text style={styles.memberText}>Premium Member</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('UpdateProfile')}
            >
              <Ionicons name="create-outline" size={13} color="#fff" />
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Stats row ────────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <StatPill icon="bag-handle-outline"  label="Orders"   value="12"   color="#3B82F6" />
          <View style={{ width: 10 }} />
          <StatPill icon="heart-outline"       label="Wishlist"  value="8"    color="#EF4444" />
          <View style={{ width: 10 }} />
          <StatPill icon="star-outline"        label="Reviews"   value="5"    color="#F59E0B" />
        </View>

        {/* ── My Account ───────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>MY ACCOUNT</Text>
        <View style={styles.card}>
          <MenuRow icon="bag-outline"        iconColor="#3B82F6" label="My Orders"        onPress={() => navigation.navigate('Shop')} />
          <View style={styles.divider} />
          <MenuRow icon="heart-outline"      iconColor="#EF4444" label="Wishlist"          onPress={() => navigation.navigate('Wishlist')} />
          <View style={styles.divider} />
          <MenuRow icon="cart-outline"       iconColor="#10B981" label="Cart"              onPress={() => navigation.navigate('Cart')} />
          <View style={styles.divider} />
          <MenuRow icon="person-outline"     iconColor="#8B5CF6" label="Edit Profile"      onPress={() => navigation.navigate('UpdateProfile')} />
        </View>

        {/* ── SDK & App ─────────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>SDK & APP</Text>
        <View style={styles.card}>
          <MenuRow icon="pulse-outline"      iconColor="#F59E0B" label="CE Dashboard"      onPress={() => navigation.navigate('CEDashboard')} />
          <View style={styles.divider} />
          <MenuRow icon="layers-outline"     iconColor="#E11D48" label="PX Dashboard"      onPress={() => navigation.navigate('PXDashboard')} />
          <View style={styles.divider} />
          <MenuRow icon="notifications-outline" iconColor="#0EA5E9" label="App Inbox"      onPress={() => navigation.navigate('CustomInbox')} />
          <View style={styles.divider} />
          <MenuRow icon="flash-outline"      iconColor="#10B981" label="Track Events"      onPress={() => navigation.navigate('Events')} />
        </View>

        {/* ── General ──────────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>GENERAL</Text>
        <View style={styles.card}>
          <MenuRow icon="phone-portrait-outline" iconColor="#6366F1" label="Device Info"   onPress={() => navigation.navigate('DeviceInfo')} />
          <View style={styles.divider} />
          <MenuRow icon="settings-outline"   iconColor="#6B7280" label="Settings"           onPress={() => navigation.navigate('Settings')} />
        </View>

        {/* ── GUID chip ─────────────────────────────────────────────────── */}
        <View style={styles.guidChip}>
          <Ionicons name="finger-print-outline" size={14} color={NC_MUTED} style={{ marginRight: 6 }} />
          <Text style={styles.guidLabel}>GUID: </Text>
          <Text style={styles.guidValue} numberOfLines={1} selectable>{guid}</Text>
        </View>

        {/* ── Logout ───────────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color="#EF4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  // Hero
  hero: {
    backgroundColor: NC_RED,
    paddingHorizontal: 16,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 8,
    shadowColor: NC_RED,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  heroHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  heroTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },

  // Avatar
  avatarRow:      { flexDirection: 'row', alignItems: 'center' },
  avatarRing:     {
    width: 78, height: 78, borderRadius: 39,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatar:         {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInitials: { fontSize: 26, fontWeight: '900', color: '#fff' },
  userName:       { fontSize: 18, fontWeight: '900', color: '#fff', marginBottom: 4 },
  memberBadge:    {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10,
  },
  memberText:     { fontSize: 11, fontWeight: '700', color: '#FEF3C7' },
  editBtn:        {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20, alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
  },
  editBtnText:    { color: '#fff', fontSize: 12, fontWeight: '800' },

  // Content
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },

  // Stats
  statsRow: { flexDirection: 'row', marginBottom: 20 },

  // Section labels
  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: '#6B7280',
    textTransform: 'uppercase', letterSpacing: 1.2,
    marginBottom: 8, marginLeft: 4,
  },

  // Card
  card: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 16,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 6,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 70 },

  // GUID chip
  guidChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4,
  },
  guidLabel: { fontSize: 12, fontWeight: '700', color: NC_MUTED },
  guidValue: {
    flex: 1, fontSize: 12, color: '#374151',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FEF2F2', borderRadius: 14,
    paddingVertical: 15, borderWidth: 1, borderColor: '#FECACA',
  },
  logoutText: { color: '#EF4444', fontSize: 15, fontWeight: '800' },
});
