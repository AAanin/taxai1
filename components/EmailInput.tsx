
import React, { useState } from 'react';

interface EmailInputProps {
  onSubmit: (email: string) => void;
  isLoading: boolean;
}

const EmailInput: React.FC<EmailInputProps> = ({ onSubmit, isLoading }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    if (!email) return false;
    // More robust regex for email validation
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail(email)) {
      setError('');
      onSubmit(email);
      setEmail('');
    } else {
      setError('Please enter a valid email address.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
      <div className="flex items-center space-x-3">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(''); // Clear error on new input
          }}
          placeholder="Enter your email for the report..."
          disabled={isLoading}
          className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:border-transparent transition duration-200 disabled:opacity-50 disabled:bg-gray-100 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'}`}
          autoComplete="email"
          aria-label="Email address for PDF report"
          aria-invalid={!!error}
          aria-describedby={error ? 'email-error' : undefined}
        />
        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="px-5 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200 disabled:bg-purple-300 disabled:cursor-not-allowed flex items-center justify-center"
          aria-label="Send Email"
        >
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </div>
      {error && <p id="email-error" className="text-red-500 text-sm px-1">{error}</p>}
    </form>
  );
};

export default EmailInput;
