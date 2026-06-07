import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'smt_user_session';

export async function saveSession(identity, name = '') {
  await AsyncStorage.setItem(KEY, JSON.stringify({ identity, name }));
}

export async function getSession() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearSession() {
  await AsyncStorage.removeItem(KEY);
}
