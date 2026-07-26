export function ProductSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card" style={{ display: 'block', overflow: 'hidden' }}>
          <div className="skeleton" style={{ width: '100%', height: '250px' }}></div>
          <div style={{ padding: '1.5rem' }}>
            <div className="skeleton" style={{ width: '80%', height: '1.5rem', marginBottom: '0.75rem', borderRadius: '4px' }}></div>
            <div className="skeleton" style={{ width: '50%', height: '1rem', marginBottom: '1rem', borderRadius: '4px' }}></div>
            <div className="skeleton" style={{ width: '40%', height: '1.25rem', borderRadius: '4px' }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}
