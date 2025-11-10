import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AssignedRoute {
  _id: string;
  routeId: string;
  clusterId: string;
  clusterName: string;
  assignedDate: string;
  scheduledDate: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  completedAt?: string;
  reportCount: number;
  verifiedPhotos: string[];
  notes: string;
}

export default function TodayTasksScreen() {
  const [routes, setRoutes] = useState<AssignedRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAssignedRoutes = async () => {
    try {
      const collectorId = 'YOUR_COLLECTOR_ID_HERE';
      const response = await fetch(
        `https://smart-waste-nairobi-chi.vercel.app/api/collectors/${collectorId}/routes`
      );
      
      if (response.ok) {
        const data = await response.json();
        setRoutes(data.routes || []);
      } else {
        Alert.alert('Error', 'No routes assigned yet');
        setRoutes([]);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      Alert.alert('Error', 'Failed to load assigned routes');
      setRoutes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssignedRoutes();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssignedRoutes();
  };

  const startCollection = async (routeId: string) => {
    try {
      const collectorId = 'YOUR_COLLECTOR_ID_HERE';
      const response = await fetch(
        `https://smart-waste-nairobi-chi.vercel.app/api/collectors/${collectorId}/routes/${routeId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'in-progress' }),
        }
      );

      if (response.ok) {
        Alert.alert('Success', 'Collection started!');
        fetchAssignedRoutes();
      } else {
        Alert.alert('Error', 'Failed to start collection');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update route status');
    }
  };

  const completeCollection = async (routeId: string) => {
    try {
      const collectorId = 'YOUR_COLLECTOR_ID_HERE';
      const response = await fetch(
        `https://smart-waste-nairobi-chi.vercel.app/api/collectors/${collectorId}/routes/${routeId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'completed' }),
        }
      );

      if (response.ok) {
        Alert.alert('Success', 'Collection completed!');
        fetchAssignedRoutes();
      } else {
        Alert.alert('Error', 'Failed to complete collection');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update route status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in-progress': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'in-progress': return 'time';
      default: return 'calendar';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="trash" size={64} color="#059669" />
        <Text style={styles.loadingText}>Loading your tasks...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Today's Tasks</Text>
        <Text style={styles.subtitle}>
          {routes.length} routes assigned • {routes.filter(r => r.status === 'completed').length} completed
        </Text>
      </View>

      {routes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-done-circle" size={80} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>No routes assigned</Text>
          <Text style={styles.emptyStateText}>
            Check the web dashboard to get assigned collection routes.
          </Text>
        </View>
      ) : (
        routes.map((route) => (
          <View key={route._id} style={styles.routeCard}>
            <View style={styles.routeHeader}>
              <View style={styles.routeInfo}>
                <Text style={styles.routeName}>{route.clusterName}</Text>
                <View style={styles.statusContainer}>
                  <Ionicons 
                    name={getStatusIcon(route.status)} 
                    size={16} 
                    color={getStatusColor(route.status)} 
                  />
                  <Text 
                    style={[
                      styles.statusText, 
                      { color: getStatusColor(route.status) }
                    ]}
                  >
                    {route.status.replace('-', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#6B7280" />
            </View>

            <View style={styles.routeDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="location" size={16} color="#6B7280" />
                <Text style={styles.detailText}>{route.clusterName}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="document" size={16} color="#6B7280" />
                <Text style={styles.detailText}>{route.reportCount} reports</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="calendar" size={16} color="#6B7280" />
                <Text style={styles.detailText}>
                  {new Date(route.scheduledDate).toLocaleDateString()}
                </Text>
              </View>
            </View>

            {route.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesText}>{route.notes}</Text>
              </View>
            )}

            {route.status === 'scheduled' && (
              <TouchableOpacity 
                style={styles.startButton}
                onPress={() => startCollection(route._id)}
              >
                <Ionicons name="play" size={20} color="#FFFFFF" />
                <Text style={styles.startButtonText}>Start Collection</Text>
              </TouchableOpacity>
            )}

            {route.status === 'in-progress' && (
              <TouchableOpacity 
                style={styles.inProgressButton}
                onPress={() => completeCollection(route._id)}
              >
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                <Text style={styles.inProgressButtonText}>Mark Complete</Text>
              </TouchableOpacity>
            )}

            {route.status === 'completed' && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark" size={16} color="#059669" />
                <Text style={styles.completedText}>Completed</Text>
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    margin: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  routeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  notesContainer: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  notesText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  startButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  inProgressButton: {
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  inProgressButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  completedText: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});