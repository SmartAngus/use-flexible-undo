import React, { FC, useState, useEffect, useMemo } from 'react';
import {
  useUndoableEffects,
  makeUndoableHandler,
  invertHandlers,
  makeUndoableFTHandler,
} from 'use-flexible-undo';
import { addUpdater, subtractUpdater } from '../examples-util';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { NumberInput } from '../components/number-input';
import { BranchNav } from '../components/branch-nav';
import { ActionList } from '../components/action-list';

export const MemoizationExample: FC = () => {
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState<number | null>(1);

  const handlers = useMemo(() => {
    const undoableAddHandler = makeUndoableHandler(setCount)(
      addUpdater,
      subtractUpdater
    );
    return {
      add: undoableAddHandler,
      subtract: invertHandlers(undoableAddHandler),
      updateAmount: makeUndoableFTHandler(setAmount),
    };
  }, []);

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useUndoableEffects({
    handlers,
    options: {
      // options do not need to be memoized / extracted
      clearFutureOnDo: false,
    },
  });

  useEffect(() => {
    console.log('--- INIT memoization example ---');
  }, []);

  useEffect(() => {
    console.log('component render');
  });

  // Just for checking that memoization works.
  // Effect should only run once instead of every render.
  useEffect(() => {
    console.log('undoables changed');
  }, [undoables]);

  const { add, subtract, updateAmount } = undoables;

  return (
    <div className={rootStyle}>
      <div className={topUIStyle}>
        <div className={countStyle}>count &nbsp;= &nbsp;{count}</div>
        <div className={actionsStyle}>
          <label>
            amount =&nbsp;
            <NumberInput
              value={amount}
              onChange={value =>
                updateAmount({
                  from: amount,
                  to: value,
                })
              }
            />
          </label>
          <button disabled={!amount} onClick={() => amount && add(amount)}>
            add
          </button>
          <button disabled={!amount} onClick={() => amount && subtract(amount)}>
            subtract
          </button>
        </div>
        <BranchNav
          history={history}
          switchToBranch={switchToBranch}
          undo={undo}
          redo={redo}
        />
      </div>
      <ActionList
        history={history}
        timeTravel={timeTravel}
        switchToBranch={switchToBranch}
      />
    </div>
  );
};
