import { useCallback, useMemo, useReducer } from 'react';

import {
  PayloadByType,
  HandlersByType,
  History,
  BranchSwitchModus,
  UseUnducerProps,
  UReducer,
  UActionUnion,
  UDispatch,
} from './index.types';
import { mapObject } from './util-internal';
import {
  getCurrentBranch,
  getCurrentIndex,
  updatePath,
  createInitialHistory,
  createAction,
  isUndoPossible,
  isRedoPossible,
  addAction,
  undoUpdater,
  redoUpdater,
  getNewPosition,
  getBranchSwitchProps,
  getActionForRedo,
} from './updaters';
import { defaultOptions } from './constants';

interface PayloadByType2 {
  undo: void;
  redo: void;
  timeTravelCurrentBranch: number;
  switchToBranch: {
    branchId: string;
    travelTo?: BranchSwitchModus;
  };
}

interface State<S, PBT> {
  history: History<PBT>;
  state: S;
}

// type PBT2<A extends Action> = {
//   [T in A['type']]: (A extends Record<'type', T> ? A : never)['payload'];
// };

const timeTravelCurrentBranch = <S, PBT extends PayloadByType>(
  prevState: State<S, PBT>,
  newIndex: number,
  reducer: UReducer<S, PBT>
): State<S, PBT> => {
  const prev = prevState.history;
  const currentIndex = getCurrentIndex(prev);
  const currentStack = getCurrentBranch(prev).stack;
  if (newIndex === currentIndex) {
    return prevState;
  } else if (newIndex > currentStack.length - 1 || newIndex < -1) {
    throw new Error(`Invalid index ${newIndex}`);
  } else {
    let newState = prevState.state;
    if (newIndex < currentIndex) {
      const actions = currentStack
        .slice(newIndex + 1, currentIndex + 1)
        .reverse();
      newState = actions.reduce(
        (acc, action) =>
          reducer(acc, {
            type: action.type,
            payload: action.payload,
            meta: {
              isUndo: true,
            },
          } as any),
        prevState.state
      );
    } else if (newIndex > currentIndex) {
      const actions = currentStack.slice(currentIndex + 1, newIndex + 1);
      newState = actions.reduce(
        (acc, action) =>
          reducer(acc, {
            type: action.type,
            payload: action.payload,
          } as any),
        prevState.state
      );
    }
    return {
      history: {
        ...prev,
        currentPosition: getNewPosition(newIndex)(currentStack),
      },
      state: newState,
    };
  }
};

const makeReducer = <S, PBT extends PayloadByType>(
  reducer: UReducer<S, PBT>
) => (
  prevState: State<S, PBT>,
  action: UActionUnion<PayloadByType2>
): State<S, PBT> => {
  switch (action.type) {
    case 'undo':
      const stack = getCurrentBranch(prevState.history).stack;
      const actionU = stack[getCurrentIndex(prevState.history)];
      return {
        history: undoUpdater(prevState.history),
        state: reducer(prevState.state, {
          type: actionU.type,
          payload: actionU.payload,
          meta: {
            isUndo: true,
          },
        } as any),
      };
    case 'redo':
      const actionR = getActionForRedo(prevState.history);
      return {
        history: redoUpdater(prevState.history),
        state: reducer(prevState.state, {
          type: actionR.type,
          payload: actionR.payload,
        } as any),
      };
    case 'timeTravelCurrentBranch':
      return timeTravelCurrentBranch(prevState, action.payload, reducer);
    case 'switchToBranch':
      const travelTo = action.payload.travelTo || 'LAST_COMMON_ACTION_IF_PAST';
      const branchId = action.payload.branchId;
      const history = prevState.history;
      let newState: State<S, PBT> = prevState;
      if (branchId === history.currentBranchId) {
        throw new Error('You cannot switch to the current branch.');
      } else {
        const targetBranch = history.branches[branchId];
        const { caIndex, path, parentIndex } = getBranchSwitchProps(
          history,
          branchId
        );
        if (
          caIndex < history.currentPosition.globalIndex ||
          travelTo === 'LAST_COMMON_ACTION'
        ) {
          newState = timeTravelCurrentBranch(newState, caIndex, reducer);
        }
        newState = {
          ...newState,
          history: updatePath(path.map(b => b.id))(newState.history),
        };
        // current branch is updated
        if (travelTo === 'LAST_KNOWN_POSITION_ON_BRANCH') {
          newState = timeTravelCurrentBranch(
            newState,
            targetBranch.lastPosition!.globalIndex,
            reducer
          );
        } else if (travelTo === 'HEAD_OF_BRANCH') {
          newState = timeTravelCurrentBranch(
            newState,
            parentIndex + targetBranch.stack.length,
            reducer
          );
        }
        return newState;
      }

    default:
      const a = action as UActionUnion<PBT>;
      const action2 = createAction(a.type, a.payload);
      return {
        history: addAction(
          action2,
          a.meta?.clearFutureOnDo || false
        )(prevState.history),
        state: reducer(prevState.state, a),
      };
  }
};

