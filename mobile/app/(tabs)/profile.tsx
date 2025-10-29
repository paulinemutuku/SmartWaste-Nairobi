import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  Switch,
  Modal,
  Dimensions,
  Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const { user, login, logout, isAuthenticated } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState('English');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            logout();
            Alert.alert('Signed Out', 'You have been successfully signed out.');
          }
        }
      ]
    );
  };

  const handleLanguageSelect = (selectedLanguage: string) => {
    setLanguage(selectedLanguage);
    setShowLanguageModal(false);
    Alert.alert('Language Updated', `App language changed to ${selectedLanguage}`);
  };

  const PrivacyPolicyModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showPrivacyModal}
      onRequestClose={() => setShowPrivacyModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowPrivacyModal(false)}
            >
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <Text style={styles.policySectionTitle}>Your Privacy Matters</Text>
            <Text style={styles.policyText}>
              At SmartWaste Nairobi, we are committed to protecting your privacy and ensuring the security of your personal information.
            </Text>
            
            <Text style={styles.policySectionTitle}>Information We Collect</Text>
            <Text style={styles.policyText}>
              • Personal identification information (Name, email address){'\n'}
              • Location data for waste reporting{'\n'}
              • Photos submitted with waste reports{'\n'}
              • App usage statistics
            </Text>
            
            <Text style={styles.policySectionTitle}>How We Use Your Information</Text>
            <Text style={styles.policyText}>
              • To provide and improve our waste management services{'\n'}
              • To communicate important updates about your reports{'\n'}
              • To analyze trends and improve Nairobi's cleanliness{'\n'}
              • To ensure the security of our platform
            </Text>
            
            <Text style={styles.policySectionTitle}>Data Security</Text>
            <Text style={styles.policyText}>
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, or disclosure.
            </Text>
            
            <Text style={styles.policyFooter}>
              Last updated: December 2024{'\n'}
              SmartWaste Nairobi - Building a Cleaner City Together
            </Text>
          </ScrollView>
          
          <TouchableOpacity 
            style={styles.modalButton}
            onPress={() => setShowPrivacyModal(false)}
          >
            <Text style={styles.modalButtonText}>I Understand</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const LanguageModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showLanguageModal}
      onRequestClose={() => setShowLanguageModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.languageModalContent}>
          <Text style={styles.languageModalTitle}>Choose Language</Text>
          
          <TouchableOpacity 
            style={[
              styles.languageOption,
              language === 'English' && styles.languageOptionSelected
            ]}
            onPress={() => handleLanguageSelect('English')}
          >
            <Text style={styles.languageText}>🇺🇸 English</Text>
            {language === 'English' && (
              <Ionicons name="checkmark-circle" size={24} color="#2E8B57" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.languageOption,
              language === 'Swahili' && styles.languageOptionSelected
            ]}
            onPress={() => handleLanguageSelect('Swahili')}
          >
            <Text style={styles.languageText}>🇰🇪 Kiswahili</Text>
            {language === 'Swahili' && (
              <Ionicons name="checkmark-circle" size={24} color="#2E8B57" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.modalButton}
            onPress={() => setShowLanguageModal(false)}
          >
            <Text style={styles.modalButtonText}>Confirm Selection</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Beautiful Header */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color="#FFFFFF" />
              </View>
              <View style={styles.avatarGlow} />
            </View>
            
            {user ? (
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.userBadge}>
                  <Ionicons name="ribbon" size={16} color="#FFFFFF" />
                  <Text style={styles.badgeText}>Nairobi Clean Champion</Text>
                </View>
              </View>
            ) : (
              <View style={styles.userInfo}>
                <Text style={styles.welcomeTitle}>Welcome to SmartWaste</Text>
                <Text style={styles.welcomeSubtitle}>Sign in to personalize your experience</Text>
              </View>
            )}
          </View>

          {/* Authentication Section */}
          <View style={styles.section}>
            {user ? (
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                <Text style={styles.logoutButtonText}>Sign Out</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={handleLogin}
              >
                <Ionicons name="person-circle-outline" size={22} color="#FFFFFF" />
                <Text style={styles.loginButtonText}>Sign In to Your Account</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Stats Section for Logged-in Users */}
          {user && (
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Your Impact</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>12</Text>
                  <Text style={styles.statLabel}>Reports Submitted</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>8</Text>
                  <Text style={styles.statLabel}>Issues Resolved</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>4</Text>
                  <Text style={styles.statLabel}>Active Reports</Text>
                </View>
              </View>
            </View>
          )}

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences & Settings</Text>
            
            {/* Notifications Setting */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={22} color="#2E8B57" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Push Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Receive updates about your reports and city cleanliness
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E2E8F0', true: '#86EFAC' }}
                thumbColor={notificationsEnabled ? '#2E8B57' : '#94A3B8'}
              />
            </View>

            {/* Language Setting */}
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => setShowLanguageModal(true)}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="language-outline" size={22} color="#7C3AED" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>App Language</Text>
                  <Text style={styles.settingDescription}>
                    Currently: {language}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>

            {/* Privacy Policy */}
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => setShowPrivacyModal(true)}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="shield-checkmark-outline" size={22} color="#3B82F6" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Privacy Policy</Text>
                  <Text style={styles.settingDescription}>
                    Learn how we protect and use your data
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support & Information</Text>
            
            <TouchableOpacity style={styles.supportItem}>
              <Ionicons name="help-circle-outline" size={22} color="#F59E0B" />
              <Text style={styles.supportText}>Help & FAQ</Text>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.supportItem}>
              <Ionicons name="star-outline" size={22} color="#8B5CF6" />
              <Text style={styles.supportText}>Rate Our App</Text>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.supportItem}>
              <Ionicons name="share-social-outline" size={22} color="#EC4899" />
              <Text style={styles.supportText}>Share SmartWaste</Text>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>SmartWaste Nairobi v1.0</Text>
            <Text style={styles.versionSubtext}>Building a cleaner city together</Text>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Modals */}
      <LanguageModal />
      <PrivacyPolicyModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 30,
    backgroundColor: 'linear-gradient(135deg, #2E8B57 0%, #3B82F6 100%)',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2E8B57',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  avatarGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(46, 139, 87, 0.3)',
    top: -10,
    left: -10,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#2E8B57',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    padding: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2E8B57',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 18,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  supportText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginLeft: 16,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: '#CBD5E1',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 0,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  languageModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 30,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 24,
    maxHeight: 400,
  },
  policySectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 20,
    marginBottom: 8,
  },
  policyText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  policyFooter: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 20,
    fontStyle: 'italic',
  },
  languageModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 24,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  languageOptionSelected: {
    borderColor: '#2E8B57',
    backgroundColor: '#F0FDF4',
  },
  languageText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  modalButton: {
    backgroundColor: '#2E8B57',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});