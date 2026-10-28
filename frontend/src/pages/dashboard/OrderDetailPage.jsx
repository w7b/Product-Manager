import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ordersApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { PageHeader, Button, Card, Badge, Table, Modal, ModalActions } from '../../components/ui'
import { ORDER_STATUS, PAYMENT_METHODS, money, dateTime, selectStyle, labelStyle, apiError } from '../../components/ui/form'
import OrderFormModal from './OrderFormModal'

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [order, setOrder] = useState(null)
  const [editOpen, setEditOpen] = useState(false)
  const [finalizeOpen, setFinalizeOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [payment, setPayment] = useState('PIX')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    ordersApi.get(id).then(r => setOrder(r.data)).catch(() => { toast.error('Pedido não encontrado'); navigate('/orders') })
  }, [id])

  async function run(action, success) {
    setBusy(true)
    try {
      const res = await action()
      setOrder(res.data)
      toast.success(success)
      return true
    } catch (err) {
      toast.error(apiError(err, 'Não foi possível concluir a operação'))
      return false
    } finally {
      setBusy(false)
    }
  }

  if (!order) return <div style={{ color: 'var(--muted)', padding: 20 }}>Carregando...</div>

  const open = order.status === 'ABERTO'
  const canCancel = open || (order.status === 'FINALIZADO' && isAdmin)

  return (
    <div>
      <PageHeader
        title={`Pedido #${order.id}`}
        subtitle={`${order.customerName || 'Sem cliente informado'} · atendido por ${order.userName}`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={() => navigate('/orders')}>← Voltar</Button>
            {open && <Button variant="outline" onClick={() => setEditOpen(true)}>✏️ Editar itens</Button>}
            {canCancel && <Button variant="danger" onClick={() => setCancelOpen(true)}>Cancelar pedido</Button>}
            {open && <Button onClick={() => setFinalizeOpen(true)}>✓ Finalizar</Button>}
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        <Card><div style={styles.label}>Status</div><Badge color={ORDER_STATUS[order.status].color}>{ORDER_STATUS[order.status].label}</Badge></Card>
        <Card><div style={styles.label}>Total</div><div style={{ ...styles.value, color: 'var(--green)', fontFamily: 'var(--mono)' }}>{money(order.total)}</div></Card>
        <Card><div style={styles.label}>Pagamento</div><div style={styles.value}>{order.paymentMethod ? PAYMENT_METHODS[order.paymentMethod] : '—'}</div></Card>
        <Card><div style={styles.label}>Aberto em</div><div style={styles.value}>{dateTime(order.createdAt)}</div></Card>
        <Card><div style={styles.label}>Finalizado em</div><div style={styles.value}>{dateTime(order.finishedAt)}</div></Card>
      </div>

      <Table
        columns={[
          { key: 'productName', label: 'Produto' },
          { key: 'quantity', label: 'Qtd.', render: v => <span style={{ fontFamily: 'var(--mono)' }}>{v}</span> },
          { key: 'unitPrice', label: 'Preço unit.', render: v => <span style={{ fontFamily: 'var(--mono)' }}>{money(v)}</span> },
          { key: 'subtotal', label: 'Subtotal', render: v => <span style={{ fontFamily: 'var(--mono)' }}>{money(v)}</span> },
        ]}
        data={order.items}
        onRowClick={row => navigate(`/products/${row.productId}`)}
      />
      {open && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>O estoque só é baixado quando o pedido é finalizado.</p>}

      <OrderFormModal open={editOpen} order={order} onClose={() => setEditOpen(false)} onSaved={o => { setOrder(o); setEditOpen(false) }} />

      <Modal open={finalizeOpen} onClose={() => setFinalizeOpen(false)} title={`Finalizar pedido #${order.id}`} maxWidth={380}>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>Total: <b style={{ color: 'var(--text)' }}>{money(order.total)}</b>. A baixa no estoque é feita agora.</p>
        <label style={labelStyle}>FORMA DE PAGAMENTO</label>
        <select style={selectStyle} value={payment} onChange={e => setPayment(e.target.value)}>
          {Object.entries(PAYMENT_METHODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <ModalActions>
          <Button variant="ghost" onClick={() => setFinalizeOpen(false)}>Voltar</Button>
          <Button loading={busy} onClick={async () => { if (await run(() => ordersApi.finalize(order.id, payment), 'Pedido finalizado!')) setFinalizeOpen(false) }}>Confirmar</Button>
        </ModalActions>
      </Modal>

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title={`Cancelar pedido #${order.id}?`} maxWidth={380}>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
          {order.status === 'FINALIZADO'
            ? 'O pedido já foi finalizado: os itens voltarão para o estoque.'
            : 'O pedido ainda está aberto: nada foi baixado do estoque.'}
        </p>
        <ModalActions>
          <Button variant="ghost" onClick={() => setCancelOpen(false)}>Voltar</Button>
          <Button variant="danger" loading={busy} onClick={async () => { if (await run(() => ordersApi.cancel(order.id), 'Pedido cancelado')) setCancelOpen(false) }}>Cancelar pedido</Button>
        </ModalActions>
      </Modal>
    </div>
  )
}

const styles = {
  label: { fontSize: 11, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 },
  value: { fontSize: 15, fontWeight: 500 },
}
