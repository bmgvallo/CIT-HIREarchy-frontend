// MainApp.js
import React, { useState } from 'react';
import App from './App';
import Coordinator from './Coordinator';

function MainApp() {
  const [currentView, setCurrentView] = useState('company');

  return (
    <div>
      {/* Navigation Bar */}
      <div style={{
        padding: '10px 20px', 
        backgroundColor: '#450000', 
        color: 'white',
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <button 
          onClick={() => setCurrentView('company')}
          style={{
            padding: '10px 20px',
            backgroundColor: currentView === 'company' ? '#2A0001' : '#450000',
            color: 'white',
            border: '1px solid white',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.3s ease'
          }}
        >
          🏢 Company View
        </button>
        <button 
          onClick={() => setCurrentView('coordinator')}
          style={{
            padding: '10px 20px',
            backgroundColor: currentView === 'coordinator' ? '#2A0001' : '#450000',
            color: 'white',
            border: '1px solid white',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.3s ease'
          }}
        >
          👨‍💼 Coordinator View
        </button>
      </div>

      {/* Render the selected component */}
      {currentView === 'company' ? <App /> : <Coordinator />}
    </div>
  );
}

export default MainApp;