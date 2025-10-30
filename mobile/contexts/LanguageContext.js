import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('English');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('appLanguage');
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (newLanguage) => {
    try {
      setLanguage(newLanguage);
      await AsyncStorage.setItem('appLanguage', newLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const translations = {
    English: {
      // Profile Screen
      welcomeTitle: 'Welcome to SmartWaste',
      welcomeSubtitle: 'Sign in to personalize your experience',
      userName: 'SmartWaste User',
      userEmail: 'user@example.com',
      nairobiChampion: 'Nairobi Clean Champion',
      signIn: 'Sign In to Your Account',
      signOut: 'Sign Out',
      settingsTitle: 'Preferences & Settings',
      pushNotifications: 'Push Notifications',
      notificationsDesc: 'Receive updates about your reports and city cleanliness',
      appLanguage: 'App Language',
      languageDesc: 'Currently: English',
      privacyPolicy: 'Privacy Policy',
      privacyDesc: 'Learn how we protect and use your data',
      supportTitle: 'Support & Information',
      sendFeedback: 'Send Feedback',
      helpFaq: 'Help & FAQ',
      rateApp: 'Rate Our App',
      shareApp: 'Share SmartWaste',
      appVersion: 'SmartWaste Nairobi v1.0',
      buildingCity: 'Building a cleaner city together',
      
      // Language Modal
      chooseLanguage: 'Choose Language',
      english: 'English',
      swahili: 'Kiswahili',
      confirmSelection: 'Confirm Selection',
      languageUpdated: 'Language Updated',
      
      // Privacy Modal
      privacyPolicyTitle: 'Privacy Policy',
      yourPrivacyMatters: 'Your Privacy Matters',
      informationWeCollect: 'Information We Collect',
      howWeUseInfo: 'How We Use Your Information',
      dataSecurity: 'Data Security',
      lastUpdated: 'Last updated: December 2024',
    },
    Swahili: {
      // Profile Screen
      welcomeTitle: 'Karibu kwenye SmartWaste',
      welcomeSubtitle: 'Ingia ili kubinafsisha uzoefu wako',
      userName: 'Mtumiaji wa SmartWaste',
      userEmail: 'mtumiaji@mfano.com',
      nairobiChampion: 'Bingwa wa Usafi wa Nairobi',
      signIn: 'Ingia kwenye Akaunti Yako',
      signOut: 'Toka',
      settingsTitle: 'Mapendeleo na Mipangilio',
      pushNotifications: 'Arifa za Kukwaruza',
      notificationsDesc: 'Pokea visasisho kuhusu ripoti zako na usafi wa jiji',
      appLanguage: 'Lugha ya Programu',
      languageDesc: 'Kwa sasa: Kiswahili',
      privacyPolicy: 'Sera ya Faragha',
      privacyDesc: 'Jua jinsi tunavyolinda na kutumia data yako',
      supportTitle: 'Usaidizi na Taarifa',
      sendFeedback: 'Tuma Maoni',
      helpFaq: 'Usaidizi na Maswali Yanayoulizwa Mara kwa Mara',
      rateApp: 'Kadiria Programu Yetu',
      shareApp: 'Shiriki SmartWaste',
      appVersion: 'SmartWaste Nairobi Toleo 1.0',
      buildingCity: 'Kujenga jiji safi pamoja',
      
      // Language Modal
      chooseLanguage: 'Chagua Lugha',
      english: 'Kiingereza',
      swahili: 'Kiswahili',
      confirmSelection: 'Thibitisha Uchaguzi',
      languageUpdated: 'Lugha Imebadilishwa',
      
      // Privacy Modal
      privacyPolicyTitle: 'Sera ya Faragha',
      yourPrivacyMatters: 'Faragha Yako Ni Muhimu',
      informationWeCollect: 'Taarifa Tunazokusanya',
      howWeUseInfo: 'Jinsi Tunavyotumia Taarifa Zako',
      dataSecurity: 'Usalama wa Data',
      lastUpdated: 'Ilisasishwa mwisho: Desemba 2024',
    }
  };

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  const value = {
    language,
    changeLanguage,
    t,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};