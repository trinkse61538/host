import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useLocale } from '../../app/providers/LocaleProvider';
import { AppIcon } from '../../shared/components/AppIcon';
import './availability.css';

const API_BASE = 'https://airbnb-availability-api.khaitri15.workers.dev';

interface CalendarEvent {
  from: string;
  to: string;
}

interface CalendarListing {
  id: string;
  name: string;
  events: CalendarEvent[];
  error?: string;
}

interface CalendarResponse {
  query: { from: string; to: string; days: number };
  summary: { total: number; errors: number };
  results: CalendarListing[];
  fetchedAt: string;
}

interface AvailabilityItem {
  id: string;
  name: string;
  available: boolean | null;
  conflicts?: CalendarEvent[];
  error?: string;
}

interface AvailabilityResponse {
  query: { checkin: string; checkout: string };
  summary: { total: number; available: number; unavailable: number; errors: number };
  results: AvailabilityItem[];
  fetchedAt: string;
}

function dateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseUtc(value: string) {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function addDays(value: string, amount: number) {
  const date = parseUtc(value);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function buildDates(start: string, count: number) {
  return Array.from({ length: count }, (_, i) => addDays(start, i));
}

function covers(event: CalendarEvent, day: string) {
  return event.from <= day && day < event.to;
}

function defaultStay() {
  const checkin = new Date();
  const checkout = new Date(checkin);
  checkout.setDate(checkout.getDate() + 1);
  return { checkin: dateKey(checkin), checkout: dateKey(checkout) };
}

export function AvailabilityPage() {
  const { locale, text } = useLocale();
  const today = useMemo(() => dateKey(new Date()), []);
  const stay = useMemo(defaultStay, []);
  const [mode, setMode] = useState<'calendar' | 'search'>('calendar');

  const [startDate, setStartDate] = useState(today);
  const [rangeDays, setRangeDays] = useState(14);
  const [calendarData, setCalendarData] = useState<CalendarResponse | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarError, setCalendarError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [checkin, setCheckin] = useState(stay.checkin);
  const [checkout, setCheckout] = useState(stay.checkout);
  const [searchData, setSearchData] = useState<AvailabilityResponse | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const dates = useMemo(() => buildDates(startDate, rangeDays), [startDate, rangeDays]);
  const endExclusive = useMemo(() => addDays(startDate, rangeDays), [startDate, rangeDays]);

  const formatDate = (value: string, short = false) =>
    parseUtc(value).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-AU', short
      ? { day: '2-digit', month: '2-digit', timeZone: 'UTC' }
      : { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setCalendarLoading(true);
      setCalendarError('');
      try {
        const params = new URLSearchParams({ from: startDate, to: endExclusive });
        const response = await fetch(`${API_BASE}/calendar?${params}`, {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const payload = await response.json() as CalendarResponse | { error?: string };
        if (!response.ok) {
          throw new Error('error' in payload && payload.error
            ? payload.error
            : text('Không thể tải lịch tổng quan.', 'Unable to load calendar overview.'));
        }
        if (!cancelled) setCalendarData(payload as CalendarResponse);
      } catch (reason) {
        if (!cancelled) {
          setCalendarError(reason instanceof Error
            ? reason.message
            : text('Không thể kết nối API lịch.', 'Could not connect to the calendar API.'));
        }
      } finally {
        if (!cancelled) setCalendarLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [endExclusive, refreshKey, startDate, text]);

  const runSearch = async (event: FormEvent) => {
    event.preventDefault();
    setSearchError('');
    setSearchData(null);

    if (!checkin || !checkout || checkout <= checkin) {
      setSearchError(text('Ngày trả phòng phải sau ngày nhận phòng.', 'Check-out must be after check-in.'));
      return;
    }

    setSearchLoading(true);
    try {
      const params = new URLSearchParams({ checkin, checkout });
      const response = await fetch(`${API_BASE}/availability?${params}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      const payload = await response.json() as AvailabilityResponse | { error?: string };
      if (!response.ok) {
        throw new Error('error' in payload && payload.error
          ? payload.error
          : text('Không thể kiểm tra căn trống.', 'Unable to check availability.'));
      }
      setSearchData(payload as AvailabilityResponse);
    } catch (reason) {
      setSearchError(reason instanceof Error
        ? reason.message
        : text('Không thể kết nối API.', 'Could not connect to the API.'));
    } finally {
      setSearchLoading(false);
    }
  };

  const available = searchData?.results.filter(item => item.available === true) ?? [];
  const unavailable = searchData?.results.filter(item => item.available === false) ?? [];
  const unknown = searchData?.results.filter(item => item.available === null) ?? [];

  return (
    <div className="availability-page stack-lg">
      <div className="availability-hero card">
        <div>
          <span className="eyebrow">{text('Lịch căn hộ', 'Property calendar')}</span>
          <h1>{text('Availability', 'Availability')}</h1>
          <p>{text(
            'Xem lịch tổng tất cả căn hoặc tìm căn còn trống theo ngày.',
            'Review all listing calendars or search available properties by date.',
          )}</p>
        </div>

        <div className="availability-mode-switch" role="tablist">
          <button
            type="button"
            className={mode === 'calendar' ? 'is-active' : ''}
            onClick={() => setMode('calendar')}
          >
            <AppIcon name="calendar" size={16} />
            {text('Lịch tổng', 'Calendar')}
          </button>
          <button
            type="button"
            className={mode === 'search' ? 'is-active' : ''}
            onClick={() => setMode('search')}
          >
            <AppIcon name="search" size={16} />
            {text('Tìm căn trống', 'Search dates')}
          </button>
        </div>
      </div>

      {mode === 'calendar' ? (
        <>
          <div className="card availability-toolbar">
            <div>
              <span className="eyebrow">{text('Khoảng hiển thị', 'Visible range')}</span>
              <strong>{formatDate(startDate)} → {formatDate(addDays(startDate, rangeDays - 1))}</strong>
            </div>

            <div className="availability-controls">
              <button className="button button--ghost" type="button" onClick={() => setStartDate(today)}>
                {text('Hôm nay', 'Today')}
              </button>
              <button className="button button--ghost availability-square" type="button" onClick={() => setStartDate(addDays(startDate, -rangeDays))}>‹</button>
              <input type="date" value={startDate} onChange={event => setStartDate(event.target.value || today)} />
              <button className="button button--ghost availability-square" type="button" onClick={() => setStartDate(addDays(startDate, rangeDays))}>›</button>
              <div className="availability-range">
                {[7, 14, 30].map(days => (
                  <button key={days} type="button" className={rangeDays === days ? 'is-active' : ''} onClick={() => setRangeDays(days)}>
                    {days}D
                  </button>
                ))}
              </div>
              <button className="button availability-square" type="button" onClick={() => setRefreshKey(value => value + 1)} disabled={calendarLoading}>
                <AppIcon name="loader" size={16} className={calendarLoading ? 'spin' : ''} />
              </button>
            </div>

            <div className="availability-legend">
              <span><i className="free" />{text('Trống', 'Available')}</span>
              <span><i className="busy" />{text('Đã có lịch / chặn', 'Unavailable / blocked')}</span>
              <span><i className="error" />{text('Lỗi lịch', 'Calendar error')}</span>
              {calendarData && <span className="availability-summary">{calendarData.summary.total} {text('căn', 'listings')} · {calendarData.summary.errors} {text('lỗi', 'errors')}</span>}
            </div>

            {calendarError && <div className="availability-alert">{calendarError}</div>}
          </div>

          <div className="availability-calendar card">
            {calendarLoading && !calendarData ? (
              <div className="availability-empty">
                <AppIcon name="loader" size={24} className="spin" />
                {text('Đang tải lịch...', 'Loading calendars...')}
              </div>
            ) : calendarData ? (
              <div className="availability-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th className="listing-col">{text('Căn hộ', 'Listing')}</th>
                      {dates.map(date => {
                        const parsed = parseUtc(date);
                        const weekday = parsed.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-AU', { weekday: 'short', timeZone: 'UTC' });
                        return (
                          <th key={date} className={date === today ? 'is-today' : ''}>
                            <small>{weekday}</small>
                            <strong>{formatDate(date, true)}</strong>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {calendarData.results.map(listing => (
                      <tr key={listing.id}>
                        <th className="listing-col">
                          <strong title={listing.name}>{listing.name}</strong>
                          {listing.error && <small title={listing.error}>{listing.error}</small>}
                        </th>
                        {dates.map(date => {
                          const occupied = listing.events.some(event => covers(event, date));
                          return (
                            <td key={date} className={date === today ? 'is-today' : ''}>
                              <span className={listing.error ? 'calendar-cell error' : occupied ? 'calendar-cell busy' : 'calendar-cell free'}>
                                {listing.error ? '!' : occupied ? 'BUSY' : 'FREE'}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="availability-empty">{text('Chưa có dữ liệu lịch.', 'No calendar data yet.')}</div>
            )}
          </div>

          {calendarData && (
            <div className="availability-fetched">
              {text('Cập nhật lúc', 'Fetched')}: {new Date(calendarData.fetchedAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-AU')}
            </div>
          )}
        </>
      ) : (
        <>
          <form className="card availability-search-form" onSubmit={runSearch}>
            <div>
              <span className="eyebrow">{text('Tìm theo ngày', 'Search by dates')}</span>
              <h2>{text('Kiểm tra căn trống', 'Check availability')}</h2>
            </div>
            <label>
              <span>{text('Nhận phòng', 'Check-in')}</span>
              <input type="date" value={checkin} onChange={event => setCheckin(event.target.value)} />
            </label>
            <label>
              <span>{text('Trả phòng', 'Check-out')}</span>
              <input type="date" min={checkin || undefined} value={checkout} onChange={event => setCheckout(event.target.value)} />
            </label>
            <button className="button" type="submit" disabled={searchLoading}>
              <AppIcon name={searchLoading ? 'loader' : 'search'} size={16} className={searchLoading ? 'spin' : ''} />
              {searchLoading ? text('Đang kiểm tra…', 'Checking…') : text('Kiểm tra', 'Check')}
            </button>
            {searchError && <div className="availability-alert availability-search-error">{searchError}</div>}
          </form>

          {searchData && (
            <>
              <div className="availability-stats">
                <div className="card"><span>{text('Tổng căn', 'Total')}</span><strong>{searchData.summary.total}</strong></div>
                <div className="card good"><span>{text('Còn trống', 'Available')}</span><strong>{searchData.summary.available}</strong></div>
                <div className="card bad"><span>{text('Đã bận', 'Unavailable')}</span><strong>{searchData.summary.unavailable}</strong></div>
                <div className="card warn"><span>{text('Lỗi', 'Errors')}</span><strong>{searchData.summary.errors}</strong></div>
              </div>

              <div className="availability-result-grid">
                <section className="card">
                  <h3>{text('Căn đang trống', 'Available listings')} <span>{available.length}</span></h3>
                  <div className="availability-list">
                    {available.length ? available.map(item => <div key={item.id}>✓ <strong>{item.name}</strong></div>) : <p>{text('Không có căn phù hợp.', 'No available listings.')}</p>}
                  </div>
                </section>

                <section className="card">
                  <h3>{text('Căn đã có lịch', 'Unavailable listings')} <span>{unavailable.length}</span></h3>
                  <div className="availability-list">
                    {unavailable.map(item => (
                      <div key={item.id}>
                        ✕ <strong>{item.name}</strong>
                        {item.conflicts?.length ? <small>{item.conflicts.map(conflict => `${formatDate(conflict.from)} → ${formatDate(conflict.to)}`).join(' · ')}</small> : null}
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {unknown.length > 0 && (
                <section className="card availability-unknown">
                  <h3>{text('Không thể xác minh', 'Unable to verify')}</h3>
                  {unknown.map(item => <p key={item.id}><strong>{item.name}</strong>{item.error ? ` — ${item.error}` : ''}</p>)}
                </section>
              )}

              <div className="availability-fetched">
                {text('Cập nhật lúc', 'Fetched')}: {new Date(searchData.fetchedAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-AU')}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
