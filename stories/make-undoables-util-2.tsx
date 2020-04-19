import React, { FC, useState } from 'react';
import {
  CurriedUpdater,
  useFlexibleUndo,
  makeUndoableDeltaHandler,
  invertUndoable,
} from '../.';
import { ActionList } from './components/action-list';
import { rootClass, uiContainerClass } from './styles';

interface PayloadByType {
  add: number;
  subtract: number;
}

const addAmount: CurriedUpdater<number> = amount => prev => prev + amount;
const subAmount: CurriedUpdater<number> = amount => prev => prev - amount;

export const MakeUndoablesUtil2: FC = () => {
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

  const addHandler = makeUndoableDeltaHandler(setCount)(addAmount, subAmount);

  const { add, subtract } = makeUndoables<PayloadByType>({
    add: addHandler,
    subtract: invertUndoable(addHandler),
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
