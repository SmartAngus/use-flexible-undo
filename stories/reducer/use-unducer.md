### unducer & makeUndoableUpdater - Readme & Code

A bit more experimental: You can also make a reducer that handles the undo cases internally, in this case based on the `{ meta: { isUndo: boolean }}` part of the actions. This means that you do not need to create separate handlers or action creators for "undo", but it has the possible downside that it is harder to see the difference between undo and redo in something like Redux-devtools. In this example there is still a lot of repetition in the code, but in the next examples we take a look at utilities for removing this.

In this example we use the curried utility function **makeUndoableUpdater**, which takes

- a function for selecting slice B from state A.
- a function for updating slice B in state A.  
  ->
- a function P -> A -> C for deriving a state change value C based on the action payload and/or the previous state A
- an optional predicate function P -> A -> boolean, for conditionally applying the entire update  
  ->
- a curried updater function C -> B -> B for the do/redo handler
- a curried updater function C -> B -> B for the undo handler

Again this may not be a one-size-fits-all utility. Feel free to write your own solution, for example using lenses and other functional utilities.

```typescript
import React, { FC, useReducer } from 'react';
import {
  useUndoableEffects,
  PayloadFromTo,
  Unducer,
  makeUndoableUpdater,
} from 'use-flexible-undo';
import { merge, addUpdater, subtractUpdater } from '../examples-util';
import { ActionList } from '../components/action-list';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { NumberInput } from '../components/number-input';
import { BranchNav } from '../components/branch-nav';

type Nullber = number | null;

interface State {
  count: number;
  amount: Nullber;
}

interface PayloadByType {
  add: void;
  subtract: void;
  updateAmount: PayloadFromTo<Nullber>;
}

const selectAmount = (_: void) => (state: State) => state.amount || 0;

const undoableAddUpdater = makeUndoableUpdater(
  (state: State) => state.count,
  count => merge({ count })
)(selectAmount)(addUpdater, subtractUpdater);

const unducer: Unducer<State, PayloadByType> = (prevState, action) => {
  const isUndo = action.meta?.isUndo;
  switch (action.type) {
    case 'add':
      return isUndo
        ? undoableAddUpdater.undo()(prevState)
        : undoableAddUpdater.drdo()(prevState);
    case 'subtract':
      return isUndo
        ? undoableAddUpdater.drdo()(prevState)
        : undoableAddUpdater.undo()(prevState);
    case 'updateAmount':
      const { from, to } = action.payload;
      return { ...prevState, amount: isUndo ? from : to };
    default:
      return prevState;
  }
};

const makeHandlers = <R extends unknown>(fn: (isUndo: boolean) => R) => ({
  drdo: fn(false),
  undo: fn(true),
});

export const UnducerAndMakeUndoableUpdaterExample: FC = () => {
  const [{ count, amount }, dispatch] = useReducer(unducer, {
    count: 0,
    amount: 1,
  });

  const makeAddHandler = (isUndo: boolean) => () =>
    dispatch({ type: 'add', meta: { isUndo } });

  const makeSubtractHandler = (isUndo: boolean) => () =>
    dispatch({ type: 'subtract', meta: { isUndo } });

  const makeUpdateAmountHandler = (isUndo: boolean) => (
    payload: PayloadFromTo<Nullber>
  ) => dispatch({ type: 'updateAmount', payload, meta: { isUndo } });

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useUndoableEffects<PayloadByType>({
    handlers: {
      add: makeHandlers(makeAddHandler),
      subtract: makeHandlers(makeSubtractHandler),
      updateAmount: makeHandlers(makeUpdateAmountHandler),
    },
  });

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
          <button disabled={!amount} onClick={() => add()}>
            add
          </button>
          <button disabled={!amount} onClick={() => subtract()}>
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
```
