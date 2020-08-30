import React, { FC, useReducer } from 'react';
import {
  useUndoableEffects,
  PayloadFromTo,
  Reducer,
  invertHandlers,
  invertFTHandler,
} from 'use-flexible-undo';
import { merge, addUpdater, subtractUpdater } from '../examples-util';
import { ActionList } from '../components/action-list';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { NumberInput } from '../components/number-input';
import { BranchNav } from '../components/branch-nav';
import { makeUpdater } from '../../src';

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

const countUpdater = makeUpdater(
  (state: State) => state.count, // getter
  count => merge({ count }) // setter
)(
  (_: void) => state => state.amount || 0, // dependency selector
  () => state => Boolean(state.amount) // condition
);

const reducer: Reducer<State, PayloadByType> = (prevState, action) => {
  switch (action.type) {
    case 'add':
      return countUpdater(addUpdater)()(prevState);
    case 'subtract':
      return countUpdater(subtractUpdater)()(prevState);
    case 'updateAmount':
      return { ...prevState, amount: action.payload.to };
    default:
      return prevState;
  }
};

export const ReducerAndMakeUpdaterExample: FC = () => {
  const [{ count, amount }, dispatch] = useReducer(reducer, {
    count: 0,
    amount: 1,
  });

  const addHandlers = {
    drdo: () => dispatch({ type: 'add' }),
    undo: () => dispatch({ type: 'subtract' }),
  };

  const updateAmountHandler = (payload: PayloadFromTo<Nullber>) =>
    dispatch({ type: 'updateAmount', payload });

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useUndoableEffects<PayloadByType>({
    handlers: {
      add: addHandlers,
      subtract: invertHandlers(addHandlers),
      updateAmount: {
        drdo: updateAmountHandler,
        undo: invertFTHandler(updateAmountHandler),
      },
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
