import { useReducer, useCallback, useRef, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { FiInfo, FiSave, FiSend, FiCheck } from 'react-icons/fi';
import { Country, State } from 'country-state-city';

import MapView from '../../components/map/MapView/MapView';
import Pin from '../../components/map/Pin/Pin';
import PinPopup from '../../components/map/PinPopup/PinPopup';
import RouteLayer from '../../components/map/RouteLayer/RouteLayer';
import PlaceSearch from '../../components/map/PlaceSearch/PlaceSearch';
import DayTimeline from '../../components/route/DayTimeline/DayTimeline';
import PinEditor from '../../components/route/PinEditor/PinEditor';
import SearchableSelect from '../../components/common/SearchableSelect/SearchableSelect';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getDayColor } from '../../utils/constants';
import { getNextOrderIndex } from '../../utils/mapHelpers';
import { saveRoute, updateRoute, publishRoute } from '../../services/routeService';
import styles from './RouteCreatePage.module.css';

// --- Reducer ---

const initialRouteState = {
  routeId: uuidv4(),
  title: '',
  description: '',
  city: '',
  country: '',
  countryCode: '',
  days: [{ id: uuidv4(), dayNumber: 1, title: '' }],
  pins: [],
  selectedPinId: null,
  editingPinId: null,
  activeDayNumber: 1,
  saving: false,
  saveError: null,
  lastSavedAt: null,
};

function routeReducer(state, action) {
  switch (action.type) {
    case 'SET_TITLE':
      return { ...state, title: action.payload };

    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload };

    case 'SET_CITY':
      return { ...state, city: action.payload };

    case 'SET_COUNTRY':
      return { ...state, country: action.payload.name, countryCode: action.payload.code, city: '' };

    case 'ADD_DAY': {
      const newDayNumber = state.days.length + 1;
      return {
        ...state,
        days: [
          ...state.days,
          { id: uuidv4(), dayNumber: newDayNumber, title: '' },
        ],
      };
    }

    case 'REMOVE_DAY': {
      const dayNum = action.payload;
      if (state.days.length <= 1) return state;
      const newDays = state.days
        .filter((d) => d.dayNumber !== dayNum)
        .map((d, i) => ({ ...d, dayNumber: i + 1 }));
      const newPins = state.pins
        .filter((p) => p.dayNumber !== dayNum)
        .map((p) => ({
          ...p,
          dayNumber: p.dayNumber > dayNum ? p.dayNumber - 1 : p.dayNumber,
        }));
      const newActive =
        state.activeDayNumber > newDays.length
          ? newDays.length
          : state.activeDayNumber === dayNum
            ? 1
            : state.activeDayNumber > dayNum
              ? state.activeDayNumber - 1
              : state.activeDayNumber;
      return {
        ...state,
        days: newDays,
        pins: newPins,
        activeDayNumber: newActive,
        selectedPinId: null,
        editingPinId: null,
      };
    }

    case 'SET_ACTIVE_DAY':
      return { ...state, activeDayNumber: action.payload };

    case 'ADD_PIN': {
      const { lng, lat, placeName: initialPlaceName } = action.payload;
      const newId = uuidv4();
      const orderIndex = getNextOrderIndex(state.pins, state.activeDayNumber);
      const newPin = {
        id: newId,
        dayNumber: state.activeDayNumber,
        orderIndex,
        placeName: initialPlaceName || '',
        coordinates: { lng, lat },
        notes: '',
        photos: [],
        budget: 0,
        currency: 'TRY',
        category: '',
      };
      return {
        ...state,
        pins: [...state.pins, newPin],
        editingPinId: newId,
        selectedPinId: null,
      };
    }

    case 'UPDATE_PIN': {
      const { id, ...fields } = action.payload;
      const oldPin = state.pins.find((p) => p.id === id);
      let updatedPins = state.pins.map((p) =>
        p.id === id ? { ...p, ...fields } : p
      );
      if (oldPin && fields.dayNumber && fields.dayNumber !== oldPin.dayNumber) {
        const newOrderIndex = getNextOrderIndex(
          updatedPins.filter((p) => p.id !== id),
          fields.dayNumber
        );
        updatedPins = updatedPins.map((p) => {
          if (p.id === id) return { ...p, orderIndex: newOrderIndex };
          if (
            p.dayNumber === oldPin.dayNumber &&
            p.orderIndex > oldPin.orderIndex
          ) {
            return { ...p, orderIndex: p.orderIndex - 1 };
          }
          return p;
        });
      }
      return {
        ...state,
        pins: updatedPins,
        editingPinId: null,
      };
    }

    case 'REMOVE_PIN': {
      const pinId = action.payload;
      const removedPin = state.pins.find((p) => p.id === pinId);
      if (!removedPin) return state;
      const remaining = state.pins
        .filter((p) => p.id !== pinId)
        .map((p) => {
          if (
            p.dayNumber === removedPin.dayNumber &&
            p.orderIndex > removedPin.orderIndex
          ) {
            return { ...p, orderIndex: p.orderIndex - 1 };
          }
          return p;
        });
      return {
        ...state,
        pins: remaining,
        selectedPinId:
          state.selectedPinId === pinId ? null : state.selectedPinId,
        editingPinId:
          state.editingPinId === pinId ? null : state.editingPinId,
      };
    }

    case 'REORDER_PIN': {
      const { pinId, direction } = action.payload;
      const pin = state.pins.find((p) => p.id === pinId);
      if (!pin) return state;
      const dayPins = state.pins
        .filter((p) => p.dayNumber === pin.dayNumber)
        .sort((a, b) => a.orderIndex - b.orderIndex);
      const currentIndex = dayPins.findIndex((p) => p.id === pinId);
      const swapIndex =
        direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (swapIndex < 0 || swapIndex >= dayPins.length) return state;
      const swapPin = dayPins[swapIndex];
      return {
        ...state,
        pins: state.pins.map((p) => {
          if (p.id === pinId) return { ...p, orderIndex: swapPin.orderIndex };
          if (p.id === swapPin.id) return { ...p, orderIndex: pin.orderIndex };
          return p;
        }),
      };
    }

    case 'SELECT_PIN':
      return { ...state, selectedPinId: action.payload };

    case 'SET_EDITING_PIN':
      return { ...state, editingPinId: action.payload, selectedPinId: null };

    case 'ADD_PIN_PHOTO': {
      const { pinId, photoURL } = action.payload;
      return {
        ...state,
        pins: state.pins.map((p) =>
          p.id === pinId ? { ...p, photos: [...p.photos, photoURL] } : p
        ),
      };
    }

    case 'REMOVE_PIN_PHOTO': {
      const { pinId, photoURL } = action.payload;
      return {
        ...state,
        pins: state.pins.map((p) =>
          p.id === pinId
            ? { ...p, photos: p.photos.filter((u) => u !== photoURL) }
            : p
        ),
      };
    }

    case 'SET_SAVING':
      return { ...state, saving: action.payload };

    case 'SET_SAVE_ERROR':
      return { ...state, saveError: action.payload };

    case 'SET_LAST_SAVED':
      return { ...state, lastSavedAt: action.payload, saving: false, saveError: null };

    default:
      return state;
  }
}

