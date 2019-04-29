import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Page, Header, Content, stores,
} from 'choerodon-front-boot';
import moment from 'moment';
import EditFeature from '../../../../components/EditIssueNarrow';
import RoadMapContent from './components/RoadMapContent';
import RoadMapHeader from './components/RoadMapHeader';
import { getRoadMap } from '../../../../api/RoadMapApi';
import FeatureStore from '../../../../stores/program/Feature/FeatureStore';

class RoadMap extends Component {
  state = {    
    piList: [],
    editFeatureVisible: false,
    currentFeature: null,
  }

  componentDidMount() {
    getRoadMap().then((piList) => {
      this.setState({
        piList,
      });
    });
  }

  getRange = piList => ({
    startDate: piList[0] && piList[0].startDate,
    endDate: piList[piList.length - 1] && piList[piList.length - 1].endDate,
  })

  handleFeatureClick=(feature) => {
    this.setState({
      currentFeature: feature.issueId,
      editFeatureVisible: true,
    });
  }

  handleCancel=() => {
    this.setState({
      currentFeature: null,
      editFeatureVisible: false,
    });
  }

  render() {
    const { piList, editFeatureVisible, currentFeature } = this.state;
    const { startDate, endDate } = this.getRange(piList);
    return (
      <Page className="c7ntest-Issue c7ntest-region">
        <Header
          title="路线图"
        />
        <Content style={{ paddingTop: 0 }}>         
          <RoadMapHeader startDate={startDate} endDate={endDate} />
          <RoadMapContent piList={piList} onFeatureClick={this.handleFeatureClick} />          
          {
            editFeatureVisible && (
              <div style={{
                position: 'fixed',
                bottom: 0,
                right: 0,
                width: 440,
                height: 'calc(100% - 106px)',
                background: 'white',
                zIndex: 8,
              }}
              >
                <EditFeature 
                  store={FeatureStore}
                  issueId={currentFeature}
                  onCancel={this.handleCancel}
                  onDeleteIssue={this.handleDelete}
                />
              </div>
            )}         
        </Content>
      </Page>
    );
  }
}

RoadMap.propTypes = {

};

export default RoadMap;
