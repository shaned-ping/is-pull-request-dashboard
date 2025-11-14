interface FilterControlProps {
  days: number | null
  onChange: (days: number | null) => void
}

export default function FilterControl({ days, onChange }: FilterControlProps) {
  const getDisplayValue = () => {
    if (days === null) return 'all'
    return days.toString()
  }

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    if (value === 'all') {
      onChange(null)
    } else {
      onChange(parseInt(value, 10))
    }
  }

  return (
    <div className="filter-control">
      <label htmlFor="days-filter">Filter:</label>
      <select id="days-filter" value={getDisplayValue()} onChange={handleChange}>
        <option value="7">Last 7 days</option>
        <option value="14">Last 14 days</option>
        <option value="30">Last 30 days</option>
        <option value="all">All time</option>
      </select>
    </div>
  )
}
