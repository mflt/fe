import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

export type ReactFCtoMount<ReactcProps extends {} = {}> = {
  component: React.FunctionComponent<ReactcProps>,
  props?: ReactcProps,
};

// @TODO<x> add portal

export const mountReactC = <
  ReactcProps extends {} = {}
>(
  reactC: ReactFCtoMount<ReactcProps> | React.ReactNode, // ReactNode type includes React.FunctionComponentElement returned by createElement
  mountPoint: string | Element,
  options: {
    renderRoot?: HTMLElement | ShadowRoot,  // @TODO test in shadow, test with react-spectrum in shadow
    createRootOptions?: (Parameters<typeof ReactDOM.createRoot>)[1]
    epilogueCb?: (
      node?: ReactDOM.Root
    ) => void,
  }
): ReactDOM.Root | null => {
  try {

    let reactcNode: React.ReactNode | undefined = undefined;
    if (!(reactC as ReactFCtoMount).component) {  // @TODO in
      reactcNode = reactC as React.ReactNode;
    } else {
      reactcNode = React.createElement(
        (reactC as ReactFCtoMount).component,
        (reactC as ReactFCtoMount).props
      );
    };
    if (!reactcNode) {
      throw ('no or bad component/node reference');
    }

    let mountPointEl = undefined;
    if (typeof mountPoint === 'string') {
      mountPointEl = (options?.renderRoot || document)
        .querySelector('#' + mountPoint);  // # prepended
    }
    if (!mountPointEl) {
      throw (`mount point missing: ${mountPoint}`);
    }
    const node = ReactDOM.createRoot(
      mountPointEl,
      options.createRootOptions
    );
    node.render(reactcNode);

    options?.epilogueCb?.(node);

    return node;
  } catch (err) {
    console.error(`[FE/mountReactC]: error: ${err}`);
    return null;
  }
};

export function unmountReactC(
  node: ReactDOM.Root | null
) {
  node?.unmount();
}
