import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerWithEmail, loginWithGoogle } from '../../services/authService';
import { FcGoogle } from 'react-icons/fc';
import styles from './Auth.module.css';

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Sifreler eslesmiyordur.');
      return;
    }

    if (password.length < 6) {
      setError('Sifre en az 6 karakter olmalidir.');
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail(email, password, displayName);
      navigate('/');
    } catch (err) {
      console.error('Register error:', err.code, err.message);
      setError(`Kayit hatasi: ${err.code || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      console.error('Google register error:', err.code, err.message);
      setError(`Google hatasi: ${err.code || err.message}`);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <h2 className={styles.authTitle}>Kayit Ol</h2>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="displayName">Kullanici Adi</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">E-posta</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Sifre</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Sifre Tekrar</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Kayit olunuyor...' : 'Kayit Ol'}
          </button>
        </form>

        <div className={styles.divider}>veya</div>

        <button onClick={handleGoogleLogin} className={styles.googleBtn}>
          <FcGoogle size={20} />
          Google ile Kayit Ol
        </button>

        <p className={styles.switchLink}>
          Zaten hesabin var mi? <Link to="/login">Giris Yap</Link>
        </p>
      </div>
    </div>
  );
}
