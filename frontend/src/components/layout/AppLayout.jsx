import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard',  label: 'Visão Geral',  icon: '◈' },
  { to: '/products',   label: 'Produtos',      icon: '⬡' },
  { to: '/categories', label: 'Categorias',    icon: '◇' },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    toast.success('Até logo!')
    navigate('/login')
  }

  return (
    <div style={styles.root}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <span style={styles.brandDot}>●</span>
          <span style={styles.brandName}>ProductMgr</span>
        </div>

        <div style={styles.storeChip}>
          <span style={styles.storeIcon}>⬡</span>
          <span style={styles.storeName}>{user?.storeName}</span>
        </div>

        <nav style={styles.nav}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.navActive : {}) })}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div style={styles.userDetails}>
              <div style={styles.userName}>{user?.name}</div>
              <div style={styles.userEmail}>{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Sair">⏏</button>
        </div>
      </aside>

      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

const styles = {
  root: { display: 'flex', height: '100vh', overflow: 'hidden' },
  sidebar: {
    width: 220, background: 'var(--bg2)', borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', padding: '20px 12px', flexShrink: 0,
  },
  brand: { display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', marginBottom: 24 },
  brandDot: { color: 'var(--accent)', fontSize: 18 },
  brandName: { fontWeight: 600, fontSize: 15, letterSpacing: '-0.02em' },
  storeChip: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px',
    background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
    marginBottom: 24, overflow: 'hidden',
  },
  storeIcon: { color: 'var(--accent2)', fontSize: 13, flexShrink: 0 },
  storeName: { fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  nav: { display: 'flex', flexDirection: 'column', gap: 2, flex: 1 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
    borderRadius: 8, color: 'var(--muted)', fontSize: 13, fontWeight: 500,
    transition: 'all 0.15s', textDecoration: 'none',
  },
  navActive: { background: 'rgba(108,99,255,0.14)', color: 'var(--accent2)' },
  navIcon: { fontSize: 14, width: 18, textAlign: 'center' },
  sidebarFooter: {
    borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 8,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: 8, flex: 1, overflow: 'hidden' },
  avatar: {
    width: 30, height: 30, borderRadius: '50%',
    background: 'rgba(108,99,255,0.2)', color: 'var(--accent2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 600, flexShrink: 0,
  },
  userDetails: { overflow: 'hidden' },
  userName: { fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userEmail: { fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  logoutBtn: {
    background: 'transparent', border: '1px solid var(--border)', borderRadius: 6,
    padding: '5px 8px', cursor: 'pointer', color: 'var(--muted)', fontSize: 13,
    transition: 'all 0.15s', flexShrink: 0,
  },
  main: { flex: 1, overflow: 'auto', padding: 28, background: 'var(--bg)' },
}
