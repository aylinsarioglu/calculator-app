import { useEffect, useState } from 'react'
import './Calculator.css'

function formatResult(value: number) {
  if (!Number.isFinite(value)) return 'Error'
  const asString = value.toString()
  return asString.length > 12 ? value.toPrecision(12).replace(/\.?0+$/, '') : asString
}

const calculate = (a: number, b: number, op: string) => {
  switch (op) {
    case '+': return a + b
    case '-': return a - b
    case '*': return a * b
    case '/': return b !== 0 ? a / b : 0
    default: return b
  }
}

export default function Calculator() {
  const [display, setDisplay] = useState<string>('0')
  const [firstValue, setFirstValue] = useState<number | null>(null)
  const [operator, setOperator] = useState<string | null>(null)
  const [awaitingNextValue, setAwaitingNextValue] = useState<boolean>(false)
  const [history, setHistory] = useState<string[]>([])

  type ButtonKey =
    | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
    | '+' | '-' | '*' | '/'
    | '=' | 'C' | '.' | ','

  function handleClick(key: ButtonKey) {
    // Clear
    if (key === 'C') {
      setDisplay('0')
      setOperator(null)
      setFirstValue(null)
      setAwaitingNextValue(false)
      return
    }

    // Decimal (. or , from keyboard normalized to '.')
    if (key === '.' || key === ',') {
      if (awaitingNextValue) {
        setDisplay('0.')
        setAwaitingNextValue(false)
        return
      }
      setDisplay(prev => {
        if (prev === 'Error') return '0.'
        return prev.includes('.') ? prev : prev + '.'
      })
      return
    }

    // Equals
    if (key === '=') {
      if (operator === null || firstValue === null) return
      const inputValue = parseFloat(display)
      const result = calculate(firstValue, inputValue, operator)
      setDisplay(formatResult(result))
      const expr = `${formatResult(firstValue)} ${operator} ${display} = ${formatResult(result)}`
      setHistory(prev => [expr, ...prev])
      setFirstValue(null)
      setOperator(null)
      setAwaitingNextValue(true)
      return
    }

    // Operator
    if (key === '+' || key === '-' || key === '*' || key === '/') {
      const inputValue = parseFloat(display)
      if (firstValue === null) {
        setFirstValue(inputValue)
      } else if (operator) {
        const result = calculate(firstValue, inputValue, operator)
        setFirstValue(result)
        setDisplay(formatResult(result))
      }
      setOperator(key)
      setAwaitingNextValue(true)
      return
    }

    // Digit
    if (awaitingNextValue) {
      setDisplay(key)
      setAwaitingNextValue(false)
      return
    }
    setDisplay(prev => (prev === '0' || prev === 'Error' ? key : prev + key))
  }

  const digits = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.']
  const operators: Array<'+' | '-' | '*' | '/'> = ['+', '-', '*', '/']

  const previousCalculationLine =
    firstValue !== null && operator !== null
      ? `${formatResult(firstValue)} ${operator}`
      : history[0] ?? null

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const key = e.key
      // Normalize Enter to '='
      if (key === 'Enter') {
        e.preventDefault()
        handleClick('=')
        return
      }
      // Clear on Escape or 'c'/'C'
      if (key === 'Escape' || key === 'c' || key === 'C') {
        e.preventDefault()
        handleClick('C')
        return
      }
      // Operators
      if (key === '+' || key === '-' || key === '*' || key === '/') {
        e.preventDefault()
        handleClick(key)
        return
      }
      // Decimal (. or comma on TR/EU keyboards)
      if (key === '.' || key === ',') {
        e.preventDefault()
        handleClick(key as ButtonKey)
        return
      }
      // Digits
      if (key >= '0' && key <= '9') {
        e.preventDefault()
        handleClick(key as ButtonKey)
        return
      }
      // '=' key
      if (key === '=') {
        e.preventDefault()
        handleClick('=')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [operator, firstValue, display, awaitingNextValue])

  return (
    <div className="calc-container">
      <div className="calculator">
        <div className="display" role="status" aria-live="polite">
          <div
            className="display-previous-calculation"
            aria-hidden={previousCalculationLine === null}
          >
            {previousCalculationLine ?? '\u00a0'}
          </div>
          <div className="display-current">{display}</div>
        </div>
        <div className="keys">
          <div className="controls">
            <div className="keypad">
              {digits.map(d => (
                <button key={d} className="btn" onClick={() => handleClick(d as ButtonKey)} aria-label={`Digit ${d}`}>
                  {d}
                </button>
              ))}
              <button className="btn btn-clear" onClick={() => handleClick('C')} aria-label="Clear">C</button>
            </div>
            <div className="operators">
              {operators.map(op => (
                <button
                  key={op}
                  className={`btn btn-op${operator === op ? ' active' : ''}`}
                  onClick={() => handleClick(op as ButtonKey)}
                  aria-pressed={operator === op}
                  aria-label={`Operator ${op}`}
                >
                  {op}
                </button>
              ))}
            </div>
            <button className="btn btn-equals" onClick={() => handleClick('=')} aria-label="Equals">=</button>
          </div>
          <aside className="history-panel" aria-label="Calculation history">
            <h3 className="history-title">History</h3>
            <div className="history">
              <ul className="history-list">
                {history.map((h, idx) => (
                  <li key={idx}>{h}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

