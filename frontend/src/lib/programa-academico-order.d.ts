export function moveOrderedItems<T extends { id?: number; orden?: number }>(items: T[], activeId: number, direction: 'up' | 'down'): T[]
