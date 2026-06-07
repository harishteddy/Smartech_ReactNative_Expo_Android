import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Alert, Platform, KeyboardAvoidingView,
} from 'react-native';
import SmartechBaseReact from 'smartech-base-react-native';
import { HanselUserRn } from 'smartech-reactnative-nudges';
import { saveSession } from '../utils/authSession';

const NC_RED = '#E11D48';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');

  const handleRegister = () => {
    if (!email.trim() || !name.trim()) { Alert.alert('Error', 'Name and email are required'); return; }
    SmartechBaseReact.login(email.trim());
    SmartechBaseReact.setUserIdentity(email.trim());
    SmartechBaseReact.updateUserProfile({
      NAME: name.trim(),
      EMAIL: email.trim(),
      MOBILE: mobile.trim(),
    });
    HanselUserRn.setUserId(email.trim());
    SmartechBaseReact.trackEvent('user_register', { name: name.trim(), email: email.trim() });
    saveSession(email.trim(), name.trim());
    navigation.replace('Main');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar backgroundColor={NC_RED} barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the Netcore CE Demo</Text>
        </View>

        <View style={styles.card}>
          {[
            { label: 'Full Name *', value: name, setter: setName, placeholder: 'John Doe' },
            { label: 'Email Address *', value: email, setter: setEmail, placeholder: 'john@example.com', keyboard: 'email-address' },
            { label: 'Mobile Number', value: mobile, setter: setMobile, placeholder: '+91 9876543210', keyboard: 'phone-pad' },
          ].map(({ label, value, setter, placeholder, keyboard }) => (
            <View key={label}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input} placeholder={placeholder} value={value}
                onChangeText={setter} keyboardType={keyboard || 'default'}
                autoCapitalize="none" placeholderTextColor="#aaa"
              />
            </View>
          ))}

          <TouchableOpacity style={styles.btn} onPress={handleRegister} activeOpacity={0.85}>
            <Text style={styles.btnText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Already have an account? <Text style={{ color: NC_RED, fontWeight: '700' }}>Login</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: NC_RED, padding: 24 },
  header: { marginBottom: 28, paddingTop: 20 },
  backBtn: { marginBottom: 16 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' },
  title: { color: '#fff', fontSize: 26, fontWeight: '900' },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, elevation: 8 },
  label: { fontSize: 12, fontWeight: '700', color: '#6C757D', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1.5, borderColor: '#E5E5E5', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 15,
    color: '#1A1A2E', marginBottom: 16, backgroundColor: '#FAFAFA',
  },
  btn: { backgroundColor: NC_RED, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  linkBtn: { alignItems: 'center', marginTop: 16 },
  linkText: { color: '#6C757D', fontSize: 14 },
});
