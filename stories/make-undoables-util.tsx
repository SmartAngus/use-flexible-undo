import React, { useState } from 'react';
import { useInfiniteUndo } from '../src';
import { btnContainerStyle } from './styles';
import { makeHandler } from '../src/util';
import { CurriedUpdater } from '../src/index.types';

interface PayloadByType {
  add: number;
  subtract: number;
}

const incr: CurriedUpdater<number> = n => prev => prev + n;
const decr: CurriedUpdater<number> = n => prev => prev - n;

export const MakeUndoablesUtil: React.FC = () => {
  const [count, setCount] = useState(0);

  const { makeUndoables, canUndo, undo, canRedo, redo } = useInfiniteUndo();

  const addHandler = makeHandler(setCount)(incr);
  const subtractHandler = makeHandler(setCount)(decr);

  const { add, subtract } = makeUndoables<PayloadByType>({
    add: {
      do: addHandler,
      undo: subtractHandler,
    },
    subtract: {
      do: subtractHandler,
      undo: addHandler,
    },
  });

  return (
    <>
      <div>count = {count}</div>
      <div style={btnContainerStyle}>
        <button onClick={() => add(1)}>add 1</button>
        <button onClick={() => subtract(2)}>subtract 2</button>
        <button disabled={!canUndo} onClick={() => undo()}>
          undo
        </button>
        <button disabled={!canRedo} onClick={() => redo()}>
          redo
        </button>
      </div>
    </>
  );
};
