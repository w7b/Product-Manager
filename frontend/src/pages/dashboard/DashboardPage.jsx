import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { reportsApi, stockApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { PageHeader, StatCard, Card, Badge, Button } from '../../components/ui'
import { money, inputStyle } from '../../components/ui/form'

const isoDate = (d) => d.toISOString().slice(0, 10)

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [daily, setDaily]     = useState([])
  const [top, setTop]         = useState([])
  const [low, setLow]         = useState([])
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState(() => { const d = new Date(); d.setDate(1); return isoDate(d) })
  const [to, setTo]     = useState(() => isoDate(new Date()))

  useEffect(() => {
    async function load() {
      try {
        const [s, d, t, l] = await Promise.all([
          reportsApi.summary(), reportsApi.salesByDay(14), reportsApi.topProducts(30, 5), stockApi.low(),
        ])
        setSummary(s.data); setDaily(d.data); setTop(t.data); setLow(l.data)
      } catch {
        toast.error('Erro ao carregar o painel')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function exportCsv() {
    try {
      const res = await reportsApi.salesCsv(from, to)
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `vendas_${from}_${to}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Erro ao exportar vendas')
    }
  }

  const greet = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  const maxRevenue = Math.max(1, ...daily.map(d => Number(d.revenue)))

  return (
    <div>
      <PageHeader
        title={`${greet()}, ${user?.name?.split(' ')[0]} 👋`}
        subtitle={`Loja: ${user?.storeName}`}
        action={<Button onClick={() => navigate('/orders')}>+ Novo pedido</Button>}
      />

      {loading ? (
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>Carregando...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
            <StatCard label="Faturamento hoje" value={money(summary.revenueToday)} hint={`${summary.ordersToday} pedido(s) finalizado(s)`} icon="◈" color="var(--green)" />
            <StatCard label="Faturamento do mês" value={money(summary.revenueMonth)} hint={`${summary.ordersMonth} pedido(s)`} icon="▤" color="var(--green)" />
            <StatCard label="Ticket médio (mês)" value={money(summary.averageTicketMonth)} icon="◇" color="var(--accent2)" />
            <StatCard label="Pedidos abertos" value={summary.openOrders} icon="▥" color="var(--accent2)" />
            <StatCard label="Estoque baixo" value={summary.lowStockProducts} hint={`de ${summary.activeProducts} produto(s) ativo(s)`} icon="⚠" color={summary.lowStockProducts ? 'var(--yellow)' : 'var(--muted)'} />
          </div>

          <Card style={{ marginBottom: 20 }}>
            <h2 style={styles.h2}>Vendas dos últimos 14 dias</h2>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 160, paddingTop: 10 }}>
              {daily.map(d => (
                <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                  title={`${new Date(d.date + 'T12:00').toLocaleDateString('pt-BR')}: ${money(d.revenue)} em ${d.orders} pedido(s)`}>
                  <div style={{ width: '100%', maxWidth: 36, height: `${(Number(d.revenue) / maxRevenue) * 120}px`, minHeight: 2, background: Number(d.revenue) ? 'var(--accent)' : 'var(--border)', borderRadius: 4 }} />
                  <span style={{ fontSize: 10, color: 'var(--muted)' }}>{d.date.slice(8)}/{d.date.slice(5, 7)}</span>
                </div>
              ))}
            </div>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 20 }}>
            <Card>
              <h2 style={styles.h2}>Mais vendidos (30 dias)</h2>
              {top.length === 0 ? <p style={styles.empty}>Nenhuma venda finalizada ainda.</p> : (
                <table style={styles.table}>
                  <thead><tr>{['Produto', 'Qtd.', 'Faturamento'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {top.map(p => (
                      <tr key={p.productId} onClick={() => navigate(`/products/${p.productId}`)} style={{ cursor: 'pointer' }}>
                        <td style={styles.td}>{p.name}</td>
                        <td style={{ ...styles.td, fontFamily: 'var(--mono)' }}>{p.quantity}</td>
                        <td style={{ ...styles.td, fontFamily: 'var(--mono)', color: 'var(--green)' }}>{money(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>

            <Card>
              <h2 style={styles.h2}>Precisam de reposição</h2>
              {low.length === 0 ? <p style={styles.empty}>Todos os produtos estão acima do mínimo.</p> : (
                <table style={styles.table}>
                  <thead><tr>{['Produto', 'Atual', 'Mínimo'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {low.slice(0, 6).map(p => (
                      <tr key={p.id} onClick={() => navigate(`/products/${p.id}`)} style={{ cursor: 'pointer' }}>
                        <td style={styles.td}>{p.name}</td>
                        <td style={styles.td}><Badge color={p.stockQty === 0 ? 'red' : 'yellow'}>{p.stockQty}</Badge></td>
                        <td style={{ ...styles.td, fontFamily: 'var(--mono)', color: 'var(--muted)' }}>{p.minStock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </div>

          <Card>
            <h2 style={styles.h2}>Exportar vendas (CSV)</h2>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ ...inputStyle, width: 170 }} />
              <span style={{ color: 'var(--muted)' }}>até</span>
              <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ ...inputStyle, width: 170 }} />
              <Button variant="outline" onClick={exportCsv} disabled={!from || !to || from > to}>⤓ Baixar CSV</Button>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

const styles = {
  h2: { fontSize: 14, fontWeight: 600, marginBottom: 14 },
  empty: { color: 'var(--muted)', fontSize: 13, padding: '16px 0' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '6px 8px', textAlign: 'left', fontSize: 11, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' },
  td: { padding: '8px', fontSize: 13, borderBottom: '1px solid var(--border)' },
}
