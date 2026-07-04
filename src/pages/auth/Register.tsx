import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerRequest } from '../../api/auth';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/Card';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { inputClasses, labelClasses } from '../../components/formControls';

export function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await registerRequest(name.trim(), email.trim(), password);
      login(token, user);
      navigate('/painel');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.');
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1180px] px-6">
      <Card className="mx-auto my-16 max-w-[440px] p-10">
        <h2 className="text-center">Criar a sua conta</h2>
        <p className="text-center">Grátis e demora menos de um minuto.</p>
        <Alert variant="error">{error}</Alert>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={labelClasses} htmlFor="name">Nome completo</label>
            <input id="name" type="text" required autoComplete="name" placeholder="O seu nome" className={inputClasses()} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className={labelClasses} htmlFor="email">Email</label>
            <input id="email" type="email" required autoComplete="email" placeholder="voce@exemplo.com" className={inputClasses()} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className={labelClasses} htmlFor="password">Password</label>
            <input id="password" type="password" required minLength={6} autoComplete="new-password" placeholder="Mínimo 6 caracteres" className={inputClasses()} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" block disabled={loading}>{loading ? 'A criar conta...' : 'Criar conta'}</Button>
        </form>
        <p className="mt-4 text-center text-[0.95rem]">Já tem conta? <Link to="/login" className="text-primary">Entrar</Link></p>
      </Card>
    </div>
  );
}
