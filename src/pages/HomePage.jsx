import React, { useState, useEffect } from 'react';
import { AuthService } from '../components/auth/AuthService';
import UserPanelModal from '../modal/UserPanelModal';

const HomePage = ({ user, onLogout, registrationData }) => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [postsLoading, setPostsLoading] = useState(true);
  
  // Показываем модалку после регистрации, если есть данные регистрации
  useEffect(() => {
    if (registrationData) {
      setShowUserPanel(true);
    }
  }, [registrationData]);
  
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setPostsLoading(true);
      console.log('Loading posts...');
      const data = await AuthService.getPosts();
      console.log('Posts loaded:', data);
      
      // Безопасная обработка данных
      let postsWithSafeComments = [];
      
      if (Array.isArray(data)) {
        postsWithSafeComments = data.map(post => ({
          ...post,
          comments: post.comments || [],
          comments_count: post.comments_count || 0,
          like_count: post.like_count || 0,
          is_liked: post.is_liked || false
        }));
      } else if (data && typeof data === 'object') {
        // Если data - объект, но не массив
        postsWithSafeComments = [];
      }
      
      setPosts(postsWithSafeComments);
    } catch (error) {
      console.error('Ошибка загрузки постов:', error);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  // Функция создания поста
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setLoading(true);
    try {
      const token = AuthService.getToken();
      await AuthService.createPost(token, newPostContent);
      setNewPostContent('');
      await loadPosts(); // Перезагружаем посты
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  // Функция лайка поста
  const handleLike = async (postId) => {
    try {
      const token = AuthService.getToken();
      await AuthService.toggleLike(token, postId);
      await loadPosts(); // Перезагружаем посты для обновления лайков
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Функция добавления комментария
  const handleAddComment = async (postId) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;

    try {
      const token = AuthService.getToken();
      await AuthService.addComment(token, postId, content);
      
      // Очищаем поле ввода комментария
      setCommentInputs(prev => ({
        ...prev,
        [postId]: ''
      }));
      
      await loadPosts(); // Перезагружаем посты для обновления комментариев
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Функция переключения отображения комментариев
  const toggleComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Функция форматирования времени
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'только что';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} мин. назад`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ч. назад`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} дн. назад`;
    }
  };

  if (postsLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">Загрузка постов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              <h1 className="text-xl font-bold">Threads</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div 
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-800 rounded-lg px-2 py-1 transition-colors"
                onClick={() => setShowUserPanel(true)}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.login?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-sm">@{user?.login || 'unknown'}</span>
              </div>
              <button
                onClick={onLogout}
                className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Create Post Form */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6">
          <form onSubmit={handleCreatePost}>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Поделитесь своими мыслями..."
              className="w-full bg-transparent border-none resize-none text-white placeholder-gray-500 focus:outline-none text-lg mb-4"
              rows="3"
              maxLength="500"
            />
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">
                {newPostContent.length}/500
              </span>
              <button
                type="submit"
                disabled={loading || !newPostContent.trim()}
                className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Публикация...
                  </div>
                ) : (
                  'Опубликовать'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="bg-gray-900 rounded-2xl p-6">
                {/* Post Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {post.user?.login?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">@{post.user?.login || 'unknown'}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-400 text-sm">
                        {formatTime(post.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>

                {/* Post Stats */}
                <div className="flex items-center space-x-6 text-gray-400 text-sm mb-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-2 transition-colors ${
                      post.is_liked ? 'text-red-500' : 'hover:text-red-400'
                    }`}
                  >
                    <svg className="w-5 h-5" fill={post.is_liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{post.like_count || 0}</span>
                  </button>
                  
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{post.comments_count || 0}</span>
                  </button>
                </div>

                {/* Comments Section */}
                {expandedComments[post.id] && (
                  <div className="border-t border-gray-800 pt-4">
                    {/* Add Comment */}
                    <div className="flex space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">
                          {user?.login?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({
                            ...prev,
                            [post.id]: e.target.value
                          }))}
                          placeholder="Напишите комментарий..."
                          className="w-full bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddComment(post.id);
                            }
                          }}
                        />
                      </div>
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentInputs[post.id]?.trim()}
                        className="bg-gray-700 hover:bg-gray-600 px-4 rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Отправить
                      </button>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-3">
                      {post.comments && post.comments.length > 0 ? (
                        post.comments.map((comment) => (
                          <div key={comment.id} className="flex space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-xs">
                                {comment.user?.login?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="bg-gray-800 rounded-2xl p-3">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-semibold text-sm">
                                    @{comment.user?.login || 'unknown'}
                                  </span>
                                  <span className="text-gray-400 text-xs">
                                    {formatTime(comment.created_at)}
                                  </span>
                                </div>
                                <p className="text-white text-sm">
                                  {comment.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 text-sm py-2">
                          Пока нет комментариев
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                Пока нет постов. Будьте первым, кто поделится мыслями!
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Panel Modal */}
      {showUserPanel && (
        <UserPanelModal
          user={user}
          initialPassword={registrationData?.generatedPassword}
          onClose={() => {
            setShowUserPanel(false);
          }}
        />
      )}
    </div>
  );
};

export default HomePage;