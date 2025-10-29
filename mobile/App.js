import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './services/api';

export default function App() {
  useEffect(() => {
    const updateActivityOnStart = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          if (user.user && user.user._id) {
            await authService.updateUserActivity(user.user._id);
          }
        }
      } catch (error) {
        console.log('Activity update on start failed');
      }
    };

    updateActivityOnStart();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SmartWaste Nairobi</Text>
      <Text style={styles.subtitle}>Mobile App Loading...</Text>
      <Text style={styles.note}>We're building the citizen reporting app</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2E8B57',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#666',
  },
  note: {
    fontSize: 14,
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
  },
});