// Estilos de formulário compartilhados pelas páginas (mesmo visual de Produtos e Categorias).
export const inputStyle = {
  width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '10px 12px', color: 'var(--text)', fontSize: 14,
  fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box',
}
export const inputErrorStyle = { ...inputStyle, borderColor: 'var(--red)' }
export const selectStyle = { ...inputStyle, appearance: 'none', cursor: 'pointer' }
export const labelStyle = {
  display: 'block', fontSize: 11, color: 'var(--muted)', fontWeight: 500,
  letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 5,
}
export const fieldStyle = { marginBottom: 14 }
export const errorStyle = { display: 'block', fontSize: 11, color: 'var(--red)', marginTop: 4 }

export const money = (v) => `R$ ${Number(v ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export const dateTime = (v) => (v ? new Date(v).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—')
export const apiError = (err, fallback) => err.response?.data?.message || fallback

export const ORDER_STATUS = {
  ABERTO: { label: 'Aberto', color: 'accent' },
  FINALIZADO: { label: 'Finalizado', color: 'green' },
  CANCELADO: { label: 'Cancelado', color: 'red' },
}
export const PAYMENT_METHODS = {
  DINHEIRO: 'Dinheiro',
  PIX: 'Pix',
  CARTAO_CREDITO: 'Cartão de crédito',
  CARTAO_DEBITO: 'Cartão de débito',
}
export const MOVEMENT_TYPES = {
  ENTRADA: { label: 'Entrada', color: 'green' },
  SAIDA: { label: 'Saída', color: 'red' },
  AJUSTE: { label: 'Ajuste', color: 'accent' },
}
