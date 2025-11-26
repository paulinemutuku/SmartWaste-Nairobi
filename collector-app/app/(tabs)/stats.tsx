import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

interface PerformanceStats {
  totalRoutes: number;
  completedRoutes: number;
  completionRate: number;
  totalReports: number;
  avgResponseTime: number;
  efficiencyScore: string;
  weeklyTrend: number;
  rating: number;
  rank: string;
}

export default function PerformanceScreen() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { collector } = useAuth();

  const fetchPerformanceStats = async () => {
    if (!collector) return;

    try {
      const response = await fetch(
        `https://smart-waste-nairobi-chi.vercel.app/api/collectors/${collector._id}/performance`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        const assignedRoutes = (collector as any)?.assignedRoutes || [];
        const completedRoutes = assignedRoutes.filter((route: any) => route.status === 'completed').length;
        const totalRoutes = assignedRoutes.length;
        const completionRate = totalRoutes > 0 ? Math.round((completedRoutes / totalRoutes) * 100) : 0;
        
        const performanceData: PerformanceStats = {
          totalRoutes,
          completedRoutes,
          completionRate,
          totalReports: data.performance?.reportsCompleted || 0,
          avgResponseTime: data.performance?.avgResponseTime || 0,
          efficiencyScore: calculateEfficiencyScore(completedRoutes, data.performance?.reportsCompleted || 0),
          weeklyTrend: 15,
          rating: data.performance?.rating || 4.5,
          rank: getRank(completionRate)
        };
        
        setStats(performanceData);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load performance data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateEfficiencyScore = (routes: number, reports: number): string => {
    const efficiency = reports / (routes || 1);
    if (efficiency > 15) return 'A+';
    if (efficiency > 10) return 'A';
    if (efficiency > 5) return 'B';
    return 'C';
  };

  const getRank = (completionRate: number): string => {
    if (completionRate >= 90) return 'Elite Collector';
    if (completionRate >= 75) return 'Advanced Collector';
    if (completionRate >= 60) return 'Pro Collector';
    return 'Collector';
  };

  useEffect(() => {
    fetchPerformanceStats();
  }, [collector]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPerformanceStats();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="stats-chart" size={64} color="#059669" />
        <Text style={styles.loadingText}>Loading your performance...</Text>
      </View>
    );
  }

  if (!collector) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="warning" size={64} color="#EF4444" />
        <Text style={styles.loadingText}>Please login to view performance</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerCard}>
        <View style={styles.rankSection}>
          <Text style={styles.rankTitle}>Your Rank</Text>
          <Text style={styles.rank}>{stats?.rank}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={styles.rating}>{stats?.rating}/5.0</Text>
          </View>
        </View>
        
        <View style={styles.efficiencySection}>
          <Text style={styles.efficiencyLabel}>Efficiency Score</Text>
          <Text style={styles.efficiencyScore}>{stats?.efficiencyScore}</Text>
          <Text style={styles.trend}>↑ {stats?.weeklyTrend}% this week</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={32} color="#059669" />
          <Text style={styles.statNumber}>{stats?.completedRoutes}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="list" size={32} color="#3B82F6" />
          <Text style={styles.statNumber}>{stats?.totalRoutes}</Text>
          <Text style={styles.statLabel}>Total Routes</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={32} color="#8B5CF6" />
          <Text style={styles.statNumber}>{stats?.completionRate}%</Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="document" size={32} color="#F59E0B" />
          <Text style={styles.statNumber}>{stats?.totalReports}</Text>
          <Text style={styles.statLabel}>Reports Handled</Text>
        </View>
      </View>

      <View style={styles.metricsCard}>
        <Text style={styles.metricsTitle}>Performance Metrics</Text>
        
        <View style={styles.metricItem}>
          <View style={styles.metricInfo}>
            <Ionicons name="time" size={20} color="#6B7280" />
            <Text style={styles.metricLabel}>Avg Response Time</Text>
          </View>
          <Text style={styles.metricValue}>{stats?.avgResponseTime || 0} min</Text>
        </View>
        
        <View style={styles.metricItem}>
          <View style={styles.metricInfo}>
            <Ionicons name="speedometer" size={20} color="#6B7280" />
            <Text style={styles.metricLabel}>Efficiency Grade</Text>
          </View>
          <View style={[styles.gradeBadge, 
            stats?.efficiencyScore === 'A+' ? styles.gradeAPlus :
            stats?.efficiencyScore === 'A' ? styles.gradeA :
            stats?.efficiencyScore === 'B' ? styles.gradeB : styles.gradeC
          ]}>
            <Text style={styles.gradeText}>{stats?.efficiencyScore}</Text>
          </View>
        </View>
        
        <View style={styles.metricItem}>
          <View style={styles.metricInfo}>
            <Ionicons name="trophy" size={20} color="#6B7280" />
            <Text style={styles.metricLabel}>Weekly Trend</Text>
          </View>
          <View style={styles.trendBadge}>
            <Ionicons name="trending-up" size={16} color="#059669" />
            <Text style={styles.trendText}>+{stats?.weeklyTrend}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.achievementsCard}>
        <Text style={styles.achievementsTitle}>Recent Achievements</Text>
        
        <View style={styles.achievementItem}>
          <View style={styles.achievementIcon}>
            <Ionicons name="flash" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementName}>Rapid Responder</Text>
            <Text style={styles.achievementDesc}>Completed 5 routes in one day</Text>
          </View>
        </View>
        
        <View style={styles.achievementItem}>
          <View style={[styles.achievementIcon, { backgroundColor: '#8B5CF6' }]}>
            <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementName}>Consistency Pro</Text>
            <Text style={styles.achievementDesc}>90%+ completion rate this month</Text>
          </View>
        </View>
      </View>

      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Performance Tips</Text>
        <Text style={styles.tipText}>• Start navigation early to beat traffic</Text>
        <Text style={styles.tipText}>• Complete high-priority routes first</Text>
        <Text style={styles.tipText}>• Update route status promptly</Text>
        <Text style={styles.tipText}>• Aim for A+ efficiency rating</Text>
      </View>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rankSection: {
    alignItems: 'flex-start',
  },
  rankTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  rank: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rating: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
    marginLeft: 4,
  },
  efficiencySection: {
    alignItems: 'flex-end',
  },
  efficiencyLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  efficiencyScore: {
    fontSize: 32,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 4,
  },
  trend: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  metricsCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  metricInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  gradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  gradeAPlus: { backgroundColor: '#059669' },
  gradeA: { backgroundColor: '#10B981' },
  gradeB: { backgroundColor: '#F59E0B' },
  gradeC: { backgroundColor: '#EF4444' },
  gradeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
    marginLeft: 4,
  },
  achievementsCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  achievementIcon: {
    backgroundColor: '#059669',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
    lineHeight: 20,
  },
});