// --- Component ---

export default function RouteCreatePage() {
  const [state, dispatch] = useReducer(routeReducer, initialRouteState);
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [isNewPin, setIsNewPin] = useState(false);

  const selectedPin = useMemo(
    () => state.pins.find((p) => p.id === state.selectedPinId) || null,
    [state.pins, state.selectedPinId]
  );

  const editingPin = useMemo(
    () => state.pins.find((p) => p.id === state.editingPinId) || null,
    [state.pins, state.editingPinId]
  );

  const allCountries = useMemo(() => Country.getAllCountries(), []);
  const citiesForCountry = useMemo(
    () => (state.countryCode ? State.getStatesOfCountry(state.countryCode) || [] : []),
    [state.countryCode]
  );
  const countryOptions = useMemo(
    () => allCountries.map((c) => ({ value: c.isoCode, label: c.name })),
    [allCountries]
  );
  const cityOptions = useMemo(
    () => citiesForCountry.map((c) => ({ value: c.name, label: c.name })),
    [citiesForCountry]
  );

  const handleMapClick = useCallback((coords) => {
    dispatch({ type: 'ADD_PIN', payload: coords });
    setIsNewPin(true);
  }, []);

  const handlePinSelect = useCallback((pinId) => {
    dispatch({ type: 'SELECT_PIN', payload: pinId });
  }, []);

  const handlePinFlyTo = useCallback(
    (pinId) => {
      const pin = state.pins.find((p) => p.id === pinId);
      if (pin && mapRef.current) {
        mapRef.current.flyTo({
          center: [pin.coordinates.lng, pin.coordinates.lat],
          zoom: 14,
          duration: 1500,
        });
      }
      dispatch({ type: 'SELECT_PIN', payload: pinId });
    },
    [state.pins]
  );

  const handlePinSave = useCallback((pinData) => {
    dispatch({ type: 'UPDATE_PIN', payload: pinData });
    setIsNewPin(false);
  }, []);

  const handlePinReorder = useCallback((pinId, direction) => {
    dispatch({ type: 'REORDER_PIN', payload: { pinId, direction } });
  }, []);

  const handlePhotoAdd = useCallback((pinId, photoURL) => {
    dispatch({ type: 'ADD_PIN_PHOTO', payload: { pinId, photoURL } });
  }, []);

  const handlePhotoRemove = useCallback((pinId, photoURL) => {
    dispatch({ type: 'REMOVE_PIN_PHOTO', payload: { pinId, photoURL } });
  }, []);

  const handlePlaceSelect = useCallback(({ lng, lat, placeName }) => {
    dispatch({ type: 'ADD_PIN', payload: { lng, lat, placeName } });
    setIsNewPin(true);
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 15, duration: 1200 });
  }, []);

  const handleSave = useCallback(async () => {
    if (!currentUser) return;
    dispatch({ type: 'SET_SAVING', payload: true });
    dispatch({ type: 'SET_SAVE_ERROR', payload: null });

    try {
      if (!isSaved) {
        await saveRoute(state.routeId, currentUser, state);
        setIsSaved(true);
      } else {
        await updateRoute(state.routeId, currentUser, state);
      }
      dispatch({ type: 'SET_LAST_SAVED', payload: new Date().toISOString() });
      addToast('Rota kaydedildi.', 'success');
    } catch (error) {
      console.error('Save failed:', error);
      dispatch({ type: 'SET_SAVE_ERROR', payload: 'Kaydedilirken hata oluştu.' });
      dispatch({ type: 'SET_SAVING', payload: false });
      addToast('Rota kaydedilemedi.', 'error');
    }
  }, [currentUser, state, isSaved, addToast]);

  const handlePublish = useCallback(async () => {
    if (!currentUser) return;

    if (!state.title.trim()) {
      dispatch({ type: 'SET_SAVE_ERROR', payload: 'Yayınlamak için rota başlığı gerekli.' });
      addToast('Rota başlığı gerekli.', 'info');
      return;
    }
    if (state.pins.length === 0) {
      dispatch({ type: 'SET_SAVE_ERROR', payload: 'Yayınlamak için en az bir pin gerekli.' });
      addToast('En az bir pin eklemelisiniz.', 'info');
      return;
    }

    dispatch({ type: 'SET_SAVING', payload: true });
    try {
      if (!isSaved) {
        await saveRoute(state.routeId, currentUser, state);
        setIsSaved(true);
      } else {
        await updateRoute(state.routeId, currentUser, state);
      }
      await publishRoute(state.routeId);
      addToast('Rota yayınlandı!', 'success');
      navigate(`/routes/${state.routeId}`);
    } catch (error) {
      console.error('Publish failed:', error);
      dispatch({ type: 'SET_SAVE_ERROR', payload: 'Yayınlanırken hata oluştu.' });
      dispatch({ type: 'SET_SAVING', payload: false });
      addToast('Rota yayınlanamadı.', 'error');
    }
  }, [currentUser, state, isSaved, navigate, addToast]);

  return (
    <div className={styles.page}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <input
            className={styles.routeTitle}
            placeholder="Rota başlığını girin..."
            value={state.title}
            onChange={(e) =>
              dispatch({ type: 'SET_TITLE', payload: e.target.value })
            }
          />
          <textarea
            className={styles.routeDescription}
            placeholder="Rota açıklaması (opsiyonel)..."
            value={state.description}
            onChange={(e) =>
              dispatch({ type: 'SET_DESCRIPTION', payload: e.target.value })
            }
            rows={2}
          />
          <div className={styles.locationRow}>
            <div className={styles.locationSelectWrap}>
              <SearchableSelect
                options={countryOptions}
                value={state.countryCode}
                onChange={(isoCode) => {
                  const country = allCountries.find((c) => c.isoCode === isoCode);
                  dispatch({
                    type: 'SET_COUNTRY',
                    payload: country ? { name: country.name, code: country.isoCode } : { name: '', code: '' },
                  });
                  if (country?.latitude && country?.longitude && mapRef.current) {
                    mapRef.current.flyTo({
                      center: [parseFloat(country.longitude), parseFloat(country.latitude)],
                      zoom: 5,
                      duration: 1500,
                    });
                  }
                }}
                placeholder="Ülke Seçin..."
              />
            </div>
            <div className={styles.locationSelectWrap}>
              <SearchableSelect
                options={cityOptions}
                value={state.city}
                onChange={(cityName) => {
                  dispatch({ type: 'SET_CITY', payload: cityName });
                  const selectedState = citiesForCountry.find((c) => c.name === cityName);
                  if (selectedState?.latitude && selectedState?.longitude && mapRef.current) {
                    mapRef.current.flyTo({
                      center: [parseFloat(selectedState.longitude), parseFloat(selectedState.latitude)],
                      zoom: 9,
                      duration: 1500,
                    });
                  }
                }}
                placeholder={state.countryCode ? 'Şehir Seçin...' : 'Önce ülke seçin'}
                disabled={!state.countryCode}
              />
            </div>
          </div>
          <div className={styles.editBanner}>
            <FiInfo size={16} className={styles.editBannerIcon} />
            Haritaya tıklayarak pin ekleyin
          </div>
        </div>
        <div className={styles.sidebarContent}>
          <DayTimeline
            days={state.days}
            pins={state.pins}
            activeDayNumber={state.activeDayNumber}
            selectedPinId={state.selectedPinId}
            onSelectDay={(dayNum) =>
              dispatch({ type: 'SET_ACTIVE_DAY', payload: dayNum })
            }
            onAddDay={() => dispatch({ type: 'ADD_DAY' })}
            onRemoveDay={(dayNum) =>
              dispatch({ type: 'REMOVE_DAY', payload: dayNum })
            }
            onPinClick={handlePinFlyTo}
            onPinRemove={(pinId) =>
              dispatch({ type: 'REMOVE_PIN', payload: pinId })
            }
            onPinReorder={handlePinReorder}
          />
        </div>
        <div className={styles.sidebarFooter}>
          {state.saveError && (
            <p className={styles.saveError}>{state.saveError}</p>
          )}
          {state.lastSavedAt && (
            <p className={styles.saveStatus}>
              <FiCheck size={12} />
              Kaydedildi
            </p>
          )}
          <div className={styles.saveActions}>
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={state.saving}
            >
              <FiSave size={16} />
              {state.saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button
              className={styles.publishBtn}
              onClick={handlePublish}
              disabled={state.saving}
            >
              <FiSend size={16} />
              Yayınla
            </button>
          </div>
        </div>
      </div>

      <div className={styles.mapArea}>
        <MapView mode="edit" onMapClick={handleMapClick} mapRef={mapRef}>
          <PlaceSearch onPlaceSelect={handlePlaceSelect} />
          {state.pins.map((pin) => (
            <Pin
              key={pin.id}
              pin={pin}
              color={getDayColor(pin.dayNumber)}
              isSelected={state.selectedPinId === pin.id}
              onClick={handlePinSelect}
            />
          ))}

          {selectedPin && (
            <PinPopup
              pin={selectedPin}
              color={getDayColor(selectedPin.dayNumber)}
              onClose={() =>
                dispatch({ type: 'SELECT_PIN', payload: null })
              }
              onEdit={(id) => {
                dispatch({ type: 'SET_EDITING_PIN', payload: id });
                setIsNewPin(false);
              }}
              onDelete={(id) =>
                dispatch({ type: 'REMOVE_PIN', payload: id })
              }
            />
          )}

          <RouteLayer pins={state.pins} days={state.days} />
        </MapView>
      </div>

      {state.editingPinId && (
        <PinEditor
          pin={editingPin}
          days={state.days}
          routeId={state.routeId}
          isNew={isNewPin}
          onSave={handlePinSave}
          onCancel={() => {
            dispatch({ type: 'SET_EDITING_PIN', payload: null });
            setIsNewPin(false);
          }}
          onDelete={(id) => dispatch({ type: 'REMOVE_PIN', payload: id })}
          onPhotoAdd={handlePhotoAdd}
          onPhotoRemove={handlePhotoRemove}
        />
      )}
    </div>
  );
}
