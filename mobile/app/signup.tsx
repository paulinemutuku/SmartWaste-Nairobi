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

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({ 
    name: false, 
    email: false, 
    password: false, 
    confirmPassword: false 
  });
  const router = useRouter();
  const { login } = useAuth();

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Complete Your Profile', 'Please fill in all fields to create your account and join our community.');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Valid Email Required', 'Please enter a complete email address with @ symbol to continue.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Stronger Password Needed', 'For your security, please choose a password with at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords Do Not Match', 'Please ensure both password fields contain exactly the same text.');
      return;
    }

    setIsLoading(true);

try {
  const { authService } = require('../services/api');
  const result = await authService.register({ name, email, password });
  
  if (result.success) {
    const userData = {
      ...result.user,
      token: result.token
    };
    
    await login(userData);
    
    Alert.alert(
      'Welcome to the Family! 🎉', 
      `We're thrilled to have you, ${result.user.name}! Together, we'll make Nairobi cleaner and greener.`,
      [{ text: 'Start My Journey', onPress: () => router.replace('/') }]
    );
  }
} catch (error) {
  Alert.alert(
    'Account Creation Paused', 
    error instanceof Error ? error.message : 'Please check your connection and try again in a moment.'
  );
} finally {
  setIsLoading(false);
}
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 'Empty', color: '#94A3B8' };
    if (password.length < 6) return { strength: 'Too Short', color: '#EF4444' };
    if (password.length < 8) return { strength: 'Fair', color: '#F59E0B' };
    if (password.length < 12) return { strength: 'Good', color: '#10B981' };
    return { strength: 'Strong', color: '#047857' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Inspiring Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="sparkles" size={42} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.title}>Join SmartWaste</Text>
          <Text style={styles.subtitle}>Become a Nairobi Clean City Champion</Text>
          <Text style={styles.tagline}>Create your account and start making a visible difference in our community</Text>
        </View>

        {/* Elegant Form Container */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Your Information</Text>
          
          {/* Full Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={[
              styles.inputContainer, 
              isFocused.name && styles.inputContainerFocused
            ]}>
              <Ionicons 
                name="person-outline" 
                size={22} 
                color={isFocused.name ? '#2E8B57' : '#94A3B8'} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
                autoComplete="name"
                onFocus={() => setIsFocused({...isFocused, name: true})}
                onBlur={() => setIsFocused({...isFocused, name: false})}
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={[
              styles.inputContainer, 
              isFocused.email && styles.inputContainerFocused
            ]}>
              <Ionicons 
                name="mail-outline" 
                size={22} 
                color={isFocused.email ? '#2E8B57' : '#94A3B8'} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your email address"
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

          {/* Password Input with Strength Indicator */}
          <View style={styles.inputGroup}>
            <View style={styles.passwordHeader}>
              <Text style={styles.inputLabel}>Create Password</Text>
              {password.length > 0 && (
                <Text style={[styles.passwordStrength, { color: passwordStrength.color }]}>
                  {passwordStrength.strength}
                </Text>
              )}
            </View>
            <View style={[
              styles.inputContainer, 
              isFocused.password && styles.inputContainerFocused
            ]}>
              <Ionicons 
                name="lock-closed-outline" 
                size={22} 
                color={isFocused.password ? '#2E8B57' : '#94A3B8'} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Choose a secure password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                onFocus={() => setIsFocused({...isFocused, password: true})}
                onBlur={() => setIsFocused({...isFocused, password: false})}
              />
              <TouchableOpacity 
                style={styles.visibilityToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color={isFocused.password ? '#2E8B57' : '#94A3B8'} 
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.passwordHint}>
              {showPassword ? '👁️ Password is visible' : '👁️ Tap to show password'} • Minimum 6 characters
            </Text>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={[
              styles.inputContainer, 
              isFocused.confirmPassword && styles.inputContainerFocused,
              confirmPassword && password !== confirmPassword && styles.inputContainerError
            ]}>
              <Ionicons 
                name="lock-closed-outline" 
                size={22} 
                color={
                  confirmPassword && password !== confirmPassword ? '#EF4444' : 
                  isFocused.confirmPassword ? '#2E8B57' : '#94A3B8'
                } 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Re-enter your password"
                placeholderTextColor="#94A3B8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onFocus={() => setIsFocused({...isFocused, confirmPassword: true})}
                onBlur={() => setIsFocused({...isFocused, confirmPassword: false})}
              />
              {confirmPassword && password === confirmPassword && password.length >= 6 && (
                <Ionicons name="checkmark-circle" size={22} color="#10B981" />
              )}
            </View>
            {confirmPassword && password !== confirmPassword && (
              <Text style={styles.errorText}>❌ Passwords do not match</Text>
            )}
            {confirmPassword && password === confirmPassword && password.length >= 6 && (
              <Text style={styles.successText}>✅ Passwords match perfectly!</Text>
            )}
          </View>

          {/* Beautiful Signup Button */}
          <TouchableOpacity 
            style={[
              styles.signupButton, 
              isLoading && styles.signupButtonDisabled,
              (!name || !email || !password || !confirmPassword || password !== confirmPassword) && styles.signupButtonInactive
            ]} 
            onPress={handleSignup}
            disabled={isLoading || !name || !email || !password || !confirmPassword || password !== confirmPassword}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.signupButtonText}>Create My Account</Text>
                <Ionicons name="sparkles" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>

          {/* Elegant Login Section */}
          <View style={styles.loginSection}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Already have an account?</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => router.back()}
            >
              <Text style={styles.loginButtonText}>Sign In to Existing Account</Text>
            </TouchableOpacity>
            
            <Text style={styles.loginHint}>
              Welcome back! We've missed your contributions to our clean city mission
            </Text>
          </View>
        </View>

        {/* Inspiring Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>🌟 Your journey to a cleaner Nairobi starts here</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
    paddingTop: height * 0.06,
    paddingBottom: 35,
    paddingHorizontal: 30,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
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
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passwordStrength: {
    fontSize: 14,
    fontWeight: '600',
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
  inputContainerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
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
  visibilityToggle: {
    padding: 4,
  },
  passwordHint: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 6,
    paddingLeft: 4,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginTop: 6,
    paddingLeft: 4,
    fontWeight: '500',
  },
  successText: {
    fontSize: 13,
    color: '#10B981',
    marginTop: 6,
    paddingLeft: 4,
    fontWeight: '500',
  },
  signupButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 20,
    marginTop: 15,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  signupButtonDisabled: {
    backgroundColor: '#C4B5FD',
  },
  signupButtonInactive: {
    backgroundColor: '#CBD5E1',
    shadowColor: '#64748B',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  loginSection: {
    marginTop: 30,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 15,
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2E8B57',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#2E8B57',
    fontSize: 16,
    fontWeight: '700',
  },
  loginHint: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: 30,
    paddingTop: 35,
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