import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
  StatusBar, Platform, RefreshControl, Modal, ScrollView,
  Dimensions, Animated, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SmartechAppInboxReact from 'smartech-appinbox-react-native';
import SmartechBaseReact from 'smartech-base-react-native';

const NC_RED   = '#E11D48';
const NC_DARK  = '#1A1A2E';
const NC_MUTED = '#6C757D';
const { width: SW } = Dimensions.get('window');

// 1 = ALL_MESSAGE, 2 = READ_MESSAGE, 3 = UNREAD_MESSAGE
const MSG_TYPE = { ALL: 1, READ: 2, UNREAD: 3 };
const TABS = ['ALL', 'UNREAD', 'READ'];

/* ── helpers ─────────────────────────────────────────────────────────── */
function stripHtml(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function formatDate(ts) {
  if (!ts) return '';
  try {
    const s = String(ts);
    // ISO string like "2026-06-07T06:48:24"
    if (s.includes('T') || s.includes('-')) {
      const d = new Date(s);
      if (!isNaN(d.getTime()))
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
          + ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }
    // Unix seconds or ms
    const ms = s.length <= 10 ? Number(s) * 1000 : Number(s);
    const d = new Date(ms);
    if (!isNaN(d.getTime()))
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        + ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch { /* */ }
  return String(ts);
}

function timeAgo(ts) {
  if (!ts) return '';
  try {
    const s = String(ts);
    const d = s.includes('T') || s.includes('-') ? new Date(s)
            : new Date(s.length <= 10 ? Number(s) * 1000 : Number(s));
    if (isNaN(d.getTime())) return '';
    const diff = Date.now() - d.getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 1)   return 'Just now';
    if (mins < 60)  return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7)   return `${days}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch { return ''; }
}

function parseInboxData(data) {
  if (!data) return [];
  if (typeof data === 'string') { try { data = JSON.parse(data); } catch { return []; } }
  if (Array.isArray(data)) return data;
  if (data.data && Array.isArray(data.data)) return data.data;
  if (data.messages && Array.isArray(data.messages)) return data.messages;
  return [];
}

function isRead(item) {
  const s = item.status;
  if (s === null || s === undefined) return false;
  if (typeof s === 'string') {
    const lower = s.toLowerCase().trim();
    return lower === 'read' || lower === '1' || lower === 'true';
  }
  if (typeof s === 'number') return s === 1;
  if (typeof s === 'boolean') return s;
  return false;
}

/* ── Detail Modal ────────────────────────────────────────────────────── */
function MessageDetail({ item, visible, onClose }) {
  const slideAnim = useRef(new Animated.Value(500)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
    } else {
      slideAnim.setValue(500);
    }
  }, [visible]);

  if (!item) return null;
  const imageUri = item.mediaURL || item.imageUrl || item.imgUrl || null;
  const title    = stripHtml(item.title)    || 'Notification';
  const subtitle = stripHtml(item.subtitle) || '';
  const body     = stripHtml(item.description) || '';

  const handleCTA = () => {
    if (item.deeplink) {
      if (item.deeplink.startsWith('http')) Linking.openURL(item.deeplink).catch(() => {});
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />

      <Animated.View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16, transform: [{ translateY: slideAnim }] }]}>
        {/* Drag handle */}
        <View style={styles.dragHandle} />

        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {/* Banner image */}
          {!!imageUri && (
            <Image source={{ uri: imageUri }} style={styles.modalImage} resizeMode="cover" />
          )}

          <View style={styles.modalContent}>
            {/* Header row */}
            <View style={styles.modalMeta}>
              {item.notificationType ? (
                <View style={styles.modalTypeChip}>
                  <Text style={styles.modalTypeText}>{item.notificationType}</Text>
                </View>
              ) : null}
              <Text style={styles.modalTime}>{formatDate(item.publishedDate)}</Text>
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>{title}</Text>

            {/* Subtitle */}
            {!!subtitle && <Text style={styles.modalSubtitle}>{subtitle}</Text>}

            {/* Divider */}
            <View style={styles.modalDivider} />

            {/* Body */}
            {!!body
              ? <Text style={styles.modalBody}>{body}</Text>
              : <Text style={styles.modalBodyEmpty}>No additional details for this notification.</Text>
            }

            {/* CTA button */}
            {!!item.deeplink && item.deeplink.startsWith('http') && (
              <TouchableOpacity style={styles.modalCTA} onPress={handleCTA} activeOpacity={0.85}>
                <Text style={styles.modalCTAText}>Open Link →</Text>
              </TouchableOpacity>
            )}

            {/* Close button */}
            <TouchableOpacity style={styles.modalClose} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

/* ── Main Screen ─────────────────────────────────────────────────────── */
export default function CustomInboxScreen({ navigation }) {
  const [allMessages, setAllMessages]   = useState([]);   // full unfiltered list
  const [messages, setMessages]         = useState([]);   // tab-filtered list
  const [unreadCount, setUnreadCount]   = useState(0);
  const [loading, setLoading]           = useState(false);
  const [activeTab, setActiveTab]       = useState('ALL');
  const [selectedMsg, setSelectedMsg]   = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  /* ── filter helpers ─── */
  const applyFilter = useCallback((items, tab) => {
    if (tab === 'ALL')    return items;
    if (tab === 'READ')   return items.filter(m => isRead(m));
    if (tab === 'UNREAD') return items.filter(m => !isRead(m));
    return items;
  }, []);

  /* ── fetch ─── */
  const fetchMessages = useCallback((tab = 'ALL') => {
    setLoading(true);
    SmartechAppInboxReact.getAppInboxMessagesByApiCall(50, 1, [], (err, data) => {
      if (!err) {
        const all = parseInboxData(data);
        if (all.length > 0) {
          setAllMessages(all);
          setMessages(applyFilter(all, tab));
          setLoading(false);
          return;
        }
      }
      // Fallback to local DB
      SmartechAppInboxReact.getAppInboxMessages(MSG_TYPE.ALL, (err2, data2) => {
        setLoading(false);
        if (!err2) {
          const all2 = parseInboxData(data2);
          setAllMessages(all2);
          setMessages(applyFilter(all2, tab));
        }
      });
    });
  }, [applyFilter]);

  const fetchUnreadCount = useCallback(() => {
    SmartechAppInboxReact.getAppInboxMessageCount(MSG_TYPE.UNREAD, (err, count) => {
      if (!err) setUnreadCount(typeof count === 'number' ? count : 0);
    });
  }, []);

  useEffect(() => {
    SmartechBaseReact.trackEvent('screen_load', { screen: 'app_inbox' });
    fetchMessages('ALL');
    fetchUnreadCount();
  }, []);

  /* ── tab change ─── */
  const onTabChange = (tab) => {
    setActiveTab(tab);
    setMessages(applyFilter(allMessages, tab));
    // Refetch if switching to READ to get latest status
    if (tab === 'READ') fetchMessages(tab);
  };

  /* ── mark viewed and open detail ─── */
  const handlePress = (item) => {
    // Mark as viewed in SDK
    SmartechAppInboxReact.markMessageAsViewed(item);
    if (item.deeplink) SmartechAppInboxReact.markMessageAsClicked(item.trid, item.deeplink);

    // Optimistically update local status so READ tab shows it
    const updateStatus = (list) =>
      list.map(m => m.trid === item.trid ? { ...m, status: 'read' } : m);
    const updatedAll = updateStatus(allMessages);
    setAllMessages(updatedAll);
    setMessages(applyFilter(updatedAll, activeTab));
    fetchUnreadCount();

    // Open detail modal
    setSelectedMsg(item);
    setDetailVisible(true);
  };

  const handleDismiss = (item) => {
    SmartechAppInboxReact.markMessageAsDismissed(item, (err) => {
      if (!err) {
        const filtered = allMessages.filter(m => m.trid !== item.trid);
        setAllMessages(filtered);
        setMessages(applyFilter(filtered, activeTab));
        fetchUnreadCount();
      }
    });
  };

  /* ── render card ─── */
  const renderItem = ({ item }) => {
    const unread   = !isRead(item);
    const imageUri = item.mediaURL || item.imageUrl || item.imgUrl || null;
    const title    = stripHtml(item.title) || 'Notification';
    const body     = stripHtml(item.description) || stripHtml(item.subtitle) || '';

    return (
      <TouchableOpacity
        style={[styles.card, unread ? styles.cardUnread : styles.cardRead]}
        onPress={() => handlePress(item)}
        activeOpacity={0.82}
      >
        {/* Unread indicator dot */}
        {unread && <View style={styles.unreadDot} />}

        {/* Banner image */}
        {!!imageUri && (
          <Image source={{ uri: imageUri }} style={styles.cardImage} resizeMode="cover" />
        )}

        <View style={styles.cardBody}>
          {/* Top row: type chip + time + dismiss */}
          <View style={styles.cardTop}>
            <View style={[styles.chip, unread ? styles.chipNew : styles.chipRead]}>
              <Text style={[styles.chipText, unread ? styles.chipTextNew : styles.chipTextRead]}>
                {unread ? 'NEW' : 'READ'}
              </Text>
            </View>
            {!!item.notificationType && (
              <View style={styles.typeChip}>
                <Text style={styles.typeChipText}>{item.notificationType}</Text>
              </View>
            )}
            <View style={{ flex: 1 }} />
            <Text style={styles.timeAgo}>{timeAgo(item.publishedDate)}</Text>
            <TouchableOpacity
              style={styles.dismissBtn}
              onPress={() => handleDismiss(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.dismissIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={[styles.cardTitle, !unread && styles.cardTitleRead]} numberOfLines={2}>
            {title}
          </Text>

          {/* Body */}
          {!!body && (
            <Text style={styles.cardDesc} numberOfLines={2}>{body}</Text>
          )}

          {/* Footer: full date */}
          <Text style={styles.cardDate}>{formatDate(item.publishedDate)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const unreadBadge = unreadCount > 0 ? (
    <View style={styles.headerBadge}>
      <Text style={styles.headerBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
    </View>
  ) : null;

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={NC_RED} barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 60 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.headerBack}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {/* Bell icon + badge */}
          <View style={styles.bellWrap}>
            <Text style={styles.bellIcon}>🔔</Text>
            {unreadBadge}
          </View>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>

        <TouchableOpacity
          onPress={() => { fetchMessages(activeTab); fetchUnreadCount(); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.headerRefresh}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Summary bar */}
      {unreadCount > 0 && (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            🔴  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity onPress={() => onTabChange('UNREAD')}>
            <Text style={styles.summaryAction}>View →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(tab => {
          const count = tab === 'ALL'    ? allMessages.length
                      : tab === 'UNREAD' ? allMessages.filter(m => !isRead(m)).length
                      : allMessages.filter(m => isRead(m)).length;
          const active = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => onTabChange(tab)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab}</Text>
              {count > 0 && (
                <View style={[styles.tabBadge, active ? styles.tabBadgeActive : styles.tabBadgeInactive]}>
                  <Text style={[styles.tabBadgeText, active && styles.tabBadgeTextActive]}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <FlatList
        data={messages}
        keyExtractor={(item, i) => item.trid ?? String(i)}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, messages.length === 0 && styles.listEmpty]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => { fetchMessages(activeTab); fetchUnreadCount(); }}
            colors={[NC_RED]}
            tintColor={NC_RED}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>{loading ? '⏳' : '🔔'}</Text>
            <Text style={styles.emptyTitle}>{loading ? 'Loading…' : 'All caught up!'}</Text>
            <Text style={styles.emptySubtitle}>
              {loading ? 'Fetching your notifications' : 'No notifications here yet'}
            </Text>
            {!loading && (
              <TouchableOpacity style={styles.retryBtn} onPress={() => { fetchMessages(activeTab); fetchUnreadCount(); }}>
                <Text style={styles.retryText}>Refresh</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Detail Modal */}
      <MessageDetail
        item={selectedMsg}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
      />
    </View>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F6FA' },

  /* Header */
  header: {
    backgroundColor: NC_RED, paddingHorizontal: 20, paddingBottom: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerBack:    { color: '#fff', fontSize: 22, fontWeight: '700' },
  headerRefresh: { color: '#fff', fontSize: 24, fontWeight: '700' },
  headerCenter:  { alignItems: 'center', flex: 1 },
  bellWrap:      { position: 'relative', marginBottom: 4 },
  bellIcon:      { fontSize: 26 },
  headerBadge: {
    position: 'absolute', top: -4, right: -10,
    backgroundColor: '#fff', borderRadius: 10,
    minWidth: 20, height: 20,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 4,
  },
  headerBadgeText: { fontSize: 10, fontWeight: '900', color: NC_RED },
  headerTitle:     { color: '#fff', fontSize: 16, fontWeight: '800' },

  /* Summary bar */
  summaryBar: {
    backgroundColor: '#FFF1F3', paddingHorizontal: 16, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: '#FECDD3',
  },
  summaryText:   { fontSize: 13, color: NC_RED, fontWeight: '600' },
  summaryAction: { fontSize: 13, color: NC_RED, fontWeight: '800' },

  /* Tabs */
  tabs: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0', elevation: 2,
  },
  tab:       { flex: 1, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  tabActive: { borderBottomWidth: 2.5, borderBottomColor: NC_RED },
  tabText:       { fontSize: 12, fontWeight: '700', color: '#9CA3AF' },
  tabTextActive: { color: NC_RED },
  tabBadge: { borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  tabBadgeActive:   { backgroundColor: NC_RED },
  tabBadgeInactive: { backgroundColor: '#F0F0F0' },
  tabBadgeText:     { fontSize: 10, fontWeight: '800', color: '#9CA3AF' },
  tabBadgeTextActive: { color: '#fff' },

  /* List */
  list:      { padding: 12, paddingBottom: 40 },
  listEmpty: { flex: 1 },

  /* Card */
  card: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 10,
    overflow: 'hidden', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 4,
  },
  cardUnread: { borderLeftWidth: 4, borderLeftColor: NC_RED },
  cardRead:   { borderLeftWidth: 4, borderLeftColor: 'transparent', opacity: 0.88 },
  unreadDot: {
    position: 'absolute', top: 14, right: 14, zIndex: 1,
    width: 8, height: 8, borderRadius: 4, backgroundColor: NC_RED,
  },
  cardImage: { width: '100%', height: 170, backgroundColor: '#F0F0F0' },
  cardBody:  { padding: 14 },

  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  chip:       { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  chipNew:    { backgroundColor: NC_RED + '18' },
  chipRead:   { backgroundColor: '#F3F4F6' },
  chipText:     { fontSize: 10, fontWeight: '800' },
  chipTextNew:  { color: NC_RED },
  chipTextRead: { color: '#9CA3AF' },
  typeChip:     { backgroundColor: '#EFF6FF', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 },
  typeChipText: { fontSize: 10, fontWeight: '700', color: '#3B82F6' },
  timeAgo:      { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
  dismissBtn:   { marginLeft: 4 },
  dismissIcon:  { color: '#D1D5DB', fontSize: 14, fontWeight: '700' },

  cardTitle:     { fontSize: 15, fontWeight: '800', color: NC_DARK, marginBottom: 5, lineHeight: 21 },
  cardTitleRead: { fontWeight: '600', color: NC_MUTED },
  cardDesc:      { fontSize: 13, color: NC_MUTED, lineHeight: 19, marginBottom: 8 },
  cardDate:      { fontSize: 11, color: '#B0B7C3', marginTop: 2 },

  /* Empty state */
  emptyWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingTop: 80, paddingHorizontal: 32,
  },
  emptyIcon:     { fontSize: 52, marginBottom: 16 },
  emptyTitle:    { fontSize: 18, fontWeight: '800', color: NC_DARK, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: NC_MUTED, textAlign: 'center', marginBottom: 24 },
  retryBtn:      { backgroundColor: NC_RED, borderRadius: 12, paddingHorizontal: 28, paddingVertical: 12 },
  retryText:     { color: '#fff', fontWeight: '800', fontSize: 14 },

  /* Detail Modal */
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '88%',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 12,
    elevation: 20,
  },
  dragHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#DDD',
    alignSelf: 'center', marginTop: 12, marginBottom: 6,
  },
  modalImage:   { width: '100%', height: 220, backgroundColor: '#F0F0F0' },
  modalContent: { padding: 20 },
  modalMeta:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  modalTypeChip: { backgroundColor: '#EFF6FF', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  modalTypeText: { fontSize: 11, fontWeight: '700', color: '#3B82F6' },
  modalTime:     { fontSize: 12, color: '#9CA3AF' },
  modalTitle:    { fontSize: 20, fontWeight: '900', color: NC_DARK, lineHeight: 27, marginBottom: 6 },
  modalSubtitle: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 8 },
  modalDivider:  { height: 1, backgroundColor: '#F0F0F0', marginVertical: 14 },
  modalBody:     { fontSize: 14, color: NC_MUTED, lineHeight: 22 },
  modalBodyEmpty:{ fontSize: 14, color: '#B0B7C3', fontStyle: 'italic', lineHeight: 22 },
  modalCTA: {
    backgroundColor: NC_RED, borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginTop: 20,
  },
  modalCTAText:  { color: '#fff', fontSize: 15, fontWeight: '800' },
  modalClose: {
    borderWidth: 1.5, borderColor: '#E5E5E5', borderRadius: 14,
    paddingVertical: 13, alignItems: 'center', marginTop: 10,
  },
  modalCloseText: { color: NC_MUTED, fontSize: 14, fontWeight: '700' },
});
