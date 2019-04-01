import React, { memo } from 'react';
import PropTypes from 'prop-types';

import ArtForm from './component/ArtForm';

const propTypes = {
  initValue: PropTypes.shape({}).isRequired,
  onSave: PropTypes.func.isRequired,
  onFormChange: PropTypes.func.isRequired,
};
const ArtSetting = ({
  initValue,
  PiList,
  onSave,
  onFormChange,
  onGetPIList,
}) => (
  <div>
    <ArtForm onChange={onFormChange} initValue={initValue} PiList={PiList} onSave={onSave} onGetPIList={onGetPIList} />
  </div>
);

ArtSetting.propTypes = propTypes;

export default memo(ArtSetting);
