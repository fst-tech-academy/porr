import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useSettings } from "../hooks/useSettings";
import apiService from "../services/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Home,
  Users,
  Building,
  User,
  Shield,
  FileText,
  CreditCard,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  DollarSign,
  Calendar,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Clock,
} from "lucide-react";

interface DashboardStats {
  counts: {
    totalItems: number;
    activeItems: number;
    totalUsers: number;
    pendingItems: number;
  };
  charts: {
    itemTypes: Array<{ _id: string; count: number }>;
    itemStatuses: Array<{ _id: string; count: number }>;
  };
  recentActivity: {
    items: any[];
    activities: any[];
    users: any[];
  };
}

const COLORS = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#84CC16", // Lime
  "#EC4899", // Pink
  "#6B7280", // Gray
  "#14B8A6", // Teal
  "#F43F5E", // Rose
];

const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const { isDashboardAnalyticsEnabled, loading: settingsLoading } = useSettings();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [expiringSoonCount, setExpiringSoonCount] = useState(0);

  // Check if dashboard analytics is enabled
  useEffect(() => {
    if (!settingsLoading && !isDashboardAnalyticsEnabled()) {
      // Redirect to help page if dashboard is disabled
      navigate('/help', { replace: true });
    }
  }, [isDashboardAnalyticsEnabled, settingsLoading, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !token) {
        setLoading(false);
        setError(t("dashboard.authenticationRequired"));
        return;
      }

      try {
        setLoading(true);
        setError("");

        // Use the optimized dashboard stats endpoint
        const response = await apiService.getDashboardStats();

        if (response.success) {
          setStats(response.data);

          // Set expiring soon count to 0 for NPST system
          setExpiringSoonCount(0);
        } else {
          throw new Error(
            response.message || "Failed to fetch dashboard stats"
          );
        }
      } catch (err: any) {
        console.error("❌ Dashboard data fetch error:", err);
        setError(err.message || t("dashboard.failedToFetchData"));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, token]);

  // Show loading while settings are being checked
  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-lg animate-spin"></div>
          <p className="text-slate-600 font-medium">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if feature is disabled (redirect will happen)
  if (!isDashboardAnalyticsEnabled()) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-lg animate-spin"></div>
          <p className="text-slate-600 font-medium">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {t("common.error")}
            </h3>
            <p className="text-slate-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Process chart data from the new stats structure
  const chartData =
    stats?.charts?.propertyTypes?.map((item) => ({
      type: item._id || t("dashboard.other"),
      count: item.count,
    })) || [];

  const statusData =
    stats?.charts?.propertyStatuses?.map((item) => ({
      status: item._id || t("dashboard.unknown"),
      count: item.count,
    })) || [];

  const itemStatusChartData =
    stats?.charts?.itemStatuses?.map((item) => ({
      status: item._id === "active" ? "Active" : "Pending",
      count: item.count,
      fill: item._id === "active" ? "#10B981" : "#F59E0B",
    })) || [];


  // Recent activity data processing
  const generateActivityData = () => {
    const activities: any[] = [];

    // Properties activities
    stats?.recentActivity?.properties?.slice(0, 3).forEach((property: any) => {
      activities.push({
        id: `property-${property._id}`,
        type: "property",
        action: "created",
        entity: property.propertyId || property.address?.street || "Property",
        entityId: property._id,
        timestamp: new Date(property.createdAt),
        icon: Plus,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        navigationPath: `/properties`,
      });
    });


    // Items activities
    stats?.recentActivity?.items?.slice(0, 3).forEach((item: any) => {
      activities.push({
        id: `item-${item._id}`,
        type: "item",
        action: item.status === "active" ? "updated" : "created",
        entity: `Item`,
        entityId: item._id,
        timestamp: new Date(item.createdAt),
        icon: FileText,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        navigationPath: `/items`,
      });
    });

    // Sort by timestamp (most recent first) and take top 8
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 8);
  };

  const recentActivities = generateActivityData();

  // Helper function to format time ago
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000)
      return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  };

  const recentActivityData = [
    { month: t("dashboard.jan"), items: 12, activities: 8 },
    { month: t("dashboard.feb"), items: 19, activities: 15 },
    { month: t("dashboard.mar"), items: 15, activities: 12 },
    { month: t("dashboard.apr"), items: 22, activities: 18 },
    { month: t("dashboard.may"), items: 18, activities: 14 },
    { month: t("dashboard.jun"), items: 25, activities: 20 },
  ];

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color = "blue",
  }: any) => (
    <Card className="relative overflow-hidden group hover:shadow-sm transition-all duration-300 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {title}
            </p>
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">
              {value}
            </p>
            {trend && (
              <div
                className={`flex items-center mt-2 text-sm ${
                  trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend === "up" ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                <span>{trendValue}% from last month</span>
              </div>
            )}
          </div>
          <div
            className={`p-3 rounded-lg ${
              color === "blue"
                ? "bg-blue-600"
                : color === "green"
                ? "bg-green-600"
                : color === "yellow"
                ? "bg-yellow-600"
                : color === "red"
                ? "bg-red-600"
                : color === "purple"
                ? "bg-purple-600"
                : "bg-indigo-600"
            } shadow-sm`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-blue-900 dark:bg-blue-800 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="hidden md:block">
            <div className="w-20 h-20 rounded-lg flex items-center justify-center">
              <Activity className="h-10 w-10 text-white" />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left md:ml-6">
            <h1 className="text-3xl font-semibold mb-2">
              {t("dashboard.welcome")}, {user?.firstName}!
            </h1>
            <p className="text-blue-100 text-lg">{t("dashboard.overview")}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t("dashboard.totalProperties")}
          value={stats?.counts?.properties || 0}
          icon={Home}
          trend="up"
          trendValue="12"
          color="blue"
        />
        <StatCard
          title={t("dashboard.activeCases")}
          value={stats?.counts?.activeCases || 0}
          icon={Users}
          trend="up"
          trendValue="8"
          color="green"
        />
        <StatCard
          title={t("dashboard.totalUsers")}
          value={stats?.counts?.totalUsers || 0}
          icon={Building}
          trend="up"
          trendValue="5"
          color="yellow"
        />
        <StatCard
          title={t("dashboard.pendingCases")}
          value={stats?.counts?.pendingCases || 0}
          icon={FileText}
          trend="down"
          trendValue="3"
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Offence Types Chart */}
        <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span className="text-gray-900 dark:text-white">
                {t("dashboard.offenceTypes")}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            {/* Calculate total count */}
            {(() => {
              const total = chartData.reduce(
                (sum, item) => sum + (item.count || 0),
                0
              );
              const dataWithPercent = chartData.map((item) => ({
                ...item,
                percent: total ? (item.count / total) * 100 : 0,
              }));

              return (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={dataWithPercent}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="count"
                        fill="#3B82F6"
                        labelLine={false}
                      >
                        {dataWithPercent.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any, name: any, props: any) => [
                          `${props.payload.type}: ${value}`,
                          "",
                        ]}
                        labelFormatter={() => ""}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Two-column Legend Below */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 mt-6 justify-items-start">
                    {dataWithPercent.map((entry, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <span
                          className="inline-block w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="text-base text-gray-800 dark:text-gray-200 font-semibold">
                          {entry.type}:{" "}
                          <span className="text-gray-500 font-normal">
                            {entry.percent.toFixed(0)}%
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="p-6 pt-2 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <span className="text-gray-900 dark:text-white">
                Recent Activity
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2 ">
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => {
                  const IconComponent = activity.icon;
                  const timeAgo = getTimeAgo(activity.timestamp);

                  return (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer group"
                      onClick={() => navigate(activity.navigationPath)}
                    >
                      <div
                        className={`p-2 rounded-full ${activity.bgColor} dark:bg-opacity-20 group-hover:scale-110 transition-transform`}
                      >
                        <IconComponent
                          className={`h-4 w-4 ${activity.color}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            <span className="capitalize">
                              {activity.entity}
                            </span>{" "}
                            {activity.action}
                          </p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-600 text-gray-800 dark:text-gray-200 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 transition-colors">
                            {activity.type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{timeAgo}</span>
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No recent activity
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Case Status Chart */}
        <Card className="p-6 pt-2 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <span className="text-gray-900 dark:text-white">
                Case Status
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Active Cases Card */}
              <div
                className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 cursor-pointer transition-colors group h-32 flex flex-col justify-between"
                onClick={() => navigate("/cases?status=active")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      Active Cases
                    </p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {itemStatusChartData.find(
                        (item) => item.status === "Active"
                      )?.count || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-green-600 rounded-full group-hover:bg-green-700 transition-colors">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  {itemStatusChartData.length > 0
                    ? `${Math.round(
                        ((itemStatusChartData.find(
                          (item) => item.status === "Signed"
                        )?.count || 0) /
                          itemStatusChartData.reduce(
                            (sum, item) => sum + item.count,
                            0
                          )) *
                          100
                      )}% of total`
                    : "0% of total"}
                </p>
              </div>

              {/* Pending Cases Card */}
              <div
                className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 cursor-pointer transition-colors group h-32 flex flex-col justify-between"
                onClick={() => navigate("/cases?status=pending")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                      Pending Cases
                    </p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {itemStatusChartData.find(
                        (item) => item.status === "Pending"
                      )?.count || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-600 rounded-full group-hover:bg-orange-700 transition-colors">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                  {itemStatusChartData.length > 0
                    ? `${Math.round(
                        ((itemStatusChartData.find(
                          (item) => item.status === "Pending"
                        )?.count || 0) /
                          itemStatusChartData.reduce(
                            (sum, item) => sum + item.count,
                            0
                          )) *
                          100
                      )}% of total`
                    : "0% of total"}
                </p>
              </div>

              {/* Expiring Soon Card */}
              <div
                className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer transition-colors group h-32 flex flex-col justify-between"
                onClick={() => navigate("/items?filter=urgent")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                      Expiring Soon
                    </p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                      {expiringSoonCount}
                    </p>
                  </div>
                  <div className="p-3 bg-red-600 rounded-full group-hover:bg-red-700 transition-colors">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  {expiringSoonCount > 0
                    ? `Within 30 days`
                    : "No urgent items"}
                </p>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Activity Trends */}
      <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <span className="text-gray-900 dark:text-white">
              {t("dashboard.monthlyRevenue")}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={recentActivityData}>
              <defs>
                <linearGradient
                  id="colorProperties"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="items"
                stroke="#1e3a8a"
                fillOpacity={1}
                fill="url(#colorProperties)"
                name="Items"
              />
              <Area
                type="monotone"
                dataKey="activities"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#colorCases)"
                name="Activities"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="text-center">
            <div className="w-16 h-16 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("dashboard.monthlyRevenue")}
            </h3>
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">
              $45,230
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("dashboard.quickStats")}
            </h3>
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">
              87%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              +3% from last month
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Dashboard;
