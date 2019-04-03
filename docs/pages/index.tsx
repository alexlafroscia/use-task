import React from "react";
import styled from "@emotion/styled";

import BaseDemo from "../components/ConcurrencyDemo";

const Demo = styled(BaseDemo)`
  & + * {
    margin-top: 10px;
  }
`;

const IndexPage = () => {
  return (
    <>
      <h1>Use Task</h1>

      <Demo title="Keep All" keep="all" />
      <Demo title="Keep Last" keep="last" />
      <Demo title="Keep First" keep="first" />
    </>
  );
};

export default IndexPage;
