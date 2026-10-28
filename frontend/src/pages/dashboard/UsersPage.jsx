import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { usersApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { PageHeader, Button, Table, Badge, Modal, ModalActions } from '../../components/ui'
import { inputStyle, inputErrorStyle, selectStyle, labelStyle, fieldStyle, errorStyle, apiError } from '../../components/ui/form'

/** Equipe da loja: somente ADMIN acessa (rota protegida e endpoints com @PreAuthorize). */
export default function UsersPage() {
  const { user: me } = useAuth()
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [saving, setSaving]     = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ mode: 'onSubmit' })

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      setUsers((await usersApi.list()).data)
    } catch {
      toast.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditTarget(null)
    reset({ name: '', email: '', password: '', role: 'USER', active: true })
    setModalOpen(true)
  }

  function openEdit(u) {
    setEditTarget(u)
    reset({ name: u.name, email: u.email, password: '', role: u.role, active: u.active })
    setModalOpen(true)
  }

  async function onSubmit(data) {
    setSaving(true)
    try {
      if (editTarget) {
        await usersApi.update(editTarget.id, { name: data.name, role: data.role, active: Boolean(data.active), password: data.password || null })
        toast.success('Usuário atualizado!')
      } else {
        await usersApi.create({ name: data.name, email: data.email, password: data.password, role: data.role })
        toast.success('Usuário cadastrado!')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(apiError(err, 'Erro ao salvar usuário'))
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'name', label: 'Nome', render: (v, row) => <span style={{ fontWeight: 500 }}>{v}{row.id === me?.id && <span style={{ color: 'var(--muted)', fontWeight: 400 }}> (você)</span>}</span> },
    { key: 'email', label: 'E-mail' },
    { key: 'role', label: 'Papel', render: v => v === 'ADMIN' ? <Badge>Administrador</Badge> : <Badge color="muted">Usuário</Badge> },
    { key: 'active', label: 'Situação', render: v => v ? <Badge color="green">ativo</Badge> : <Badge color="red">desativado</Badge> },
    { key: 'createdAt', label: 'Desde', render: v => <span style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(v).toLocaleDateString('pt-BR')}</span> },
    { key: '_actions', label: '', render: (_, row) => <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); openEdit(row) }}>✏️ Editar</Button> },
  ]

  return (
    <div>
      <PageHeader
        title="Usuários"
        subtitle="Equipe da loja. Usuários operam pedidos, produtos e estoque; administradores também gerenciam a equipe e cancelam vendas finalizadas."
        action={<Button onClick={openCreate}>+ Novo usuário</Button>}
      />

      <Table columns={columns} data={users} loading={loading} emptyMessage="Nenhum usuário" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Editar usuário' : 'Novo usuário'} maxWidth={420}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={fieldStyle}>
            <label style={labelStyle}>NOME *</label>
            <input style={errors.name ? inputErrorStyle : inputStyle} {...register('name', { required: 'Nome obrigatório', minLength: { value: 2, message: 'Mínimo 2 caracteres' } })} />
            {errors.name && <span style={errorStyle}>{errors.name.message}</span>}
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>E-MAIL *</label>
            <input style={errors.email ? inputErrorStyle : inputStyle} type="email" disabled={Boolean(editTarget)}
              {...register('email', { required: 'E-mail obrigatório', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'E-mail inválido' } })} />
            {errors.email && <span style={errorStyle}>{errors.email.message}</span>}
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>{editTarget ? 'NOVA SENHA (opcional)' : 'SENHA *'}</label>
            <input style={errors.password ? inputErrorStyle : inputStyle} type="password"
              {...register('password', { required: editTarget ? false : 'Senha obrigatória', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })} />
            {errors.password && <span style={errorStyle}>{errors.password.message}</span>}
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>PAPEL</label>
            <select style={selectStyle} {...register('role')}>
              <option value="USER">Usuário</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          {editTarget && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)' }}>
              <input type="checkbox" {...register('active')} /> Conta ativa (desativada não consegue entrar)
            </label>
          )}
          <ModalActions>
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Salvar</Button>
          </ModalActions>
        </form>
      </Modal>
    </div>
  )
}
