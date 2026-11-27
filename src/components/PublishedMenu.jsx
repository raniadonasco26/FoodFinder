import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import MenuCard from './MenuCard';
import { fetchPublishedMenu } from '../services/ownerMenus';

export default function PublishedMenu({ restaurant }) {
  const [result, setResult] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchPublishedMenu(restaurant.id, controller.signal).then(
      menu => { if (!controller.signal.aborted) setResult({ menu }); },
      () => { if (!controller.signal.aborted) setResult({ error: true }); }
    );
    return () => controller.abort();
  }, [restaurant.id]);

  const categories = new Map();
  for (const item of result?.menu?.items ?? []) {
    if (!categories.has(item.category)) categories.set(item.category, []);
    categories.get(item.category).push(item);
  }
  const officialLink = restaurant.menuUrl || restaurant.website;
  return (
    <div className="published-menu">
      {officialLink && (
        <a href={officialLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
          <ExternalLink size={16} />
          {restaurant.menuUrl ? 'Open restaurant menu' : 'Check restaurant website'}
        </a>
      )}
      {!result && <p role="status">Loading the published menu…</p>}
      {result?.error && <p role="alert">Couldn’t load the published menu. Reload to try again.</p>}
      {result && !result.error && !categories.size && !restaurant.menuUrl && <p>Menu currently unavailable.</p>}
      {!!categories.size && <p>Published by the verified restaurant owner.</p>}
      {[...categories].map(([category, items]) => (
        <section key={category}>
          <h3 className="editorial-serif">{category}</h3>
          <div className="menu-grid">
            {items.map(item => <MenuCard key={item.id} item={{ ...item, image: item.imageUrl }} ownerPublished />)}
          </div>
        </section>
      ))}
    </div>
  );
}
