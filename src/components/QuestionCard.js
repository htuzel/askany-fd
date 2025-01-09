import { HandThumbUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function QuestionCard({ 
  question, 
  isOwner, 
  onUpvote, 
  onMarkAnswered 
}) {
  return (
    <div 
      className={clsx(
        "bg-white rounded-lg shadow-sm p-6 animate-fade-in",
        question.isAnswered && "opacity-60"
      )}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <p className="text-gray-900 text-lg mb-2">{question.content}</p>
          <p className="text-sm text-gray-500">
            {question.isAnonymous ? 'Anonymous' : question.nickname || 'Anonymous'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onUpvote(question.id)}
            className={clsx(
              "flex items-center gap-1 px-3 py-1 rounded-full transition-colors",
              "text-gray-600 hover:text-primary-600 hover:bg-primary-50"
            )}
          >
            <HandThumbUpIcon className="w-5 h-5" />
            <span>{question.upvoteCount}</span>
          </button>
          
          {isOwner && !question.isAnswered && (
            <button
              onClick={() => onMarkAnswered(question.id)}
              className={clsx(
                "flex items-center gap-1 px-3 py-1 rounded-full transition-colors",
                "text-green-600 hover:bg-green-50"
              )}
            >
              <CheckCircleIcon className="w-5 h-5" />
              <span>Mark Answered</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 