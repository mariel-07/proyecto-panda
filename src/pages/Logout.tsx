import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface LogoutProps {
  onLogout: () => void;
}

const Logout: React.FC<LogoutProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    onLogout();
    navigate('/login');
  }, [onLogout, navigate]);

  return (
    <div style={{ padding: '20px', color: '#fff' }}>
      <p>Cerrando sesión...</p>
    </div>
  );
};

export default Logout;