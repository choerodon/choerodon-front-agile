import React, { memo } from 'react';
import PropTypes from 'prop-types';

import ArtForm from './ArtForm';

const ArtSetting = ({
  initValue,
  onSave,
  onFormChange,
}) => (
  <div>
    <ArtForm onChange={onFormChange} initValue={initValue} onSave={onSave} />   
  </div>
);

ArtSetting.propTypes = {

};

export default memo(ArtSetting);
