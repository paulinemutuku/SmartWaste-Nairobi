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
import { useLanguage } from '../contexts/LanguageContext';

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
  const { t } = useLanguage();

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert(t('completeProfile'), t('fillAllFields'));
      return;
    }

    if (!email.includes('@')) {
      Alert.alert(t('validEmailRequired'), t('completeEmail'));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('strongerPassword'), t('passwordLength'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('passwordsDontMatch'), t('ensureSamePassword'));
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
      t('welcomeToFamily'), 
      t('welcomeMessageSignup', result.user.name),
      [{ text: t('startJourney'), onPress: () => router.replace('/') }]
    );
  }
} catch (error) {
  Alert.alert(
    t('accountCreationPaused'), 
    error instanceof Error ? error.message : t('checkConnection')
  );
} finally {
  setIsLoading(false);
}
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: t('empty'), color: '#94A3B8' };
    if (password.length < 6) return { strength: t('tooShort'), color: '#EF4444' };
    if (password.length < 8) return { strength: t('fair'), color: '#F59E0B' };
    if (password.length < 12) return { strength: t('good'), color: '#10B981' };
    return { strength: t('strong'), color: '#047857' };
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
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="sparkles" size={42} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.title}>{t('joinSmartWaste')}</Text>
          <Text style={styles.subtitle}>{t('becomeChampion')}</Text>
          <Text style={styles.tagline}>{t('createAccountStart')}</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>{t('yourInformation')}</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('fullName')}</Text>
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
                placeholder={t('enterFullName')}
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
                autoComplete="name"
                onFocus={() => setIsFocused({...isFocused, name: true})}
                onBlur={() => setIsFocused({...isFocused, name: false})}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('emailAddress')}</Text>
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
                placeholder={t('enterEmail')}
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
            <View style={styles.passwordHeader}>
              <Text style={styles.inputLabel}>{t('createPassword')}</Text>
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
                placeholder={t('chooseSecurePassword')}
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
              {showPassword ? t('passwordVisible') : t('tapToShowPassword')} • {t('minimumCharacters')}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('confirmPassword')}</Text>
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
                placeholder={t('reenterPassword')}
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
              <Text style={styles.errorText}>{t('passwordsDontMatchError')}</Text>
            )}
            {confirmPassword && password === confirmPassword && password.length >= 6 && (
              <Text style={styles.successText}>{t('passwordsMatch')}</Text>
            )}
          </View>

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
                <Text style={styles.signupButtonText}>{t('createAccount')}</Text>
                <Ionicons name="sparkles" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.loginSection}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('alreadyHaveAccount')}</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => router.back()}
            >
              <Text style={styles.loginButtonText}>{t('signInExisting')}</Text>
            </TouchableOpacity>
            
            <Text style={styles.loginHint}>
              {t('welcomeBackMessage')}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('journeyStartsHere')}</Text>
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
    backgroundColor: '#10B981',
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