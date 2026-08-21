import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface LogoutProps {
  onLogout: () => void;
}

const Logout: React.FC<LogoutProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    onLogout();
    navigate('/login', { replace: true });
  }, [onLogout, navigate]);

  return (
    <div style={{ padding: '40px', color: '#fff', textAlign: 'center' }}>
      <p>Cerrando sesión...</p>
    </div>
  );
};

export default Logout;
