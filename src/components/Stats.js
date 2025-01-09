import { useState, useEffect } from 'react';
import axios from 'axios';
import clsx from 'clsx';

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/stats`);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats({
          totalSessions: 0,
          totalParticipants: 0,
          lastUpdated: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Fetch stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="mt-12 inline-flex gap-12 text-sm bg-white/80 backdrop-blur-sm px-8 py-4 rounded-full shadow-sm animate-pulse">
        <div className="flex flex-col items-center">
          <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="flex flex-col items-center">
          <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 inline-flex gap-12 text-sm bg-white/80 backdrop-blur-sm px-8 py-4 rounded-full shadow-sm animate-fade-in">
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold text-blue-600">
          {stats.totalSessions.toLocaleString()}
        </span>
        <span className="text-gray-500">Total Sessions</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold text-indigo-600">
          {stats.totalParticipants.toLocaleString()}
        </span>
        <span className="text-gray-500">Total Participants</span>
      </div>
      <div className="text-xs text-gray-400 absolute -bottom-6 left-1/2 transform -translate-x-1/2">
        Last Updated: {new Date(stats.lastUpdated).toLocaleDateString()}
      </div>
    </div>
  );
} 