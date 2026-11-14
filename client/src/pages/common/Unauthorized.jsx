import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ShieldX, Home } from 'lucide-react';

export function Unauthorized() {
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
        <ShieldX size={56} color="#dc2626" style={{ margin: '0 auto 1rem' }} />
        <h1 style={{ fontSize: '1.85rem', color: '#991b1b', marginBottom: '0.5rem' }}>403 - Access Denied</h1>
        <p style={{ color: '#4b5563', fontSize: '1rem', marginBottom: '1.5rem' }}>
          Your account role does not have authorization to view or manage this institutional section.
        </p>
        <Button onClick={() => navigate('/')} variant="primary" icon={<Home size={16} />}>
          Return to Dashboard
        </Button>
      </Card>
    </div>
  );
}

