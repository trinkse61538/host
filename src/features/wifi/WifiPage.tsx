import { useMemo, useState } from 'react';
import { useApartments } from '../../app/providers/ApartmentProvider';
import { Card } from '../../shared/components/Card';
import { CopyButton } from '../../shared/components/CopyButton';

export function WifiPage() {
  const { apartments } = useApartments();
  const [query, setQuery] = useState('');
  const records = useMemo(() => apartments.filter(apartment => apartment.wifiName || apartment.password || apartment.wifiNote).filter(apartment => apartment.apartment.toLowerCase().includes(query.toLowerCase()) || apartment.wifiName.toLowerCase().includes(query.toLowerCase())), [apartments, query]);
  return <div className="stack-lg"><Card><div className="toolbar"><div><span className="eyebrow">Guest connectivity</span><h2>Apartment Wi-Fi</h2><p>{records.length} network profiles</p></div><input className="input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search apartment or Wi-Fi" /></div></Card><div className="card-grid">{records.map(record => {
    const full = `Apartment: ${record.apartment}\nWi-Fi: ${record.wifiName || 'Not available'}\nPassword: ${record.password || 'Not available'}${record.wifiNote ? `\nNote: ${record.wifiNote}` : ''}`;
    return <Card key={record.id}><span className="eyebrow">Apartment</span><h3>{record.apartment}</h3><div className="credential"><span>Wi-Fi name</span><strong>{record.wifiName || 'Not available'}</strong><CopyButton value={record.wifiName} /></div><div className="credential"><span>Password</span><strong>{record.password || 'Not available'}</strong><CopyButton value={record.password} /></div>{record.wifiNote && <div className="notice notice--warn">{record.wifiNote}</div>}<CopyButton value={full} label="Copy full Wi-Fi message" /></Card>;
  })}</div></div>;
}
