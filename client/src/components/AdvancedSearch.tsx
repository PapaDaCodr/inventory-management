'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Button,
  Chip,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  Divider,
  IconButton,
  Collapse,
  Card,
  CardContent,
} from '@mui/material'
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Save,
  History,
  Eraser,
} from 'lucide-react'

interface SearchFilter {
  field: string
  operator: string
  value: any
  label?: string
}

interface SavedSearch {
  id: string
  name: string
  filters: SearchFilter[]
  createdAt: string
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilter[], searchTerm: string) => void
  searchFields: Array<{
    key: string
    label: string
    type: 'text' | 'number' | 'date' | 'select' | 'boolean'
    options?: Array<{ value: any; label: string }>
  }>
  placeholder?: string
  className?: string
}

export default function AdvancedSearch({
  onSearch,
  searchFields,
  placeholder = "Search...",
  className
}: AdvancedSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<SearchFilter[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [saveSearchDialog, setSaveSearchDialog] = useState(false)
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [searchName, setSearchName] = useState('')

  // Load saved searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedSearches')
    if (saved) {
      setSavedSearches(JSON.parse(saved))
    }
  }, [])

  const handleSearch = () => {
    onSearch(filters, searchTerm)
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  const addFilter = () => {
    const newFilter: SearchFilter = {
      field: searchFields[0]?.key || '',
      operator: 'equals',
      value: '',
    }
    setFilters([...filters, newFilter])
  }

  const updateFilter = (index: number, updates: Partial<SearchFilter>) => {
    const newFilters = [...filters]
    newFilters[index] = { ...newFilters[index], ...updates }
    setFilters(newFilters)
  }

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index))
  }

  const clearAllFilters = () => {
    setFilters([])
    setSearchTerm('')
    onSearch([], '')
  }

  const saveSearch = () => {
    if (!searchName.trim()) return

    const newSavedSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchName,
      filters: [...filters],
      createdAt: new Date().toISOString(),
    }

    const updatedSavedSearches = [...savedSearches, newSavedSearch]
    setSavedSearches(updatedSavedSearches)
    localStorage.setItem('savedSearches', JSON.stringify(updatedSavedSearches))
    
    setSearchName('')
    setSaveSearchDialog(false)
  }

  const loadSavedSearch = (savedSearch: SavedSearch) => {
    setFilters(savedSearch.filters)
    onSearch(savedSearch.filters, searchTerm)
  }

  const deleteSavedSearch = (id: string) => {
    const updatedSavedSearches = savedSearches.filter(s => s.id !== id)
    setSavedSearches(updatedSavedSearches)
    localStorage.setItem('savedSearches', JSON.stringify(updatedSavedSearches))
  }

  const getOperatorOptions = (fieldType: string) => {
    switch (fieldType) {
      case 'text':
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'equals', label: 'Equals' },
          { value: 'starts_with', label: 'Starts with' },
          { value: 'ends_with', label: 'Ends with' },
        ]
      case 'number':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'greater_than', label: 'Greater than' },
          { value: 'less_than', label: 'Less than' },
          { value: 'between', label: 'Between' },
        ]
      case 'date':
        return [
          { value: 'equals', label: 'On date' },
          { value: 'after', label: 'After' },
          { value: 'before', label: 'Before' },
          { value: 'between', label: 'Between' },
        ]
      case 'select':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'in', label: 'In list' },
        ]
      case 'boolean':
        return [
          { value: 'equals', label: 'Is' },
        ]
      default:
        return [{ value: 'equals', label: 'Equals' }]
    }
  }

  const renderFilterValue = (filter: SearchFilter, index: number) => {
    const field = searchFields.find(f => f.key === filter.field)
    if (!field) return null

    switch (field.type) {
      case 'text':
        return (
          <TextField
            size="small"
            value={filter.value}
            onChange={(e) => updateFilter(index, { value: e.target.value })}
            placeholder="Enter value..."
            sx={{ minWidth: 150 }}
          />
        )
      case 'number':
        return (
          <TextField
            size="small"
            type="number"
            value={filter.value}
            onChange={(e) => updateFilter(index, { value: e.target.value })}
            placeholder="Enter number..."
            sx={{ minWidth: 150 }}
          />
        )
      case 'date':
        return (
          <TextField
            size="small"
            type="date"
            value={filter.value}
            onChange={(e) => updateFilter(index, { value: e.target.value })}
            sx={{ minWidth: 150 }}
          />
        )
      case 'select':
        return (
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={filter.value}
              onChange={(e) => updateFilter(index, { value: e.target.value })}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      case 'boolean':
        return (
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={filter.value}
              onChange={(e) => updateFilter(index, { value: e.target.value })}
            >
              <MenuItem value={'true'}>True</MenuItem>
              <MenuItem value={'false'}>False</MenuItem>
            </Select>
          </FormControl>
        )
      default:
        return null
    }
  }

  const activeFiltersCount = filters.filter(f => f.value !== '').length

  return (
    <Box className={className}>
      {/* Main Search Bar */}
      <Box display="flex" gap={2} alignItems="center" mb={2}>
        <TextField
          fullWidth
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: <Search size={20} className="mr-2 text-gray-400" />,
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          startIcon={<Search />}
        >
          Search
        </Button>
        <Button
          variant="outlined"
          onClick={() => setShowAdvanced(!showAdvanced)}
          startIcon={<Filter />}
          endIcon={showAdvanced ? <ChevronUp /> : <ChevronDown />}
        >
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </Button>
      </Box>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          {filters
            .filter(f => f.value !== '')
            .map((filter, index) => {
              const field = searchFields.find(f => f.key === filter.field)
              return (
                <Chip
                  key={index}
                  label={`${field?.label}: ${filter.value}`}
                  onDelete={() => removeFilter(filters.indexOf(filter))}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )
            })}
          <Button
            size="small"
            onClick={clearAllFilters}
            startIcon={<Eraser />}
            color="error"
          >
            Clear All
          </Button>
        </Box>
      )}

      {/* Advanced Search Panel */}
      <Collapse in={showAdvanced}>
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
              <Typography variant="h6">Advanced Search</Typography>
              <Box display="flex" gap={1}>
                <Button
                  size="small"
                  onClick={() => setSaveSearchDialog(true)}
                  startIcon={<Save />}
                  disabled={filters.length === 0}
                >
                  Save Search
                </Button>
                <Button
                  size="small"
                  onClick={addFilter}
                  startIcon={<Filter />}
                >
                  Add Filter
                </Button>
              </Box>
            </Box>

            {/* Filters */}
            {filters.map((filter, index) => {
              const field = searchFields.find(f => f.key === filter.field)
              return (
                <Box key={index} display="flex" gap={2} alignItems="center" mb={2}>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Field</InputLabel>
                    <Select
                      value={filter.field}
                      onChange={(e) => updateFilter(index, { field: e.target.value, value: '' })}
                      label="Field"
                    >
                      {searchFields.map((field) => (
                        <MenuItem key={field.key} value={field.key}>
                          {field.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Operator</InputLabel>
                    <Select
                      value={filter.operator}
                      onChange={(e) => updateFilter(index, { operator: e.target.value })}
                      label="Operator"
                    >
                      {getOperatorOptions(field?.type || 'text').map((op) => (
                        <MenuItem key={op.value} value={op.value}>
                          {op.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {renderFilterValue(filter, index)}

                  <IconButton
                    size="small"
                    onClick={() => removeFilter(index)}
                    color="error"
                  >
                    <X size={16} />
                  </IconButton>
                </Box>
              )
            })}

            {filters.length === 0 && (
              <Typography variant="body2" color="textSecondary" textAlign="center" py={2}>
                No filters added. Click "Add Filter" to create advanced search criteria.
              </Typography>
            )}

            {/* Saved Searches */}
            {savedSearches.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  <History size={16} className="inline mr-1" />
                  Saved Searches
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {savedSearches.map((savedSearch) => (
                    <Chip
                      key={savedSearch.id}
                      label={savedSearch.name}
                      onClick={() => loadSavedSearch(savedSearch)}
                      onDelete={() => deleteSavedSearch(savedSearch.id)}
                      size="small"
                      variant="outlined"
                      color="secondary"
                    />
                  ))}
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Collapse>

      {/* Save Search Dialog */}
      <Dialog open={saveSearchDialog} onClose={() => setSaveSearchDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Search</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Search Name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Enter a name for this search..."
            sx={{ mt: 1 }}
          />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            This will save your current filters for quick access later.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveSearchDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={saveSearch}
            disabled={!searchName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
