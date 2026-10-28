import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ordersApi } from '../../api'
import { PageHeader, Button, Table, Pagination, Badge } from '../../components/ui'
import { ORDER_STATUS, PAYMENT_METHODS, money, dateTime, inputStyle } from '../../components/ui/form'
import OrderFormModal from './OrderFormModal'

export default function OrdersPage() {
  const navigate = useNavigate()
  const [data, setData]       = useState(null)
  const [page, setPage]       = useState(0)
  const [status, setStatus]   = useState('')
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => { load(page) }, [page, status])

  async function load(p) {
    setLoading(true)
    try {
      const res = await ordersApi.list({ page: p, size: 10, status: status || undefined })
      setData(res.data)
    } catch {
      toast.error('Erro ao carregar pedidos')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'id', label: 'Nº', render: v => <span style={{ fontFamily: 'var(--mono)' }}>#{v}</span> },
    { key: 'customerName', label: 'Cliente', render: v => v || <span style={{ color: 'var(--muted)' }}>—</span> },
    { key: 'status', label: 'Status', render: v => <Badge color={ORDER_STATUS[v].color}>{ORDER_STATUS[v].label}</Badge> },
    { key: 'paymentMethod', label: 'Pagamento', render: v => v ? PAYMENT_METHODS[v] : '—' },
    { key: 'total', label: 'Total', render: v => <span style={{ fontFamily: 'var(--mono)', color: 'var(--green)' }}>{money(v)}</span> },
    { key: 'userName', label: 'Atendente' },
    { key: 'createdAt', label: 'Aberto em', render: v => <span style={{ fontSize: 12, color: 'var(--muted)' }}>{dateTime(v)}</span> },
  ]

  return (
    <div>
      <PageHeader
        title="Pedidos"
        subtitle={data ? `${data.totalElements} pedido(s)` : ''}
        action={<Button onClick={() => setFormOpen(true)}>+ Novo pedido</Button>}
      />

      <select value={status} onChange={e => { setStatus(e.target.value); setPage(0) }}
        style={{ ...inputStyle, width: 220, marginBottom: 16, appearance: 'none', cursor: 'pointer' }}>
        <option value="">Todos os status</option>
        {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
      </select>

      <Table columns={columns} data={data?.content} loading={loading} emptyMessage="Nenhum pedido encontrado" onRowClick={row => navigate(`/orders/${row.id}`)} />
      <Pagination page={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />

      <OrderFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={order => { setFormOpen(false); navigate(`/orders/${order.id}`) }}
      />
    </div>
  )
}
