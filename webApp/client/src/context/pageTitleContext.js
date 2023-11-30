import React from 'react';

const PageTitleContext = React.createContext({
  pageTitle: 'No Title',
  updatePageTitle: () => {}
});

export default PageTitleContext;
