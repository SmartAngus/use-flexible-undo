import React, { FC, useState } from 'react';
import { useFlexibleUndo, invertHandlers, makeUndoableHandler } from '../../.';
import { ActionList } from '../components/action-list';
import { rootClass, uiContainerClass } from '../styles';

interface PayloadByType {
  add: number;
  subtract: number;
}

export const MakeUndoableHandlerExample: FC = () => {
  const [count, setCount] = useState(0);

  const undoableAddHandler = makeUndoableHandler(setCount)(
    amount => prev => prev + amount,
    amount => prev => prev - amount
  );

  const {
    undoables,
    canUndo,
    undo,
    canRedo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useFlexibleUndo<PayloadByType>({
    handlers: {
      add: undoableAddHandler,
      subtract: invertHandlers(undoableAddHandler),
    },
  });

  const { add, subtract } = undoables;

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
      <ActionList
        history={history}
        timeTravel={timeTravel}
        switchToBranch={switchToBranch}
      />
    </div>
  );
};