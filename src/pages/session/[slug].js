import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import SEO from '../../components/SEO';
import QuestionForm from '../../components/QuestionForm';
import QuestionCard from '../../components/QuestionCard';
import BuyMeCoffeeButton from '../../components/BuyMeCoffeeButton';

export default function SessionPage() {
  const router = useRouter();
  const { slug } = router.query;
  
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('clientId') || uuidv4();
    }
    return null;
  });

  const isOwner = typeof window !== 'undefined' && localStorage.getItem(`isOwner_${slug}`) === 'true';

  useEffect(() => {
    if (clientId && typeof window !== 'undefined') {
      localStorage.setItem('clientId', clientId);
    }
  }, [clientId]);

  useEffect(() => {
    if (!slug || !clientId) return;

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${slug}`,
          { params: { clientId } }
        );
        setSession(response.data.session);
        setQuestions(response.data.questions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching session:', error);
        if (error.response?.status === 404) {
          alert('Session not found');
          router.push('/');
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [slug, clientId, router]);

  if (loading) {
    return (
      <>
        <SEO 
          title="Loading Q&A Session..." 
          description="Please wait while we load your Q&A session."
          noIndex={true}
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title={`Q&A Session - ${session?.title || 'Live Questions'}`}
        description="Join this live Q&A session to ask questions and vote on what matters most."
        noIndex={true}
      />
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/')}
                  className="text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Home</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  Live Q&A Session
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  Copy Session Link
                </button>
                {isOwner && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Session Owner
                  </span>
                )}
              </div>
            </div>
          </div>

          <QuestionForm session={session} onQuestionAdded={question => setQuestions([question, ...questions])} />

          <div className="mt-8 space-y-8">
            {/* Unanswered Questions */}
            <div className="space-y-4">
              {questions
                .filter(q => !q.isAnswered)
                .sort((a, b) => b.upvoteCount - a.upvoteCount)
                .map(question => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    isOwner={isOwner}
                    clientId={clientId}
                    sessionSlug={slug}
                    onQuestionUpdated={updatedQuestion => {
                      setQuestions(questions.map(q => 
                        q.id === updatedQuestion.id ? updatedQuestion : q
                      ));
                    }}
                  />
                ))}
              
              {questions.filter(q => !q.isAnswered).length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-500">
                    No questions yet. Be the first to ask!
                  </p>
                </div>
              )}
            </div>

            {/* Answered Questions */}
            {questions.some(q => q.isAnswered) && (
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4 border-t pt-8">Answered Questions</h2>
                <div className="space-y-4">
                  {questions
                    .filter(q => q.isAnswered)
                    .sort((a, b) => b.upvoteCount - a.upvoteCount)
                    .map(question => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        isOwner={isOwner}
                        clientId={clientId}
                        sessionSlug={slug}
                        onQuestionUpdated={updatedQuestion => {
                          setQuestions(questions.map(q => 
                            q.id === updatedQuestion.id ? updatedQuestion : q
                          ));
                        }}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-12 text-center">
            <BuyMeCoffeeButton />
            <div className="mt-4 text-sm text-gray-500">
              <p>
                Using{' '}
                <a 
                  href="https://askany.me" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600"
                >
                  AskAny
                </a>
                {' '}for your Q&A sessions
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 