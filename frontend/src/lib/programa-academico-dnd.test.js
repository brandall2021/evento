const test = require('node:test')
const assert = require('node:assert/strict')

const { describeProgramDragMove, getProgramDragTargets, moveSessionBetweenBlocks } = require('./programa-academico-dnd')

test('getProgramDragTargets identifies the dragged item and its parent', () => {
  const targets = getProgramDragTargets({
    days: [
      { id: 1, bloques: [{ id: 11, sesiones: [{ id: 21 }] }] },
    ],
  }, 21)

  assert.equal(targets.kind, 'session')
  assert.equal(targets.parentId, 11)
  assert.equal(targets.dayId, 1)
})

test('getProgramDragTargets identifies day targets', () => {
  const targets = getProgramDragTargets([
    { id: 7, bloques: [] },
  ], 7)

  assert.deepEqual(targets, {
    kind: 'day',
    dayId: 7,
    parentId: undefined,
    blockId: undefined,
  })
})

test('describeProgramDragMove distinguishes same-parent and cross-parent moves', () => {
  assert.deepEqual(describeProgramDragMove(
    { kind: 'session', dayId: 1, parentId: 11, blockId: 11 },
    { kind: 'session', dayId: 1, parentId: 11, blockId: 11 },
  ), {
    relationship: 'same-parent',
    sameParent: true,
  })

  assert.deepEqual(describeProgramDragMove(
    { kind: 'session', dayId: 1, parentId: 11, blockId: 11 },
    { kind: 'session', dayId: 1, parentId: 12, blockId: 12 },
  ), {
    relationship: 'cross-parent',
    sameParent: false,
  })
})

test('moveSessionBetweenBlocks moves a session to a new block at the end', () => {
  const result = moveSessionBetweenBlocks(
    [
      { id: 11, sesiones: [{ id: 21, orden: 1 }] },
      { id: 12, sesiones: [{ id: 31, orden: 1 }] },
    ],
    21,
    12,
  )

  assert.equal(result.blocks[0].sesiones.length, 0)
  assert.equal(result.blocks[1].sesiones[1].id, 21)
})
