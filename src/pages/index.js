import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import SEO from '../components/SEO';
import BuyMeCoffeeButton from '../components/BuyMeCoffeeButton';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
                    Hayrettin Tüzel
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