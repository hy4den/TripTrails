import { FiPlus, FiTrash2, FiMapPin, FiChevronUp, FiChevronDown, FiImage } from 'react-icons/fi';
import { groupPinsByDay } from '../../../utils/mapHelpers';
import { getDayColor, getCurrencySymbol, MAX_DAYS } from '../../../utils/constants';
import styles from './DayTimeline.module.css';

export default function DayTimeline({
  days,
  pins,
  activeDayNumber,
  selectedPinId,
  onSelectDay,
  onAddDay,
  onRemoveDay,
  onPinClick,
  onPinRemove,
  onPinReorder,
}) {
  const grouped = groupPinsByDay(pins);

  return (
    <div className={styles.timeline}>
      {days.map((day) => {
        const color = getDayColor(day.dayNumber);
        const dayPins = grouped[day.dayNumber] || [];
        const isActive = day.dayNumber === activeDayNumber;
        const dayBudget = dayPins.reduce((sum, p) => sum + (p.budget || 0), 0);

        return (
          <div
            key={day.id}
            className={`${styles.daySection} ${isActive ? styles.daySectionActive : ''}`}
            style={isActive ? { borderLeftColor: color } : undefined}
          >
            <div
              className={styles.dayHeader}
              onClick={() => onSelectDay(day.dayNumber)}
            >
              <div className={styles.dayCircle} style={{ backgroundColor: color }}>
                {day.dayNumber}
              </div>
              <span className={styles.dayLabel}>Gün {day.dayNumber}</span>
              {dayPins.length > 0 && (
                <span className={styles.pinCount}>{dayPins.length} pin</span>
              )}
              {dayBudget > 0 && (
                <span className={styles.dayBudget}>
                  {getCurrencySymbol('TRY')}{dayBudget}
                </span>
              )}
              {days.length > 1 && (
                <button
                  className={styles.removeDayBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveDay(day.dayNumber);
                  }}
                  title="Günü sil"
                >
                  <FiTrash2 size={14} />
                </button>
              )}
            </div>

            {dayPins.length > 0 && (
              <ul className={styles.pinList}>
                {dayPins.map((pin) => {
                  const photoCount = pin.photos?.length || 0;
                  return (
                    <li
                      key={pin.id}
                      className={`${styles.pinItem} ${selectedPinId === pin.id ? styles.pinItemSelected : ''}`}
                    >
                      <button
                        className={styles.pinName}
                        onClick={() => onPinClick(pin.id)}
                      >
                        <FiMapPin size={12} style={{ color, flexShrink: 0 }} />
                        <span>{pin.placeName || 'İsimsiz Konum'}</span>
                      </button>
                      <div className={styles.pinMeta}>
                        {photoCount > 0 && (
                          <span className={styles.pinPhotoCount}>
                            <FiImage size={10} /> {photoCount}
                          </span>
                        )}
                        {pin.budget > 0 && (
                          <span className={styles.pinBudget}>
                            {getCurrencySymbol(pin.currency || 'TRY')}{pin.budget}
                          </span>
                        )}
                      </div>
                      <div className={styles.pinActions}>
                        <button
                          className={styles.reorderBtn}
                          onClick={() => onPinReorder(pin.id, 'up')}
                          disabled={pin.orderIndex === 0}
                          title="Yukarı taşı"
                        >
                          <FiChevronUp size={14} />
                        </button>
                        <button
                          className={styles.reorderBtn}
                          onClick={() => onPinReorder(pin.id, 'down')}
                          disabled={pin.orderIndex === dayPins.length - 1}
                          title="Aşağı taşı"
                        >
                          <FiChevronDown size={14} />
                        </button>
                        <button
                          className={styles.removePinBtn}
                          onClick={() => onPinRemove(pin.id)}
                          title="Pin sil"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}

      {days.length < MAX_DAYS && (
        <button className={styles.addDayBtn} onClick={onAddDay}>
          <FiPlus size={16} />
          Gün Ekle
        </button>
      )}
    </div>
  );
}
