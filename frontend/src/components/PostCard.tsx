'use client';

import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface Post {
  id: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  index?: number;
}

export default function PostCard({ post, index = 0 }: PostCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  // Generate consistent gradient based on username
  const getGradientColors = (username: string) => {
    const gradients = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-green-400 to-green-600',
      'from-yellow-400 to-orange-500',
      'from-indigo-400 to-indigo-600',
      'from-red-400 to-red-600',
      'from-teal-400 to-teal-600',
    ];
    const index = username.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      {/* Glow Effect on Hover */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${getGradientColors(post.username)} rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500`} />
      
      <div className="relative bg-white rounded-2xl shadow-soft hover:shadow-soft-lg p-6 mb-4 transition-all duration-300 border border-gray-100">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="flex-shrink-0"
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getGradientColors(post.username)} flex items-center justify-center text-white font-bold text-lg shadow-lg relative overflow-hidden`}>
              {/* Shimmer Effect */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: isHovered ? '100%' : '-100%' }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
              <span className="relative z-10">{post.username.charAt(0).toUpperCase()}</span>
            </div>
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                  @{post.username}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{getRelativeTime(post.createdAt)}</span>
                </div>
              </div>

              {/* Action Dots */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </motion.button>
            </div>

            {/* Post Content */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-800 leading-relaxed text-base break-words"
            >
              {post.content}
            </motion.p>

            {/* Interaction Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center space-x-6 mt-4 pt-3 border-t border-gray-100"
            >
              <InteractionButton icon="heart" count={0} />
              <InteractionButton icon="comment" count={0} />
              <InteractionButton icon="share" count={0} />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface InteractionButtonProps {
  icon: 'heart' | 'comment' | 'share';
  count: number;
}

function InteractionButton({ icon, count }: InteractionButtonProps) {
  const [isActive, setIsActive] = useState(false);

  const icons = {
    heart: (
      <svg className={`w-5 h-5 ${isActive ? 'fill-red-500 text-red-500' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    comment: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    share: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setIsActive(!isActive)}
      className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
        isActive 
          ? 'text-primary-600 bg-primary-50' 
          : 'text-gray-500 hover:text-primary-600 hover:bg-gray-50'
      }`}
    >
      {icons[icon]}
      {count > 0 && <span className="text-sm font-medium">{count}</span>}
    </motion.button>
  );
}
