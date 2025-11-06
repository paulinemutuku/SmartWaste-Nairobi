import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../contexts/LanguageContext';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/GreenBin_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>{t('appName')}</Text>
        <Text style={styles.subtitle}>{t('appTagline')}</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{t('heroTitle')}</Text>
        <Text style={styles.heroText}>
          {t('heroDescription')}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/report')}>
          <View style={styles.iconContainer}>
            <Text style={styles.actionIcon}>📝</Text>
          </View>
          <Text style={styles.actionTitle}>{t('reportIssue')}</Text>
          <Text style={styles.actionDesc}>{t('reportIssueDesc')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/status')}>
          <View style={styles.iconContainer}>
            <Text style={styles.actionIcon}>📊</Text>
          </View>
          <Text style={styles.actionTitle}>{t('myReports')}</Text>
          <Text style={styles.actionDesc}>{t('myReportsDesc')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/profile')}>
          <View style={styles.iconContainer}>
            <Text style={styles.actionIcon}>👤</Text>
          </View>
          <Text style={styles.actionTitle}>{t('profile')}</Text>
          <Text style={styles.actionDesc}>{t('profileDesc')}</Text>
        </TouchableOpacity>
      </View>

      {/* New Feature Highlights Section */}
      <View style={styles.features}>
        <Text style={styles.featuresTitle}>{t('howItWorks')}</Text>
        
        <View style={styles.featureRow}>
          <View style={styles.featureItem}>
            <View style={styles.featureNumber}>
              <Text style={styles.featureNumberText}>1</Text>
            </View>
            <Text style={styles.featureItemTitle}>{t('step1Title')}</Text>
            <Text style={styles.featureItemDesc}>{t('step1Desc')}</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureNumber}>
              <Text style={styles.featureNumberText}>2</Text>
            </View>
            <Text style={styles.featureItemTitle}>{t('step2Title')}</Text>
            <Text style={styles.featureItemDesc}>{t('step2Desc')}</Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureItem}>
            <View style={styles.featureNumber}>
              <Text style={styles.featureNumberText}>3</Text>
            </View>
            <Text style={styles.featureItemTitle}>{t('step3Title')}</Text>
            <Text style={styles.featureItemDesc}>{t('step3Desc')}</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureNumber}>
              <Text style={styles.featureNumberText}>4</Text>
            </View>
            <Text style={styles.featureItemTitle}>{t('step4Title')}</Text>
            <Text style={styles.featureItemDesc}>{t('step4Desc')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>{t('impactTitle')}</Text>
        <Text style={styles.infoText}>
          {t('impactDescription')}
        </Text>
        
        <View style={styles.impactStats}>
          <View style={styles.impactItem}>
            <Text style={styles.impactNumber}>{t('efficiencyStat')}</Text>
            <Text style={styles.impactLabel}>{t('efficiencyLabel')}</Text>
          </View>
          <View style={styles.impactItem}>
            <Text style={styles.impactNumber}>{t('fuelStat')}</Text>
            <Text style={styles.impactLabel}>{t('fuelLabel')}</Text>
          </View>
          <View style={styles.impactItem}>
            <Text style={styles.impactNumber}>{t('clusteringStat')}</Text>
            <Text style={styles.impactLabel}>{t('clusteringLabel')}</Text>
          </View>
        </View>
      </View>

      {/* Call to Action */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>{t('ctaTitle')}</Text>
        <Text style={styles.ctaText}>{t('ctaDescription')}</Text>
        <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/report')}>
          <Text style={styles.ctaButtonText}>{t('ctaButton')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#1a472a',
    paddingHorizontal: 25,
    paddingTop: 50,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#a7ffb3',
    textAlign: 'center',
    marginTop: 5,
    fontWeight: '500',
  },
  hero: {
    alignItems: 'center',
    padding: 30,
    paddingBottom: 25,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d5a3c',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 28,
  },
  heroText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '90%',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#2d5a3c',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  actionDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  features: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 25,
    padding: 25,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d5a3c',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 15,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
  },
  featureNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a472a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  featureItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d5a3c',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureItemDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  infoSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 25,
    padding: 25,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5a3c',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  impactStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  impactItem: {
    alignItems: 'center',
  },
  impactNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a472a',
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  ctaSection: {
    backgroundColor: '#1a472a',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 14,
    color: '#a7ffb3',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a472a',
  },
});