import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import BoardStore from '../../../../../../stores/program/Board/BoardStore';
import FeatureItem from './FeatureItem';

@observer
class SideFeatureList extends Component {
  render() {
    const { featureList } = BoardStore;
    return (
      <div>
        {
          featureList.map(feature => <FeatureItem feature={feature} />)
        }
      </div>
    );
  }
}

SideFeatureList.propTypes = {

};

export default SideFeatureList;
