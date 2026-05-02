import { CATEGORIES } from '../analyses/registry.js';
import styles from './AnalysisMenu.module.css';

interface Props {
  onSelectCategory: (categoryId: string) => void;
}

export default function AnalysisMenu({ onSelectCategory }: Props) {
  return (
    <div className={styles.menu}>
      <div className={styles.header}>
        <h2 className={styles.title}>Select an Analysis</h2>
        <p className={styles.subtitle}>Choose what to explore in your backup data</p>
      </div>

      <div className={styles.grid}>
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            className={styles.card}
            onClick={() => onSelectCategory(category.id)}
          >
            <h3 className={styles.cardTitle}>{category.title}</h3>
            <p className={styles.cardDescription}>{category.description}</p>
            {category.notes && <p className={styles.cardNotes}>{category.notes}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}
