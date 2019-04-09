import React from 'react';
import QuickCreateFeature from './QuickCreateFeature';
import QuickCreateFeatureProvider from './QuickCreateFeatureProvider';

const QuickCreateFeatureWithProvider = () => (
  <QuickCreateFeatureProvider>
    {({
      featureTypeDTO, 
      defaultPriority,
      ...otherProps
    }) => (
      <QuickCreateFeature
        featureTypeDTO={featureTypeDTO}  
        defaultPriority={defaultPriority}
        {...otherProps}
      />
    )}
  </QuickCreateFeatureProvider>
);
export {
  QuickCreateFeature,
  QuickCreateFeatureProvider,
  QuickCreateFeatureWithProvider,
};
