'use client';

import { useState, useEffect } from 'react';
import withAuth from '@/components/withAuth';
import Navbar from '@/components/Navbar';
import CreatePost from '@/components/CreatePost';
import PostCard from '@/components/PostCard';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';

// API Response interface (lowercase from backend)
interface PostResponse {
  id: number;
  userid: number;
  content: string;
  createdat: string;
}

// Internal interface for frontend (camelCase)
interface Post {
  id: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
}

function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchFeed = async (pageNum: number = 1) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/feed?page=${pageNum}&limit=10`);
      
      // Map API response to internal format
      const mappedPosts = response.data.posts.map((post: PostResponse & { username?: string }) => ({
        id: post.id,
        userId: post.userid,
        username: post.username || 'unknown',
        content: post.content,
        createdAt: post.createdat
      }));
      
      setPosts(mappedPosts);
      setHasMore(mappedPosts.length === 10); // If less than 10, no more pages
      setPage(pageNum);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load feed', {
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
    fetchFeed();
  }, []);

  const handlePostCreated = () => {
    fetchFeed(1); // Reload the feed from the first page
  };

  const handleNextPage = () => {
    if (hasMore) {
      fetchFeed(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      fetchFeed(page - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-primary-50/20">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-primary-700 to-primary-600 bg-clip-text text-transparent">
                Your Feed
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Discover what&apos;s happening with people you follow</p>
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
              className="text-3xl sm:text-4xl"
            >
            </motion.div>
          </div>
        </motion.div>

        {/* Create Post */}
        <CreatePost onPostCreated={handlePostCreated} />

        {/* Feed Content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Skeleton Loading Cards */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-soft p-6 animate-pulse">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-200" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/6" />
                      <div className="space-y-2 mt-4">
                        <div className="h-3 bg-gray-200 rounded w-full" />
                        <div className="h-3 bg-gray-200 rounded w-5/6" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : posts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative group"
            >
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-400 to-purple-400 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
              
              <div className="relative bg-white rounded-3xl shadow-soft-lg p-12 text-center border border-gray-100">
                {/* Animated Icon */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="mb-6"
                >
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center shadow-lg">
                    <svg
                      className="w-12 h-12 text-primary-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                      />
                    </svg>
                  </div>
                </motion.div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">Your feed is empty</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                  Start following other users to see their posts in your personalized feed!
                </p>

                <motion.button
                  onClick={() => router.push('/people')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Discover People</span>
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="posts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Posts List */}
              <div className="space-y-5">
                {posts.map((post, index) => (
                  <PostCard key={post.id} post={post} index={index} />
                ))}
              </div>

              {/* Pagination */}
              {(page > 1 || hasMore) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center items-center space-x-4 mt-10"
                >
                  <motion.button
                    whileHover={{ scale: page === 1 ? 1 : 1.05 }}
                    whileTap={{ scale: page === 1 ? 1 : 0.95 }}
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                      page === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 shadow-md hover:shadow-lg border border-gray-200 hover:border-primary-300'
                    }`}
                    aria-label="Previous page"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous</span>
                  </motion.button>

                  <div className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold shadow-lg">
                    <span className="text-sm">Page</span>
                    <span className="text-xl">{page}</span>
                  </div>

                  <motion.button
                    whileHover={{ scale: !hasMore ? 1 : 1.05 }}
                    whileTap={{ scale: !hasMore ? 1 : 0.95 }}
                    onClick={handleNextPage}
                    disabled={!hasMore}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                      !hasMore
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 shadow-md hover:shadow-lg border border-gray-200 hover:border-primary-300'
                    }`}
                    aria-label="Next page"
                  >
                    <span>Next</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default withAuth(FeedPage);
