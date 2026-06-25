'use client';

import withAuth from '@/components/withAuth';
import Navbar from '@/components/Navbar';
import FollowSuggestions from '@/components/FollowSuggestions';
import { motion } from 'framer-motion';

function PeoplePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-primary-50/20">
      <Navbar />
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-700 to-primary-600 bg-clip-text text-transparent">
                Discover People
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2 leading-relaxed">
                Follow other users to personalize your feed and keep track of their latest posts.
              </p>
            </div>
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
              className="text-3xl sm:text-4xl hidden sm:block"
            >
            </motion.div>
          </div>
        </motion.div>

  <FollowSuggestions />
      </div>
    </div>
  );
}

export default withAuth(PeoplePage);
