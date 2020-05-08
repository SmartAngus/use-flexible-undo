As an alternative to manually inverting the do/redo and undo handlers like in the previous example, you can use the utility **invertHandlers**. This function takes an object with "drdo" and "undo" properties and switches the values of these properties.

```typescript
const [count, setCount] = useState(0);

const undoableAddHandler: UndoableHandler<number> = {
  drdo: amount => setCount(prev => prev + amount),
  undo: amount => setCount(prev => prev - amount),
};

const { add, subtract } = makeUndoables<PayloadByType>({
  add: undoableAddHandler,
  subtract: invertHandlers(undoableAddHandler),
});
```

Full code:

```typescript
import React, { FC, useState } from 'react';
import {
  useFlexibleUndo,
  UndoableHandler,
  invertHandlers,
} from 'use-flexible-undo';
import { ActionList } from '../components/action-list';
import { rootClass, uiContainerClass } from '../styles';

interface PayloadByType {
  add: number;
  subtract: number;
}

export const InvertHandlersExample: FC = () => {
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
    drdo: amount => setCount(prev => prev + amount),
    undo: amount => setCount(prev => prev - amount),
  };

  const { add, subtract } = makeUndoables<PayloadByType>({
    add: undoableAddHandler,
    subtract: invertHandlers(undoableAddHandler),
  });

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={uiContainerClass}>
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