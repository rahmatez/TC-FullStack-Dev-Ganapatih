import { useState, useEffect, useCallback } from 'react';
import withAuth from '@/components/withAuth';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Post {
  id: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
}

interface UserStats {
  followers: number;
  following: number;
}

function ProfilePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<UserStats>({ followers: 0, following: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserData = useCallback(async () => {
    if (!user?.id) {
      return;
    }
    setIsLoading(true);
    try {
      // Fetch user's posts
      const postsResponse = await api.get('/posts/user/me');
      setPosts(postsResponse.data.posts);

      // Fetch followers and following
      const followersResponse = await api.get(`/follow/followers/${user.id}`);
      const followingResponse = await api.get(`/follow/following/${user.id}`);
      
      setStats({
        followers: followersResponse.data.count,
        following: followingResponse.data.count
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-primary-50/20">
      <Navbar />
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 sm:p-8 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-xl">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">@{user?.username}</h1>
              <div className="flex flex-wrap justify-center sm:justify-start gap-6 sm:gap-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">{stats.followers}</div>
                  <div className="text-sm sm:text-base text-gray-600 font-medium">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">{stats.following}</div>
                  <div className="text-sm sm:text-base text-gray-600 font-medium">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">{posts.length}</div>
                  <div className="text-sm sm:text-base text-gray-600 font-medium">Posts</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Your Posts</h2>
          <p className="text-gray-600 mt-1">All your posts in one place</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md p-6 animate-pulse">
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
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-12 text-center border border-gray-100">
            <div className="text-gray-400 mb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No posts yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first post to get started and share with your followers!
            </p>
            <button
              onClick={() => window.location.href = '/feed'}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Post</span>
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(ProfilePage);
