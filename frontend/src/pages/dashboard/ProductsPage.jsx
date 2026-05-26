import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { productsApi, categoriesApi } from '../../api'
import { PageHeader, Button, Table, Pagination, Badge, Modal, ModalActions, ConfirmDialog } from '../../components/ui'

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

export default function ProductsPage() {
  const navigate = useNavigate()

  const [data, setData]               = useState(null)
  const [page, setPage]               = useState(0)
  const [search, setSearch]           = useState('')
  const [listLoading, setListLoading] = useState(true)
  const [categories, setCategories]   = useState([])

  const [modalOpen, setModalOpen]   = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [saving, setSaving]         = useState(false)

  const [confirmOpen, setConfirmOpen]   = useState(false)
  const [deletingId, setDeletingId]     = useState(null)
  const [deletingName, setDeletingName] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ mode: 'onSubmit' })

  useEffect(() => {
    const t = setTimeout(() => { setPage(0); loadProducts(0, search) }, 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => { loadProducts(page, search) }, [page])

  useEffect(() => {
    categoriesApi.list().then(r => setCategories(r.data)).catch(() => {})
  }, [])

  async function loadProducts(p = page, s = search) {
    setListLoading(true)
    try {
      const res = await productsApi.list({ page: p, size: 10, sortBy: 'createdAt', direction: 'desc', search: s || undefined })
      setData(res.data)
    } catch {
      toast.error('Erro ao carregar produtos')
    } finally {
      setListLoading(false)
    }
  }

  function openCreate() {
    setEditTarget(null)
    reset({ name: '', description: '', price: '', categoryId: '' })
    setModalOpen(true)
  }

  function openEdit(product) {
    setEditTarget(product)
    reset({
      name: product.name,
      description: product.description || '',
      price: product.price,
      categoryId: product.category?.id || '',
    })
    setModalOpen(true)
  }

  function askDelete(product) {
    setDeletingId(product.id)
    setDeletingName(product.name)
    setConfirmOpen(true)
  }

  async function onSubmit(formData) {
    setSaving(true)
    const payload = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
    }
    try {
      if (editTarget) {
        await productsApi.update(editTarget.id, payload)
        toast.success('Produto atualizado!')
      } else {
        await productsApi.create(payload)
        toast.success('Produto criado!')
      }
      setModalOpen(false)
      loadProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setConfirmOpen(false)
    try {
      await productsApi.delete(deletingId)
      toast.success('Produto excluído')
      loadProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao excluir')
    }
  }

  const columns = [
    { key: 'name', label: 'Nome' },
    {
      key: 'price', label: 'Preço',
      render: (v) => <span style={{ fontFamily: 'var(--mono)', color: 'var(--green)' }}>R$ {Number(v).toFixed(2)}</span>,
    },
    {
      key: 'category', label: 'Categoria',
      render: (v) => v ? <Badge>{v.name}</Badge> : <Badge color="muted">—</Badge>,
    },
    {
      key: 'createdAt', label: 'Criado em',
      render: (v) => <span style={{ color: 'var(--muted)', fontSize: 12 }}>{new Date(v).toLocaleDateString('pt-BR')}</span>,
    },
    {
      key: '_actions', label: '',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
          <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>✏️ Editar</Button>
          <Button size="sm" variant="ghost" style={{ color: 'var(--red)', borderColor: 'transparent' }} onClick={() => askDelete(row)}>🗑️</Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Produtos"
        subtitle={data ? `${data.totalElements} produto(s)` : ''}
        action={<Button onClick={openCreate}>+ Novo produto</Button>}
      />

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="🔍  Buscar por nome..."
        style={{ ...inputStyle, marginBottom: 16 }}
      />

      <Table
        columns={columns}
        data={data?.content}
        loading={listLoading}
        emptyMessage="Nenhum produto encontrado"
        onRowClick={row => navigate(`/products/${row.id}`)}
      />

      <Pagination page={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Editar produto' : 'Novo produto'}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          <div style={fieldStyle}>
            <label style={labelStyle}>NOME *</label>
            <input
              style={errors.name ? inputErrorStyle : inputStyle}
              placeholder="Nome do produto"
              {...register('name', {
                required: 'Nome obrigatório',
                minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                maxLength: { value: 150, message: 'Máximo 150 caracteres' },
              })}
            />
            {errors.name && <span style={errorStyle}>{errors.name.message}</span>}
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>DESCRIÇÃO</label>
            <input
              style={inputStyle}
              placeholder="Descrição opcional"
              {...register('description', { maxLength: { value: 2000, message: 'Máximo 2000 caracteres' } })}
            />
            {errors.description && <span style={errorStyle}>{errors.description.message}</span>}
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>PREÇO *</label>
            <input
              style={errors.price ? inputErrorStyle : inputStyle}
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              {...register('price', {
                required: 'Preço obrigatório',
                min: { value: 0.01, message: 'Preço deve ser maior que zero' },
              })}
            />
            {errors.price && <span style={errorStyle}>{errors.price.message}</span>}
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>CATEGORIA</label>
            <select
              style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
              {...register('categoryId')}
            >
              <option value="">Sem categoria</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <ModalActions>
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Salvar</Button>
          </ModalActions>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        message={`Excluir o produto "${deletingName}"?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
