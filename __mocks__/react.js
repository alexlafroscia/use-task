/**
 * Copied from https://github.com/kentcdodds/react-testing-library/issues/281#issuecomment-465626540
 */
const realModule = jest.requireActual("react");

module.exports = {
  ...realModule,
  useState: initialState => {
    const [state, setState] = realModule.useState(initialState);
    return [
      state,
      value => {
        require("react-dom/test-utils").act(() => {
          setState(value);
        });
      }
    ];
  },
  useReducer: (reducer, initialState) => {
    const [state, dispatch] = realModule.useReducer(reducer, initialState);
    return [
      state,
      action => {
        require("react-dom/test-utils").act(() => {
          dispatch(action);
        });
      }
    ];
  }
};
