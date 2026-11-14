import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { BlobBackground } from '../../components/layout/BlobBackground.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Shield, Sparkles, User, GraduationCap, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@school.test',
      password: 'Admin@123',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const user = await login(data.email, data.password);
      showToast(`Welcome back, ${user.name}!`);

      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'TEACHER') {
        navigate('/teacher/dashboard');
      } else if (user.role === 'GUARDIAN') {
        navigate('/guardian/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (email, password) => {
    setValue('email', email);
    setValue('password', password);
    setErrorMsg('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative',
      }}
    >
      <BlobBackground />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 10 }}>
        <Card className="glass-modal" style={{ padding: '2rem 1.75rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.85rem',
                boxShadow: '0 8px 24px rgba(30, 58, 138, 0.35)',
              }}
            >
              <Shield size={30} />
            </div>
            <h1 style={{ fontSize: '1.9rem', color: '#1e3a8a', marginBottom: '0.25rem', fontWeight: 700 }}>
              Algions Academy
            </h1>
            <p style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 600 }}>
              Institutional Management & Evaluation Portal
            </p>
          </div>

          {errorMsg && (
            <div
              style={{
                background: 'rgba(254, 242, 242, 0.95)',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                fontSize: '0.9rem',
                marginBottom: '1rem',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.08)',
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email Address"
              type="email"
              placeholder="name@school.test"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
              icon={<Lock size={16} />}
            >
              Sign In to Portal
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(229, 231, 235, 0.7)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#374151',
                marginBottom: '0.75rem',
              }}
            >
              <Sparkles size={16} color="#4f46e5" />
              <span>One-Click Demo Credentials:</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.65rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setDemoCredentials('admin@school.test', 'Admin@123')}
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.3rem', color: '#1e3a8a', fontWeight: 700 }}
              >
                <Shield size={14} color="#1e3a8a" /> Admin
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setDemoCredentials('teacher@school.test', 'Teacher@123')}
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.3rem', color: '#4f46e5', fontWeight: 700 }}
              >
                <GraduationCap size={14} color="#4f46e5" /> Teacher
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setDemoCredentials('guardian@school.test', 'Guardian@123')}
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.3rem', color: '#059669', fontWeight: 700 }}
              >
                <User size={14} color="#059669" /> Guardian
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

