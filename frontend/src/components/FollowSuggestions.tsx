'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface FollowSuggestionsProps {
  onFollowChange?: () => void;
}

interface Suggestion {
  id: number;
  username: string;
  createdAt: string;
  isFollowing: boolean;
}

export default function FollowSuggestions({ onFollowChange }: FollowSuggestionsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [processingIds, setProcessingIds] = useState<number[]>([]);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users');
      setSuggestions(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load users', {
        style: {
          borderRadius: '12px',
          padding: '16px',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const toggleFollow = async (userId: number, currentlyFollowing: boolean) => {
    setProcessingIds(prev => [...prev, userId]);
    try {
      if (currentlyFollowing) {
        await api.delete(`/follow/${userId}`);
        toast.success('Unfollowed successfully', {
          duration: 2000,
          style: {
            borderRadius: '12px',
            padding: '16px',
          },
        });
      } else {
        await api.post(`/follow/${userId}`);
        toast.success('Now following user', {
          duration: 2000,
          style: {
            borderRadius: '12px',
            padding: '16px',
          },
        });
      }

      setSuggestions(prev =>
        prev.map(suggestion =>
          suggestion.id === userId
            ? { ...suggestion, isFollowing: !currentlyFollowing }
            : suggestion
        )
      );

      if (onFollowChange) {
        onFollowChange();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update follow status', {
        style: {
          borderRadius: '12px',
          padding: '16px',
        },
      });
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== userId));
    }
  };

  const isProcessing = (userId: number) => processingIds.includes(userId);

  return (
    <section id="follow-suggestions" className="relative group" aria-labelledby="people-heading">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex-1">
            <h2 id="people-heading" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              People You May Know
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1.5">Connect with other users to see their content</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchSuggestions}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 shadow-sm hover:shadow-md transition-all w-full sm:w-auto"
            aria-label="Refresh user list"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="font-medium">Refresh</span>
          </motion.button>
        </div>

        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-400 to-purple-400 rounded-2xl blur opacity-0 group-hover:opacity-10 transition duration-500" />

          <div className="relative bg-white rounded-2xl shadow-md hover:shadow-lg p-6 border border-gray-100 transition-shadow duration-300">
            {isLoading ? (
              <div className="space-y-4" role="status" aria-live="polite" aria-label="Loading users">
                {[1, 2, 3].map(index => (
                  <div key={index} className="flex items-center space-x-4 animate-pulse">
                    <div className="w-12 h-12 rounded-xl bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                    </div>
                    <div className="w-24 h-8 bg-gray-200 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-12" role="status">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">No users available</p>
                <p className="text-gray-500 text-sm mt-1">Check back later for new people to follow</p>
              </div>
            ) : (
              <AnimatePresence>
                <div className="space-y-3" role="list" aria-label="User suggestions">
                  {suggestions.map((suggestion, index) => (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all bg-white"
                      role="listitem"
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 flex-shrink-0 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-base sm:text-lg shadow-md">
                          {suggestion.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base text-gray-900 font-semibold truncate">@{suggestion.username}</p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            <time dateTime={suggestion.createdAt}>Joined {new Date(suggestion.createdAt).toLocaleDateString()}</time>
                          </p>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: isProcessing(suggestion.id) ? 1 : 1.05 }}
                        whileTap={{ scale: isProcessing(suggestion.id) ? 1 : 0.95 }}
                        disabled={isProcessing(suggestion.id)}
                        onClick={() => toggleFollow(suggestion.id, suggestion.isFollowing)}
                        className={`px-5 sm:px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 w-full sm:w-auto flex-shrink-0 shadow-sm hover:shadow-md ${
                          suggestion.isFollowing
                            ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300 hover:from-gray-200 hover:to-gray-300'
                            : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700'
                        } ${isProcessing(suggestion.id) ? 'opacity-70 cursor-not-allowed' : ''}`}
                        aria-label={suggestion.isFollowing ? `Unfollow ${suggestion.username}` : `Follow ${suggestion.username}`}
                        aria-pressed={suggestion.isFollowing}
                      >
                        {isProcessing(suggestion.id) ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                            aria-hidden="true"
                          />
                        ) : suggestion.isFollowing ? (
                          <>
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                            </svg>
                            <span className="whitespace-nowrap">Unfollow</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="whitespace-nowrap">Follow</span>
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
