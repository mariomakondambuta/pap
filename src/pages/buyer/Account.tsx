import { useMe } from '../../api/auth';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/Card';
import { Spinner } from '../../components/Spinner';
import { formatDate } from '../../lib/format';

export function Account() {
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useMe(isAuthenticated);
  const me = data?.user;

  return (
    <div>
      <Card className="max-w-[520px]">
        <h3>Os meus dados</h3>
        {isLoading || !me ? (
          <Spinner />
        ) : (
          <>
            <div className="mb-4"><label className="mb-1.5 block text-[0.88rem] font-semibold">Nome</label><p className="mb-0">{me.name}</p></div>
            <div className="mb-4"><label className="mb-1.5 block text-[0.88rem] font-semibold">Email</label><p className="mb-0">{me.email}</p></div>
            <div><label className="mb-1.5 block text-[0.88rem] font-semibold">Conta criada em</label><p className="mb-0">{formatDate(me.created_at)}</p></div>
          </>
        )}
      </Card>
    </div>
  );
}
