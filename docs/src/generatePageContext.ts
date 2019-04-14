/* globals process */

import { SheetsRegistry } from "jss";
import { createGenerateClassName, Theme } from "@material-ui/core/styles";
import { theme } from "../theme";

export interface PageContext {
  theme: Theme;
  sheetsManager: Map<any, any>;
  sheetsRegistry: SheetsRegistry;
  generateClassName: (...args: any[]) => any;
}

function createPageContext(): PageContext {
  return {
    theme,
    // This is needed in order to deduplicate the injection of CSS in the page.
    sheetsManager: new Map(),
    // This is needed in order to inject the critical CSS.
    sheetsRegistry: new SheetsRegistry(),
    // The standard class name generator.
    generateClassName: createGenerateClassName()
  };
}

let pageContext: PageContext;

export default function getPageContext(): PageContext {
  // Make sure to create a new context for every server-side request so that data
  // isn't shared between connections (which would be bad).

  // @ts-ignore
  if (!process.browser) {
    return createPageContext();
  }

  // Reuse context on the client-side.
  if (!pageContext) {
    pageContext = createPageContext();
  }

  return pageContext;
}
