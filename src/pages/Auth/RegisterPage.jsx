import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Country } from 'country-state-city';
import { registerWithEmail, loginWithGoogle } from '../../services/authService';
import SearchableSelect from '../../components/common/SearchableSelect/SearchableSelect';
import { FcGoogle } from 'react-icons/fc';
import styles from './Auth.module.css';

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [citizenCountryCode, setCitizenCountryCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const allCountries = useMemo(() => Country.getAllCountries(), []);
  const countryOptions = useMemo(
    () => allCountries.map((c) => ({ value: c.isoCode, label: c.name })),
    [allCountries]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    const citizenCountry = citizenCountryCode
      ? allCountries.find((c) => c.isoCode === citizenCountryCode)?.name || ''
      : '';

    setLoading(true);
    try {
      await registerWithEmail(email, password, displayName, {
        firstName,
        lastName,
        citizenCountry,
      });
      navigate('/');
    } catch (err) {
      console.error('Register error:', err.code, err.message);
      setError(`Kayıt hatası: ${err.code || err.message}`);
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
      setError(`Google hatası: ${err.code || err.message}`);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <h2 className={styles.authTitle}>Kayıt Ol</h2>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="displayName">Kullanıcı Adı</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div className={styles.twoCol}>
            <div className={styles.inputGroup}>
              <label htmlFor="firstName">İsim</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="lastName">Soyisim</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Vatandaşlık Ülkesi</label>
            <SearchableSelect
              options={countryOptions}
              value={citizenCountryCode}
              onChange={setCitizenCountryCode}
              placeholder="Ülke seçin (opsiyonel)"
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
            <label htmlFor="password">Şifre</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Şifre Tekrar</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div className={styles.divider}>veya</div>

        <button onClick={handleGoogleLogin} className={styles.googleBtn}>
          <FcGoogle size={20} />
          Google ile Kayıt Ol
        </button>

        <p className={styles.switchLink}>
          Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
}
