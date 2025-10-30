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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const router = useRouter();
  const { login } = useAuth();

const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Missing Information', 'Please enter both your email address and password to continue.');
    return;
  }

  if (!email.includes('@')) {
    Alert.alert('Invalid Email', 'Please enter a valid email address with @ symbol.');
    return;
  }

  setIsLoading(true);

  try {
    const { authService } = require('../services/api');
    
    const result = await authService.login({ email, password });
    
    if (result.success) {
      const userData = {
  user: result.user,
  token: result.token 
};
      
      await login(userData);
      
      Alert.alert(
        'Welcome Back! 🌟', 
        `It's wonderful to see you again, ${result.user.name}! Ready to continue making Nairobi cleaner?`,
        [{ text: 'Let\'s Go!', onPress: () => router.replace('/') }]
      );
    }
  } catch (error) {
    Alert.alert(
      'Unable to Sign In', 
      error instanceof Error ? error.message : 'Please check your connection and try again.'
    );
  } finally {
    setIsLoading(false);
  }
};

  const handleSignup = () => {
    router.push('/signup');
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
              <Ionicons name="leaf" size={42} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.title}>Welcome to SmartWaste</Text>
          <Text style={styles.subtitle}>Nairobi's Clean City Initiative</Text>
          <Text style={styles.tagline}>Sign in to continue your impact on our beautiful city</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Your Account</Text>
          
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

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
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
                placeholder="Enter your password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
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
              {showPassword ? '👁️ Password is visible' : '👁️ Tap to show password'}
            </Text>
          </View>

          <TouchableOpacity 
            style={[
              styles.loginButton, 
              isLoading && styles.loginButtonDisabled,
              (!email || !password) && styles.loginButtonInactive
            ]} 
            onPress={handleLogin}
            disabled={isLoading || !email || !password}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.loginButtonText}>Sign In to Your Account</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.signupSection}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>New to SmartWaste?</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <TouchableOpacity 
              style={styles.signupButton}
              onPress={handleSignup}
            >
              <Text style={styles.signupButtonText}>Create Your Account</Text>
            </TouchableOpacity>
            
            <Text style={styles.signupHint}>
              Join thousands of Nairobians making our city cleaner every day
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>🌿 Together, we're building a cleaner, greener Nairobi</Text>
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
  signupSection: {
    marginTop: 35,
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
  signupButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2E8B57',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#2E8B57',
    fontSize: 16,
    fontWeight: '700',
  },
  signupHint: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 20,
    fontStyle: 'italic',
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