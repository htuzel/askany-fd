import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import SEO from '../components/SEO';
import BuyMeCoffeeButton from '../components/BuyMeCoffeeButton';

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
      alert('Error creating session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO />
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Live Q&A Session Manager
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Create interactive Q&A sessions for your events, webinars, and meetings.
              Let participants ask questions anonymously and vote on what matters most.
            </p>
            <button
              onClick={createSession}
              disabled={loading}
              className="bg-blue-500 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 mb-12"
              data-noindex="true"
            >
              {loading ? 'Creating...' : 'Create New Session'}
            </button>

            {stats && (
              <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
                <p className="text-gray-600">
                  Total Sessions Created: <span className="font-semibold text-blue-600">{stats.totalSessions}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Last Updated: {new Date(stats.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
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

            <div className="mt-16">
              <BuyMeCoffeeButton className="mb-8" />
              
              <div className="text-sm text-gray-500 space-y-4">
                <p>
                  Created with ❤️ by{' '}
                  <a 
                    href="https://github.com/htuzel" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600"
                  >
                    Hakan Tüzel
                  </a>
                </p>
                <p>
                  AskAny is a free, open-source tool for managing live Q&A sessions.
                  Perfect for conferences, webinars, team meetings, and educational events.
                </p>
                <p>
                  Features: Anonymous questions, real-time updates, question voting,
                  session management, and more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Feature({ title, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
} 