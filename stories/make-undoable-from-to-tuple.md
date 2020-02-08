You can model the action payload anyway you like. Here we use a tuple instead of an object.

```typescript
const updateCount = makeUndoable<[number, number]>({
  type: 'updateCount',
  redo: ([_, to]) => setCount(to),
  undo: ([from]) => setCount(from),
});

const multiply = (amount: number) => updateCount([count, count * amount]);
const divide = (amount: number) => updateCount([count, count / amount]);
```

Full code:

```typescript
import React, { useState } from 'react';
import { useFlexibleUndo } from '../.';
import { rootClass, uiContainerClass } from './styles';
import { ActionList } from './components/action-list';

export const MakeUndoableFromToTuple: React.FC = () => {
  const [count, setCount] = useState(1);

  const {
    makeUndoable,
    canUndo,
    undo,
    canRedo,
    redo,
    stack,
    timeTravel,
  } = useFlexibleUndo();

  const updateCount = makeUndoable<[number, number]>({
    type: 'updateCount',
    redo: ([_, to]) => setCount(to),
    undo: ([from]) => setCount(from),
  });

  const multiply = (amount: number) => updateCount([count, count * amount]);
  const divide = (amount: number) => updateCount([count, count / amount]);

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={uiContainerClass}>
        <button onClick={() => multiply(Math.PI)}>multi&pi;</button>
        <button onClick={() => divide(Math.PI)}>di&pi;de</button>
        <button disabled={!canUndo} onClick={() => undo()}>
          undo
        </button>
        <button disabled={!canRedo} onClick={() => redo()}>
          redo
        </button>
      </div>
      <ActionList stack={stack} timeTravel={timeTravel} />
    </div>
  );
};
```