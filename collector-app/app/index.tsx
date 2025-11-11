import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  Alert, 
  ActivityIndicator,
  ScrollView,
  Dimensions 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

export default function CollectorLoginScreen() {
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState({ email: false });
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    if (!email) {
      Alert.alert('Missing Information', 'Please enter your email');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    const success = await login(email);
    
    if (success) {
      Alert.alert(
        'Welcome Back! 🎉', 
        'Ready to make Nairobi cleaner!',
        [{ 
          text: 'View Routes', 
          onPress: () => router.replace('/(tabs)') 
        }]
      );
    } else {
      Alert.alert('Sign In Failed', 'Collector not found. Please check your email.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="trash" size={42} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.title}>SmartWaste Collector</Text>
          <Text style={styles.subtitle}>Professional Waste Management</Text>
          <Text style={styles.tagline}>Sign in to access your collection routes</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Collector Login</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Your Email</Text>
            <View style={[
              styles.inputContainer, 
              isFocused.email && styles.inputContainerFocused
            ]}>
              <Ionicons 
                name="person-outline" 
                size={22} 
                color={isFocused.email ? '#2E8B57' : '#94A3B8'} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="your.email@smartwaste.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                onFocus={() => setIsFocused({...isFocused, email: true})}
                onBlur={() => setIsFocused({...isFocused, email: false})}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[
              styles.loginButton, 
              isLoading && styles.loginButtonDisabled,
              (!email) && styles.loginButtonInactive
            ]} 
            onPress={handleLogin}
            disabled={isLoading || !email}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.loginButtonText}>Access My Routes</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Making Nairobi Cleaner, One Route at a Time 🚛</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Your existing styles here...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: height * 0.08,
    paddingBottom: 40,
    paddingHorizontal: 30,
  },
  logoContainer: {
    marginBottom: 25,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#2E8B57',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#2E8B57',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  formContainer: {
    backgroundColor: 'white',
    marginHorizontal: 25,
    borderRadius: 24,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    paddingLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: '#F1F5F9',
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainerFocused: {
    borderColor: '#2E8B57',
    backgroundColor: '#FFFFFF',
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#2E8B57',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#86EFAC',
  },
  loginButtonInactive: {
    backgroundColor: '#CBD5E1',
    shadowColor: '#64748B',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  footer: {
    paddingHorizontal: 30,
    paddingTop: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});