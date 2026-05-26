import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { productsApi, categoriesApi } from '../../api'
import { PageHeader, Button, Card, Badge, ConfirmDialog } from '../../components/ui'

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

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, catRes] = await Promise.all([
          productsApi.get(id),
          categoriesApi.list(),
        ])
        setProduct(prodRes.data)
        setCategories(catRes.data)
        reset({
          name: prodRes.data.name,
          description: prodRes.data.description || '',
          price: prodRes.data.price,
          categoryId: prodRes.data.category?.id || '',
        })
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
