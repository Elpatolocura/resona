import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  Send,
  Film,
  Music,
  Tv,
  Flame,
  Shield,
  Clock,
} from 'lucide-react';
import { cn } from '../utils/format';
import { INITIAL_POSTS, type ForumPost, type ForumComment } from '../utils/forumData';

const CATEGORIES = [
  { id: 'movies', label: 'Películas', icon: Film },
  { id: 'tv', label: 'Series', icon: Tv },
  { id: 'music', label: 'Música', icon: Music },
  { id: 'general', label: 'General', icon: Flame },
];

const catIcon = (cat: string) => {
  switch (cat) {
    case 'movies': return <Film className="h-3.5 w-3.5" />;
    case 'tv': return <Tv className="h-3.5 w-3.5" />;
    case 'music': return <Music className="h-3.5 w-3.5" />;
    default: return <Flame className="h-3.5 w-3.5" />;
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

export default function ForumThreadPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<ForumPost[]>(INITIAL_POSTS);
  const [newComment, setNewComment] = useState('');

  const post = posts.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="animate-fade-in space-y-6">
        <button
          onClick={() => navigate('/forum')}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-4 py-2 text-sm font-semibold text-muted backdrop-blur transition hover:border-fuchsia-400/40 hover:text-fuchsia-300"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al foro
        </button>
        <div className="flex flex-col items-center rounded-3xl border border-line bg-surface/60 px-6 py-20 text-center">
          <MessageSquare className="h-16 w-16 text-fuchsia-300/30" />
          <h2 className="mt-4 text-lg font-bold text-text">Hilo no encontrado</h2>
          <p className="mt-2 text-sm text-muted">Esta publicación no existe o fue eliminada.</p>
        </div>
      </div>
    );
  }

  const toggleLike = () => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, likedByMe: !p.likedByMe, likes: p.likedByMe ? p.likes - 1 : p.likes + 1 }
          : p,
      ),
    );
  };

  const toggleCommentLike = (commentId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
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

  const addComment = () => {
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
      prev.map((p) => (p.id === post.id ? { ...p, comments: [...p.comments, comment] } : p)),
    );
    setNewComment('');
  };

  const currentPost = posts.find((p) => p.id === id) ?? post;

  return (
    <div className="animate-fade-in space-y-6">
      <button
        onClick={() => navigate('/forum')}
        className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-4 py-2 text-sm font-semibold text-muted backdrop-blur transition hover:border-fuchsia-400/40 hover:text-fuchsia-300"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al foro
      </button>

      <div className="rounded-3xl border border-line bg-surface/70 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand/20 text-lg font-bold text-fuchsia-300">
            {currentPost.author === 'Admin' ? (
              <Shield className="h-6 w-6 text-fuchsia-300" />
            ) : (
              currentPost.author.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold', catColor(currentPost.category))}>
                {catIcon(currentPost.category)} {CATEGORIES.find((c) => c.id === currentPost.category)?.label}
              </span>
              {currentPost.author === 'Admin' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500/20 px-2.5 py-0.5 text-[10px] font-bold text-fuchsia-300">
                  <Shield className="h-2.5 w-2.5" /> Admin
                </span>
              )}
            </div>

            <h1 className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl">
              {currentPost.title}
            </h1>

            <div className="mt-2 flex items-center gap-3 text-xs text-muted">
              <span className="font-semibold text-text">{currentPost.author}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {currentPost.date}
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted">{currentPost.body}</p>

            <div className="mt-5 flex items-center gap-5 border-t border-line pt-4">
              <button
                onClick={toggleLike}
                className={cn(
                  'inline-flex items-center gap-2 text-sm font-semibold transition-colors',
                  currentPost.likedByMe ? 'text-fuchsia-300' : 'text-muted hover:text-fuchsia-300',
                )}
              >
                <ThumbsUp className={cn('h-4.5 w-4.5', currentPost.likedByMe && 'fill-current')} />
                {currentPost.likes}
              </button>
              <span className="inline-flex items-center gap-2 text-sm text-muted">
                <MessageSquare className="h-4.5 w-4.5" />
                {currentPost.comments.length} {currentPost.comments.length === 1 ? 'comentario' : 'comentarios'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <MessageSquare className="h-5 w-5 text-fuchsia-300" /> Comentarios
        </h2>

        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/20 text-xs font-bold text-fuchsia-300">
            T
          </div>
          <div className="flex flex-1 gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  addComment();
                }
              }}
              placeholder="Escribe un comentario..."
              className="flex-1 rounded-full border border-line bg-surface/80 px-5 py-2.5 text-sm text-text placeholder-faint outline-none transition focus:border-fuchsia-400/40"
            />
            <button
              onClick={addComment}
              disabled={!newComment.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white transition hover:opacity-90 disabled:opacity-30"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        {currentPost.comments.length === 0 && (
          <div className="flex flex-col items-center rounded-2xl border border-line bg-surface/40 px-6 py-12 text-center">
            <MessageSquare className="h-10 w-10 text-fuchsia-300/20" />
            <p className="mt-2 text-sm text-muted">Sé el primero en comentar</p>
          </div>
        )}

        <div className="space-y-3">
          {currentPost.comments.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-line bg-surface/50 p-4 transition-all hover:border-fuchsia-400/15"
            >
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-3 text-xs font-bold text-muted">
                  {c.author.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text">{c.author}</span>
                    <span className="text-[11px] text-faint">{c.date}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-muted leading-relaxed">{c.text}</p>
                  <button
                    onClick={() => toggleCommentLike(c.id)}
                    className={cn(
                      'mt-2 inline-flex items-center gap-1.5 text-xs font-medium transition-colors',
                      c.likedByMe ? 'text-fuchsia-300' : 'text-faint hover:text-fuchsia-300',
                    )}
                  >
                    <ThumbsUp className={cn('h-3 w-3', c.likedByMe && 'fill-current')} />
                    {c.likes}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
