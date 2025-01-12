import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import SEO from '../../components/SEO';
import QuestionForm from '../../components/QuestionForm';
import QuestionCard from '../../components/QuestionCard';
import BuyMeCoffeeButton from '../../components/BuyMeCoffeeButton';
import toast from 'react-hot-toast';
import clsx from 'clsx';

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

  // Load questions from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && slug) {
      const storedQuestions = localStorage.getItem(`questions_${slug}`);
      if (storedQuestions) {
        setQuestions(JSON.parse(storedQuestions));
      }
    }
  }, [slug]);

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
        console.log('Session data:', response.data); // Debug log
        setSession(response.data.session);

        // Get server questions and currently stored questions
        const serverQuestions = response.data.questions;
        const storedQuestions = JSON.parse(localStorage.getItem(`questions_${slug}`) || '[]');
        
        // Create maps for easier lookup
        const serverQuestionsMap = new Map(serverQuestions.map(q => [q.id, q]));
        const storedQuestionsMap = new Map(storedQuestions.map(q => [q.id, q]));
        
        // Combine questions, preserving user's own questions
        const mergedQuestions = [...serverQuestions];

        // Add stored questions that belong to the current user and aren't in server response
        storedQuestions.forEach(storedQuestion => {
          if (storedQuestion.clientId === clientId && !serverQuestionsMap.has(storedQuestion.id)) {
            mergedQuestions.push({
              ...storedQuestion,
              isOwn: true,
              is_spotlight: storedQuestion.is_spotlight || false
            });
          }
        });

        // Update existing questions with server data while preserving user's own questions
        const finalQuestions = mergedQuestions.map(question => {
          const storedQuestion = storedQuestionsMap.get(question.id);
          if (storedQuestion?.clientId === clientId) {
            // Preserve user's own question properties while updating with server data
            return {
              ...question,
              isOwn: true,
              // Keep the question visible in spotlight mode
              is_spotlight: question.is_spotlight || false
            };
          }
          return question;
        });

        setQuestions(finalQuestions);
        // Store the merged questions in localStorage
        localStorage.setItem(`questions_${slug}`, JSON.stringify(finalQuestions));
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

  const toggleMode = async () => {
    if (!session?.isOwner) return;
    const newMode = session.mode === 'normal' ? 'spotlight' : 'normal';
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${slug}/mode`, { mode: newMode });
      setSession(prev => ({ ...prev, mode: newMode }));
      toast.success(`Session mode changed to ${newMode}`);
    } catch (error) {
      console.error('Error changing session mode:', error);
      toast.error('Failed to change session mode. Please try again.');
    }
  };

  const toggleSpotlight = async (questionId) => {
    if (!session?.isOwner) return;
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${questionId}/spotlight`,
        { sessionSlug: slug }
      );
      setQuestions(questions.map(q => 
        q.id === questionId ? response.data : q
      ));
      toast.success('Question spotlight status updated');
    } catch (error) {
      console.error('Error updating spotlight status:', error);
      toast.error('Failed to update spotlight status');
    }
  };

  const handleQuestionAdded = (newQuestion) => {
    const updatedQuestions = [
      {
        ...newQuestion,
        isOwn: true,
        clientId: clientId
      },
      ...questions
    ];
    setQuestions(updatedQuestions);
    localStorage.setItem(`questions_${slug}`, JSON.stringify(updatedQuestions));
  };

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
                  Live Q&A Session {session?.isOwner ? '(Owner)' : ''} - Mode: {session?.mode}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                {session?.isOwner && (
                  <button
                    onClick={toggleMode}
                    className={clsx(
                      "px-3 py-1 rounded-lg text-sm font-medium transition-colors",
                      session.mode === 'normal' 
                        ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                        : "bg-purple-100 text-purple-800 hover:bg-purple-200"
                    )}
                  >
                    Mode: {session.mode === 'normal' ? 'Normal' : 'Spotlight'}
                  </button>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                      .then(() => {
                        toast.success('Session link copied to clipboard!');
                      })
                      .catch(err => {
                        console.error('Failed to copy: ', err);
                        toast.error('Failed to copy session link. Please try again.');
                      });
                  }}
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  Copy Session Link
                </button>
                {session?.isOwner && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Session Owner
                  </span>
                )}
              </div>
            </div>
          </div>

          <QuestionForm 
            session={session} 
            clientId={clientId}
            onQuestionAdded={handleQuestionAdded}
          />

          <div className="mt-8 space-y-8">
            {/* Session Owner View: Spotlighted and Other Questions */}
            {session?.isOwner ? (
              <>
                {/* Spotlighted Questions */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <span className="text-purple-600">★</span> Spotlighted Questions
                  </h2>
                  {questions
                    .filter(q => !q.is_answered && q.is_spotlight)
                    .sort((a, b) => b.upvote_count - a.upvote_count)
                    .map(question => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        isOwner={session.isOwner}
                        clientId={clientId}
                        sessionSlug={slug}
                        onQuestionUpdated={updatedQuestion => {
                          setQuestions(questions.map(q => 
                            q.id === updatedQuestion.id ? updatedQuestion : q
                          ));
                        }}
                        onToggleSpotlight={() => toggleSpotlight(question.id)}
                        sessionMode={session.mode}
                      />
                    ))}
                  
                  {questions.filter(q => !q.is_answered && q.is_spotlight).length === 0 && (
                    <div className="text-center py-6 bg-white rounded-lg shadow-sm border border-purple-100">
                      <p className="text-gray-500">
                        No spotlighted questions yet
                      </p>
                    </div>
                  )}
                </div>

                {/* Other Questions */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">Other Questions</h2>
                  {questions
                    .filter(q => !q.is_answered && !q.is_spotlight)
                    .sort((a, b) => b.upvote_count - a.upvote_count)
                    .map(question => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        isOwner={session.isOwner}
                        clientId={clientId}
                        sessionSlug={slug}
                        onQuestionUpdated={updatedQuestion => {
                          setQuestions(questions.map(q => 
                            q.id === updatedQuestion.id ? updatedQuestion : q
                          ));
                        }}
                        onToggleSpotlight={() => toggleSpotlight(question.id)}
                        sessionMode={session.mode}
                      />
                    ))}
                  
                  {questions.filter(q => !q.is_answered && !q.is_spotlight).length === 0 && (
                    <div className="text-center py-6 bg-white rounded-lg shadow-sm">
                      <p className="text-gray-500">
                        No other questions yet
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Regular User View: Normal Question List */
              <div className="space-y-4">
                {questions
                  .filter(q => !q.is_answered)
                  .sort((a, b) => b.upvote_count - a.upvote_count)
                  .map(question => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      isOwner={session.isOwner}
                      clientId={clientId}
                      sessionSlug={slug}
                      onQuestionUpdated={updatedQuestion => {
                        setQuestions(questions.map(q => 
                          q.id === updatedQuestion.id ? updatedQuestion : q
                        ));
                      }}
                      onToggleSpotlight={() => toggleSpotlight(question.id)}
                      sessionMode={session.mode}
                    />
                  ))}
                
                {questions.filter(q => !q.is_answered).length === 0 && (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <p className="text-gray-500">
                      No questions yet. Be the first to ask!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Answered Questions Section (remains the same for both views) */}
            {questions.some(q => q.is_answered) && (
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4 border-t pt-8">Answered Questions</h2>
                <div className="space-y-4">
                  {questions
                    .filter(q => q.is_answered)
                    .sort((a, b) => b.upvote_count - a.upvote_count)
                    .map(question => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        isOwner={session.isOwner}
                        clientId={clientId}
                        sessionSlug={slug}
                        onQuestionUpdated={updatedQuestion => {
                          setQuestions(questions.map(q => 
                            q.id === updatedQuestion.id ? updatedQuestion : q
                          ));
                        }}
                        onToggleSpotlight={() => toggleSpotlight(question.id)}
                        sessionMode={session.mode}
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