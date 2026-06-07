import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Alert, Platform, KeyboardAvoidingView,
} from 'react-native';
import SmartechBaseReact from 'smartech-base-react-native';
import { HanselUserRn } from 'smartech-reactnative-nudges';

const NC_RED = '#E11D48';

export default function UpdateProfileScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', city: '', dob: '' });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    const payload = {};
    if (form.name) payload.NAME = form.name;
    if (form.email) payload.EMAIL = form.email;
    if (form.mobile) payload.MOBILE = form.mobile;
    if (form.city) payload.CITY = form.city;
    if (form.dob) payload.DOB = form.dob;

    if (!Object.keys(payload).length) { Alert.alert('Error', 'Fill at least one field'); return; }

    SmartechBaseReact.updateUserProfile(payload);
    if (form.email) HanselUserRn.setUserId(form.email);

    SmartechBaseReact.trackEvent('profile_updated', { fields: Object.keys(payload).join(',') });
    Alert.alert('Success', 'Profile updated successfully', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const FIELDS = [
    { key: 'name', label: 'Full Name', placeholder: 'John Doe' },
    { key: 'email', label: 'Email Address', placeholder: 'john@example.com', keyboard: 'email-address' },
    { key: 'mobile', label: 'Mobile Number', placeholder: '+91 9876543210', keyboard: 'phone-pad' },
    { key: 'city', label: 'City', placeholder: 'Mumbai' },
    { key: 'dob', label: 'Date of Birth', placeholder: 'YYYY-MM-DD' },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar backgroundColor={NC_RED} barStyle="light-content" />
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 60 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Update Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {FIELDS.map(f => (
            <View key={f.key}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input} placeholder={f.placeholder}
                value={form[f.key]} onChangeText={v => set(f.key, v)}
                keyboardType={f.keyboard || 'default'} autoCapitalize="none"
                placeholderTextColor="#aaa"
              />
            </View>
          ))}
          <TouchableOpacity style={styles.btn} onPress={handleSave}>
            <Text style={styles.btnText}>Save Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: NC_RED, paddingHorizontal: 20, paddingBottom: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  back: { color: '#fff', fontSize: 22, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 2 },
  label: { fontSize: 12, fontWeight: '700', color: '#6C757D', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#E5E5E5', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 15,
    color: '#1A1A2E', marginBottom: 14, backgroundColor: '#FAFAFA',
  },
  btn: { backgroundColor: NC_RED, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
