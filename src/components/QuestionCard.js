import { useState } from 'react';
import axios from 'axios';
import clsx from 'clsx';

export default function QuestionCard({ 
  question, 
  isOwner, 
  clientId, 
  sessionSlug, 
  onQuestionUpdated,
  onToggleSpotlight,
  sessionMode
}) {
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  // Determine if the question should be shown as disabled
  const isDisabled = sessionMode === 'spotlight' && !question.is_spotlight;
  const isOwnQuestion = question.isOwn;

  const handleUpvote = async () => {
    if (isDisabled && !isOwner) return; // Allow owner to upvote any question
    try {
      setIsUpvoting(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${question.id}/upvote`,
        { clientId, sessionSlug }
      );
      onQuestionUpdated(response.data);
    } catch (error) {
      console.error('Error upvoting question:', error);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleMarkAnswered = async () => {
    try {
      setIsMarking(true);
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${question.id}/answer`,
        { sessionSlug }
      );
      onQuestionUpdated(response.data);
    } catch (error) {
      console.error('Error marking question as answered:', error);
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div className={clsx(
      "bg-white rounded-lg shadow-sm p-6 transition-all duration-300",
      question.is_answered && "opacity-75",
      isOwnQuestion && "border-l-4 border-blue-500",
      sessionMode === 'spotlight' && question.is_spotlight && "border-l-4 border-purple-500",
      isDisabled && !isOwnQuestion && !isOwner && "opacity-40 cursor-not-allowed", // Non-owner, non-spotlight questions are dimmed
      isDisabled && isOwnQuestion && !question.is_spotlight && "opacity-75 border-l-4 border-gray-300" // Own non-spotlight questions are semi-dimmed
    )}>
      <div className="flex items-start gap-4">
        <button
          onClick={handleUpvote}
          disabled={isUpvoting || (isDisabled && !isOwner)}
          className={clsx(
            "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
            (!isDisabled || isOwner) && "hover:bg-gray-100",
            "focus:outline-none focus:ring-2",
            "focus:ring-primary-500 focus:ring-offset-2",
            (isUpvoting || (isDisabled && !isOwner)) && "opacity-50 cursor-not-allowed"
          )}
        >
          <svg
            className={clsx(
              "w-6 h-6 transition-colors",
              question.hasUpvoted ? "text-primary-600" : "text-gray-400"
            )}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium text-gray-600">
            {question.upvote_count}
          </span>
        </button>

        <div className="flex-1">
          <p className="text-gray-900 mb-2">{question.content}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>
              {question.is_anonymous ? 'Anonymous' : question.nickname || 'Anonymous'}
            </span>
            {question.is_answered && (
              <span className="text-green-600 font-medium">
                Answered
              </span>
            )}
            {sessionMode === 'spotlight' && question.is_spotlight && (
              <span className="text-purple-600 font-medium">
                Spotlight
              </span>
            )}
            {isOwnQuestion && (
              <span className="text-blue-600 font-medium">
                Your Question
              </span>
            )}
            {isOwnQuestion && sessionMode === 'spotlight' && !question.is_spotlight && (
              <span className="text-gray-500 font-medium">
                Waiting for Spotlight
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && !question.is_answered && (
            <button
              onClick={handleMarkAnswered}
              disabled={isMarking}
              className={clsx(
                "px-3 py-1 rounded-lg text-sm font-medium",
                "bg-green-100 text-green-800",
                "hover:bg-green-200 focus:outline-none focus:ring-2",
                "focus:ring-green-500 focus:ring-offset-2",
                "transition-colors",
                isMarking && "opacity-50 cursor-not-allowed"
              )}
            >
              {isMarking ? 'Marking...' : 'Mark Answered'}
            </button>
          )}
          {isOwner && sessionMode === 'spotlight' && !question.is_spotlight && (
            <button
              onClick={onToggleSpotlight}
              className={clsx(
                "px-3 py-1 rounded-lg text-sm font-medium",
                "bg-purple-100 text-purple-800",
                "hover:bg-purple-200 focus:outline-none focus:ring-2",
                "focus:ring-purple-500 focus:ring-offset-2",
                "transition-colors"
              )}
            >
              Spotlight
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 