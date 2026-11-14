import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { HelpCircle, Home } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        padding: '1.5rem',
      }}
    >
      <Card style={{ textAlign: 'center', maxWidth: '440px', padding: '3rem 2rem' }}>
        <HelpCircle size={56} color="#1e3a8a" style={{ margin: '0 auto 1rem' }} />
        <h1 style={{ fontSize: '2rem', color: '#1e3a8a', marginBottom: '0.5rem' }}>404 - Not Found</h1>
        <p style={{ color: '#4b5563', fontSize: '1rem', marginBottom: '1.5rem' }}>
          The requested administrative page or resource could not be found.
        </p>
        <Button onClick={() => navigate('/')} variant="primary" icon={<Home size={16} />}>
          Return to Dashboard
        </Button>
      </Card>
    </div>
  );
}