export const useFlexibleUnducer = <S, PBT extends PayloadByType>({
  initialHistory = createInitialHistory(),
  reducer,
  initialState,
  actionCreators,
  options,
}: UseUnducerProps<S, PBT>) => {
  const { clearFutureOnDo } = {
    ...defaultOptions,
    ...options,
  };

  const red = useMemo(() => makeReducer(reducer), [reducer]);
  const [state, dispatch] = useReducer(red, {
    state: initialState,
    history: initialHistory,
  });

  const undoables = useMemo(
    () =>
      mapObject(actionCreators)<HandlersByType<PBT>>(([type, creator]) => [
        type,
        payload => {
          const a = creator.drdo(payload);
          (dispatch as UDispatch<PBT>)({
            ...a,
            meta: {
              ...a.meta,
              clearFutureOnDo,
            },
          });
        },
      ]),
    [actionCreators, clearFutureOnDo]
  );
  const history = state.history;

  const canUndo = useMemo(() => isUndoPossible(history), [history]);

  const canRedo = useMemo(() => isRedoPossible(history), [history]);

  const undo = useCallback(() => dispatch({ type: 'undo' }), []);

  const redo = useCallback(() => dispatch({ type: 'redo' }), []);

  const timeTravel = useCallback(
    (index: number) =>
      dispatch({ type: 'timeTravelCurrentBranch', payload: index }),
    []
  );

  const switchToBranch = useCallback(
    (branchId: string, travelTo?: BranchSwitchModus) =>
      dispatch({ type: 'switchToBranch', payload: { branchId, travelTo } }),
    []
  );

  // const timeTravel = useCallback(
  //   (indexOnBranch: number, branchId = history.currentBranchId) => {
  //     if (branchId === history.currentBranchId) {
  //       timeTravelCurrentBranch(indexOnBranch);
  //     } else {
  //       const { caIndex, path, parentIndex } = getBranchSwitchProps(
  //         history,
  //         branchId
  //       );
  //       if (caIndex < history.currentPosition.globalIndex) {
  //         timeTravelCurrentBranch(caIndex);
  //       }
  //       setHistory(updatePath(path.map(b => b.id)));
  //       // current branch is updated
  //       timeTravelCurrentBranch(parentIndex + 1 + indexOnBranch);
  //     }
  //   },
  //   [history, timeTravelCurrentBranch]
  // );

  // const timeTravelById = useCallback(
  //   (actionId: string, branchId = history.currentBranchId) => {
  //     const index = history.branches[branchId].stack.findIndex(
  //       action => action.id === actionId
  //     );
  //     if (index >= 0) {
  //       timeTravel(index, branchId);
  //     } else {
  //       throw new Error(
  //         `action with id ${actionId} not found on branch with id ${branchId}${
  //           branchId === history.currentBranchId ? '(current branch)' : ''
  //         }`
  //       );
  //     }
  //   },
  //   [history, timeTravel]
  // );

  return {
    undoables,
    canUndo,
    canRedo,
    undo,
    redo,
    state: state.state,
    history,
    timeTravel,
    switchToBranch,
  };
};