import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  ThumbsUp,
  Plus,
  X,
  Send,
  Film,
  Music,
  Tv,
  MessagesSquare,
  Flame,
  ExternalLink,
  Image as ImageIcon,
  Video,
  Link2,
  Smile,
  Reply,
  Shield,
  Share2,
  Flag,
  Heart,
  Check,
} from 'lucide-react';
import { cn } from '../utils/format';
import { INITIAL_POSTS, type ForumPost, type ForumComment } from '../utils/forumData';
import { useMediaStore } from '../store/mediaStore';

const CATEGORIES = [
  { id: 'all', label: 'Todo', icon: MessagesSquare },
  { id: 'movies', label: 'Películas', icon: Film },
  { id: 'tv', label: 'Series', icon: Tv },
  { id: 'music', label: 'Música', icon: Music },
  { id: 'general', label: 'General', icon: Flame },
];

const EMOJIS = ['😀', '😂', '😍', '🔥', '👍', '👎', '❤️', '🎬', '🎵', '📺', '🎮', '💯', '🙌', '🤔', '👀', '⭐', '🎉', '💬', '🎤', '🎸'];

function renderText(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-fuchsia-300 underline transition hover:text-fuchsia-200">
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function CommentItem({
  comment,
  postId,
  onToggleLike,
  onReply,
  depth = 0,
}: {
  comment: ForumComment;
  postId: string;
  onToggleLike: (postId: string, commentId: string) => void;
  onReply: (postId: string, replyTo: string) => void;
  depth?: number;
}) {
  const [showReplies, setShowReplies] = useState(true);
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className={cn('flex gap-2.5', depth > 0 && 'ml-6 mt-2')}>
      <div className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-surface-3 text-[10px] font-bold text-muted',
        depth > 0 ? 'h-6 w-6' : 'h-7 w-7',
      )}>
        {comment.author.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text">{comment.author}</span>
          <span className="text-[10px] text-faint">{comment.date}</span>
        </div>
        <p className="mt-0.5 text-xs text-muted leading-relaxed">{renderText(comment.text)}</p>
        <div className="mt-1 flex items-center gap-3">
          <button
            onClick={() => onToggleLike(postId, comment.id)}
            className={cn(
              'inline-flex items-center gap-1 text-[10px] font-medium transition-colors',
              comment.likedByMe ? 'text-fuchsia-300' : 'text-faint hover:text-fuchsia-300',
            )}
          >
            <ThumbsUp className={cn('h-2.5 w-2.5', comment.likedByMe && 'fill-current')} />
            {comment.likes}
          </button>
          <button
            onClick={() => onReply(postId, comment.id)}
            className="inline-flex items-center gap-1 text-[10px] font-medium text-faint transition-colors hover:text-fuchsia-300"
          >
            <Reply className="h-2.5 w-2.5" /> Responder
          </button>
        </div>
        {hasReplies && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="mt-1 text-[10px] font-medium text-fuchsia-300 transition hover:text-fuchsia-200"
          >
            {showReplies ? 'Ocultar respuestas' : `Ver ${comment.replies!.length} respuesta(s)`}
          </button>
        )}
        {showReplies && hasReplies && (
          <div className="mt-2 space-y-2">
            {comment.replies!.map((r) => (
              <CommentItem
                key={r.id}
                comment={r}
                postId={postId}
                onToggleLike={onToggleLike}
                onReply={onReply}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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
  const [replyTo, setReplyTo] = useState<{ postId: string; commentId: string } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(() => localStorage.getItem('resona_user_avatar'));
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [newImages, setNewImages] = useState('');
  const [imageMode, setImageMode] = useState<'url' | 'file'>('url');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useState<HTMLInputElement | null>(null);
  const [newVideo, setNewVideo] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinks, setNewLinks] = useState<{ url: string; label: string }[]>([]);
  const [reportedPosts, setReportedPosts] = useState<Set<string>>(new Set());
  const [showReportModal, setShowReportModal] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { forumFavorites, toggleForumFavorite } = useMediaStore();

  const filtered = activeCategory === 'all' ? posts : posts.filter((p) => p.category === activeCategory);

  const toggleFavorite = (postId: string) => {
    toggleForumFavorite(postId);
  };

  const sharePost = async (post: ForumPost) => {
    const url = `${window.location.origin}/#/forum/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.body.slice(0, 100), url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const reportPost = (postId: string) => {
    if (!reportReason.trim()) return;
    setReportedPosts((prev) => new Set(prev).add(postId));
    setShowReportModal(null);
    setReportReason('');
    setReportDetails('');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setUserAvatar(result);
      localStorage.setItem('resona_user_avatar', result);
      setShowAvatarModal(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const result = ev.target?.result as string;
          setUploadedImages((prev) => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    });
    e.target.value = '';
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

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
    const urlImages = newImages.trim() ? newImages.split('\n').filter((u) => u.trim()) : [];
    const allImages = [...uploadedImages, ...urlImages];
    const post: ForumPost = {
      id: String(Date.now()),
      title: newTitle.trim(),
      body: newBody.trim(),
      author: 'Tú',
      category: newCategory,
      date: 'Ahora mismo',
      likes: 0,
      likedByMe: false,
      ...(allImages.length > 0 && { images: allImages }),
      ...(newVideo.trim() && { video: newVideo.trim() }),
      ...(newLinks.length > 0 && { links: newLinks }),
      comments: [],
    };
    setPosts((prev) => [post, ...prev]);
    setNewTitle('');
    setNewBody('');
    setNewImages('');
    setUploadedImages([]);
    setImageMode('url');
    setNewVideo('');
    setNewLinks([]);
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
      ...(replyTo && replyTo.postId === postId && { replyTo: replyTo.commentId }),
    };

    if (replyTo && replyTo.postId === postId) {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const addReplyToComment = (comments: ForumComment[]): ForumComment[] =>
            comments.map((c) => {
              if (c.id === replyTo.commentId) {
                return { ...c, replies: [...(c.replies ?? []), comment] };
              }
              if (c.replies && c.replies.length > 0) {
                return { ...c, replies: addReplyToComment(c.replies) };
              }
              return c;
            });
          return { ...p, comments: addReplyToComment(p.comments) };
        }),
      );
    } else {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, comment] } : p)),
      );
    }
    setNewComment('');
    setReplyTo(null);
    setCommentingOn(null);
  };

  const addLink = () => {
    if (!newLink.trim()) return;
    setNewLinks((prev) => [...prev, { url: newLink.trim(), label: newLinkLabel.trim() || newLink.trim() }]);
    setNewLink('');
    setNewLinkLabel('');
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAvatarModal(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface/80 transition hover:border-fuchsia-400/40 hover:bg-surface"
            title="Cambiar foto de perfil"
          >
            {userAvatar ? (
              <img src={userAvatar} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-fuchsia-300">T</span>
            )}
          </button>
          <button
            onClick={() => setShowNewPost(true)}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/25 transition hover:scale-[1.03] hover:opacity-90 active:scale-95"
          >
            <Plus className="h-4 w-4" /> Nueva publicación
          </button>
        </div>
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
          const textPreview = post.body.length > 150 ? post.body.slice(0, 150) + '...' : post.body;
          const hasMedia = (post.images && post.images.length > 0) || post.video;
          const hasLinks = post.links && post.links.length > 0;
          const commentCount = post.comments.length;
          const replyCount = post.comments.reduce((acc, c) => acc + (c.replies?.length ?? 0), 0);
          const totalComments = commentCount + replyCount;

          return (
            <div
              key={post.id}
              className="rounded-2xl border border-line bg-surface/70 transition-all hover:border-fuchsia-400/20 hover:bg-surface/90 hover:shadow-lg hover:shadow-black/20"
            >
              <div className="p-4 sm:p-5">
                <div className="flex gap-4">
                  {post.images && post.images.length > 0 && (
                    <div className="hidden sm:block shrink-0">
                      <img
                        src={post.images[0]}
                        alt=""
                        className="h-24 w-24 rounded-xl object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {post.author === 'Admin' ? (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fuchsia-500/30">
                          <Shield className="h-3 w-3 text-fuchsia-300" />
                        </div>
                      ) : userAvatar ? (
                        <img src={userAvatar} alt="" className="h-6 w-6 shrink-0 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/30 text-[10px] font-bold text-fuchsia-300">
                          T
                        </div>
                      )}
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold', catColor(post.category))}>
                        {catIcon(post.category)} {CATEGORIES.find((c) => c.id === post.category)?.label}
                      </span>
                      {post.author === 'Admin' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500/20 px-2.5 py-0.5 text-[10px] font-bold text-fuchsia-300">
                          Admin
                        </span>
                      )}
                      <span className="text-[11px] text-faint">{post.date}</span>
                    </div>

                    <h3
                      onClick={() => navigate(`/forum/${post.id}`)}
                      className="mt-2 text-base font-bold text-text leading-snug cursor-pointer transition hover:text-fuchsia-300"
                    >
                      {post.title}
                    </h3>

                    <p className="mt-1.5 text-xs text-muted leading-relaxed whitespace-pre-line">{renderText(textPreview)}</p>

                    {post.images && post.images.length > 0 && (
                      <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar">
                        {post.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt=""
                            className="h-20 w-20 shrink-0 cursor-pointer rounded-lg object-cover transition hover:opacity-80 hover:ring-2 hover:ring-fuchsia-400/50"
                            loading="lazy"
                            onClick={() => setFullscreenImage(img)}
                          />
                        ))}
                      </div>
                    )}

                    {post.video && (
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-faint">
                        <Video className="h-3 w-3 text-red-400" /> Video incluido
                      </div>
                    )}

                    {hasLinks && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {post.links!.slice(0, 3).map((link, i) => (
                          <span key={i} className="inline-flex items-center gap-1 rounded-full bg-surface-3 px-2 py-0.5 text-[10px] text-muted">
                            <ExternalLink className="h-2.5 w-2.5" /> {link.label}
                          </span>
                        ))}
                      </div>
                    )}

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
                        onClick={() => navigate(`/forum/${post.id}`)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-faint transition-colors hover:text-fuchsia-300"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {totalComments} {totalComments === 1 ? 'comentario' : 'comentarios'}
                      </button>
                      <button
                        onClick={() => toggleFavorite(post.id)}
                        className={cn(
                          'inline-flex items-center gap-1.5 text-xs font-medium transition-colors',
                          forumFavorites.includes(post.id) ? 'text-pink-400' : 'text-faint hover:text-pink-400',
                        )}
                      >
                        <Heart className={cn('h-3.5 w-3.5', forumFavorites.includes(post.id) && 'fill-current')} />
                        {forumFavorites.includes(post.id) ? 'Guardado' : 'Guardar'}
                      </button>
                      <button
                        onClick={() => sharePost(post)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-faint transition-colors hover:text-fuchsia-300"
                      >
                        {copiedId === post.id ? (
                          <><Check className="h-3.5 w-3.5 text-emerald-400" /> <span className="text-emerald-400">Copiado</span></>
                        ) : (
                          <><Share2 className="h-3.5 w-3.5" /> Compartir</>
                        )}
                      </button>
                      {!reportedPosts.has(post.id) && (
                        <button
                          onClick={() => setShowReportModal(post.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-faint transition-colors hover:text-red-400"
                        >
                          <Flag className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {reportedPosts.has(post.id) && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-red-400">
                          <Flag className="h-3 w-3 fill-current" /> Denunciado
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="hidden sm:flex shrink-0 flex-col items-center gap-1 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/15 text-sm font-black text-fuchsia-300">
                      {post.likes}
                    </div>
                    <span className="text-[9px] font-semibold uppercase text-faint">likes</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showNewPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-line bg-surface p-6 shadow-2xl shadow-black/50 animate-rise">
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
                <div className="relative">
                  <textarea
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    placeholder="Escribe tu publicación... Puedes usar emojis 😊"
                    rows={4}
                    className="w-full resize-none rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-text placeholder-faint outline-none transition focus:border-fuchsia-400/40"
                  />
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-2 top-2 rounded-full p-1.5 text-muted transition hover:bg-surface-3 hover:text-text"
                  >
                    <Smile className="h-4 w-4" />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute right-0 top-10 z-10 grid grid-cols-5 gap-1 rounded-xl border border-line bg-surface-2 p-2 shadow-xl">
                      {EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            setNewBody((prev) => prev + emoji);
                            setShowEmojiPicker(false);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition hover:bg-surface-3"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-muted">
                  <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3" /> Imágenes</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setImageMode('url')}
                    className={cn(
                      'flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-all',
                      imageMode === 'url'
                        ? 'border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-300'
                        : 'border-line text-muted hover:text-text',
                    )}
                  >
                    🌐 URL
                  </button>
                  <button
                    onClick={() => setImageMode('file')}
                    className={cn(
                      'flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-all',
                      imageMode === 'file'
                        ? 'border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-300'
                        : 'border-line text-muted hover:text-text',
                    )}
                  >
                    📁 Subir archivo
                  </button>
                </div>

                {imageMode === 'url' ? (
                  <textarea
                    value={newImages}
                    onChange={(e) => setNewImages(e.target.value)}
                    placeholder="https://ejemplo.com/imagen1.jpg&#10;https://ejemplo.com/imagen2.jpg"
                    rows={2}
                    className="w-full resize-none rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-xs text-text placeholder-faint outline-none transition focus:border-fuchsia-400/40"
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-line bg-surface-2 px-4 py-6 text-center transition-all hover:border-fuchsia-400/40 hover:bg-surface/50"
                    >
                      <ImageIcon className="h-8 w-8 text-fuchsia-300/50" />
                      <span className="text-xs text-muted">Haz click para seleccionar imágenes</span>
                      <span className="text-[10px] text-faint">JPG, PNG, GIF (máx. 5MB cada una)</span>
                    </label>
                  </div>
                )}

                {uploadedImages.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                    {uploadedImages.map((img, i) => (
                      <div key={i} className="relative shrink-0">
                        <img src={img} alt="" className="h-20 w-20 rounded-lg object-cover" />
                        <button
                          onClick={() => removeUploadedImage(i)}
                          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-muted">
                  <span className="flex items-center gap-1"><Video className="h-3 w-3" /> Video (URL de YouTube, etc.)</span>
                </label>
                <input
                  type="text"
                  value={newVideo}
                  onChange={(e) => setNewVideo(e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-xs text-text placeholder-faint outline-none transition focus:border-fuchsia-400/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-muted">
                  <span className="flex items-center gap-1"><Link2 className="h-3 w-3" /> Links externos</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLinkLabel}
                    onChange={(e) => setNewLinkLabel(e.target.value)}
                    placeholder="Etiqueta"
                    className="w-1/3 rounded-xl border border-line bg-surface-2 px-3 py-2 text-xs text-text placeholder-faint outline-none transition focus:border-fuchsia-400/40"
                  />
                  <input
                    type="text"
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 rounded-xl border border-line bg-surface-2 px-3 py-2 text-xs text-text placeholder-faint outline-none transition focus:border-fuchsia-400/40"
                  />
                  <button
                    onClick={addLink}
                    disabled={!newLink.trim()}
                    className="rounded-xl bg-surface-3 px-3 text-xs font-semibold text-muted transition hover:text-text disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
                {newLinks.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {newLinks.map((link, i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500/15 px-2.5 py-1 text-[10px] font-medium text-fuchsia-300">
                        {link.label}
                        <button onClick={() => setNewLinks((prev) => prev.filter((_, j) => j !== i))} className="hover:text-white">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-6 shadow-2xl shadow-black/50 animate-rise">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-red-400">
                <Flag className="h-5 w-5" /> Denunciar publicación
              </h2>
              <button
                onClick={() => { setShowReportModal(null); setReportReason(''); }}
                className="rounded-full p-1.5 text-muted transition hover:bg-surface-2 hover:text-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-sm text-muted">Selecciona el motivo de la denuncia:</p>
            <div className="mt-3 space-y-2">
              {['Contenido ofensivo', 'Spam', 'Contenido ilegal', 'Información falsa', 'Otro'].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setReportReason(reason)}
                  className={cn(
                    'w-full rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-all',
                    reportReason === reason
                      ? 'border-red-400/40 bg-red-500/15 text-red-300'
                      : 'border-line text-muted hover:border-red-400/30 hover:text-text',
                  )}
                >
                  {reason}
                </button>
              ))}
            </div>
            {reportReason && (
              <div className="mt-3">
                <label className="mb-1 block text-xs font-semibold text-muted">Detalles adicionales (opcional)</label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Describe el problema con más detalle..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-text placeholder-faint outline-none transition focus:border-red-400/40"
                />
              </div>
            )}
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => { setShowReportModal(null); setReportReason(''); setReportDetails(''); }}
                className="flex-1 rounded-full border border-line py-2.5 text-sm font-semibold text-muted transition hover:text-text"
              >
                Cancelar
              </button>
              <button
                onClick={() => reportPost(showReportModal)}
                disabled={!reportReason.trim()}
                className="flex-1 rounded-full bg-red-600 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-30"
              >
                Denunciar
              </button>
            </div>
          </div>
        </div>
      )}

      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-6 shadow-2xl shadow-black/40">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-text">Foto de perfil</h3>
              <button onClick={() => setShowAvatarModal(false)} className="text-faint transition hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-4">
              {userAvatar ? (
                <img src={userAvatar} alt="" className="h-24 w-24 rounded-full object-cover ring-4 ring-fuchsia-500/30" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand/30 text-3xl font-bold text-fuchsia-300">
                  T
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="cursor-pointer rounded-full bg-fuchsia-500/20 px-6 py-2.5 text-sm font-semibold text-fuchsia-300 transition hover:bg-fuchsia-500/30"
              >
                📁 Subir imagen
              </label>

              {userAvatar && (
                <button
                  onClick={() => {
                    setUserAvatar(null);
                    localStorage.removeItem('resona_user_avatar');
                    setShowAvatarModal(false);
                  }}
                  className="text-xs text-faint transition hover:text-red-400"
                >
                  Eliminar foto
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {fullscreenImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={fullscreenImage}
            alt=""
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
