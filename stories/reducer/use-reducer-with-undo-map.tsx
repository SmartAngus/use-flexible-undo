import React, { FC } from 'react';
import {
  useFlexibleUndo,
  PayloadFromTo,
  makeUpdater,
  makeReducer,
  invertFTHandler,
} from '../../.';
import { merge, addUpdater, subtractUpdater } from '../examples-util';
import { rootStyle, topUIStyle, countStyle, actionsStyle } from '../styles';
import { ActionList } from '../components/action-list';
import { NumberInput } from '../components/number-input';
import { BranchNav } from '../components/branch-nav';
import { useReducerWithUndoMap } from '../../src/use-reducer-with-undo-map';

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
  (state: State) => state.count,
  count => merge({ count })
)(() => state => state.amount || 0);

const { reducer, actionCreators } = makeReducer<State, PayloadByType>({
  add: countUpdater(addUpdater),
  subtract: countUpdater(subtractUpdater),
  updateAmount: ({ to }) => merge({ amount: to }),
});

export const UseReducerWithUndoMapExample: FC = () => {
  const [{ count, amount }, handlers] = useReducerWithUndoMap(
    reducer,
    {
      count: 0,
      amount: 1,
    },
    actionCreators,
    {
      add: actionCreators.subtract,
      subtract: actionCreators.add,
      updateAmount: invertFTHandler(actionCreators.updateAmount),
    }
  );

  const {
    undoables,
    undo,
    redo,
    history,
    timeTravel,
    switchToBranch,
  } = useFlexibleUndo({
    handlers,
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
