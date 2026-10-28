import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { ordersApi, productsApi } from '../../api'
import { Button, Modal, ModalActions } from '../../components/ui'
import { inputStyle, selectStyle, labelStyle, fieldStyle, money, apiError } from '../../components/ui/form'

/** Criação de pedido e edição dos itens de um pedido ABERTO. */
export default function OrderFormModal({ open, onClose, onSaved, order }) {
  const [products, setProducts] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [items, setItems] = useState([])
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    productsApi.list({ page: 0, size: 100, sortBy: 'name', direction: 'asc', activeOnly: true })
      .then(r => setProducts(r.data.content)).catch(() => toast.error('Erro ao carregar produtos'))
    setCustomerName(order?.customerName || '')
    setItems(order ? order.items.map(i => ({ productId: i.productId, name: i.productName, price: i.unitPrice, quantity: i.quantity })) : [])
    setProductId('')
    setQuantity(1)
  }, [open, order])

  function addItem() {
    const p = products.find(x => String(x.id) === String(productId))
    const qty = parseInt(quantity)
    if (!p || !(qty > 0)) return
    setItems(prev => {
      const existing = prev.find(i => i.productId === p.id)
      if (existing) return prev.map(i => i.productId === p.id ? { ...i, quantity: i.quantity + qty } : i)
      return [...prev, { productId: p.id, name: p.name, price: p.price, quantity: qty }]
    })
    setProductId('')
    setQuantity(1)
  }

  const total = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0)
  const selected = products.find(x => String(x.id) === String(productId))

  async function save() {
    setSaving(true)
    const payload = { customerName: customerName || null, items: items.map(i => ({ productId: i.productId, quantity: i.quantity })) }
    try {
      const res = order ? await ordersApi.update(order.id, payload) : await ordersApi.create(payload)
      toast.success(order ? 'Pedido atualizado!' : `Pedido #${res.data.id} aberto!`)
      onSaved(res.data)
    } catch (err) {
      toast.error(apiError(err, 'Erro ao salvar pedido'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={order ? `Editar pedido #${order.id}` : 'Novo pedido'} maxWidth={560}>
      <div style={fieldStyle}>
        <label style={labelStyle}>CLIENTE / MESA</label>
        <input style={inputStyle} value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Ex.: Mesa 4 ou João" maxLength={120} />
      </div>

      <label style={labelStyle}>ADICIONAR ITEM</label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
        <select style={{ ...selectStyle, flex: 1 }} value={productId} onChange={e => setProductId(e.target.value)}>
          <option value="">Selecione um produto</option>
          {products.map(p => (
            <option key={p.id} value={p.id} disabled={p.stockQty === 0}>
              {p.name} · {money(p.price)} · {p.stockQty} em estoque
            </option>
          ))}
        </select>
        <input style={{ ...inputStyle, width: 80 }} type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} />
        <Button type="button" variant="outline" onClick={addItem} disabled={!selected}>Adicionar</Button>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: 8, marginTop: 12, overflow: 'hidden' }}>
        {items.length === 0 ? (
          <p style={{ padding: 16, fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>Nenhum item adicionado</p>
        ) : items.map(i => (
          <div key={i.productId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
            <span style={{ flex: 1 }}>{i.name}</span>
            <input style={{ ...inputStyle, width: 64, padding: '5px 8px' }} type="number" min="1" value={i.quantity}
              onChange={e => setItems(prev => prev.map(x => x.productId === i.productId ? { ...x, quantity: Math.max(1, parseInt(e.target.value) || 1) } : x))} />
            <span style={{ width: 90, textAlign: 'right', fontFamily: 'var(--mono)' }}>{money(Number(i.price) * i.quantity)}</span>
            <button type="button" onClick={() => setItems(prev => prev.filter(x => x.productId !== i.productId))}
              style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer' }} title="Remover">✕</button>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', fontWeight: 600 }}>
          <span>Total</span><span style={{ fontFamily: 'var(--mono)', color: 'var(--green)' }}>{money(total)}</span>
        </div>
      </div>

      <ModalActions>
        <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
        <Button onClick={save} loading={saving} disabled={items.length === 0}>{order ? 'Salvar itens' : 'Abrir pedido'}</Button>
      </ModalActions>
    </Modal>
  )
}
