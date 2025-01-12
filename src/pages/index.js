import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import SEO from '../components/SEO';
import Stats from '../components/Stats';
import BuyMeCoffeeButton from '../components/BuyMeCoffeeButton';
import GitHubStars from '../components/GitHubStars';

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
        <div className="py-24 bg-gradient-to-br from-white to-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              Why Choose <span className="text-blue-600">AskAny</span>?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Feature
                title="Privacy First"
                description="No registration, no identity sharing. Data automatically deleted after 7 days."
                icon="🔒"
              />
              <Feature
                title="Instant Setup"
                description="Create a session with one click, share the link, and start collecting questions."
                icon="⚡️"
              />
              <Feature
                title="Open Source"
                description="Transparent codebase, open to community contributions. Inspect and contribute on GitHub."
                icon="💻"
              />
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-24 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              How It <span className="text-blue-600">Works</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <Step
                number="1"
                title="Create Session"
                description="Start a new session instantly without registration."
              />
              <Step
                number="2"
                title="Share Link"
                description="Share the session link with your participants."
              />
              <Step
                number="3"
                title="Manage Questions"
                description="View, upvote, and mark questions as answered."
              />
            </div>
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="py-24 bg-gradient-to-br from-white to-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              Perfect <span className="text-blue-600">For</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <UseCase
                title="Webinars & Events"
                description="Collect questions from participants during live events."
              />
              <UseCase
                title="Team Meetings"
                description="Get anonymous feedback in office meetings."
              />
              <UseCase
                title="Education"
                description="Manage interactive Q&A in classes and seminars."
              />
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