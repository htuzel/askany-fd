import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import QuestionForm from '../../components/QuestionForm';
import QuestionCard from '../../components/QuestionCard';
import BuyMeCoffeeButton from '../../components/BuyMeCoffeeButton';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';

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
    if (!slug) return;

    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${slug}`);
        setSession(response.data.session);
        setQuestions(response.data.questions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching session:', error);
        if (error.response?.status === 404) {
          toast.error('Session not found');
          router.push('/');
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [slug, router]);

  const handleSubmitQuestion = async (questionData) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/questions`, {
        session_id: session.id,
        ...questionData
      });

      setQuestions([response.data, ...questions]);
      toast.success('Question submitted successfully!');
    } catch (error) {
      console.error('Error submitting question:', error);
      toast.error('Failed to submit question. Please try again.');
    }
  };

  const handleUpvote = async (questionId) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${questionId}/upvote`,
        { client_id: clientId }
      );

      setQuestions(questions.map(q => 
        q.id === questionId ? response.data : q
      ));
      toast.success('Vote recorded!');
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('You have already voted for this question');
      } else {
        console.error('Error upvoting:', error);
        toast.error('Failed to upvote. Please try again.');
      }
    }
  };

  const handleMarkAnswered = async (questionId) => {
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${questionId}/answer`
      );

      setQuestions(questions.map(q => 
        q.id === questionId ? response.data : q
      ));
      toast.success('Question marked as answered!');
    } catch (error) {
      console.error('Error marking as answered:', error);
      toast.error('Failed to mark question as answered. Please try again.');
    }
  };

  const copySessionLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading session...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const answeredQuestions = questions.filter(q => q.isAnswered);
  const unansweredQuestions = questions.filter(q => !q.isAnswered);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Q&A Session
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={copySessionLink}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 focus:outline-none"
              >
                <ClipboardDocumentIcon className="w-5 h-5" />
                Copy Session Link
              </button>
              <BuyMeCoffeeButton className="text-sm" />
            </div>
          </div>
          {isOwner && (
            <p className="text-sm text-gray-600 bg-primary-50 p-3 rounded-lg">
              You are the session owner. You can mark questions as answered.
            </p>
          )}
        </div>

        <div className="mb-8">
          <QuestionForm onSubmit={handleSubmitQuestion} />
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Active Questions ({unansweredQuestions.length})
            </h2>
            <div className="space-y-4">
              {unansweredQuestions.map(question => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  isOwner={isOwner}
                  onUpvote={handleUpvote}
                  onMarkAnswered={handleMarkAnswered}
                />
              ))}
              {unansweredQuestions.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No active questions yet. Be the first to ask!
                </p>
              )}
            </div>
          </div>

          {answeredQuestions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Answered Questions ({answeredQuestions.length})
              </h2>
              <div className="space-y-4">
                {answeredQuestions.map(question => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    isOwner={isOwner}
                    onUpvote={handleUpvote}
                    onMarkAnswered={handleMarkAnswered}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 