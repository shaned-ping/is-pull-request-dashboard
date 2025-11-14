import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FilterControl from './FilterControl'

describe('FilterControl', () => {
  it('should render with label and select dropdown', () => {
    const mockOnChange = vi.fn()
    render(<FilterControl days={14} onChange={mockOnChange} />)

    expect(screen.getByLabelText('Filter:')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('should display all filter options', () => {
    const mockOnChange = vi.fn()
    render(<FilterControl days={14} onChange={mockOnChange} />)

    const select = screen.getByRole('combobox')
    const options = Array.from(select.querySelectorAll('option'))

    expect(options).toHaveLength(4)
    expect(options[0]).toHaveTextContent('Last 7 days')
    expect(options[1]).toHaveTextContent('Last 14 days')
    expect(options[2]).toHaveTextContent('Last 30 days')
    expect(options[3]).toHaveTextContent('All time')
  })

  it('should select 7 days option when days is 7', () => {
    const mockOnChange = vi.fn()
    render(<FilterControl days={7} onChange={mockOnChange} />)

    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select.value).toBe('7')
  })

  it('should select 14 days option when days is 14', () => {
    const mockOnChange = vi.fn()
    render(<FilterControl days={14} onChange={mockOnChange} />)

    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select.value).toBe('14')
  })

  it('should select 30 days option when days is 30', () => {
    const mockOnChange = vi.fn()
    render(<FilterControl days={30} onChange={mockOnChange} />)

    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select.value).toBe('30')
  })

  it('should select all time option when days is null', () => {
    const mockOnChange = vi.fn()
    render(<FilterControl days={null} onChange={mockOnChange} />)

    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select.value).toBe('all')
  })

  it('should call onChange with number when selecting a days option', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()
    render(<FilterControl days={14} onChange={mockOnChange} />)

    const select = screen.getByRole('combobox')
    await user.selectOptions(select, '7')

    expect(mockOnChange).toHaveBeenCalledWith(7)
    expect(mockOnChange).toHaveBeenCalledTimes(1)
  })

  it('should call onChange with null when selecting all time', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()
    render(<FilterControl days={14} onChange={mockOnChange} />)

    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'all')

    expect(mockOnChange).toHaveBeenCalledWith(null)
    expect(mockOnChange).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple selection changes', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()
    render(<FilterControl days={14} onChange={mockOnChange} />)

    const select = screen.getByRole('combobox')

    await user.selectOptions(select, '7')
    expect(mockOnChange).toHaveBeenCalledWith(7)

    await user.selectOptions(select, '30')
    expect(mockOnChange).toHaveBeenCalledWith(30)

    await user.selectOptions(select, 'all')
    expect(mockOnChange).toHaveBeenCalledWith(null)

    expect(mockOnChange).toHaveBeenCalledTimes(3)
  })

  it('should have accessible label association', () => {
    const mockOnChange = vi.fn()
    render(<FilterControl days={14} onChange={mockOnChange} />)

    const label = screen.getByText('Filter:')
    const select = screen.getByRole('combobox')

    expect(label).toHaveAttribute('for', 'days-filter')
    expect(select).toHaveAttribute('id', 'days-filter')
  })
})
