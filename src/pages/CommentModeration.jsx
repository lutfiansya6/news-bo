import { useEffect, useState } from "react";
import { getComments, deleteComment } from "../api/comments";
import toast from "react-hot-toast";

function getCommentId(comment) {
  const raw = comment?._id ?? comment?.id;
  if (raw == null) return "";
  return typeof raw === "object" ? String(raw) : String(raw);
}

export default function CommentModeration() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      try {
        const data = await getComments();
        setComments(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, []);

  const handleDelete = async (comment) => {
    const commentId = getCommentId(comment);
    if (!commentId || commentId === "undefined") {
      toast.error("ID komentar tidak valid");
      return;
    }

    if (!confirm("Apakah Anda yakin ingin menghapus komentar ini?")) {
      return;
    }

    try {
      await deleteComment(commentId);
      setComments((current) =>
        current.filter((c) => getCommentId(c) !== commentId),
      );
      toast.success("Komentar berhasil dihapus");
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="comment-moderation">
      <h1>Moderasi Komentar</h1>
      <div className="comments-list">
        {comments.length === 0 ? (
          <p>Tidak ada komentar</p>
        ) : (
          comments.map((comment) => {
            const commentId = getCommentId(comment);
            return (
              <div key={commentId || comment.createdAt} className="comment-card">
                <div className="comment-header">
                  <span className="comment-author">{comment.author}</span>
                </div>
                <p className="comment-text">{comment.text}</p>
                <div className="comment-actions">
                  <button
                    type="button"
                    onClick={() => handleDelete(comment)}
                    className="btn btn-sm btn-danger"
                    disabled={!commentId}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
