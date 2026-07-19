export default function LoadingProducts() {
  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', minHeight: 'calc(100vh - 80px)' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div className="skeleton" style={{ height: '48px', width: '300px', margin: '0 auto 1rem auto' }}></div>
        <div className="skeleton" style={{ height: '24px', width: '250px', margin: '0 auto' }}></div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexDirection: 'row', flexWrap: 'wrap' }}>
        {/* Sidebar Skeleton */}
        <aside style={{ width: '250px', flexShrink: 0 }}>
          <div className="glass-card" style={{ padding: '1.5rem', height: '400px' }}>
            <div className="skeleton" style={{ height: '28px', width: '150px', marginBottom: '1.5rem' }}></div>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton" style={{ height: '20px', width: '100%', marginBottom: '1rem' }}></div>
            ))}
          </div>
        </aside>

        {/* Product Grid Skeleton */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ height: '60px', width: '100%', borderRadius: 'var(--radius-md)' }} className="skeleton"></div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card" style={{ overflow: 'hidden' }}>
                <div className="skeleton" style={{ width: '100%', height: '250px', borderRadius: '0' }}></div>
                <div style={{ padding: '1.5rem' }}>
                  <div className="skeleton" style={{ height: '24px', width: '80%', marginBottom: '0.5rem' }}></div>
                  <div className="skeleton" style={{ height: '20px', width: '40%', marginBottom: '0.5rem' }}></div>
                  <div className="skeleton" style={{ height: '28px', width: '30%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
