import { useState } from 'react';
import clsx from 'clsx';

export default function QuestionForm({ onSubmit }) {
  const [content, setContent] = useState('');
  const [nickname, setNickname] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSubmit({
      content,
      nickname: isAnonymous ? null : nickname,
      is_anonymous: isAnonymous
    });

    setContent('');
    setNickname('');
    setIsAnonymous(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-slide-up">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label 
            htmlFor="question" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Question
          </label>
          <textarea
            id="question"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={clsx(
              "w-full px-4 py-2 rounded-lg border border-gray-300",
              "focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
              "placeholder-gray-400 transition-colors"
            )}
            rows="3"
            placeholder="Type your question here..."
            required
          />
        </div>

        <div className="mb-4">
          <label 
            htmlFor="nickname" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Name (optional)
          </label>
          <input
            type="text"
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            disabled={isAnonymous}
            className={clsx(
              "w-full px-4 py-2 rounded-lg border border-gray-300",
              "focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
              "placeholder-gray-400 transition-colors",
              isAnonymous && "bg-gray-100 cursor-not-allowed"
            )}
            placeholder="Enter your name"
          />
        </div>

        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-600">
              Ask Anonymously
            </span>
          </label>
        </div>

        <button
          type="submit"
          className={clsx(
            "w-full px-4 py-2 rounded-lg font-medium",
            "bg-primary-600 text-white",
            "hover:bg-primary-700 focus:outline-none focus:ring-2",
            "focus:ring-offset-2 focus:ring-primary-500",
            "transition-colors"
          )}
        >
          Submit Question
        </button>
      </form>
    </div>
  );
} 