import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import BuyMeCoffeeButton from '../components/BuyMeCoffeeButton';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/stats`);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const createSession = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions`);
      const { slug } = response.data;
      
      localStorage.setItem('isOwner_' + slug, 'true');
      router.push(`/session/${slug}`);
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Q&A Session Manager
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Create a live Q&A session and share the link with your audience.
          Get real-time questions and manage them efficiently.
        </p>
        <button
          onClick={createSession}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-lg font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            'Creating Session...'
          ) : (
            <>
              Create New Session
              <ArrowRightIcon className="w-5 h-5" />
            </>
          )}
        </button>

        {stats && (
          <div className="mt-8 p-4 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600">
              Total Sessions Handled: <span className="font-semibold text-primary-600">{stats.totalSessions}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Last Updated: {new Date(stats.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Feature
            title="Real-time Updates"
            description="Questions appear instantly and are automatically sorted by votes."
          />
          <Feature
            title="Anonymous Questions"
            description="Participants can ask questions anonymously or with their name."
          />
          <Feature
            title="Easy Management"
            description="Mark questions as answered and keep track of discussions."
          />
        </div>

        <div className="mt-12">
          <BuyMeCoffeeButton />
        </div>
      </div>
    </Layout>
  );
}

function Feature({ title, description }) {
  return (
    <div className="text-center p-6 rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
} 