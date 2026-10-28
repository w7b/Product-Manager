import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { productsApi, stockApi } from '../../api'
import { PageHeader, Table, Pagination, Badge, Card } from '../../components/ui'
import { inputStyle } from '../../components/ui/form'

export default function StockPage() {
  const navigate = useNavigate()
  const [low, setLow]         = useState([])
  const [data, setData]       = useState(null)
  const [page, setPage]       = useState(0)
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    stockApi.low().then(r => setLow(r.data)).catch(() => toast.error('Erro ao carregar alertas de estoque'))
  }, [])

  useEffect(() => {
    const t = setTimeout(() => load(page), 300)
    return () => clearTimeout(t)
  }, [page, search])

  async function load(p) {
    setLoading(true)
    try {
      const res = await productsApi.list({ page: p, size: 15, sortBy: 'stockQty', direction: 'asc', activeOnly: true, search: search || undefined })
      setData(res.data)
    } catch {
      toast.error('Erro ao carregar estoque')
    } finally {
      setLoading(false)
    }
  }

  const statusBadge = (row) => row.stockQty === 0
    ? <Badge color="red">sem estoque</Badge>
    : row.lowStock ? <Badge color="yellow">abaixo do mínimo</Badge> : <Badge color="green">ok</Badge>

  const columns = [
    { key: 'name', label: 'Produto', render: (v, row) => <span>{v}{row.sku && <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}> · {row.sku}</span>}</span> },
    { key: 'category', label: 'Categoria', render: v => v ? <Badge>{v.name}</Badge> : <Badge color="muted">—</Badge> },
    { key: 'stockQty', label: 'Atual', render: v => <span style={{ fontFamily: 'var(--mono)' }}>{v}</span> },
    { key: 'minStock', label: 'Mínimo', render: v => <span style={{ fontFamily: 'var(--mono)', color: 'var(--muted)' }}>{v}</span> },
    { key: '_status', label: 'Situação', render: (_, row) => statusBadge(row) },
  ]

  return (
    <div>
      <PageHeader title="Estoque" subtitle="Clique em um produto para registrar entrada, saída ou ajuste" />

      {low.length > 0 && (
        <Card style={{ marginBottom: 18, borderColor: 'rgba(234,179,8,0.4)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>⚠ {low.length} produto(s) precisam de reposição</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {low.map(p => (
              <button key={p.id} onClick={() => navigate(`/products/${p.id}`)} style={styles.chip}>
                {p.name} <b style={{ color: p.stockQty === 0 ? 'var(--red)' : 'var(--yellow)' }}>{p.stockQty}/{p.minStock}</b>
              </button>
            ))}
          </div>
        </Card>
      )}

      <input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} placeholder="🔍  Buscar por nome ou SKU..." style={{ ...inputStyle, marginBottom: 16 }} />

      <Table columns={columns} data={data?.content} loading={loading} emptyMessage="Nenhum produto ativo" onRowClick={row => navigate(`/products/${row.id}`)} />
      <Pagination page={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
    </div>
  )
}

const styles = {
  chip: {
    background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px',
    color: 'var(--text)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)',
  },
}
