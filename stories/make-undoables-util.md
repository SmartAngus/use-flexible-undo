It's up to you how you define you're undo/redo handlers. You can define them inline as in the previous examples, or you can extract them for reuse. Here we extract them because the two functions "add" and "subtract" are the inverse of each other - so we can use the undo handler of one as the redo handler of the other (and vice versa).

```typescript
const incr: CurriedUpdater<number> = amount => prev => prev + amount;
const decr: CurriedUpdater<number> = amount => prev => prev - amount;

const addHandler = makeHandler(setCount)(incr);
const subtractHandler = makeHandler(setCount)(decr);

const { add, subtract } = makeUndoables<PayloadByType>({
  add: {
    redo: addHandler,
    undo: subtractHandler,
  },
  subtract: {
    redo: subtractHandler,
    undo: addHandler,
  },
});
```

Full code:

```typescript
import React, { FC, useState } from 'react';
import { useFlexibleUndo, makeHandler, CurriedUpdater } from '../.';
import { ActionList } from './components/action-list';
import { rootClass, btnContainerClass } from './styles';

interface PayloadByType {
  add: number;
  subtract: number;
}

const incr: CurriedUpdater<number> = amount => prev => prev + amount;
const decr: CurriedUpdater<number> = amount => prev => prev - amount;

export const MakeUndoablesUtil: FC = () => {
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

  const addHandler = makeHandler(setCount)(incr);
  const subtractHandler = makeHandler(setCount)(decr);

  const { add, subtract } = makeUndoables<PayloadByType>({
    add: {
      redo: addHandler,
      undo: subtractHandler,
    },
    subtract: {
      redo: subtractHandler,
      undo: addHandler,
    },
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