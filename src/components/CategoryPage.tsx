import { analysesForCategory, getCategory } from '../analyses/registry.js';
import styles from './CategoryPage.module.css';

interface Props {
  categoryId: string;
  onBack: () => void;
  onSelectAnalysis: (analysisId: string) => void;
}

export default function CategoryPage({ categoryId, onBack, onSelectAnalysis }: Props) {
  const category = getCategory(categoryId);
  const analyses = analysesForCategory(categoryId);

  if (!category) {
    return (
      <div className={styles.page}>
        <button className={styles.backButton} onClick={onBack}>← All analyses</button>
        <p>Unknown category.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <button className={styles.backButton} onClick={onBack}>← All analyses</button>
      <header className={styles.header}>
        <h2 className={styles.title}>{category.title}</h2>
        <p className={styles.description}>{category.description}</p>
        {category.notes && <p className={styles.notes}>{category.notes}</p>}
      </header>

      {analyses.length === 0 ? (
        <div className={styles.empty}>
          <p>No analyses available yet for this category.</p>
          <p className={styles.emptyHint}>Coming soon.</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {analyses.map((a) => (
            <li key={a.id}>
              <button
                className={styles.item}
                onClick={() => onSelectAnalysis(a.id)}
              >
                <span className={styles.itemTitle}>{a.title}</span>
                <span className={styles.itemDescription}>{a.description}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
