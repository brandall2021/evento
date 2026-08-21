function moveOrderedItems(items, activeId, direction) {
  const ordered = [...items].sort((left, right) => (left.orden ?? 0) - (right.orden ?? 0))
  const index = ordered.findIndex((item) => item.id === activeId)
  const swapIndex = direction === 'up' ? index - 1 : index + 1

  if (index < 0 || swapIndex < 0 || swapIndex >= ordered.length) {
    return ordered
  }

  const current = ordered[index]
  const swap = ordered[swapIndex]
  const currentOrden = current.orden ?? index + 1
  const swapOrden = swap.orden ?? swapIndex + 1

  ordered[index] = { ...current, orden: swapOrden }
  ordered[swapIndex] = { ...swap, orden: currentOrden }

  return ordered.sort((left, right) => (left.orden ?? 0) - (right.orden ?? 0))
}

module.exports = { moveOrderedItems }
