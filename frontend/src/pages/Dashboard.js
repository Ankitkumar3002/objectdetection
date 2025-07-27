import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Camera, 
  History, 
  User, 
  BarChart3, 
  Eye, 
  Users,
  TrendingUp,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  
  const { data: dashboardData, isLoading } = useQuery(
    'dashboard',
    userAPI.getDashboard,
    {
      retry: 1,
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-primary-600 rounded-full pulse-dot"></div>
          <div className="w-3 h-3 bg-primary-600 rounded-full pulse-dot"></div>
          <div className="w-3 h-3 bg-primary-600 rounded-full pulse-dot"></div>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.data?.stats || {
    totalDetections: 0,
    completedDetections: 0,
    failedDetections: 0,
    faceDetections: 0,
    bodyDetections: 0
  };

  const recentDetections = dashboardData?.data?.recentDetections || [];

  const quickActions = [
    {
      title: 'New Detection',
      description: 'Upload image or use webcam',
      icon: Camera,
      path: '/detection',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'View History',
      description: 'Browse past detections',
      icon: History,
      path: '/history',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Profile Settings',
      description: 'Update your profile',
      icon: User,
      path: '/profile',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  const statCards = [
    {
      title: 'Total Detections',
      value: stats.totalDetections,
      icon: BarChart3,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Face Detections',
      value: stats.faceDetections,
      icon: Eye,
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Body Detections',
      value: stats.bodyDetections,
      icon: Users,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Success Rate',
      value: stats.totalDetections > 0 
        ? `${Math.round((stats.completedDetections / stats.totalDetections) * 100)}%`
        : '0%',
      icon: TrendingUp,
      color: 'bg-yellow-50 text-yellow-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's an overview of your AI detection activities
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={index}
                      to={action.path}
                      className={`flex items-center p-4 rounded-lg text-white transition-colors duration-200 ${action.color}`}
                    >
                      <Icon className="h-6 w-6 mr-3" />
                      <div>
                        <p className="font-semibold">{action.title}</p>
                        <p className="text-sm opacity-90">{action.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Detections */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Detections
                </h2>
                <Link
                  to="/history"
                  className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                >
                  View all
                </Link>
              </div>
              
              {recentDetections.length > 0 ? (
                <div className="space-y-3">
                  {recentDetections.map((detection) => (
                    <div
                      key={detection._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            {detection.detectionType === 'face' ? (
                              <Eye className="h-5 w-5 text-primary-600" />
                            ) : detection.detectionType === 'body' ? (
                              <Users className="h-5 w-5 text-primary-600" />
                            ) : (
                              <Camera className="h-5 w-5 text-primary-600" />
                            )}
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {detection.originalFileName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {detection.detectionType} detection • 
                            {detection.results?.totalDetections || 0} items found
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(detection.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No detections yet</p>
                  <Link
                    to="/detection"
                    className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                  >
                    Start your first detection
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
