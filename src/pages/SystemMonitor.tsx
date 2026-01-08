import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Lightbulb,
  Clock,
  BarChart3
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const MANAGEMENT_HUB_URL = "https://management-hub-production-80d6.up.railway.app";

interface SystemHealth {
  overall_status: string;
  systems: Array<{
    app_name: string;
    status: string;
    response_time_ms: number;
    last_check: string;
  }>;
  critical_count: number;
  warning_count: number;
  healthy_count: number;
}

interface Recommendation {
  id: string;
  app_name: string;
  category: string;
  priority: string;
  title: string;
  description: string;
  impact_score: number;
  confidence_score: number;
  recommended_action: string;
  created_at: string;
  status: string;
}

interface PerformanceMetric {
  app_name: string;
  avg_response_time: number;
  max_response_time: number;
  uptime_percentage: number;
  error_rate: number;
  total_checks: number;
}

export default function SystemMonitor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<SystemHealth | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [processingRec, setProcessingRec] = useState<string | null>(null);

  // Removed redirect - handled in render instead

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching from Management Hub:', MANAGEMENT_HUB_URL);
      
      // Fetch health overview
      const healthResponse = await fetch(`${MANAGEMENT_HUB_URL}/api/health/overview`);
      console.log('Health response:', healthResponse.status, healthResponse.ok);
      if (healthResponse.ok) {
        const healthJson = await healthResponse.json();
        console.log('Health data:', healthJson);
        setHealthData(healthJson);
      } else {
        console.error('Health fetch failed:', healthResponse.status, healthResponse.statusText);
      }

      // Fetch recommendations
      const recsResponse = await fetch(`${MANAGEMENT_HUB_URL}/api/recommendations?status=pending&limit=10`);
      console.log('Recommendations response:', recsResponse.status, recsResponse.ok);
      if (recsResponse.ok) {
        const recsJson = await recsResponse.json();
        console.log('Recommendations data:', recsJson);
        setRecommendations(recsJson.recommendations || []);
      } else {
        console.error('Recommendations fetch failed:', recsResponse.status, recsResponse.statusText);
      }

      // Fetch performance metrics
      const metricsResponse = await fetch(`${MANAGEMENT_HUB_URL}/api/metrics/performance?hours=24`);
      console.log('Metrics response:', metricsResponse.status, metricsResponse.ok);
      if (metricsResponse.ok) {
        const metricsJson = await metricsResponse.json();
        console.log('Metrics data:', metricsJson);
        setMetrics(metricsJson.metrics || []);
      } else {
        console.error('Metrics fetch failed:', metricsResponse.status, metricsResponse.statusText);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    try {
      const response = await fetch(`${MANAGEMENT_HUB_URL}/api/recommendations/generate`, {
        method: 'POST',
      });
      if (response.ok) {
        toast({
          title: "Recommendations Generated",
          description: "New AI recommendations have been created successfully.",
        });
        await fetchData(); // Refresh all data
      }
    } catch (err) {
      console.error('Failed to generate recommendations:', err);
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    }
  };

  const applyRecommendation = async (recId: string, title: string) => {
    setProcessingRec(recId);
    try {
      // Update the recommendation status to 'applied' in the backend
      const response = await fetch(`${MANAGEMENT_HUB_URL}/api/recommendations/${recId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'applied',
          applied_by: user?.email,
          applied_at: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast({
          title: "Recommendation Applied",
          description: `"${title}" has been marked as applied successfully.`,
        });
        
        // Remove from local state immediately for better UX
        setRecommendations(prev => prev.filter(rec => rec.id !== recId));
        
        // Refresh data from server
        await fetchData();
      } else {
        throw new Error('Failed to apply recommendation');
      }
    } catch (err) {
      console.error('Failed to apply recommendation:', err);
      toast({
        title: "Error",
        description: "Failed to apply recommendation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingRec(null);
    }
  };

  const dismissRecommendation = async (recId: string, title: string) => {
    setProcessingRec(recId);
    try {
      // Update the recommendation status to 'dismissed' in the backend
      const response = await fetch(`${MANAGEMENT_HUB_URL}/api/recommendations/${recId}/dismiss`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'dismissed',
          dismissed_by: user?.email,
          dismissed_at: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast({
          title: "Recommendation Dismissed",
          description: `"${title}" has been dismissed.`,
        });
        
        // Remove from local state immediately for better UX
        setRecommendations(prev => prev.filter(rec => rec.id !== recId));
        
        // Refresh data from server
        await fetchData();
      } else {
        throw new Error('Failed to dismiss recommendation');
      }
    } catch (err) {
      console.error('Failed to dismiss recommendation:', err);
      toast({
        title: "Error",
        description: "Failed to dismiss recommendation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingRec(null);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      healthy: "default",
      warning: "secondary",
      critical: "destructive",
    };
    return (
      <Badge variant={variants[status.toLowerCase()] || "outline"}>
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };
    return (
      <Badge className={colors[priority.toLowerCase()] || "bg-gray-100 text-gray-800"}>
        {priority}
      </Badge>
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Please log in to access the System Monitor.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (user.email !== 'itsajungletv@gmail.com') {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access Denied. This page is restricted to authorized users only. (Logged in as: {user.email})
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Monitor</h1>
          <p className="text-gray-500">IAJ Management Hub - Real-time monitoring and AI recommendations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generateRecommendations} variant="outline">
            <Lightbulb className="h-4 w-4 mr-2" />
            Generate Recommendations
          </Button>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* System Health Overview */}
      {healthData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
              {getStatusIcon(healthData.overall_status)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{healthData.overall_status}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Healthy Systems</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{healthData.healthy_count}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warnings</CardTitle>
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{healthData.warning_count}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
              <XCircle className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{healthData.critical_count}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="health" className="w-full">
        <TabsList>
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
        </TabsList>

        {/* System Health Tab */}
        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Real-time health status of all IAJ systems</CardDescription>
            </CardHeader>
            <CardContent>
              {healthData && healthData.systems.length > 0 ? (
                <div className="space-y-4">
                  {healthData.systems.map((system, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(system.status)}
                        <div>
                          <h3 className="font-semibold">{system.app_name}</h3>
                          <p className="text-sm text-gray-500">
                            Response time: {system.response_time_ms}ms
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(system.status)}
                        <p className="text-sm text-gray-500">
                          <Clock className="inline h-4 w-4 mr-1" />
                          {new Date(system.last_check).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No system data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Recommendations</CardTitle>
              <CardDescription>Smart insights and suggested actions for your IAJ systems</CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{rec.title}</h3>
                            {getPriorityBadge(rec.priority)}
                            <Badge variant="outline">{rec.category}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Impact: {rec.impact_score}/10</span>
                            <span>Confidence: {rec.confidence_score}/10</span>
                            <span>{rec.app_name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm font-medium text-blue-900 mb-1">Recommended Action:</p>
                        <p className="text-sm text-blue-800">{rec.recommended_action}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => applyRecommendation(rec.id, rec.title)}
                          disabled={processingRec === rec.id}
                        >
                          {processingRec === rec.id ? 'Applying...' : 'Apply Recommendation'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => dismissRecommendation(rec.id, rec.title)}
                          disabled={processingRec === rec.id}
                        >
                          {processingRec === rec.id ? 'Dismissing...' : 'Dismiss'}
                        </Button>
                        <Button size="sm" variant="ghost">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No recommendations available</p>
                  <Button onClick={generateRecommendations} className="mt-4" variant="outline">
                    Generate New Recommendations
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>24-Hour Performance Metrics</CardTitle>
              <CardDescription>System performance trends and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.length > 0 ? (
                <div className="space-y-4">
                  {metrics.map((metric, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-3">{metric.app_name}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Avg Response Time</p>
                          <p className="text-lg font-semibold">{metric.avg_response_time}ms</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Max Response Time</p>
                          <p className="text-lg font-semibold">{metric.max_response_time}ms</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Uptime</p>
                          <p className="text-lg font-semibold">{metric.uptime_percentage.toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Error Rate</p>
                          <p className="text-lg font-semibold">{metric.error_rate.toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Checks</p>
                          <p className="text-lg font-semibold">{metric.total_checks}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No performance data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

