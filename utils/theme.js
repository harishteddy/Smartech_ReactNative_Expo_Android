import { Platform, StyleSheet } from 'react-native';

// ─── Brand palette ─────────────────────────────────────────────────────────
export const C = {
  // Primary
  red:    '#E11D48',
  redBg:  '#FFF1F3',
  redMid: '#FB7185',

  // Neutral
  dark:   '#1A1A2E',
  mid:    '#374151',
  muted:  '#6C757D',
  faint:  '#9CA3AF',
  border: '#E5E5E5',
  divider:'#F0F0F0',
  bg:     '#F8F9FA',
  card:   '#FFFFFF',
  input:  '#FAFAFA',

  // Accent colours used across screens
  blue:   '#3B82F6',
  green:  '#10B981',
  purple: '#8B5CF6',
  amber:  '#F59E0B',
  pink:   '#EC4899',
  cyan:   '#06B6D4',
  slate:  '#6B7280',
  danger: '#EF4444',
  dangerBg:'#FEE2E2',
};

// ─── Common StyleSheet fragments ────────────────────────────────────────────
export const S = StyleSheet.create({
  // Screen root
  root: { flex: 1, backgroundColor: C.bg },

  // Standard header (NC_RED background)
  header: {
    backgroundColor: C.red,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  backArrow:   { color: '#fff', fontSize: 22, fontWeight: '700' },
  headerSpacer:{ width: 28 },

  // Card
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },

  // Section title label (all-caps small text above a card section)
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },

  // Form label above an input
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  // Standard text input
  input: {
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: C.dark,
    marginBottom: 16,
    backgroundColor: C.input,
  },

  // Primary CTA button
  btn: {
    backgroundColor: C.red,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  // Monospace value (GUID, push token)
  mono: {
    fontSize: 13,
    color: C.dark,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 18,
  },

  // Danger button
  dangerBtn: {
    backgroundColor: C.dangerBg,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dangerText: { color: C.danger, fontSize: 14, fontWeight: '800' },

  // Row with label + value (info list)
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.divider,
  },
  infoLabel: { fontSize: 13, color: C.muted },
  infoValue:  { fontSize: 13, fontWeight: '700', color: C.dark, flex: 1, textAlign: 'right' },

  // Content padding
  content: { padding: 16, paddingBottom: 40 },

  // Switch track/thumb helpers are functions — see helpers below
});

/** Returns the paddingTop for a standard header on Android (respects status bar). */
export function headerPadTop() {
  const { StatusBar, Platform } = require('react-native');
  return Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 60;
}
