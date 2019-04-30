import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { groupBy } from 'lodash';
import FeatureItem from './FeatureItem';
import { STATUS } from '../../../../../../common/Constant';
import './PiCard.scss';

class PiCard extends Component {
  renderFeatures = () => {
    const { pi, onFeatureClick, currentFeature } = this.props;
    const { subFeatureDTOList } = pi;
    if (subFeatureDTOList.length === 0) {
      return <div style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.65)', paddingBottom: 10 }}>暂无数据</div>;
    }
    const groupedFeatures = groupBy(subFeatureDTOList, 'featureType');
    const enablerFeatures = groupedFeatures.enabler || [];
    const businessFeatures = groupedFeatures.business || [];
    return (
      <Fragment>
        <div className="c7nagile-PiCard-business-list">
          {businessFeatures.map(feature => <FeatureItem selected={currentFeature === feature.issueId} feature={feature} onFeatureClick={onFeatureClick} />)}
        </div>
        {
          enablerFeatures.length > 0
          && (
            <div className="c7nagile-PiCard-enabler-list">
              {enablerFeatures.map(feature => <FeatureItem selected={currentFeature === feature.issueId} feature={feature} onFeatureClick={onFeatureClick} />)}
            </div>
          )
        }
      </Fragment>
    );
  }

  render() {
    const { pi } = this.props;
    const { statusCode, name } = pi;
    return (
      <div
        className="c7nagile-PiCard"
        style={{ borderTop: `5px solid ${STATUS[statusCode]}` }}
      >
        <div className="c7nagile-PiCard-title">{name}</div>
        <div>
          {this.renderFeatures()}
        </div>
      </div>
    );
  }
}

PiCard.propTypes = {

};

export default PiCard;
