import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import SEO from '../components/SEO';
import Stats from '../components/Stats';
import BuyMeCoffeeButton from '../components/BuyMeCoffeeButton';
import GitHubStars from '../components/GitHubStars';
import { v4 as uuidv4 } from 'uuid';
import { GoogleAnalytics, sendGAEvent } from '@next/third-parties/google';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('clientId') || uuidv4();
    }
    return null;
  });

  useEffect(() => {
    if (clientId && typeof window !== 'undefined') {
      localStorage.setItem('clientId', clientId);
    }
  }, [clientId]);

  const createSession = async () => {
    try {
      setLoading(true);
      // Track session creation attempt
      sendGAEvent('event', 'session_created', {
        category: 'Session',
        action: 'Create'
      });

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions`, {
        clientId
      });
      const { slug } = response.data;
      
      // Track successful session creation
      sendGAEvent('event', 'session_creation_success', {
        category: 'Session',
        action: 'Create Success',
        session_id: slug
      });

      router.push(`/session/${slug}`);
    } catch (error) {
      console.error('Error creating session:', error);
      // Track session creation error
      sendGAEvent('event', 'session_creation_error', {
        category: 'Session',
        action: 'Create Error',
        error_message: error.message
      });
      alert('Error creating session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO />
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Header */}
        <header className="fixed w-full top-0 bg-white/80 backdrop-blur-sm z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                AskAny
              </div>
              <div className="flex items-center gap-4">
                <GitHubStars />
                <BuyMeCoffeeButton />
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50" />
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
          </div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32 mt-16">
            <div className="text-center">
              <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-6 animate-fade-in">
                Create Anonymous Q&A Sessions<br />with One Click!
              </h1>
              <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto animate-fade-in-up">
                Start instantly without registration or personal information.
                <span className="text-red-60 font-bold"> A privacy-focused, open-source, disposable</span> Q&A experience for everyone.
              </p>
              <button
                onClick={createSession}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg px-12 py-5 rounded-xl font-medium 
                         hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                         disabled:opacity-50 mb-8 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl
                         animate-bounce-subtle"
                data-noindex="true"
              >
                {loading ? 'Creating Session...' : 'Start Free Session'}
              </button>

              <div className="flex justify-center items-center gap-6 animate-fade-in-up">
                <a 
                  href="https://www.producthunt.com/posts/askany?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-askany" 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img 
                    src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=774627&theme=light&t=1736573751317" 
                    alt="AskAny - Free, Live Q&A session manager | Product Hunt" 
                    style={{ width: '250px', height: '54px' }}
                    width="250" 
                    height="54" 
                  />
                </a>
              </div>

              <Stats />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Features
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Everything you need for interactive Q&A sessions
              </p>
            </div>

            <div className="mt-12">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                {/* Spotlight Mode Feature */}
                <div className="relative bg-purple-50 rounded-lg p-6 shadow-sm border border-purple-100">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-purple-600 text-2xl">★</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-purple-900">
                        Spotlight Mode
                      </h3>
                      <p className="mt-2 text-purple-700">
                        Highlight important questions and manage focus in your Q&A session. Perfect for large audiences and prioritizing key discussions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Anonymous Questions */}
                <div className="relative bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Anonymous Questions
                      </h3>
                      <p className="mt-2 text-gray-600">
                        Ask questions anonymously or with a nickname. No sign-up required.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Real-time Updates */}
                <div className="relative bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Real-time Updates
                      </h3>
                      <p className="mt-2 text-gray-600">
                        Questions and votes update instantly for all participants.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upvoting System */}
                <div className="relative bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Upvoting System
                      </h3>
                      <p className="mt-2 text-gray-600">
                        Let participants vote on questions to highlight what matters most.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How it Works Section */}
        <div className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                How it Works
              </h2>
            </div>

            <div className="mt-12">
              <div className="space-y-10">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 bg-blue-600 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Create a Session</h3>
                    <p className="mt-1 text-gray-600">Click "Create Session" to start a new Q&A session instantly.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 bg-blue-600 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Share the Link</h3>
                    <p className="mt-1 text-gray-600">Share the session link with your audience - no sign-up needed.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 bg-blue-600 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Manage Questions</h3>
                    <p className="mt-1 text-gray-600">Use spotlight mode to highlight important questions, mark answers, and keep discussions focused.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Perfect For
              </h2>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Conferences & Events</h3>
                <p className="mt-2 text-gray-600">
                  Manage audience questions efficiently during presentations and panels. Use spotlight mode to focus on key discussions.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Team Meetings</h3>
                <p className="mt-2 text-gray-600">
                  Collect and address team questions in an organized way. Perfect for all-hands and town halls.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Webinars</h3>
                <p className="mt-2 text-gray-600">
                  Handle participant questions smoothly in virtual events. Spotlight important topics for better engagement.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Workshops</h3>
                <p className="mt-2 text-gray-600">
                  Gather and address participant questions effectively during interactive sessions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-br from-gray-50 to-white py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="text-sm text-gray-500 space-y-4">
                <p>
                  Created with ❤️ by{' '}
                  <a 
                    href="https://github.com/htuzel" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600"
                  >
                    Hayreddin Tüzel
                  </a>
                </p>
                <p>
                  AskAny is developed as open source under the MIT license.
                  You can inspect the code, contribute, or host it on your own server.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Feature({ title, description, icon }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function Step({ number, title, description }) {
  return (
    <div className="text-center group">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 transform group-hover:scale-110 transition-all duration-300 shadow-md">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function UseCase({ title, description }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
} 