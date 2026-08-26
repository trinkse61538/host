import { useState } from 'react';
import type { AccessAccount, AccessRole } from '../../domain/models';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { removeAccessAccount, saveAccessAccount } from '../../infrastructure/firebase/apartmentRepository';

export function AccessPanel({ accounts }: { accounts: AccessAccount[] }) {
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<AccessRole>('editor');

  const save = async () => {
    await saveAccessAccount(newEmail, newRole);
    setNewEmail('');
  };

  return (
    <Card>
      <span className="eyebrow">User access</span>
      <h3>Authorized accounts</h3>
      <div className="toolbar__actions">
        <input
          className="input"
          value={newEmail}
          onChange={event => setNewEmail(event.target.value)}
          placeholder="email@example.com"
        />
        <select className="input" value={newRole} onChange={event => setNewRole(event.target.value as AccessRole)}>
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
        <Button onClick={() => void save()}>Add / update</Button>
      </div>
      <div className="selection-list">
        {accounts.map(account => (
          <div key={account.email} className="selection-row">
            <span><strong>{account.email}</strong><small>{account.role}</small></span>
            <Button variant="danger" onClick={() => void removeAccessAccount(account.email)}>Remove</Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
