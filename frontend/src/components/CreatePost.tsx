'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface PostFormData {
  content: string;
}

interface CreatePostProps {
  onPostCreated?: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<PostFormData>({
    defaultValues: { content: '' }
  });

  const content = watch('content', '');
  const charCount = content.length;

  const onSubmit = async (data: PostFormData) => {
    try {
      await api.post('/posts', data);
      toast.success('Post created successfully! 🎉', {
        duration: 3000,
        style: {
          background: '#10b981',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
        },
      });
      reset();
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create post', {
        style: {
          borderRadius: '12px',
          padding: '16px',
        },
      });
    }
  };

  const charPercentage = (charCount / 200) * 100;
  const getCharColor = () => {
    if (charCount > 200) return 'text-red-500';
    if (charCount > 180) return 'text-orange-500';
    if (charCount > 150) return 'text-yellow-600';
    return 'text-gray-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative group"
    >
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-400 to-primary-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500" />
      
      <div className="relative bg-white rounded-2xl shadow-soft hover:shadow-soft-lg p-6 mb-6 transition-all duration-300 border border-gray-100">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Create a Post
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Textarea */}
          <div className="mb-4 relative">
            <motion.div
              animate={{
                boxShadow: isFocused 
                  ? '0 0 0 3px rgba(14, 165, 233, 0.1)' 
                  : '0 0 0 0px rgba(14, 165, 233, 0)',
              }}
              transition={{ duration: 0.2 }}
              className="rounded-xl"
            >
              <textarea
                {...register('content', {
                  required: 'Content is required',
                  maxLength: {
                    value: 200,
                    message: 'Content must not exceed 200 characters'
                  }
                })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 transition-all duration-300 resize-none bg-gray-50 focus:bg-white"
                rows={4}
                placeholder="What's on your mind? ✨"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={isSubmitting}
              />
            </motion.div>

            {/* Character Counter with Progress Bar */}
            <div className="mt-3 space-y-2">
              {/* Progress Bar */}
              <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(charPercentage, 100)}%` }}
                  transition={{ duration: 0.3 }}
                  className={`h-full rounded-full ${
                    charCount > 200 
                      ? 'bg-gradient-to-r from-red-500 to-red-600' 
                      : charCount > 180
                      ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                      : charCount > 150
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                      : 'bg-gradient-to-r from-primary-400 to-primary-600'
                  }`}
                />
              </div>

              <div className="flex justify-between items-center">
                <AnimatePresence>
                  {errors.content && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center space-x-2 text-red-500 text-sm"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p>{errors.content.message}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.span
                  animate={{ scale: charCount > 200 ? 1.1 : 1 }}
                  className={`text-sm font-semibold ${getCharColor()}`}
                >
                  {charCount}/200
                </motion.span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            {/* Formatting Options (placeholder) */}
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-primary-600"
                title="Add image (coming soon)"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-primary-600"
                title="Add emoji (coming soon)"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.button>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
              type="submit"
              disabled={isSubmitting || charCount === 0 || charCount > 200}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-semibold shadow-lg transition-all ${
                isSubmitting || charCount === 0 || charCount > 200
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-xl'
              }`}
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Post</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
