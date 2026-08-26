import { useMemo, useState } from 'react';
import type { ManagedApartment } from '../../domain/models';
import { useApartments } from '../../app/providers/ApartmentProvider';
import { useAuth } from '../../app/providers/AuthProvider';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import {
  createApartmentId,
  deleteApartment,
  emptyApartment,
  saveApartment,
} from '../../infrastructure/firebase/apartmentRepository';
import { ApartmentEditor } from './ApartmentEditor';
import { AccessPanel } from './AccessPanel';

export function ManagementPage() {
  const { apartments, accessAccounts, canEdit, isAdmin, role } = useApartments();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [working, setWorking] = useState<ManagedApartment | null>(null);
  const [message, setMessage] = useState('');

  const visible = useMemo(
    () => apartments.filter(item => item.apartment.toLowerCase().includes(query.toLowerCase())),
    [apartments, query],
  );

  if (!canEdit) return <Card>This area requires Editor or Admin access.</Card>;

  const open = (apartment?: ManagedApartment) => {
    setWorking(apartment ? structuredClone(apartment) : emptyApartment());
    setMessage('');
  };

  const save = async () => {
    if (!working || !user?.email) return;
    const id = working.id || createApartmentId(working.apartment, apartments.map(item => item.id));
    await saveApartment({ ...working, id }, user.email);
    setWorking(null);
    setMessage('Apartment saved. Static media references were updated; image files remain Git-managed.');
  };

  const remove = async (apartment: ManagedApartment) => {
    if (!confirm(`Delete ${apartment.apartment}? Static image files in GitHub will not be deleted automatically.`)) return;
    await deleteApartment(apartment);
  };

  return (
    <div className="stack-lg">
      <Card>
        <div className="toolbar">
          <div>
            <span className="eyebrow">Data management</span>
            <h2>Apartments & access</h2>
            <p>Role: {role}</p>
          </div>
          <div className="toolbar__actions">
            <input
              className="input"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search apartment"
            />
            <Button onClick={() => open()}>Add apartment</Button>
          </div>
        </div>
        {message && <div className="notice">{message}</div>}
      </Card>

      <div className="table-card">
        <table>
          <thead>
            <tr><th>Apartment</th><th>Wi-Fi</th><th>Check-in</th><th>Agent policy</th><th>Photos</th><th /></tr>
          </thead>
          <tbody>
            {visible.map(apartment => (
              <tr key={apartment.id}>
                <td><strong>{apartment.apartment}</strong></td>
                <td>{apartment.wifiName || '—'}</td>
                <td>{apartment.lockboxCode || apartment.keyAddress || '—'}</td>
                <td>{apartment.airbnbAgentStatus} / {apartment.airbnbStrataStatus}</td>
                <td>{apartment.photos.length}</td>
                <td className="actions">
                  <Button variant="secondary" onClick={() => open(apartment)}>Edit</Button>
                  <Button variant="danger" onClick={() => void remove(apartment)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAdmin && <AccessPanel accounts={accessAccounts} />}

      {working && (
        <ApartmentEditor
          apartment={working}
          onChange={apartment => setWorking(apartment)}
          onCancel={() => setWorking(null)}
          onSave={() => void save()}
        />
      )}
    </div>
  );
}
