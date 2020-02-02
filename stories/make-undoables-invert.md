As an alternative to manually inverting the undo/redo like in the previous example, you can use the utility **invertUndoable**. This function takes an object with "undo" and "redo" properties and switches the values of these properties.

```typescript
const undoableAddHandler: UndoableHandler<number> = {
  redo: amount => setCount(prev => prev + amount),
  undo: amount => setCount(prev => prev - amount),
};

const { add, subtract } = makeUndoables<PayloadByType>({
  add: undoableAddHandler,
  subtract: invertUndoable(undoableAddHandler),
});
```

Full code:

```typescript
import React, { FC, useState } from 'react';
import { useFlexibleUndo, UndoableHandler, invertUndoable } from '../.';
import { ActionList } from './components/action-list';
import { rootClass, btnContainerClass } from './styles';

interface PayloadByType {
  add: number;
  subtract: number;
}

export const MakeUndoablesInvert: FC = () => {
  const [count, setCount] = useState(0);

  const {
    makeUndoables,
    canUndo,
    undo,
    canRedo,
    redo,
    stack,
    timeTravel,
  } = useFlexibleUndo();

  const undoableAddHandler: UndoableHandler<number> = {
    redo: amount => setCount(prev => prev + amount),
    undo: amount => setCount(prev => prev - amount),
  };

  const { add, subtract } = makeUndoables<PayloadByType>({
    add: undoableAddHandler,
    subtract: invertUndoable(undoableAddHandler),
  });

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={btnContainerClass}>
        <button onClick={() => add(1)}>add 1</button>
        <button onClick={() => subtract(2)}>subtract 2</button>
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