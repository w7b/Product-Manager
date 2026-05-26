import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onSubmit' })

  async function onSubmit(data) {
    setLoading(true)
    try {
      await registerUser(data)
      toast.success('Conta criada com sucesso!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}><span style={styles.dot}>●</span> ProductMgr</div>
        <h1 style={styles.title}>Criar conta</h1>
        <p style={styles.sub}>Já tem conta? <Link to="/login" style={styles.link}>Entrar</Link></p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          <div style={styles.field}>
            <label style={styles.label}>NOME</label>
            <input
              style={{ ...styles.input, ...(errors.name ? styles.inputError : {}) }}
              placeholder="Seu nome completo"
              {...register('name', {
                required: 'Nome obrigatório',
                minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                maxLength: { value: 100, message: 'Máximo 100 caracteres' },
              })}
            />
            {errors.name && <span style={styles.error}>{errors.name.message}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>EMAIL</label>
            <input
              style={{ ...styles.input, ...(errors.email ? styles.inputError : {}) }}
              type="email"
              placeholder="seu@email.com"
              {...register('email', {
                required: 'Email obrigatório',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
              })}
            />
            {errors.email && <span style={styles.error}>{errors.email.message}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>SENHA</label>
            <input
              style={{ ...styles.input, ...(errors.password ? styles.inputError : {}) }}
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Senha obrigatória',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
              })}
            />
            {errors.password && <span style={styles.error}>{errors.password.message}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>NOME DA LOJA</label>
            <input
              style={{ ...styles.input, ...(errors.storeName ? styles.inputError : {}) }}
              placeholder="Minha Loja"
              {...register('storeName', {
                required: 'Nome da loja obrigatório',
                minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              })}
            />
            {errors.storeName && <span style={styles.error}>{errors.storeName.message}</span>}
          </div>

          <button type="submit" disabled={loading} style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>

        </form>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'radial-gradient(ellipse at 60% 0%, #18103a 0%, var(--bg) 60%)',
    padding: 20,
  },
  card: {
    background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16,
    padding: '36px 32px', width: '100%', maxWidth: 400,
    boxShadow: '0 0 80px rgba(108,99,255,0.07)',
  },
  logo: { fontSize: 18, fontWeight: 600, color: 'var(--accent2)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 },
  dot: { fontSize: 14 },
  title: { fontSize: 22, fontWeight: 600, marginBottom: 6 },
  sub: { fontSize: 13, color: 'var(--muted)', marginBottom: 28 },
  link: { color: 'var(--accent2)', textDecoration: 'none', fontWeight: 500 },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 11, color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 5 },
  input: {
    width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '10px 12px', color: 'var(--text)', fontSize: 14,
    fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box',
  },
  inputError: { borderColor: 'var(--red)' },
  error: { display: 'block', fontSize: 11, color: 'var(--red)', marginTop: 4 },
  btn: {
    width: '100%', background: 'var(--accent)', color: '#fff', border: 'none',
    borderRadius: 8, padding: '11px', fontSize: 14, fontWeight: 500,
    cursor: 'pointer', fontFamily: 'var(--font)', marginTop: 4,
  },
}
