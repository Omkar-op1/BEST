import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, FeedbackRating } from "@/components/ui/data-table";
import { useUser } from "@/lib/auth";
import { FeedbackStats } from "@shared/schema";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const [dateFilter, setDateFilter] = useState("Today");
  const [mealFilter, setMealFilter] = useState("All Meals");
  const [viewType, setViewType] = useState("Bar Graph");
  const [, setLocation] = useLocation();
  const { data: user, isSuccess: isLoggedIn, isLoading: isUserLoading } = useUser();
  
  useEffect(() => {
    // Redirect to sign in if not logged in
    if (!isUserLoading && !isLoggedIn) {
      setLocation('/signin');
    }
  }, [isLoggedIn, isUserLoading, setLocation]);
  
  // Determine the meal type filter parameter
  const getMealTypeParam = () => {
    if (mealFilter === "Lunch") return "lunch";
    if (mealFilter === "Dinner") return "dinner";
    return "";
  };
  
  const { data: feedbackStats, isLoading: isStatsLoading } = useQuery<FeedbackStats[]>({
    queryKey: ['/api/feedback/stats', getMealTypeParam()],
    enabled: isLoggedIn,
  });
  
  if (isStatsLoading || isUserLoading) {
    return (
      <div className="py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="py-4 px-6 bg-primary">
            <Skeleton className="h-8 w-64 bg-white bg-opacity-20" />
          </CardHeader>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-full max-w-md mb-6" />
            
            <div className="mb-8 bg-neutral-100 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-8">
              <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm">
                <Skeleton className="h-[300px] w-full" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-neutral-100 p-4 rounded-lg shadow-sm">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="space-y-2">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="flex justify-between items-center">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="overflow-x-auto">
              <Skeleton className="h-[300px] w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!isLoggedIn) {
    return null; // Redirect is handled in useEffect
  }
  
  const chartData = feedbackStats?.map(stat => ({
    name: stat.vegetableName,
    likes: stat.likes,
    dislikes: stat.dislikes,
  })) || [];
  
  const topLiked = [...(feedbackStats || [])].sort((a, b) => b.percentage - a.percentage).slice(0, 3);
  const topDisliked = [...(feedbackStats || [])].sort((a, b) => a.percentage - b.percentage).slice(0, 3);
  
  const totalResponses = feedbackStats?.reduce((sum, item) => sum + item.likes + item.dislikes, 0) || 0;
  const totalLikes = feedbackStats?.reduce((sum, item) => sum + item.likes, 0) || 0;
  const averageSatisfaction = totalResponses > 0 ? Math.round((totalLikes / totalResponses) * 100) : 0;
  const participantCount = Math.floor(totalResponses / (feedbackStats?.length || 1)) || 0;
  
  const tableColumns = [
    {
      key: "vegetable",
      header: "Vegetable",
      cell: (item: FeedbackStats) => (
        <span className="text-sm font-medium text-neutral-800">{item.vegetableName}</span>
      ),
    },
    {
      key: "meal",
      header: "Meal",
      cell: (item: FeedbackStats) => (
        <span className="text-sm text-neutral-600">
          {item.mealType.charAt(0).toUpperCase() + item.mealType.slice(1)}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: () => (
        <span className="text-sm text-neutral-600">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: "likes",
      header: "Likes",
      cell: (item: FeedbackStats) => (
        <span className="text-sm text-neutral-600">{item.likes}</span>
      ),
    },
    {
      key: "dislikes",
      header: "Dislikes",
      cell: (item: FeedbackStats) => (
        <span className="text-sm text-neutral-600">{item.dislikes}</span>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      cell: (item: FeedbackStats) => (
        <FeedbackRating percentage={item.percentage} />
      ),
    },
  ];
  
  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-white rounded-lg shadow-md overflow-hidden">
          <CardHeader className="py-4 px-6 bg-primary">
            <CardTitle className="text-2xl font-bold text-white">Vegetable Feedback Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <CardDescription className="text-lg text-neutral-600 mb-6">
              Real-time analysis of student feedback on mess vegetables.
            </CardDescription>
            
            {/* Filter controls */}
            <div className="mb-8 bg-neutral-100 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="date-filter" className="block text-sm font-medium text-neutral-800 mb-1">Date Range</label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger id="date-filter">
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Today">Today</SelectItem>
                      <SelectItem value="This Week">This Week</SelectItem>
                      <SelectItem value="This Month">This Month</SelectItem>
                      <SelectItem value="Last 3 Months">Last 3 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="meal-filter" className="block text-sm font-medium text-neutral-800 mb-1">Meal Type</label>
                  <Select value={mealFilter} onValueChange={setMealFilter}>
                    <SelectTrigger id="meal-filter">
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Meals">All Meals</SelectItem>
                      <SelectItem value="Lunch">Lunch</SelectItem>
                      <SelectItem value="Dinner">Dinner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="view-type" className="block text-sm font-medium text-neutral-800 mb-1">View Type</label>
                  <Select value={viewType} onValueChange={setViewType}>
                    <SelectTrigger id="view-type">
                      <SelectValue placeholder="Select view type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bar Graph">Bar Graph</SelectItem>
                      <SelectItem value="Pie Chart">Pie Chart</SelectItem>
                      <SelectItem value="Line Chart">Line Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Chart container */}
            <div className="mb-8">
              <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm">
                {viewType === "Bar Graph" && (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart 
                      data={chartData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 90, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={80}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="likes" fill="#0191C6" name="Likes" />
                      <Bar dataKey="dislikes" fill="#FF7676" name="Dislikes" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                {viewType === "Pie Chart" && (
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie 
                        data={chartData} 
                        dataKey="likes" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={120} 
                        fill="#0191C6" 
                        label
                      />
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {viewType === "Line Chart" && (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="likes" stroke="#0191C6" />
                      <Line type="monotone" dataKey="dislikes" stroke="#FF7676" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            
            {/* Stats summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-neutral-100 p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">Most Liked</h3>
                <ol className="space-y-2">
                  {topLiked.map((item, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>{item.vegetableName}</span>
                      <span className="font-medium text-green-500">{item.percentage}%</span>
                    </li>
                  ))}
                </ol>
              </div>
              
              <div className="bg-neutral-100 p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">Most Disliked</h3>
                <ol className="space-y-2">
                  {topDisliked.map((item, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>{item.vegetableName}</span>
                      <span className="font-medium text-red-500">{100 - item.percentage}%</span>
                    </li>
                  ))}
                </ol>
              </div>
              
              <div className="bg-neutral-100 p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">Overall Stats</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Total Responses</p>
                    <p className="text-2xl font-medium">{totalResponses}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Average Satisfaction</p>
                    <p className="text-2xl font-medium">{averageSatisfaction}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Participants</p>
                    <p className="text-2xl font-medium">{participantCount}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent feedback table */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Recent Feedback</h3>
              <DataTable data={feedbackStats || []} columns={tableColumns} />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Dashboard;
