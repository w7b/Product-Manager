import { useState } from 'react'

// ─── Button ───────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', loading, style: extraStyle, ...props }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 6, border: 'none', cursor: props.disabled || loading ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--font)', fontWeight: 500, transition: 'opacity 0.15s',
    opacity: props.disabled || loading ? 0.55 : 1, whiteSpace: 'nowrap',
  }
  const sizes = {
    sm: { padding: '5px 12px', fontSize: 12, borderRadius: 6 },
    md: { padding: '8px 18px', fontSize: 13, borderRadius: 8 },
    lg: { padding: '11px 24px', fontSize: 14, borderRadius: 10 },
  }
  const variants = {
    primary:  { background: 'var(--accent)', color: '#fff' },
    danger:   { background: 'var(--red)',    color: '#fff' },
    ghost:    { background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)' },
    outline:  { background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent2)' },
  }
  return (
    <button style={{ ...base, ...sizes[size], ...variants[variant], ...extraStyle }} disabled={loading || props.disabled} {...props}>
      {loading && <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'currentColor', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
      {children}
    </button>
  )
}

// ─── Input ────────────────────────────────────────────────
export function Input({ label, error, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</label>}
      <input
        style={{
          width: '100%', background: 'var(--bg3)', border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
          borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 14,
          fontFamily: 'var(--font)', outline: 'none', transition: 'border 0.2s',
        }}
        onFocus={e => { if (!error) e.target.style.borderColor = 'var(--accent)' }}
        onBlur={e => { if (!error) e.target.style.borderColor = 'var(--border)' }}
        {...props}
      />
      {error && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{error}</p>}
    </div>
  )
}

// ─── Select ───────────────────────────────────────────────
export function Select({ label, error, children, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</label>}
      <select
        style={{
          width: '100%', background: 'var(--bg3)', border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
          borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 14,
          fontFamily: 'var(--font)', outline: 'none', appearance: 'none', cursor: 'pointer',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a7a88' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
        }}
        {...props}
      >
        {children}
      </select>
      {error && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{error}</p>}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, maxWidth = 440 }) {
  if (!open) return null
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 28, width: '100%', maxWidth,
        animation: 'modalIn 0.18s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── ModalActions ─────────────────────────────────────────
export function ModalActions({ children }) {
  return <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>{children}</div>
}

// ─── Badge ────────────────────────────────────────────────
export function Badge({ children, color = 'accent' }) {
  const colors = {
    accent:  { bg: 'rgba(108,99,255,0.15)', text: 'var(--accent2)' },
    green:   { bg: 'rgba(34,197,94,0.15)',  text: 'var(--green)'   },
    red:     { bg: 'rgba(239,68,68,0.15)',  text: 'var(--red)'     },
    muted:   { bg: 'var(--bg3)',            text: 'var(--muted)'   },
  }
  const c = colors[color] || colors.muted
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
      fontSize: 11, fontWeight: 500, fontFamily: 'var(--mono)',
      background: c.bg, color: c.text,
    }}>
      {children}
    </span>
  )
}

// ─── Card ─────────────────────────────────────────────────
export function Card({ children, style: extra }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '20px 22px', ...extra,
    }}>
      {children}
    </div>
  )
}

// ─── PageHeader ───────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ─── Table ────────────────────────────────────────────────
export function Table({ columns, data, loading, emptyMessage = 'Nenhum item encontrado', onRowClick }) {
  if (loading) return (
    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
      <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 10px' }} />
      Carregando...
    </div>
  )
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {columns.map(col => (
              <th key={col.key} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!data?.length ? (
            <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}>{emptyMessage}</td></tr>
          ) : data.map((row, i) => (
            <tr key={i} onClick={() => onRowClick?.(row)} style={{ borderBottom: '1px solid var(--border)', cursor: onRowClick ? 'pointer' : 'default', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {columns.map(col => (
                <td key={col.key} style={{ padding: '12px 16px', fontSize: 13 }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes modalIn { from { transform: scale(0.96); opacity: 0; } to { transform: none; opacity: 1; } }`}</style>
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────
export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 14 }}>
      <button onClick={() => onPageChange(page - 1)} disabled={page === 0} style={pageBtnStyle(page === 0)}>← Anterior</button>
      <span style={{ fontSize: 12, color: 'var(--muted)', padding: '0 6px' }}>Página {page + 1} de {totalPages}</span>
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1} style={pageBtnStyle(page >= totalPages - 1)}>Próxima →</button>
    </div>
  )
}
function pageBtnStyle(disabled) {
  return {
    background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6,
    padding: '5px 11px', fontSize: 12, color: disabled ? 'var(--border2)' : 'var(--muted)',
    cursor: disabled ? 'default' : 'pointer', fontFamily: 'var(--font)',
  }
}

// ─── ConfirmDialog ────────────────────────────────────────
export function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  return (
    <Modal open={open} onClose={onCancel} title="Confirmar exclusão" maxWidth={380}>
      <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{message}</p>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Esta ação não pode ser desfeita.</p>
      <ModalActions>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button variant="danger" onClick={onConfirm}>Excluir</Button>
      </ModalActions>
    </Modal>
  )
}

// ─── StatCard ─────────────────────────────────────────────
export function StatCard({ label, value, icon, color = 'var(--accent2)' }) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <span style={{ fontSize: 20, color }}>{icon}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 600 }}>{value}</div>
    </Card>
  )
}
