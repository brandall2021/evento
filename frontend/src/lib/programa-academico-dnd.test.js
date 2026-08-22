const test = require('node:test')
const assert = require('node:assert/strict')

const { describeProgramDragMove, getProgramDragTargets } = require('./programa-academico-dnd')

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
