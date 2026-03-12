'use client'

interface Column {
  key: string
  header: string
  align?: 'left' | 'right' | 'center'
  highlight?: boolean
}

interface Row {
  [key: string]: string | React.ReactNode
  _highlight?: boolean
}

interface FinanceTableProps {
  columns: Column[]
  rows: Row[]
  caption?: string
}

export default function FinanceTable({ columns, rows, caption }: FinanceTableProps) {
  return (
    <div style={{
      width: '100%',
      borderRadius: 12,
      border: '1px solid rgba(232,184,75,0.15)',
      overflow: 'hidden',
      marginBottom: '1.5rem',
      background: '#0D1420',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'inherit',
          fontSize: 13,
        }}>
          {/* Header */}
          <thead>
            <tr style={{
              background: 'rgba(232,184,75,0.08)',
              borderBottom: '1px solid rgba(232,184,75,0.2)',
            }}>
              {columns.map((col) => (
                <th key={col.key} style={{
                  padding: '12px 16px',
                  textAlign: col.align || 'left',
                  fontFamily: 'monospace',
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: 'rgba(232,184,75,0.8)',
                  whiteSpace: 'nowrap',
                }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{
                background: row._highlight
                  ? 'rgba(45,212,191,0.06)'
                  : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                borderBottom: i < rows.length - 1
                  ? '1px solid rgba(255,255,255,0.05)'
                  : 'none',
              }}>
                {columns.map((col) => (
                  <td key={col.key} style={{
                    padding: '12px 16px',
                    textAlign: col.align || 'left',
                    color: col.highlight
                      ? '#E8B84B'
                      : 'rgba(255,255,255,0.7)',
                    fontWeight: col.highlight ? 600 : 400,
                    fontFamily: col.align === 'right' ? 'monospace' : 'inherit',
                    whiteSpace: col.align === 'right' ? 'nowrap' : 'normal',
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}>
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {caption && (
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          fontSize: 10,
          color: 'rgba(255,255,255,0.25)',
          fontFamily: 'monospace',
          letterSpacing: 0.5,
        }}>
          {caption}
        </div>
      )}
    </div>
  )
}