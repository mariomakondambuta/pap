import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginRequest } from '../../api/auth';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/Card';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { inputClasses, labelClasses } from '../../components/formControls';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await loginRequest(email.trim(), password);
      login(token, user);
      navigate(user.role === 'admin' ? '/admin' : '/painel');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar.');
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1180px] px-6">
      <Card className="mx-auto my-16 max-w-[440px] p-10">
        <h2 className="text-center">Aceder à sua conta</h2>
        <p className="text-center">Entre para continuar a sua aprendizagem.</p>
        <Alert variant="error">{error}</Alert>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={labelClasses} htmlFor="email">Email</label>
            <input id="email" type="email" required autoComplete="email" placeholder="voce@exemplo.com" className={inputClasses()} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className={labelClasses} htmlFor="password">Password</label>
            <input id="password" type="password" required autoComplete="current-password" placeholder="••••••••" className={inputClasses()} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" block disabled={loading}>{loading ? 'A entrar...' : 'Entrar'}</Button>
        </form>
        <p className="mt-4 text-center text-[0.95rem]">Ainda não tem conta? <Link to="/registar" className="text-primary">Registe-se gratuitamente</Link></p>
        <p className="text-center text-[0.8rem] text-text-muted">Conta de administrador de demonstração: admin@eduweb.com / admin123</p>
      </Card>
    </div>
  );
}
