import { useState, useRef, useEffect } from 'react';
import { FiX, FiCamera } from 'react-icons/fi';
import { validateImageFile } from '../../../services/storageService';
import styles from './ProfileEditModal.module.css';

export default function ProfileEditModal({ profile, onSave, onClose }) {
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile?.photoURL || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Kullanici adi bos olamaz.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Kaydetme islemi zaman asimina ugradi. Lutfen tekrar deneyin.')), 15000)
      );
      await Promise.race([
        onSave({ displayName: displayName.trim(), bio: bio.trim(), avatarFile }),
        timeout,
      ]);
    } catch (err) {
      console.error('Profile save error:', err);
      setError(err.message || 'Bir hata olustu.');
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Profili Duzenle</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.avatarEdit}>
            <div
              className={styles.avatarPreview}
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="" className={styles.avatarImg} />
              ) : (
                <div className={styles.avatarFallback}>
                  {displayName.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <div className={styles.avatarOverlay}>
                <FiCamera size={20} />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarSelect}
              style={{ display: 'none' }}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="editName" className={styles.label}>
              Kullanici Adi
            </label>
            <input
              id="editName"
              type="text"
              className={styles.input}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="editBio" className={styles.label}>
              Hakkinda
            </label>
            <textarea
              id="editBio"
              className={styles.textarea}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Kendiniz hakkinda bir seyler yazin..."
              rows={3}
              maxLength={200}
            />
            <span className={styles.charCount}>{bio.length}/200</span>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Iptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
