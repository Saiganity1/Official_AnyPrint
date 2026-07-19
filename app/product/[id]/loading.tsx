export default function LoadingProduct() {
  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', minHeight: 'calc(100vh - 80px)' }}>
      <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', overflow: 'hidden' }}>
        <div className="skeleton" style={{ flex: '1 1 50%', minWidth: '300px', height: '500px', borderRadius: '0' }}></div>
        <div style={{ flex: '1 1 50%', minWidth: '300px', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="skeleton" style={{ height: '48px', width: '80%', marginBottom: '1rem' }}></div>
          <div className="skeleton" style={{ height: '36px', width: '30%', marginBottom: '2rem' }}></div>
          
          <div style={{ marginBottom: '2rem' }}>
            <div className="skeleton" style={{ height: '24px', width: '40%', marginBottom: '1rem' }}></div>
            <div className="skeleton" style={{ height: '16px', width: '100%', marginBottom: '0.5rem' }}></div>
            <div className="skeleton" style={{ height: '16px', width: '90%', marginBottom: '0.5rem' }}></div>
            <div className="skeleton" style={{ height: '16px', width: '95%' }}></div>
          </div>

          <div className="skeleton" style={{ height: '24px', width: '40%', marginBottom: '2rem' }}></div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="skeleton" style={{ height: '48px', width: '120px' }}></div>
            <div className="skeleton" style={{ height: '48px', flex: 1 }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
