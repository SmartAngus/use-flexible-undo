import React, { FC, useState } from 'react';
import { useFlexibleUndo, UndoableHandler, invertUndoable } from '../.';
import { ActionList } from './components/action-list';
import { rootClass, uiContainerClass } from './styles';

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
