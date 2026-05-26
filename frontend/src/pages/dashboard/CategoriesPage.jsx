import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { categoriesApi } from '../../api'
import { PageHeader, Button, Table, Badge, Modal, ModalActions, ConfirmDialog } from '../../components/ui'

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

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)

  const [modalOpen, setModalOpen]   = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [saving, setSaving]         = useState(false)

  const [confirmOpen, setConfirmOpen]   = useState(false)
  const [deletingId, setDeletingId]     = useState(null)
  const [deletingName, setDeletingName] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ mode: 'onSubmit' })

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await categoriesApi.list()
      setCategories(res.data)
    } catch {
      toast.error('Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditTarget(null)
    reset({ name: '', description: '' })
    setModalOpen(true)
  }

  function openEdit(cat) {
    setEditTarget(cat)
    reset({ name: cat.name, description: cat.description || '' })
    setModalOpen(true)
  }

  function askDelete(cat) {
    setDeletingId(cat.id)
    setDeletingName(cat.name)
    setConfirmOpen(true)
  }

  async function onSubmit(data) {
    setSaving(true)
    const payload = { name: data.name, description: data.description || null }
    try {
      if (editTarget) {
        await categoriesApi.update(editTarget.id, payload)
        toast.success('Categoria atualizada!')
      } else {
        await categoriesApi.create(payload)
        toast.success('Categoria criada!')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setConfirmOpen(false)
    try {
      await categoriesApi.delete(deletingId)
      toast.success('Categoria excluída')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao excluir')
    }
  }

  const columns = [
    { key: 'name', label: 'Nome', render: (v) => <span style={{ fontWeight: 500 }}>{v}</span> },
    {
      key: 'description', label: 'Descrição',
      render: (v) => <span style={{ color: v ? 'var(--text)' : 'var(--muted)', fontSize: 13 }}>{v || '—'}</span>,
    },
    {
      key: 'createdAt', label: 'Criada em',
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
        title="Categorias"
        subtitle={`${categories.length} categoria(s)`}
        action={<Button onClick={openCreate}>+ Nova categoria</Button>}
      />

      <Table
        columns={columns}
        data={categories}
        loading={loading}
        emptyMessage="Nenhuma categoria cadastrada"
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Editar categoria' : 'Nova categoria'} maxWidth={400}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          <div style={fieldStyle}>
            <label style={labelStyle}>NOME *</label>
            <input
              style={errors.name ? inputErrorStyle : inputStyle}
              placeholder="Nome da categoria"
              {...register('name', {
                required: 'Nome obrigatório',
                minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                maxLength: { value: 100, message: 'Máximo 100 caracteres' },
              })}
            />
            {errors.name && <span style={errorStyle}>{errors.name.message}</span>}
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>DESCRIÇÃO</label>
            <input
              style={inputStyle}
              placeholder="Descrição opcional"
              {...register('description', { maxLength: { value: 255, message: 'Máximo 255 caracteres' } })}
            />
            {errors.description && <span style={errorStyle}>{errors.description.message}</span>}
          </div>

          <ModalActions>
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Salvar</Button>
          </ModalActions>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        message={`Excluir a categoria "${deletingName}"?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
