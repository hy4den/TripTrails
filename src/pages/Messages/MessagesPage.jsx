import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSend, FiMessageSquare, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import {
  getUserConversations, sendMessage,
  subscribeToMessages, markConversationRead,
} from '../../services/messageService';
import styles from './MessagesPage.module.css';

function Avatar({ name, photoURL, size = 40 }) {
  const [err, setErr] = useState(false);
  if (photoURL && !err) {
    return <img src={photoURL} alt={name} width={size} height={size} className={styles.avatar} onError={() => setErr(true)} />;
  }
  return <div className={styles.avatarFallback} style={{ width: size, height: size, fontSize: size * 0.4 }}>{(name || '?').charAt(0).toUpperCase()}</div>;
}

function formatTime(ts) {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export default function MessagesPage() {
  const { currentUser, userProfile } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [activeConvId, setActiveConvId] = useState(searchParams.get('conv') || null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'

  const messagesEndRef = useRef(null);
  const unsubRef = useRef(null);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!currentUser) return;
    try {
      const convs = await getUserConversations(currentUser.uid);
      setConversations(convs);
    } catch {
      /* silent */
    }
    setLoadingConvs(false);
  }, [currentUser]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Subscribe to messages when activeConvId changes
  useEffect(() => {
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    if (!activeConvId) { setMessages([]); return; }

    unsubRef.current = subscribeToMessages(activeConvId, (msgs) => {
      setMessages(msgs);
    });
    markConversationRead(activeConvId, currentUser.uid).catch(() => {});
    // Refresh convs to update unread badges
    loadConversations();

    return () => { if (unsubRef.current) unsubRef.current(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConvId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectConversation = (convId) => {
    setActiveConvId(convId);
    setSearchParams({ conv: convId });
    setMobileView('chat');
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId || sending) return;

    const activeConv = conversations.find((c) => c.id === activeConvId);
    if (!activeConv) return;
    const receiverId = activeConv.participants.find((p) => p !== currentUser.uid);

    setSending(true);
    const text = inputText;
    setInputText('');
    try {
      await sendMessage(activeConvId, currentUser.uid, receiverId, text);
      // Update conversation last message locally for instant feedback
      setConversations((prev) => prev.map((c) =>
        c.id === activeConvId ? { ...c, lastMessage: text, lastMessageAt: { seconds: Date.now() / 1000 } } : c
      ));
    } catch {
      addToast('Mesaj gönderilemedi.', 'error');
      setInputText(text);
    }
    setSending(false);
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const otherName = activeConv
    ? (activeConv.participantNames?.[activeConv.participants.find((p) => p !== currentUser.uid)] || 'Kullanici')
    : '';
  const otherPhoto = activeConv
    ? (activeConv.participantPhotos?.[activeConv.participants.find((p) => p !== currentUser.uid)] || null)
    : null;

  return (
    <div className={styles.page}>
      {/* ── Conversation List ── */}
      <aside className={`${styles.sidebar} ${mobileView === 'chat' ? styles.sidebarHidden : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>
            <FiMessageSquare size={20} />
            Mesajlar
          </h2>
        </div>

        {loadingConvs ? (
          <p className={styles.hint}>Yükleniyor...</p>
        ) : conversations.length === 0 ? (
          <div className={styles.emptyConvs}>
            <FiMessageSquare size={36} className={styles.emptyIcon} />
            <p>Henüz mesajın yok.</p>
            <p className={styles.emptyHint}>Arkadaşlar sayfasından mesaj gönderebilirsin.</p>
          </div>
        ) : (
          <ul className={styles.convList}>
            {conversations.map((conv) => {
              const otherId = conv.participants.find((p) => p !== currentUser.uid);
              const name = conv.participantNames?.[otherId] || 'Kullanici';
              const photo = conv.participantPhotos?.[otherId] || null;
              const unread = conv.unread?.[currentUser.uid] || 0;
              const isActive = conv.id === activeConvId;

              return (
                <li
                  key={conv.id}
                  className={`${styles.convItem} ${isActive ? styles.convItemActive : ''}`}
                  onClick={() => selectConversation(conv.id)}
                >
                  <div className={styles.convAvatarWrap}>
                    <Avatar name={name} photoURL={photo} size={44} />
                    {unread > 0 && <span className={styles.unreadDot}>{unread}</span>}
                  </div>
                  <div className={styles.convInfo}>
                    <div className={styles.convTopRow}>
                      <span className={`${styles.convName} ${unread > 0 ? styles.convNameBold : ''}`}>{name}</span>
                      {conv.lastMessageAt && (
                        <span className={styles.convTime}>{formatTime(conv.lastMessageAt)}</span>
                      )}
                    </div>
                    <p className={`${styles.convLastMsg} ${unread > 0 ? styles.convLastMsgBold : ''}`}>
                      {conv.lastMessage || 'Henüz mesaj yok'}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      {/* ── Chat Panel ── */}
      <main className={`${styles.chatPanel} ${mobileView === 'list' ? styles.chatPanelHidden : ''}`}>
        {!activeConvId ? (
          <div className={styles.noConv}>
            <FiMessageSquare size={48} className={styles.noConvIcon} />
            <p>Bir konuşma seç</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className={styles.chatHeader}>
              <button className={styles.backBtn} onClick={() => setMobileView('list')}>
                <FiArrowLeft size={20} />
              </button>
              <Avatar name={otherName} photoURL={otherPhoto} size={36} />
              <span className={styles.chatHeaderName}>{otherName}</span>
            </div>

            {/* Messages */}
            <div className={styles.messages}>
              {messages.length === 0 ? (
                <p className={styles.noMessages}>Henüz mesaj yok. Merhaba de! 👋</p>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === currentUser.uid;
                  return (
                    <div key={msg.id} className={`${styles.msgRow} ${isMe ? styles.msgRowMe : ''}`}>
                      {!isMe && <Avatar name={otherName} photoURL={otherPhoto} size={28} />}
                      <div className={`${styles.bubble} ${isMe ? styles.bubbleMe : styles.bubbleOther}`}>
                        <p>{msg.text}</p>
                        <span className={styles.msgTime}>{msg.createdAt ? formatTime(msg.createdAt) : ''}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className={styles.inputRow} onSubmit={handleSend}>
              <input
                className={styles.msgInput}
                type="text"
                placeholder="Mesaj yaz..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={sending}
              />
              <button type="submit" className={styles.sendBtn} disabled={!inputText.trim() || sending}>
                <FiSend size={18} />
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
