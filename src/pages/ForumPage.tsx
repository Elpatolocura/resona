import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  ThumbsUp,
  Plus,
  X,
  Send,
  Clock,
  User,
  Film,
  Music,
  Tv,
  MessagesSquare,
  Flame,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../utils/format';
import { INITIAL_POSTS, type ForumPost, type ForumComment } from '../utils/forumData';

const CATEGORIES = [
  { id: 'all', label: 'Todo', icon: MessagesSquare },
  { id: 'movies', label: 'Películas', icon: Film },
  { id: 'tv', label: 'Series', icon: Tv },
  { id: 'music', label: 'Música', icon: Music },
  { id: 'general', label: 'General', icon: Flame },
];

export default function ForumPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<ForumPost[]>(INITIAL_POSTS);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showNewPost, setShowNewPost] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [newComment, setNewComment] = useState('');
  const [commentingOn, setCommentingOn] = useState<string | null>(null);

  const filtered = activeCategory === 'all' ? posts : posts.filter((p) => p.category === activeCategory);

  const toggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likedByMe: !p.likedByMe, likes: p.likedByMe ? p.likes - 1 : p.likes + 1 }
          : p,
      ),
    );
  };

  const toggleCommentLike = (postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: p.comments.map((c) =>
                c.id === commentId
                  ? { ...c, likedByMe: !c.likedByMe, likes: c.likedByMe ? c.likes - 1 : c.likes + 1 }
                  : c,
              ),
            }
          : p,
      ),
    );
  };

  const addPost = () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    const post: ForumPost = {
      id: String(Date.now()),
      title: newTitle.trim(),
      body: newBody.trim(),
      author: 'Tú',
      category: newCategory,
      date: 'Ahora mismo',
      likes: 0,
      likedByMe: false,
      comments: [],
    };
    setPosts((prev) => [post, ...prev]);
    setNewTitle('');
    setNewBody('');
    setShowNewPost(false);
  };

  const addComment = (postId: string) => {
    if (!newComment.trim()) return;
    const comment: ForumComment = {
      id: `c${Date.now()}`,
      author: 'Tú',
      text: newComment.trim(),
      date: 'Ahora mismo',
      likes: 0,
      likedByMe: false,
    };
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, comment] } : p)),
    );
    setNewComment('');
    setCommentingOn(null);
  };

  const catIcon = (cat: string) => {
    switch (cat) {
      case 'movies': return <Film className="h-3 w-3" />;
      case 'tv': return <Tv className="h-3 w-3" />;
      case 'music': return <Music className="h-3 w-3" />;
      default: return <Flame className="h-3 w-3" />;
    }
  };

  const catColor = (cat: string) => {
    switch (cat) {
      case 'movies': return 'text-fuchsia-300 bg-fuchsia-500/15';
      case 'tv': return 'text-cyan-300 bg-cyan-500/15';
      case 'music': return 'text-amber-300 bg-amber-500/15';
      default: return 'text-emerald-300 bg-emerald-500/15';
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-fuchsia-300" />
          <h1 className="text-2xl font-black tracking-tight">Foro</h1>
          <span className="rounded-full bg-fuchsia-500/15 px-2.5 py-0.5 text-[11px] font-bold text-fuchsia-300">
            {posts.length} publicaciones
          </span>
        </div>
        <button
          onClick={() => setShowNewPost(true)}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/25 transition hover:scale-[1.03] hover:opacity-90 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Nueva publicación
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveCategory(id)}
            className={cn(
              'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition-all',
              activeCategory === id
                ? 'border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-300'
                : 'border-line bg-surface/60 text-muted hover:border-fuchsia-400/30 hover:text-text',
            )}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center rounded-3xl border border-line bg-surface/60 px-6 py-16 text-center">
          <MessagesSquare className="h-12 w-12 text-fuchsia-300/30" />
          <p className="mt-3 text-sm text-muted">No hay publicaciones en esta categoría.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((post) => {
          const expanded = expandedPost === post.id;
          return (
            <div
              key={post.id}
              className="rounded-2xl border border-line bg-surface/70 transition-all hover:border-fuchsia-400/20 hover:bg-surface/90"
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/20 text-sm font-bold text-fuchsia-300">
                    {post.author.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold', catColor(post.category))}>
                        {catIcon(post.category)} {CATEGORIES.find((c) => c.id === post.category)?.label}
                      </span>
                      <span className="text-xs text-faint">{post.date}</span>
                    </div>
                    <h3
                      onClick={() => navigate(`/forum/${post.id}`)}
                      className="mt-1 text-sm font-bold text-text leading-snug cursor-pointer transition hover:text-fuchsia-300"
                    >
                      {post.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted leading-relaxed">{post.body}</p>

                    <div className="mt-3 flex items-center gap-4">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={cn(
                          'inline-flex items-center gap-1.5 text-xs font-medium transition-colors',
                          post.likedByMe ? 'text-fuchsia-300' : 'text-faint hover:text-fuchsia-300',
                        )}
                      >
                        <ThumbsUp className={cn('h-3.5 w-3.5', post.likedByMe && 'fill-current')} />
                        {post.likes}
                      </button>
                      <button
                        onClick={() => setExpandedPost(expanded ? null : post.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-faint transition-colors hover:text-fuchsia-300"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {post.comments.length} {post.comments.length === 1 ? 'comentario' : 'comentarios'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {expanded && (
                <div className="border-t border-line bg-surface/40 p-4 space-y-3">
                  {post.comments.length === 0 && (
                    <p className="text-xs text-faint text-center py-2">Sé el primero en comentar</p>
                  )}
                  {post.comments.map((c) => (
                    <div key={c.id} className="flex gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-3 text-[10px] font-bold text-muted">
                        {c.author.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-text">{c.author}</span>
                          <span className="text-[10px] text-faint">{c.date}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted leading-relaxed">{c.text}</p>
                        <button
                          onClick={() => toggleCommentLike(post.id, c.id)}
                          className={cn(
                            'mt-1 inline-flex items-center gap-1 text-[10px] font-medium transition-colors',
                            c.likedByMe ? 'text-fuchsia-300' : 'text-faint hover:text-fuchsia-300',
                          )}
                        >
                          <ThumbsUp className={cn('h-2.5 w-2.5', c.likedByMe && 'fill-current')} />
                          {c.likes}
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={commentingOn === post.id ? newComment : ''}
                      onFocus={() => setCommentingOn(post.id)}
                      onChange={(e) => {
                        setCommentingOn(post.id);
                        setNewComment(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          addComment(post.id);
                        }
                      }}
                      placeholder="Escribe un comentario..."
                      className="flex-1 rounded-full border border-line bg-surface/80 px-4 py-2 text-xs text-text placeholder-faint outline-none transition focus:border-fuchsia-400/40"
                    />
                    <button
                      onClick={() => addComment(post.id)}
                      disabled={!newComment.trim() || commentingOn !== post.id}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-white transition hover:opacity-90 disabled:opacity-30"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showNewPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-line bg-surface p-6 shadow-2xl shadow-black/50 animate-rise">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Nueva publicación</h2>
              <button
                onClick={() => setShowNewPost(false)}
                className="rounded-full p-1.5 text-muted transition hover:bg-surface-2 hover:text-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted">Categoría</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.filter((c) => c.id !== 'all').map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setNewCategory(id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
                        newCategory === id
                          ? 'border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-300'
                          : 'border-line text-muted hover:text-text',
                      )}
                    >
                      <Icon className="h-3 w-3" /> {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-muted">Título</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="¿Qué quieres compartir?"
                  className="w-full rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-text placeholder-faint outline-none transition focus:border-fuchsia-400/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-muted">Contenido</label>
                <textarea
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Escribe tu publicación..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-text placeholder-faint outline-none transition focus:border-fuchsia-400/40"
                />
              </div>

              <button
                onClick={addPost}
                disabled={!newTitle.trim() || !newBody.trim()}
                className="w-full rounded-full bg-brand py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/25 transition hover:opacity-90 disabled:opacity-30"
              >
                Publicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
