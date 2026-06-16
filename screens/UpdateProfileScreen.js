import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Alert, Platform, KeyboardAvoidingView, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SmartechBaseReact from 'smartech-base-react-native';

const NC_RED  = '#E11D48';
const NC_DARK = '#1A1A2E';

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

function pad(n) { return String(n).padStart(2, '0'); }

function formatDOB(y, m, d) {
  if (!y || !m || !d) return '';
  return `${y}-${pad(m)}-${pad(d)}`;
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();          // month is 1-based
}

// ── Date Picker Modal ─────────────────────────────────────────────────────────
function DatePickerModal({ visible, onConfirm, onCancel, initial }) {
  const today   = new Date();
  const initY   = initial?.year  ?? today.getFullYear() - 25;
  const initM   = initial?.month ?? 1;
  const initD   = initial?.day   ?? 1;

  const [year,  setYear]  = useState(initY);
  const [month, setMonth] = useState(initM);   // 1-12
  const [day,   setDay]   = useState(initD);

  const maxYear = today.getFullYear();
  const minYear = 1920;
  const maxDay  = daysInMonth(year, month);
  const safeDay = Math.min(day, maxDay);

  const changeYear  = (delta) => setYear(v => Math.min(maxYear, Math.max(minYear, v + delta)));
  const changeMonth = (delta) => {
    setMonth(v => {
      let n = v + delta;
      if (n < 1)  n = 12;
      if (n > 12) n = 1;
      return n;
    });
  };
  const changeDay = (delta) => {
    setDay(v => {
      let n = v + delta;
      if (n < 1)      n = maxDay;
      if (n > maxDay) n = 1;
      return n;
    });
  };

  const handleConfirm = () => onConfirm({ year, month, day: safeDay });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <TouchableOpacity style={dp.backdrop} activeOpacity={1} onPress={onCancel} />

      <View style={dp.sheet}>
        {/* Handle bar */}
        <View style={dp.handle} />

        <Text style={dp.title}>Select Date of Birth</Text>
        <Text style={dp.subtitle}>Format: {formatDOB(year, month, safeDay) || 'YYYY-MM-DD'}</Text>

        <View style={dp.pickerRow}>

          {/* ── Day ── */}
          <View style={dp.col}>
            <Text style={dp.colLabel}>DAY</Text>
            <TouchableOpacity onPress={() => changeDay(1)} style={dp.arrow} activeOpacity={0.7}>
              <Ionicons name="chevron-up" size={20} color={NC_RED} />
            </TouchableOpacity>
            <View style={dp.valueBox}>
              <Text style={dp.value}>{pad(safeDay)}</Text>
            </View>
            <TouchableOpacity onPress={() => changeDay(-1)} style={dp.arrow} activeOpacity={0.7}>
              <Ionicons name="chevron-down" size={20} color={NC_RED} />
            </TouchableOpacity>
          </View>

          <Text style={dp.sep}>–</Text>

          {/* ── Month ── */}
          <View style={[dp.col, { flex: 2 }]}>
            <Text style={dp.colLabel}>MONTH</Text>
            <TouchableOpacity onPress={() => changeMonth(1)} style={dp.arrow} activeOpacity={0.7}>
              <Ionicons name="chevron-up" size={20} color={NC_RED} />
            </TouchableOpacity>
            <View style={dp.valueBox}>
              <Text style={[dp.value, { fontSize: 16 }]}>{MONTHS[month - 1]}</Text>
              <Text style={dp.valueSmall}>{pad(month)}</Text>
            </View>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={dp.arrow} activeOpacity={0.7}>
              <Ionicons name="chevron-down" size={20} color={NC_RED} />
            </TouchableOpacity>
          </View>

          <Text style={dp.sep}>–</Text>

          {/* ── Year ── */}
          <View style={dp.col}>
            <Text style={dp.colLabel}>YEAR</Text>
            <TouchableOpacity onPress={() => changeYear(1)} style={dp.arrow} activeOpacity={0.7}>
              <Ionicons name="chevron-up" size={20} color={NC_RED} />
            </TouchableOpacity>
            <View style={dp.valueBox}>
              <Text style={dp.value}>{year}</Text>
            </View>
            <TouchableOpacity onPress={() => changeYear(-1)} style={dp.arrow} activeOpacity={0.7}>
              <Ionicons name="chevron-down" size={20} color={NC_RED} />
            </TouchableOpacity>
          </View>

        </View>

        {/* Action buttons */}
        <View style={dp.actions}>
          <TouchableOpacity style={dp.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
            <Text style={dp.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={dp.confirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={dp.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const dp = StyleSheet.create({
  backdrop:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet:      { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: Platform.OS === 'ios' ? 34 : 24, paddingHorizontal: 24 },
  handle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  title:      { fontSize: 18, fontWeight: '800', color: NC_DARK, textAlign: 'center', marginTop: 12 },
  subtitle:   { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 4, marginBottom: 20, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
  pickerRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  col:        { flex: 1, alignItems: 'center' },
  colLabel:   { fontSize: 9, fontWeight: '800', color: '#9CA3AF', letterSpacing: 0.8, marginBottom: 6 },
  arrow:      { padding: 8 },
  valueBox:   { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 10, alignItems: 'center', minWidth: 56 },
  value:      { fontSize: 20, fontWeight: '900', color: NC_DARK },
  valueSmall: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  sep:        { fontSize: 20, fontWeight: '700', color: '#D1D5DB', marginTop: 28 },
  actions:    { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn:  { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '700', color: '#6B7280' },
  confirmBtn: { flex: 2, flexDirection: 'row', paddingVertical: 14, borderRadius: 14, backgroundColor: NC_RED, alignItems: 'center', justifyContent: 'center' },
  confirmText:{ fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function UpdateProfileScreen({ navigation }) {
  const [form, setForm]       = useState({ name: '', email: '', mobile: '', city: '', dob: '' });
  const [showPicker, setShowPicker] = useState(false);
  const [dobParts, setDobParts]     = useState(null);   // { year, month, day }

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleDateConfirm = ({ year, month, day }) => {
    setDobParts({ year, month, day });
    const formatted = formatDOB(year, month, day);
    set('dob', formatted);
    setShowPicker(false);
  };

  const clearDOB = () => {
    setDobParts(null);
    set('dob', '');
  };

  const handleSave = () => {
    const payload = {};
    if (form.name)   payload.NAME   = form.name;
    if (form.email)  payload.EMAIL  = form.email;
    if (form.mobile) payload.MOBILE = form.mobile;
    if (form.city)   payload.CITY   = form.city;
    if (form.dob)    payload.DOB    = form.dob;   // "YYYY-MM-DD"

    if (!Object.keys(payload).length) { Alert.alert('Error', 'Fill at least one field'); return; }

    SmartechBaseReact.updateUserProfile(payload);
    SmartechBaseReact.trackEvent('profile_updated', { fields: Object.keys(payload).join(',') });

    Alert.alert('Success', 'Profile updated successfully', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const statusBarH = StatusBar.currentHeight ?? 0;
  // Total header height used as keyboard offset so content scrolls above keyboard
  const headerHeight = statusBarH + 54;

  return (
    <View style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <StatusBar backgroundColor={NC_RED} barStyle="light-content" translucent={false} />

      {/* Header — outside KeyboardAvoidingView so it never moves */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? statusBarH + 10 : 54 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Profile</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* KeyboardAvoidingView wraps ONLY the scroll area */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
      >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      >
        <View style={styles.card}>

          {/* ── Text fields ── */}
          {[
            { key: 'name',   label: 'Full Name',      placeholder: 'John Doe',           keyboard: 'default',       icon: 'person-outline' },
            { key: 'email',  label: 'Email Address',  placeholder: 'john@example.com',   keyboard: 'email-address', icon: 'mail-outline' },
            { key: 'mobile', label: 'Mobile Number',  placeholder: '+91 9876543210',     keyboard: 'phone-pad',     icon: 'call-outline' },
            { key: 'city',   label: 'City',           placeholder: 'Mumbai',             keyboard: 'default',       icon: 'location-outline' },
          ].map(f => (
            <View key={f.key} style={styles.fieldWrap}>
              <View style={styles.labelRow}>
                <Ionicons name={f.icon} size={12} color="#9CA3AF" style={{ marginRight: 5 }} />
                <Text style={styles.label}>{f.label}</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChangeText={v => set(f.key, v)}
                keyboardType={f.keyboard}
                autoCapitalize="none"
                placeholderTextColor="#C4C9D4"
              />
            </View>
          ))}

          {/* ── Date of Birth picker ── */}
          <View style={styles.fieldWrap}>
            <View style={styles.labelRow}>
              <Ionicons name="calendar-outline" size={12} color="#9CA3AF" style={{ marginRight: 5 }} />
              <Text style={styles.label}>Date of Birth</Text>
            </View>

            <TouchableOpacity
              style={[styles.dateBtn, form.dob && styles.dateBtnFilled]}
              onPress={() => setShowPicker(true)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="calendar"
                size={18}
                color={form.dob ? NC_RED : '#C4C9D4'}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.dateBtnText, form.dob && styles.dateBtnTextFilled]}>
                {form.dob || 'Select date  (YYYY-MM-DD)'}
              </Text>
              {form.dob ? (
                <TouchableOpacity onPress={clearDOB} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-circle" size={18} color="#D1D5DB" />
                </TouchableOpacity>
              ) : (
                <Ionicons name="chevron-down" size={16} color="#C4C9D4" />
              )}
            </TouchableOpacity>

            {/* Format hint */}
            {form.dob ? (
              <View style={styles.dobConfirm}>
                <Ionicons name="checkmark-circle" size={13} color="#10B981" style={{ marginRight: 5 }} />
                <Text style={styles.dobConfirmText}>Will be saved as: <Text style={styles.dobConfirmValue}>{form.dob}</Text></Text>
              </View>
            ) : (
              <Text style={styles.dobHint}>Tap to open date selector · Saved as YYYY-MM-DD</Text>
            )}
          </View>

          {/* ── Save button ── */}
          <TouchableOpacity style={styles.btn} onPress={handleSave} activeOpacity={0.85}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.btnText}>Save Profile</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Date Picker Modal ── */}
      <DatePickerModal
        visible={showPicker}
        onConfirm={handleDateConfirm}
        onCancel={() => setShowPicker(false)}
        initial={dobParts}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: {
    backgroundColor: NC_RED, paddingHorizontal: 16, paddingBottom: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    elevation: 4, shadowColor: NC_RED, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },

  content: { padding: 16, paddingBottom: 120 },
  card:    { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 6 },

  fieldWrap: { marginBottom: 16 },
  labelRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  label:     { fontSize: 11, fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.6 },

  input: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 13, fontSize: 15,
    color: NC_DARK, backgroundColor: '#FAFAFA',
  },

  // Date button
  dateBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 13, backgroundColor: '#FAFAFA',
  },
  dateBtnFilled: { borderColor: NC_RED + '55', backgroundColor: '#FFF5F7' },
  dateBtnText:   { flex: 1, fontSize: 15, color: '#C4C9D4' },
  dateBtnTextFilled: { color: NC_DARK, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },

  dobHint:        { fontSize: 11, color: '#9CA3AF', marginTop: 5, marginLeft: 2 },
  dobConfirm:     { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  dobConfirmText: { fontSize: 12, color: '#374151' },
  dobConfirmValue:{ fontWeight: '800', color: '#10B981', fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },

  btn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: NC_RED, borderRadius: 14, paddingVertical: 15, marginTop: 8 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
