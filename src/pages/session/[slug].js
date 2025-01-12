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
import { GoogleAnalytics, sendGAEvent } from '@next/third-parties/google';
import GitHubStars from '../../components/GitHubStars';
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
  const [showModeInfo, setShowModeInfo] = useState(false);
  const [showModeModal, setShowModeModal] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);

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
      
      // Track mode change
      sendGAEvent('event', 'session_mode_changed', {
        category: 'Session',
        action: 'Change Mode',
        mode: newMode,
        session_id: slug
      });
      
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
      
      // Track spotlight toggle
      sendGAEvent('event', 'question_spotlight_toggled', {
        category: 'Question',
        action: 'Toggle Spotlight',
        session_id: slug,
        question_id: questionId,
        is_spotlight: response.data.is_spotlight
      });

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
    
    // Track question added
    sendGAEvent('event', 'question_added', {
      category: 'Question',
      action: 'Add',
      session_id: slug,
      is_anonymous: newQuestion.is_anonymous
    });

    setQuestions(updatedQuestions);
    localStorage.setItem(`questions_${slug}`, JSON.stringify(updatedQuestions));
  };

  const handleModeChange = () => {
    const newMode = session.mode === 'normal' ? 'spotlight' : 'normal';
    setPendingMode(newMode);
    setShowModeModal(true);
    
    // Track mode modal shown
    sendGAEvent('event', 'mode_change_modal_shown', {
      category: 'Session',
      action: 'Mode Change Modal',
      current_mode: session.mode,
      session_id: slug
    });
  };

  const confirmModeChange = async () => {
    await toggleMode();
    setShowModeModal(false);
    setPendingMode(null);
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
      <GoogleAnalytics gaId="G-Q5YLZD1Y8G" />
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleModeChange}
                      className={clsx(
                        "px-3 py-1 rounded-lg text-sm font-medium transition-colors",
                        session.mode === 'normal' 
                          ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                          : "bg-purple-100 text-purple-800 hover:bg-purple-200"
                      )}
                    >
                      Mode: {session.mode === 'normal' ? 'Normal' : 'Spotlight'}
                    </button>
                    <div className="relative">
                      <button
                        onMouseEnter={() => setShowModeInfo(true)}
                        onMouseLeave={() => setShowModeInfo(false)}
                        onClick={() => setShowModeInfo(!showModeInfo)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        aria-label="Mode Information"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      {showModeInfo && (
                        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg p-4 text-sm z-50 border border-gray-200">
                          <div className="font-medium mb-2 text-gray-900">About Spotlight Mode</div>
                          <p className="text-gray-600 mb-2">
                            In spotlight mode, only spotlighted questions are visible to participants. This helps focus the discussion on key questions.
                          </p>
                          <ul className="text-gray-600 list-disc list-inside space-y-1">
                            <li><b>Normal Mode:</b> All questions are visible to participants</li>
                            <li><b>Spotlight Mode:</b> Only spotlighted questions are shown to participants</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
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
                {/* Spotlighted Questions - Only show in spotlight mode */}
                {session.mode === 'spotlight' && (
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
                )}

                {/* Other Questions - Show all non-answered questions in normal mode */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">
                    {session.mode === 'spotlight' ? 'Other Questions' : 'Questions'}
                  </h2>
                  {questions
                    .filter(q => !q.is_answered && (session.mode === 'normal' || !q.is_spotlight))
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
                  
                  {questions.filter(q => !q.is_answered && (session.mode === 'normal' || !q.is_spotlight)).length === 0 && (
                    <div className="text-center py-6 bg-white rounded-lg shadow-sm">
                      <p className="text-gray-500">
                        {session.mode === 'spotlight' ? 'No other questions yet' : 'No questions yet'}
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

      {/* Mode Change Modal */}
      {showModeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowModeModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Switch to {pendingMode === 'normal' ? 'Normal' : 'Spotlight'} Mode
            </h3>
            
            <p className="text-gray-600 mb-6">
              {pendingMode === 'spotlight' 
                ? "In Spotlight mode, only questions you highlight will be visible to participants. This helps focus the discussion on key questions."
                : "In Normal mode, all questions will be visible to everyone. This is great for open discussions."}
            </p>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                ✨ Enjoying AskAny? Your support means the world to us! Consider giving us a star on GitHub or buying us a coffee to help keep this free service running.
              </p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <GitHubStars />
                <BuyMeCoffeeButton />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModeModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmModeChange}
                className={clsx(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  pendingMode === 'normal'
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                )}
              >
                Switch Mode to {pendingMode === 'normal' ? 'Normal' : 'Spotlight'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 