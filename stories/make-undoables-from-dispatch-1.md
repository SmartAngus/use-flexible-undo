Full code:

```typescript
import React, { FC, useReducer } from 'react';
import { useFlexibleUndo, makeUndoableReducer, PayloadFromTo } from '../.';
import { ActionList } from './components/action-list';
import { uiContainerClass, rootClass } from './styles';
import { NumberInput } from './components/number-input';

type Nullber = number | null;

interface State {
  count: number;
  amount: Nullber;
}

interface PayloadByType {
  add: undefined;
  subtract: undefined;
  updateAmount: PayloadFromTo<Nullber>;
}

const { reducer, actionCreators } = makeUndoableReducer<State, PayloadByType>({
  add: {
    redo: () => state =>
      state.amount ? { ...state, count: state.count + state.amount } : state,
    undo: () => state =>
      state.amount ? { ...state, count: state.count - state.amount } : state,
  },
  subtract: {
    redo: () => state =>
      state.amount ? { ...state, count: state.count - state.amount } : state,
    undo: () => state =>
      state.amount ? { ...state, count: state.count + state.amount } : state,
  },
  updateAmount: {
    redo: ({ to }) => state => ({ ...state, amount: to }),
    undo: ({ from }) => state => ({ ...state, amount: from }),
  },
});

export const MakeUndoablesFromDispatch1: FC = () => {
  const [{ count, amount }, dispatch] = useReducer(reducer, {
    count: 0,
    amount: 1,
  });

  const {
    makeUndoablesFromDispatch,
    canUndo,
    undo,
    canRedo,
    redo,
    stack,
    timeTravel,
  } = useFlexibleUndo();

  const { add, subtract, updateAmount } = makeUndoablesFromDispatch(
    dispatch,
    actionCreators
  );

  return (
    <div className={rootClass}>
      <div>count = {count}</div>
      <div className={uiContainerClass}>
        <label>
          amount:&nbsp;
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