import React, { memo } from 'react';
import PropTypes from 'prop-types';

import ArtForm from './ArtForm';

const propTypes = {
  initValue: PropTypes.shape({}).isRequired,
  onSave: PropTypes.func.isRequired,
  onFormChange: PropTypes.func.isRequired,
};
const ArtSetting = ({
  initValue,
  onSave,
  onFormChange,
}) => (
  <div>
    <ArtForm onChange={onFormChange} initValue={initValue} onSave={onSave} />
  </div>
);

ArtSetting.propTypes = propTypes;

export default memo(ArtSetting);
