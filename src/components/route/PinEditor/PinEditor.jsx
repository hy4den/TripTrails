import { useState, useEffect, useRef } from 'react';
import { FiX, FiUpload, FiImage } from 'react-icons/fi';
import { getDayColor, PIN_CATEGORIES, CURRENCIES, MAX_PHOTOS_PER_PIN } from '../../../utils/constants';
import { uploadPinPhoto, deletePinPhoto, validateImageFile } from '../../../services/storageService';
import styles from './PinEditor.module.css';

function PhotoThumb({ url, onRemove }) {
  const [error, setError] = useState(false);
  return (
    <div className={styles.photoThumb}>
      {error ? (
        <div className={styles.photoError}><FiImage size={20} /></div>
      ) : (
        <img src={url} alt="" className={styles.photoImg} onError={() => setError(true)} />
      )}
      <button type="button" className={styles.photoRemoveBtn} onClick={() => onRemove(url)}>
        <FiX size={12} />
      </button>
    </div>
  );
}

export default function PinEditor({
  pin,
  days,
  routeId,
  onSave,
  onCancel,
  onDelete,
  onPhotoAdd,
  onPhotoRemove,
}) {
  const [placeName, setPlaceName] = useState('');
  const [notes, setNotes] = useState('');
  const [dayNumber, setDayNumber] = useState(1);
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState(0);
  const [currency, setCurrency] = useState('TRY');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (pin) {
      setPlaceName(pin.placeName || '');
      setNotes(pin.notes || '');
      setDayNumber(pin.dayNumber);
      setCategory(pin.category || '');
      setBudget(pin.budget || 0);
      setCurrency(pin.currency || 'TRY');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin?.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: pin?.id,
      placeName,
      notes,
      dayNumber: Number(dayNumber),
      category,
      budget: Number(budget),
      currency,
    });
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentCount = pin?.photos?.length || 0;
    const allowed = files.slice(0, MAX_PHOTOS_PER_PIN - currentCount);

    if (allowed.length === 0) {
      setUploadError(`En fazla ${MAX_PHOTOS_PER_PIN} fotograf yuklenebilir.`);
      return;
    }

    setUploading(true);
    setUploadError(null);

    for (const file of allowed) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setUploadError(validation.error);
        continue;
      }
      try {
        const url = await uploadPinPhoto(file, routeId, pin.id);
        onPhotoAdd(pin.id, url);
      } catch (err) {
        setUploadError(err.message);
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePhotoDelete = async (photoURL) => {
    try {
      await deletePinPhoto(photoURL);
      onPhotoRemove(pin.id, photoURL);
    } catch (err) {
      console.error('Photo delete failed:', err);
    }
  };

  const photos = pin?.photos || [];

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.editor} onClick={(e) => e.stopPropagation()}>
        <div
          className={styles.headerBar}
          style={{ backgroundColor: getDayColor(dayNumber) }}
        />
        <h3 className={styles.title}>
          {pin?.placeName ? 'Pin Duzenle' : 'Yeni Pin'}
        </h3>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="placeName" className={styles.label}>
              Mekan Adi
            </label>
            <input
              id="placeName"
              type="text"
              className={styles.input}
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="Ornek: Ayasofya"
              required
              autoFocus
            />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="daySelect" className={styles.label}>
                Gun
              </label>
              <select
                id="daySelect"
                className={styles.select}
                value={dayNumber}
                onChange={(e) => setDayNumber(Number(e.target.value))}
              >
                {days.map((day) => (
                  <option key={day.id} value={day.dayNumber}>
                    Gun {day.dayNumber}
                    {day.title ? ` - ${day.title}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="categorySelect" className={styles.label}>
                Kategori
              </label>
              <select
                id="categorySelect"
                className={styles.select}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Secin...</option>
                {PIN_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Butce</label>
            <div className={styles.budgetRow}>
              <input
                type="number"
                className={styles.input}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                min="0"
                step="0.01"
                placeholder="0"
              />
              <select
                className={styles.currencySelect}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="notes" className={styles.label}>
              Notlar
            </label>
            <textarea
              id="notes"
              className={styles.textarea}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Bu mekan hakkinda notlariniz..."
              rows={3}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Fotograflar ({photos.length}/{MAX_PHOTOS_PER_PIN})
            </label>
            {photos.length > 0 && (
              <div className={styles.photoGrid}>
                {photos.map((url) => (
                  <PhotoThumb key={url} url={url} onRemove={handlePhotoDelete} />
                ))}
              </div>
            )}
            {photos.length < MAX_PHOTOS_PER_PIN && (
              <button
                type="button"
                className={styles.uploadBtn}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <FiUpload size={14} />
                {uploading ? 'Yukleniyor...' : 'Fotograf Yukle'}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            {uploadError && (
              <p className={styles.uploadError}>{uploadError}</p>
            )}
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn}>
              Kaydet
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onCancel}
            >
              Iptal
            </button>
            {pin?.id && (
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => onDelete(pin.id)}
              >
                Sil
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
