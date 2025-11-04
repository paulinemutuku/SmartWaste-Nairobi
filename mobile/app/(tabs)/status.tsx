import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';

type Report = {
  id: string;
  address?: string;
  location?: string;
  status: string;
  date?: string;
  timestamp?: string;
  description: string;
  priority: string;
  images?: string[];
};

export default function StatusScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [])
  );

  useEffect(() => {
    if (params.newReport) {
      const newReport: Report = JSON.parse(params.newReport as string);
      setReports(prev => [newReport, ...prev]);
    }
  }, [params.newReport]);

const loadReports = async () => {
  try {
    const { reportService } = require('../../services/api');
    
    // Get current user ID using our helper
    const { getUserId } = require('../../utils/userHelper');
    const userId = await getUserId();

    if (!userId) {
      console.log('No user ID found');
      setReports([]);
      return;
    }

    // Get reports for the specific user only
    console.log('Fetching reports for user ID:', userId);
    const result = await reportService.getUserReports(userId);
    console.log('API Response:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('Reports found:', result.reports.length);
      
      // FIXED DATA TRANSFORMATION
      const transformedReports = result.reports.map((report: any) => {
        console.log('Raw report data:', report);
        
        return {
          id: report._id,
          address: report.location, // CHANGED: Use report.location directly
          location: report.location, // CHANGED: Use report.location directly
          status: report.status === 'submitted' ? 'Submitted' : 
                  report.status === 'in-progress' ? 'In Progress' : 'Completed',
          timestamp: report.createdAt,
          description: report.description,
          priority: report.priority || 'Medium',
          images: report.photo ? [report.photo] : [] // CHANGED: Use report.photo (single photo)
        };
      });
      
      console.log('Transformed reports:', transformedReports);
      setReports(transformedReports);
    } else {
      console.log('No reports found or API error');
      setReports([]);
    }
  } catch (error) {
    console.error('Failed to load user reports:', error);
    setReports([]);
  }
};

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Submitted': return '#FFA500';
      case 'In Progress': return '#4682B4';
      case 'Completed': return '#2E8B57';
      default: return '#666';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'High': return '#FF4444';
      case 'Medium': return '#FFA500';
      case 'Low': return '#2E8B57';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Submitted': return '📋';
      case 'In Progress': return '🔄';
      case 'Completed': return '✅';
      default: return '📄';
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Reports</Text>
        <Text style={styles.subtitle}>Track your waste complaints</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{reports.length}</Text>
          <Text style={styles.statLabel}>Total Reports</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{reports.filter(r => r.status === 'Completed').length}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{reports.filter(r => r.status !== 'Completed').length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
      </View>

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.reportCard}>
            <View style={styles.cardHeader}>
              <View style={styles.locationContainer}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.location}>{item.address || item.location}</Text>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
                <Text style={styles.priorityText}>{item.priority}</Text>
              </View>
            </View>
            
            <Text style={styles.description}>{item.description}</Text>
            
            {item.images && item.images.length > 0 && (
  <View style={styles.imagesContainer}>
    <Text style={styles.imagesLabel}>📸 Photo</Text>
    <FlatList
      horizontal
      data={item.images}
      keyExtractor={(img, index) => index.toString()}
      renderItem={({ item: imageUri }) => (
        <Image 
          source={{ uri: imageUri }} 
          style={styles.thumbnail}
          onError={(error) => console.log('Image load error:', error.nativeEvent.error)}
        />
      )}
      showsHorizontalScrollIndicator={false}
    />
  </View>
)}
            
            <View style={styles.cardFooter}>
              <View style={styles.statusContainer}>
                <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
                <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
                  {item.status}
                </Text>
              </View>
              <Text style={styles.date}>{item.timestamp ? formatDate(item.timestamp) : item.date}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Reports Yet</Text>
            <Text style={styles.emptyText}>Submit your first waste report to see it here</Text>
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={() => router.push('/report')}
            >
              <Text style={styles.submitButtonText}>Report Waste Issue</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.push('/(tabs)')}
      >
        <Text style={styles.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
    paddingTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d5a3c',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d5a3c',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  reportCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#2d5a3c',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locationContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  location: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  imagesContainer: {
    marginBottom: 15,
  },
  imagesLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    padding: 50,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#2d5a3c',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#2d5a3c',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});