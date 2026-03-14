import { useState, useEffect } from 'react';
import { FiSend, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../../contexts/AuthContext';
import { addComment, deleteComment, getRouteComments } from '../../../services/socialService';
import styles from './CommentSection.module.css';

export default function CommentSection({ routeId }) {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getRouteComments(routeId)
      .then(setComments)
      .finally(() => setLoading(false));
  }, [routeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !currentUser || sending) return;
    setSending(true);

    try {
      const newComment = await addComment(routeId, currentUser, text.trim());
      setComments((prev) => [newComment, ...prev]);
      setText('');
    } catch (err) {
      console.error('Comment add failed:', err);
    }
    setSending(false);
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId, routeId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error('Comment delete failed:', err);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.title}>Yorumlar ({comments.length})</h3>

      {currentUser && (
        <form className={styles.inputArea} onSubmit={handleSubmit}>
          <textarea
            className={styles.textarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Bir yorum yazın..."
            rows={2}
            maxLength={500}
          />
          <button
            type="submit"
            className={styles.sendBtn}
            disabled={!text.trim() || sending}
          >
            <FiSend size={16} />
          </button>
        </form>
      )}

      {loading ? (
        <p className={styles.loadingText}>Yorumlar yükleniyor...</p>
      ) : comments.length > 0 ? (
        <ul className={styles.commentList}>
          {comments.map((comment) => (
            <li key={comment.id} className={styles.commentItem}>
              <div className={styles.commentAvatar}>
                {comment.userPhotoURL ? (
                  <img src={comment.userPhotoURL} alt="" className={styles.avatarImg} />
                ) : (
                  <span className={styles.avatarFallback}>
                    {(comment.userName || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className={styles.commentContent}>
                <div className={styles.commentHeader}>
                  <span className={styles.commentUser}>{comment.userName}</span>
                  <span className={styles.commentTime}>{formatTime(comment.createdAt)}</span>
                </div>
                <p className={styles.commentText}>{comment.text}</p>
              </div>
              {currentUser?.uid === comment.userId && (
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(comment.id)}
                  title="Yorumu sil"
                >
                  <FiTrash2 size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.emptyText}>Henüz yorum yok.</p>
      )}
    </div>
  );
}
