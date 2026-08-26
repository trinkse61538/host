import { useMemo, useState } from 'react';
import { useApartments } from '../../app/providers/ApartmentProvider';
import { useLocale } from '../../app/providers/LocaleProvider';
import { Card } from '../../shared/components/Card';
import { CopyButton } from '../../shared/components/CopyButton';

export function WifiPage() {
  const { apartments } = useApartments();
  const { text } = useLocale();
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState('');
  const records = useMemo(() => apartments.filter(apartment => apartment.wifiName || apartment.password || apartment.wifiNote), [apartments]);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return records;
    return records.filter(apartment => apartment.apartment.toLowerCase().includes(needle) || apartment.wifiName.toLowerCase().includes(needle));
  }, [query, records]);
  const active = activeId ? records.find(record => record.id === activeId) || null : null;

  return <div className="guide-layout">
    <Card className="guide-sidebar">
      <div className="stack">
        <span className="eyebrow">Guest connectivity</span>
        <h2>{text('Wi-Fi căn hộ', 'Apartment Wi-Fi')}</h2>
        <input className="input" value={query} onChange={event => setQuery(event.target.value)} placeholder={text('Tìm căn hộ hoặc Wi-Fi', 'Search apartment or Wi-Fi')} />
        <select className="input" value={activeId} onChange={event => setActiveId(event.target.value)}>
          <option value="">{text('— Chọn căn hộ —', '— Select an apartment —')}</option>
          {visible.map(record => <option key={record.id} value={record.id}>{record.apartment}</option>)}
        </select>
      </div>
      <div className="sidebar-list">
        {visible.map(record => <button key={record.id} className={`sidebar-item ${activeId === record.id ? 'sidebar-item--active' : ''}`} onClick={() => setActiveId(record.id)}><span><strong>{record.apartment}</strong><small>{record.wifiName || text('Chưa có tên Wi-Fi', 'No Wi-Fi name')}</small></span></button>)}
      </div>
    </Card>

    {!active ? <Card className="empty-state empty-state--wifi"><div className="empty-state__icon">W</div><h2>{text('Chọn một căn hộ để xem Wi-Fi', 'Select an apartment to view Wi-Fi')}</h2><p>{text('Không hiển thị căn mặc định. Hãy tìm kiếm hoặc chọn căn hộ.', 'No apartment opens by default. Search or select one first.')}</p></Card> : <WifiCard record={active} />}
  </div>;
}

function WifiCard({ record }: { record: ReturnType<typeof useApartments>['apartments'][number] }) {
  const full = `Apartment: ${record.apartment}\nWi-Fi: ${record.wifiName || 'Not available'}\nPassword: ${record.password || 'Not available'}${record.wifiNote ? `\nNote: ${record.wifiNote}` : ''}`;
  return <Card className="feature-card feature-card--wifi"><div className="card-heading"><div><span className="eyebrow">Selected apartment</span><h2>{record.apartment}</h2></div><CopyButton value={full} label="Copy full Wi-Fi message" /></div><div className="detail-grid"><div className="credential"><span>Wi-Fi name</span><strong>{record.wifiName || 'Not available'}</strong><CopyButton value={record.wifiName} /></div><div className="credential"><span>Password</span><strong>{record.password || 'Not available'}</strong><CopyButton value={record.password} /></div></div>{record.wifiNote && <div className="notice notice--warn">{record.wifiNote}</div>}</Card>;
}
