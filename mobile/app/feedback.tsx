import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function FeedbackScreen() {
  const router = useRouter();
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  if (!feedback.trim()) {
    Alert.alert('Error', 'Please enter your feedback before submitting.');
    return;
  }

  if (rating === 0) {
    Alert.alert('Error', 'Please select a rating before submitting.');
    return;
  }

  setIsSubmitting(true);

  try {
    // Get current user ID
    const { getUserId } = require('../utils/userHelper');
    const submittedBy = await getUserId();

    if (!submittedBy) {
      Alert.alert('Error', 'Please log in to submit feedback.');
      setIsSubmitting(false);
      return;
    }

    const feedbackData = {
      rating,
      message: feedback.trim(),
      submittedBy
    };

    const { feedbackService } = require('../services/api');
    const result = await feedbackService.submitFeedback(feedbackData);
    
    Alert.alert(
      'Thank You! 🌟',
      'Your feedback has been submitted successfully. We appreciate your input!',
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  } catch (error) {
    Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    console.error('Feedback submission error:', error);
  } finally {
    setIsSubmitting(false);
  }
};

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity
        key={star}
        onPress={() => setRating(star)}
        style={styles.starButton}
      >
        <Ionicons
          name={star <= rating ? "star" : "star-outline"}
          size={32}
          color={star <= rating ? "#FFD700" : "#CCCCCC"}
        />
      </TouchableOpacity>
    ));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#2E8B57" />
        </TouchableOpacity>
        <Text style={styles.title}>Send Feedback</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          We'd love to hear your thoughts, suggestions, or concerns
        </Text>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>How would you rate your experience?</Text>
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
          <Text style={styles.ratingText}>
            {rating === 0 ? 'Select a rating' : `You rated: ${rating}/5 stars`}
          </Text>
        </View>

        {/* Feedback Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Your Feedback *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Tell us what you think about SmartWaste Nairobi... What do you like? What can we improve?"
            multiline
            numberOfLines={8}
            value={feedback}
            onChangeText={setFeedback}
            placeholderTextColor="#999"
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{feedback.length}/500 characters</Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (isSubmitting || !feedback.trim() || rating === 0) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || !feedback.trim() || rating === 0}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="white" />
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Note */}
        <View style={styles.noteSection}>
          <Ionicons name="information-circle" size={20} color="#666" />
          <Text style={styles.noteText}>
            Your feedback helps us improve SmartWaste for all Nairobi residents. 
            We read every submission and appreciate your input!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  ratingSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  starButton: {
    padding: 5,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  inputSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#2E8B57',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
    shadowColor: '#999',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  noteSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2E8B57',
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    lineHeight: 20,
  },
});