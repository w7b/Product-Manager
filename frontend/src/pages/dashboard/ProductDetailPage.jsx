import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { productsApi, categoriesApi, stockApi } from '../../api'
import { PageHeader, Button, Card, Badge, ConfirmDialog, Modal, ModalActions, Table, Pagination } from '../../components/ui'
import { MOVEMENT_TYPES, dateTime, apiError } from '../../components/ui/form'

const inputStyle = {
  width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '10px 12px', color: 'var(--text)', fontSize: 14,
  fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box',
}
const inputErrorStyle = { ...inputStyle, borderColor: 'var(--red)' }
const labelStyle = {
  display: 'block', fontSize: 11, color: 'var(--muted)', fontWeight: 500,
  letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 5,
}
const fieldStyle = { marginBottom: 14 }
const errorStyle = { display: 'block', fontSize: 11, color: 'var(--red)', marginTop: 4 }

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct]       = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [editing, setEditing]       = useState(false)
  const [saving, setSaving]         = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ mode: 'onSubmit' })

  const [history, setHistory]         = useState(null)
  const [historyPage, setHistoryPage] = useState(0)
  const [moveOpen, setMoveOpen]       = useState(false)
  const [moving, setMoving]           = useState(false)
  const moveForm = useForm({ defaultValues: { type: 'ENTRADA', quantity: '', reason: '' } })
  const moveType = moveForm.watch('type')

  useEffect(() => { loadHistory(historyPage) }, [id, historyPage])

  async function loadHistory(p = 0) {
    try {
      const res = await stockApi.history(id, { page: p, size: 8 })
      setHistory(res.data)
    } catch { /* produto inexistente: o load principal já trata */ }
  }

  function formValues(prod) {
    return {
      name: prod.name,
      description: prod.description || '',
      price: prod.price,
      categoryId: prod.category?.id || '',
      sku: prod.sku || '',
      minStock: prod.minStock ?? 0,
      active: prod.active,
    }
  }

  async function onMove(data) {
    setMoving(true)
    try {
      await stockApi.move(id, { type: data.type, quantity: parseInt(data.quantity), reason: data.reason || null })
      const res = await productsApi.get(id)
      setProduct(res.data)
      reset(formValues(res.data))
      setMoveOpen(false)
      moveForm.reset({ type: 'ENTRADA', quantity: '', reason: '' })
      setHistoryPage(0)
      loadHistory(0)
      toast.success('Estoque atualizado!')
    } catch (err) {
      toast.error(apiError(err, 'Erro ao movimentar estoque'))
    } finally {
      setMoving(false)
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, catRes] = await Promise.all([
          productsApi.get(id),
          categoriesApi.list(),
        ])
        setProduct(prodRes.data)
        setCategories(catRes.data)
        reset(formValues(prodRes.data))
      } catch {
        toast.error('Produto não encontrado')
        navigate('/products')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function onSubmit(data) {
    setSaving(true)
    try {
      const res = await productsApi.update(id, {
        name: data.name,
        description: data.description || null,
        price: parseFloat(data.price),
        categoryId: data.categoryId ? parseInt(data.categoryId) : null,
        sku: data.sku || null,
        minStock: data.minStock === '' ? 0 : parseInt(data.minStock),
        active: Boolean(data.active),
      })
      setProduct(res.data)
      setEditing(false)
      toast.success('Produto atualizado!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      await productsApi.delete(id)
      toast.success('Produto excluído')
      navigate('/products')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao excluir')
    }
  }

  if (loading) return <div style={{ color: 'var(--muted)', padding: 20 }}>Carregando...</div>

  return (
    <div>
      <PageHeader
        title={product.name}
        subtitle={`ID #${product.id} · Criado em ${new Date(product.createdAt).toLocaleDateString('pt-BR')}`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={() => navigate('/products')}>← Voltar</Button>
            <Button variant="outline" onClick={() => setMoveOpen(true)}>▥ Movimentar estoque</Button>
            {!editing && <Button variant="outline" onClick={() => setEditing(true)}>✏️ Editar</Button>}
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>🗑️ Excluir</Button>
          </div>
        }
      />

      {editing ? (
        <Card style={{ maxWidth: 520 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Editar produto</h2>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            <div style={fieldStyle}>
              <label style={labelStyle}>NOME *</label>
              <input
                style={errors.name ? inputErrorStyle : inputStyle}
                {...register('name', {
                  required: 'Nome obrigatório',
                  minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                })}
              />
              {errors.name && <span style={errorStyle}>{errors.name.message}</span>}
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>DESCRIÇÃO</label>
              <input style={inputStyle} {...register('description')} />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>PREÇO *</label>
              <input
                style={errors.price ? inputErrorStyle : inputStyle}
                type="number"
                step="0.01"
                min="0.01"
                {...register('price', {
                  required: 'Preço obrigatório',
                  min: { value: 0.01, message: 'Preço deve ser positivo' },
                })}
              />
              {errors.price && <span style={errorStyle}>{errors.price.message}</span>}
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>CATEGORIA</label>
              <select style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }} {...register('categoryId')}>
                <option value="">Sem categoria</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>SKU</label>
                <input style={inputStyle} {...register('sku', { maxLength: { value: 60, message: 'Máximo 60 caracteres' } })} />
              </div>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>ESTOQUE MÍNIMO</label>
                <input style={inputStyle} type="number" min="0" {...register('minStock', { min: { value: 0, message: 'Não pode ser negativo' } })} />
                {errors.minStock && <span style={errorStyle}>{errors.minStock.message}</span>}
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>
              <input type="checkbox" {...register('active')} /> Produto ativo (inativos não podem ser vendidos)
            </label>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <Button variant="ghost" type="button" onClick={() => { setEditing(false); reset() }}>Cancelar</Button>
              <Button type="submit" loading={saving}>Salvar alterações</Button>
            </div>
          </form>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <Card>
            <div style={styles.fieldLabel}>Nome</div>
            <div style={styles.fieldValue}>{product.name}</div>
          </Card>
          <Card>
            <div style={styles.fieldLabel}>Preço</div>
            <div style={{ ...styles.fieldValue, color: 'var(--green)', fontFamily: 'var(--mono)' }}>
              R$ {Number(product.price).toFixed(2)}
            </div>
          </Card>
          <Card>
            <div style={styles.fieldLabel}>Estoque atual</div>
            <div style={{ ...styles.fieldValue, display: 'flex', alignItems: 'center', gap: 8 }}>
              {product.stockQty} un.
              {product.lowStock && <Badge color={product.stockQty === 0 ? 'red' : 'yellow'}>{product.stockQty === 0 ? 'sem estoque' : 'abaixo do mínimo'}</Badge>}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Mínimo: {product.minStock} un.</div>
          </Card>
          <Card>
            <div style={styles.fieldLabel}>SKU · Situação</div>
            <div style={styles.fieldValue}>
              <span style={{ fontFamily: 'var(--mono)' }}>{product.sku || '—'}</span>{' '}
              {product.active ? <Badge color="green">ativo</Badge> : <Badge color="muted">inativo</Badge>}
            </div>
          </Card>
          <Card>
            <div style={styles.fieldLabel}>Categoria</div>
            <div style={styles.fieldValue}>
              {product.category ? <Badge>{product.category.name}</Badge> : <Badge color="muted">Sem categoria</Badge>}
            </div>
          </Card>
          <Card style={{ gridColumn: '1 / -1' }}>
            <div style={styles.fieldLabel}>Descrição</div>
            <div style={{ ...styles.fieldValue, color: product.description ? 'var(--text)' : 'var(--muted)' }}>
              {product.description || 'Sem descrição'}
            </div>
          </Card>
          <Card>
            <div style={styles.fieldLabel}>Criado em</div>
            <div style={styles.fieldValue}>{new Date(product.createdAt).toLocaleString('pt-BR')}</div>
          </Card>
          <Card>
            <div style={styles.fieldLabel}>Atualizado em</div>
            <div style={styles.fieldValue}>{new Date(product.updatedAt).toLocaleString('pt-BR')}</div>
          </Card>
        </div>
      )}

      <h2 style={{ fontSize: 15, fontWeight: 600, margin: '28px 0 12px' }}>Histórico de estoque</h2>
      <Table
        columns={[
          { key: 'createdAt', label: 'Data', render: v => <span style={{ fontSize: 12, color: 'var(--muted)' }}>{dateTime(v)}</span> },
          { key: 'type', label: 'Tipo', render: v => <Badge color={MOVEMENT_TYPES[v].color}>{MOVEMENT_TYPES[v].label}</Badge> },
          { key: 'quantity', label: 'Qtd.', render: (v, row) => <span style={{ fontFamily: 'var(--mono)' }}>{row.type === 'AJUSTE' ? `= ${v}` : `${row.type === 'SAIDA' ? '−' : '+'}${v}`}</span> },
          { key: 'balanceAfter', label: 'Saldo', render: v => <span style={{ fontFamily: 'var(--mono)' }}>{v}</span> },
          { key: 'reason', label: 'Motivo', render: v => v || '—' },
          { key: 'userName', label: 'Usuário' },
        ]}
        data={history?.content}
        loading={!history}
        emptyMessage="Nenhuma movimentação registrada"
      />
      <Pagination page={historyPage} totalPages={history?.totalPages ?? 0} onPageChange={setHistoryPage} />

      <Modal open={moveOpen} onClose={() => setMoveOpen(false)} title="Movimentar estoque" maxWidth={400}>
        <form onSubmit={moveForm.handleSubmit(onMove)} noValidate>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>Estoque atual: <b style={{ color: 'var(--text)' }}>{product.stockQty} un.</b></p>
          <div style={fieldStyle}>
            <label style={labelStyle}>TIPO</label>
            <select style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }} {...moveForm.register('type')}>
              <option value="ENTRADA">Entrada (compra, reposição)</option>
              <option value="SAIDA">Saída (perda, consumo, quebra)</option>
              <option value="AJUSTE">Ajuste (contagem do inventário)</option>
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>{moveType === 'AJUSTE' ? 'QUANTIDADE CONTADA *' : 'QUANTIDADE *'}</label>
            <input
              style={moveForm.formState.errors.quantity ? inputErrorStyle : inputStyle}
              type="number" min="0" step="1"
              {...moveForm.register('quantity', {
                required: 'Quantidade obrigatória',
                min: { value: moveType === 'AJUSTE' ? 0 : 1, message: moveType === 'AJUSTE' ? 'Não pode ser negativa' : 'Deve ser maior que zero' },
              })}
            />
            {moveForm.formState.errors.quantity && <span style={errorStyle}>{moveForm.formState.errors.quantity.message}</span>}
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>MOTIVO</label>
            <input style={inputStyle} placeholder="Ex.: Compra do fornecedor" {...moveForm.register('reason', { maxLength: 255 })} />
          </div>
          <ModalActions>
            <Button variant="ghost" type="button" onClick={() => setMoveOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={moving}>Registrar</Button>
          </ModalActions>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        message={`Excluir o produto "${product.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}

const styles = {
  fieldLabel: { fontSize: 11, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 },
  fieldValue: { fontSize: 15, fontWeight: 500 },
}
