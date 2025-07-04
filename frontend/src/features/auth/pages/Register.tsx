/**
 * Registration page component with branding and form.
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';

export function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleRegisterSuccess = () => {
    // Redirect to intended page or dashboard
    const from = location.state?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF5722] to-[#E64A19] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="mx-auto w-32 h-32 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
            <img 
              src="/ja_logo.png" 
              alt="JA Distribuidora" 
              className="w-24 h-24 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            JA Distribuidora
          </h1>
          <p className="text-white/90 text-lg">
            Sistema de Geração de Catálogos
          </p>
        </div>

        {/* Registration Form */}
        <RegisterForm onSuccess={handleRegisterSuccess} />

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-white/80">
          <p>&copy; 2024 JA Distribuidora. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}