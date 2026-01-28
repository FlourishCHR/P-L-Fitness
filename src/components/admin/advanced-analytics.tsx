import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, ScatterChart, Scatter, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import api from '../../services/api';

interface AdvancedAnalyticsData {
  memberGrowth: any[];
  churnAnalysis: any[];
  revenueForecast: any[];
  cohortAnalysis: any[];
  attendancePatterns: any[];
  memberLTV: any[];
  paymentMethods: any[];
  sessionAnalytics: any[];
  memberEngagement: any[];
  summary: {
    totalActiveMembers: number;
    avgRetentionRate: string;
    avgMemberLTV: string;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const AdvancedAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdvancedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'growth' | 'revenue' | 'retention' | 'engagement' | 'sessions'>('growth');

  useEffect(() => {
    loadAdvancedAnalytics();
  }, []);

  const loadAdvancedAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getAdvancedAnalytics();
      setAnalytics(response.data);
    } catch (err: any) {
      console.error('Error loading advanced analytics:', err);
      setError(err.message || 'Failed to load advanced analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading Analytics</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadAdvancedAnalytics}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) return null;

  // Transform attendance patterns for heatmap visualization
  const attendanceHeatmap = analytics.attendancePatterns.reduce((acc: any, item: any) => {
    const existing = acc.find((x: any) => x.hour === item.hour);
    if (existing) {
      existing[item.dayOfWeek] = item.checkIns;
    } else {
      acc.push({
        hour: item.hour,
        [item.dayOfWeek]: item.checkIns
      });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="text-blue-100 text-sm font-medium mb-2">Active Members</div>
          <div className="text-3xl font-bold">{analytics.summary.totalActiveMembers.toLocaleString()}</div>
          <div className="text-blue-100 text-sm mt-2">Total active membership base</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="text-green-100 text-sm font-medium mb-2">Avg Retention Rate</div>
          <div className="text-3xl font-bold">{analytics.summary.avgRetentionRate}%</div>
          <div className="text-green-100 text-sm mt-2">Member retention over cohorts</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="text-purple-100 text-sm font-medium mb-2">Avg Member LTV</div>
          <div className="text-3xl font-bold">${parseFloat(analytics.summary.avgMemberLTV).toFixed(2)}</div>
          <div className="text-purple-100 text-sm mt-2">Lifetime value per member</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'growth', label: 'Growth & Acquisition' },
              { id: 'revenue', label: 'Revenue & Forecasting' },
              { id: 'retention', label: 'Retention & Cohorts' },
              { id: 'engagement', label: 'Member Engagement' },
              { id: 'sessions', label: 'Sessions & Attendance' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Growth & Acquisition Tab */}
          {activeTab === 'growth' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Growth Trend (12 Months)</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={analytics.memberGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="newMembers" fill="#3b82f6" name="New Members" />
                    <Line yAxisId="right" type="monotone" dataKey="cumulativeMembers" stroke="#10b981" strokeWidth={2} name="Total Members" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {analytics.churnAnalysis.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Churn Analysis</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics.churnAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="churnedMembers" stackId="1" stroke="#ef4444" fill="#ef4444" name="Churned Members" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Revenue & Forecasting Tab */}
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Forecast (Historical + 3 Month Projection)</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={analytics.revenueForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      fill="#3b82f6"
                      stroke="#3b82f6"
                      fillOpacity={0.3}
                      name="Revenue"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="payingMembers"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Paying Members"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
                <div className="mt-2 text-sm text-gray-600 text-center">
                  <span className="inline-block w-4 h-0.5 bg-blue-600 mr-2"></span>
                  Historical Data
                  <span className="inline-block w-4 h-0.5 bg-blue-600 border-dashed ml-4 mr-2" style={{borderTop: '2px dashed #3b82f6', background: 'transparent'}}></span>
                  Forecast
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods Distribution</h3>
                  {analytics.paymentMethods.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.paymentMethods}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.method}: $${entry.totalAmount.toFixed(0)}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="totalAmount"
                        >
                          {analytics.paymentMethods.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-gray-500 text-center py-8">No payment data available</div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Lifetime Value by Type</h3>
                  {analytics.memberLTV.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.memberLTV}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="memberType" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="avgLifetimeValue" fill="#8b5cf6" name="Avg LTV ($)" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-gray-500 text-center py-8">No LTV data available</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Retention & Cohorts Tab */}
          {activeTab === 'retention' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cohort Retention Analysis</h3>
                {analytics.cohortAnalysis.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={350}>
                      <ComposedChart data={analytics.cohortAnalysis}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="cohort" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="cohortSize" fill="#3b82f6" name="Cohort Size" />
                        <Line yAxisId="right" type="monotone" dataKey="retentionRate" stroke="#10b981" strokeWidth={3} name="Retention Rate (%)" />
                      </ComposedChart>
                    </ResponsiveContainer>

                    <div className="mt-6 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cohort</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active Now</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retention</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {analytics.cohortAnalysis.map((cohort: any, index: number) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cohort.cohort}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cohort.cohortSize}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cohort.activeNow}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  parseFloat(cohort.retentionRate) >= 70 ? 'bg-green-100 text-green-800' :
                                  parseFloat(cohort.retentionRate) >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {cohort.retentionRate}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500 text-center py-8">No cohort data available</div>
                )}
              </div>
            </div>
          )}

          {/* Member Engagement Tab */}
          {activeTab === 'engagement' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 50 Most Engaged Members</h3>
                {analytics.memberEngagement.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visits (90d)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Payments</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Visit</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engagement</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {analytics.memberEngagement.slice(0, 20).map((member: any) => (
                          <tr key={member.memberId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {member.memberName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{member.totalVisits}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.totalPayments}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                              ${parseFloat(member.totalRevenue || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {member.daysSinceLastVisit !== null ? `${member.daysSinceLastVisit}d ago` : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                member.engagementLevel === 'High' ? 'bg-green-100 text-green-800' :
                                member.engagementLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {member.engagementLevel}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-8">No engagement data available</div>
                )}
              </div>

              {analytics.memberLTV.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Type Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analytics.memberLTV.map((ltv: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="text-sm font-medium text-gray-500 mb-2">{ltv.memberType}</div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs text-gray-500">Members: </span>
                            <span className="text-sm font-semibold">{ltv.totalMembers}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Avg LTV: </span>
                            <span className="text-sm font-semibold text-green-600">${parseFloat(ltv.avgLifetimeValue).toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Avg Visits: </span>
                            <span className="text-sm font-semibold">{parseFloat(ltv.avgVisits).toFixed(1)}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Avg Days: </span>
                            <span className="text-sm font-semibold">{Math.round(ltv.avgMembershipDays)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sessions & Attendance Tab */}
          {activeTab === 'sessions' && (
            <div className="space-y-6">
              {analytics.sessionAnalytics.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Popularity & Utilization</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance (30d)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unique Attendees</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilization</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {analytics.sessionAnalytics.map((session: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {session.sessionName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.sessionType}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.capacity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{session.totalAttendance}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.uniqueAttendees}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      parseFloat(session.utilizationRate || 0) >= 80 ? 'bg-green-600' :
                                      parseFloat(session.utilizationRate || 0) >= 50 ? 'bg-yellow-600' :
                                      'bg-red-600'
                                    }`}
                                    style={{ width: `${Math.min(parseFloat(session.utilizationRate || 0), 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-700">{parseFloat(session.utilizationRate || 0).toFixed(1)}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {analytics.attendancePatterns.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Hours by Day of Week (Last 30 Days)</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={attendanceHeatmap}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: 'Check-ins', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                        <Bar key={day} dataKey={day} fill={COLORS[index % COLORS.length]} stackId="a" />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
