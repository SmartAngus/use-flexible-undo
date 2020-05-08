The utility **makeUndoableHandler** takes a state setter function (e.g. the one returned from React.useState) as single argument and returns a function that takes two (do/redo and undo) curried functions for updating the state based on the payload and the previous state. The final return value is an object with do/redo and undo handlers.

```typescript
const [count, setCount] = useState(0);

const undoableAddHandler = makeUndoableHandler(setCount)(
  amount => prev => prev + amount,
  amount => prev => prev - amount
);

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
  invertHandlers,
  makeUndoableHandler,
} from 'use-flexible-undo';
import { ActionList } from '../components/action-list';
import { rootClass, uiContainerClass } from '../styles';

interface PayloadByType {
  add: number;
  subtract: number;
}

export const MakeUndoableHandlerExample: FC = () => {
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

  const undoableAddHandler = makeUndoableHandler(setCount)(
    amount => prev => prev + amount,
    amount => prev => prev - amount
  );

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