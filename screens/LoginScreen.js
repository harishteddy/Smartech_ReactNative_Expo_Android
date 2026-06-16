import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Alert, Platform, KeyboardAvoidingView,
} from 'react-native';
import SmartechBaseReact from 'smartech-base-react-native';
import { saveSession } from '../utils/authSession';

const NC_RED = '#E11D48';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleLogin = () => {
    if (!email.trim()) { Alert.alert('Error', 'Please enter email'); return; }
    SmartechBaseReact.login(email.trim());
    SmartechBaseReact.setUserIdentity(email.trim());
    SmartechBaseReact.updateUserProfile({
      NAME: name.trim() || 'Demo User',
      EMAIL: email.trim(),
    });
    SmartechBaseReact.trackEvent('user_login', { method: 'email', email: email.trim() });
    saveSession(email.trim(), name.trim() || 'Demo User');
    navigation.replace('Main');
  };

  const handleGuestLogin = () => {
    SmartechBaseReact.trackEvent('user_login', { method: 'guest' });
    saveSession('guest', 'Guest User');
    navigation.replace('Main');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar backgroundColor={NC_RED} barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoCircle}><Text style={styles.logoLetter}>N</Text></View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to Netcore CE Demo</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} placeholder="John Doe" value={name} onChangeText={setName} placeholderTextColor="#aaa" />

          <Text style={styles.label}>Email Address</Text>
          <TextInput style={styles.input} placeholder="john@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#aaa" />

          <TouchableOpacity style={styles.btn} onPress={handleLogin} activeOpacity={0.85}>
            <Text style={styles.btnText}>Sign In</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.guestBtn} onPress={handleGuestLogin} activeOpacity={0.85}>
            <Text style={styles.guestBtnText}>Continue as Guest</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Don't have an account? <Text style={{ color: NC_RED, fontWeight: '700' }}>Register</Text></Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.powered}>Demo app for Smartech Expo SDK</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: NC_RED, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  logoLetter: { color: '#fff', fontSize: 34, fontWeight: '900' },
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
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E5E5' },
  dividerText: { marginHorizontal: 12, fontSize: 12, fontWeight: '700', color: '#9CA3AF' },
  guestBtn: {
    borderWidth: 1.5, borderColor: NC_RED, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', backgroundColor: '#FFF5F7',
  },
  guestBtnText: { color: NC_RED, fontSize: 15, fontWeight: '700' },
  linkBtn: { alignItems: 'center', marginTop: 16 },
  linkText: { color: '#6C757D', fontSize: 14 },
  powered: { textAlign: 'center', color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 24 },
});
