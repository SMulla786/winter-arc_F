export const GlobalStyles: React.FC = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
    .font-elegant { font-family: 'Playfair Display', serif; }
    .touch-button { min-height: 44px; min-width: 44px; }
    .premium-shadow { box-shadow: 0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08); }
    .premium-border { border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); }
    .glass-effect { backdrop-filter: blur(12px); background: rgba(255,255,255,0.95); }
    .gradient-bg { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); }
    .gold-gradient { background: linear-gradient(135deg, #d4af37 0%, #f5e3a9 50%, #b8941f 100%); }
    .black-gradient { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); }
    .dark-gold-gradient { background: linear-gradient(135deg, #1a1a1a 0%, #d4af37 100%); }
    .dish-item { 
      padding: 16px 20px; 
      border-radius: 16px; 
      margin-bottom: 12px;
      transition: all 0.3s ease;
      border: 1px solid #e5e5e5;
      background: white;
    }
    .new-dish-item { 
      padding: 16px 20px; 
      border-radius: 10px; 
      margin-bottom: 12px;
      transition: all 0.3s ease;
      border: 1px solid #2E3A47;
      background-color: #1C2434;
    }
    .dish-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      border-color: #d4af37;
    }
    .category-header { 
      padding: 15px; 
      border-radius: 10px; 
      margin-bottom: 12px;
      background: linear-gradient(135deg, #997c08ff 0%, #d3b953ff 100%);
      color: white;
    }
    .premium-checkbox {
      width: 22px; height: 22px; border-radius: 8px; border: 2px solid #d4af37;
      position: relative; appearance: none; cursor: pointer; flex-shrink: 0;
      transition: all 0.2s ease;
    }
    .premium-checkbox:checked { 
      background: linear-gradient(135deg, #d4af37 0%, #f5e3a9 100%);
      border-color: #d4af37;
    }
    .premium-checkbox:checked::after {
      content: '✓'; position: absolute; color: #1a1a1a; font-size: 14px; font-weight: bold;
      top: 50%; left: 50%; transform: translate(-50%, -50%);
    }
    .bottom-action-bar {
      position: fixed; bottom: 0; left: 0; right: 0; 
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      border-top: 1px solid rgba(212, 175, 55, 0.3); 
      padding: 16px 20px; 
      box-shadow: 0 -8px 32px rgba(0,0,0,0.3); 
      z-index: 10;
    }
    .floating-action {
      background: linear-gradient(135deg, #d4af37 0%, #f5e3a9 100%);
      color: #1a1a1a;
      box-shadow: 0 8px 32px rgba(212, 175, 55, 0.4);
    }
    .category-badge {
      background: linear-gradient(135deg, #d4af37 0%, #f5e3a9 100%);
      color: #1a1a1a;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .gold-text { color: #d4af37; }
    .dark-bg { background: #1a1a1a; }
  `}</style>
);
