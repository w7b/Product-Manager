import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { productsApi, categoriesApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { PageHeader, StatCard, Card, Badge } from '../../components/ui'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, catRes] = await Promise.all([
          productsApi.list({ page: 0, size: 5, sortBy: 'createdAt', direction: 'desc' }),
          categoriesApi.list(),
        ])
        setStats({
          totalProducts: prodRes.data.totalElements,
          totalCategories: catRes.data.length,
        })
        setRecent(prodRes.data.content)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const greet = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div>
      <PageHeader
        title={`${greet()}, ${user?.name?.split(' ')[0]} 👋`}
        subtitle={`Loja: ${user?.storeName}`}
      />

      {loading ? (
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>Carregando...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
            <StatCard label="Total de Produtos"   value={stats?.totalProducts   ?? '—'} icon="⬡" color="var(--accent2)" />
            <StatCard label="Total de Categorias" value={stats?.totalCategories ?? '—'} icon="◇" color="var(--green)"   />
          </div>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600 }}>Produtos recentes</h2>
              <button onClick={() => navigate('/products')} style={styles.link}>Ver todos →</button>
            </div>

            {recent.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                Nenhum produto cadastrado ainda.{' '}
                <button onClick={() => navigate('/products')} style={styles.link}>Criar produto →</button>
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Nome', 'Preço', 'Categoria'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map(p => (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/products/${p.id}`)}
                      style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '11px 12px', fontSize: 13 }}>{p.name}</td>
                      <td style={{ padding: '11px 12px', fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--green)' }}>
                        R$ {Number(p.price).toFixed(2)}
                      </td>
                      <td style={{ padding: '11px 12px' }}>
                        {p.category
                          ? <Badge>{p.category.name}</Badge>
                          : <Badge color="muted">Sem categoria</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </>
      )}
    </div>
  )
}

const styles = {
  link: { background: 'none', border: 'none', color: 'var(--accent2)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 500 },
}
