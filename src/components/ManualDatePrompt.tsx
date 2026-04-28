import { useState } from 'react';
import styles from './ManualDatePrompt.module.css';

interface Props {
  filename: string;
  onSubmit: (date: string, time: string) => void;
  onCancel: () => void;
}

export default function ManualDatePrompt({ filename, onSubmit, onCancel }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('00:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && time) {
      onSubmit(date, time);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Enter Backup Date & Time</h2>
        <p className={styles.message}>
          The filename <code>{filename}</code> doesn't match the expected format.
          Please enter the backup date and time manually.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.group}>
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className={styles.group}>
            <label htmlFor="time">Time (HH:MM)</label>
            <input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <div className={styles.buttons}>
            <button type="submit" className={styles.primary}>
              Continue
            </button>
            <button type="button" onClick={onCancel} className={styles.secondary}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
