import { useState } from 'react';
import { catalogItems } from '../data/mockData';

type TabFilter = 'all' | 'service' | 'part';

const categoryColors: Record<string, string> = {
  'Mantenimiento': '#059669',
  'Diagnóstico': '#7C3AED',
  'Frenos': '#DC2626',
  'Suspensión': '#D97706',
  'Motor': '#E55A2B',
  'Lubricantes': '#0891B2',
  'Filtros': '#64748B',
  'Encendido': '#F59E0B',
  'Eléctrico': '#2563EB',
};

export default function Catalog() {
  const [tab, setTab] = useState<TabFilter>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'code'>('code');

  const filtered = catalogItems
    .filter(i => tab === 'all' || i.type === tab)
    .filter(i => !search ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.code.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price') return b.unitPrice - a.unitPrice;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return a.code.localeCompare(b.code);
    });

  const services = catalogItems.filter(i => i.type === 'service');
  const parts = catalogItems.filter(i => i.type === 'part');

  return (
    <div style={{ padding: '32px 36px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>Catálogo</h1>
          <p style={{ color: '#64748B', fontSize: '0.82rem', margin: '4px 0 0' }}>
            {services.length} servicios · {parts.length} repuestos y materiales
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, código, categoría…"
              style={{ padding: '7px 12px 7px 32px', borderRadius: 7, border: '1px solid #E2E8F0', fontSize: '0.8rem', width: 270, color: '#334155' }}
            />
            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <button style={{ background: '#E55A2B', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 16px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo Ítem
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Total ítems', value: catalogItems.length, color: '#0F172A' },
          { label: 'Servicios', value: services.length, color: '#059669' },
          { label: 'Repuestos', value: parts.length, color: '#2563EB' },
          { label: 'Precio promedio', value: `$${Math.round(catalogItems.reduce((s, i) => s + i.unitPrice, 0) / catalogItems.length / 1000)}K`, color: '#E55A2B' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 8, padding: '12px 18px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.3rem', fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs + sort */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 8, padding: 3, gap: 2 }}>
          {([['all', 'Todo'], ['service', 'Servicios'], ['part', 'Repuestos']] as [TabFilter, string][]).map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)} style={{
              padding: '5px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: tab === v ? '#fff' : 'transparent',
              color: tab === v ? '#0F172A' : '#64748B',
              fontWeight: tab === v ? 600 : 400, fontSize: '0.82rem',
              boxShadow: tab === v ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}>{l}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Ordenar por:</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as 'name' | 'price' | 'code')} style={{
            padding: '5px 10px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: '0.78rem', color: '#334155', background: '#fff',
          }}>
            <option value="code">Código</option>
            <option value="name">Nombre</option>
            <option value="price">Precio</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['Código', 'Tipo', 'Nombre', 'Descripción', 'Categoría', 'Unidad', 'Precio Unit.', ''].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.68rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => {
              const catColor = categoryColors[item.category] || '#64748B';
              return (
                <tr key={item.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                  <td style={{ padding: '11px 16px', fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>{item.code}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 3,
                      background: item.type === 'part' ? '#EFF6FF' : '#F0FDF4',
                      color: item.type === 'part' ? '#2563EB' : '#059669',
                      fontFamily: "'DM Mono', monospace",
                    }}>{item.type === 'part' ? 'REP' : 'SVC'}</span>
                  </td>
                  <td style={{ padding: '11px 16px', fontWeight: 600, fontSize: '0.83rem', color: '#0F172A', maxWidth: 220 }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: '0.78rem', color: '#64748B', maxWidth: 240 }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</div>
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: catColor + '15', color: catColor, whiteSpace: 'nowrap' }}>
                      {item.category}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: '0.75rem', color: '#64748B', fontFamily: "'DM Mono', monospace" }}>{item.unit}</td>
                  <td style={{ padding: '11px 16px', fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: '0.88rem', color: '#0F172A', whiteSpace: 'nowrap' }}>
                    ${item.unitPrice.toLocaleString('es-CL')}
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <button style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 5, padding: '4px 10px', fontSize: '0.72rem', color: '#64748B', cursor: 'pointer' }}>
                      Editar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: '0.82rem' }}>
            No se encontraron ítems para "{search}"
          </div>
        )}
        <div style={{ padding: '10px 16px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{filtered.length} ítem{filtered.length !== 1 ? 's' : ''} mostrado{filtered.length !== 1 ? 's' : ''}</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: '#64748B' }}>
            Precio rango: ${Math.min(...filtered.map(i => i.unitPrice)).toLocaleString('es-CL')} – ${Math.max(...filtered.map(i => i.unitPrice)).toLocaleString('es-CL')}
          </span>
        </div>
      </div>
    </div>
  );
}
