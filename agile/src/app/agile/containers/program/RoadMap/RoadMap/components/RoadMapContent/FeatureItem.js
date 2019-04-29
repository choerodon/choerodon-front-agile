import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TypeTag from '../../../../../../components/TypeTag';
import './FeatureItem.scss';

class FeatureItem extends Component {
  handleClick=() => {
    const { onFeatureClick, feature } = this.props;
    if (onFeatureClick) {
      onFeatureClick(feature);
    }
  }

  render() {
    const { feature } = this.props;
    const { featureType, summary, issueTypeDTO } = feature;
    return (
      <div className="c7nagile-RoadMap-FeatureItem" onClick={this.handleClick} role="none">
        <TypeTag
          data={{
            ...issueTypeDTO,
            colour: featureType === 'business' ? '#29B6F6' : '#FFCA28',
            name: featureType === 'business' ? '特性' : '使能',
          }}
        />
        <div className="c7nagile-RoadMap-FeatureItem-summary">
          {summary}
        </div>
      </div>
    );
  }
}

FeatureItem.propTypes = {

};

export default FeatureItem;
