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
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center text-white text-3xl font-semibold">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-gray-900">@{user?.username}</h1>
              <div className="flex space-x-6 mt-2">
                <div className="text-center">
                  <div className="text-xl font-semibold text-gray-900">{stats.followers}</div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold text-gray-900">{stats.following}</div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold text-gray-900">{posts.length}</div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Posts</h2>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600">
              Create your first post to get started!
            </p>
          </div>
        ) : (
          <div>
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
