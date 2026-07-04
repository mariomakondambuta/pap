import { useAdminUsers, useUpdateUserRole, useDeleteUser } from '../../api/admin';
import { useAuth } from '../../auth/AuthContext';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { formatDateShort } from '../../lib/format';

export function Users() {
  const { user: me } = useAuth();
  const { data, isLoading } = useAdminUsers();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const users = data?.users || [];

  async function toggleRole(id: number, currentRole: 'admin' | 'user') {
    await updateRole.mutateAsync({ id, role: currentRole === 'admin' ? 'user' : 'admin' });
  }

  async function handleDelete(id: number) {
    if (!confirm('Eliminar este utilizador? Esta ação não pode ser revertida.')) return;
    await deleteUser.mutateAsync(id);
  }

  return (
    <div>
      <h3>Utilizadores</h3>
      <div className="overflow-x-auto rounded-md border border-border bg-white">
        <table className="w-full border-collapse text-[0.9rem]">
          <thead>
            <tr>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Nome</th>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Email</th>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Papel</th>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Registado em</th>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td className="px-3.5 py-3" colSpan={5}>A carregar...</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td className="border-t border-border px-3.5 py-3">{u.name}</td>
                  <td className="border-t border-border px-3.5 py-3">{u.email}</td>
                  <td className="border-t border-border px-3.5 py-3"><Badge variant={u.role === 'admin' ? 'success' : 'neutral'}>{u.role === 'admin' ? 'Administrador' : 'Utilizador'}</Badge></td>
                  <td className="border-t border-border px-3.5 py-3">{formatDateShort(u.created_at)}</td>
                  <td className="border-t border-border px-3.5 py-3">
                    {u.id !== me?.id && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => toggleRole(u.id, u.role)}>{u.role === 'admin' ? 'Tornar utilizador' : 'Tornar admin'}</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(u.id)}>Eliminar</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
