import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Page, Header, Content, stores,
} from 'choerodon-front-boot';
import moment from 'moment';
import { observer, inject } from 'mobx-react';
import EditFeature from '../../Feature/FeatureComponent/FeatureDetail/EditFeature';
import RoadMapContent from './components/RoadMapContent';
import RoadMapHeader from './components/RoadMapHeader';
import { getRoadMap } from '../../../../api/RoadMapApi';
import FeatureStore from '../../../../stores/program/Feature/FeatureStore';

@inject('HeaderStore')
@observer
class RoadMap extends Component {
  state = {    
    piList: [],
    loading: false,
    editFeatureVisible: false,
    currentFeature: null,
  }

  componentDidMount() {
    this.loadRoadMap();
  }

  loadRoadMap=() => {
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

  handleDelete=() => {
    this.setState({
      currentFeature: null,
      editFeatureVisible: false,
    });
    this.loadRoadMap();
  }

  render() {
    const {
      piList, editFeatureVisible, currentFeature, loading, 
    } = this.state;
    const { HeaderStore } = this.props;
    const { startDate, endDate } = this.getRange(piList);
    return (
      <Page className="c7ntest-Issue c7ntest-region">
        <Header
          title="路线图"
        />
        <Content style={{ paddingTop: 0 }}>         
          <RoadMapHeader startDate={startDate} endDate={endDate} />
          <RoadMapContent piList={piList} onFeatureClick={this.handleFeatureClick} currentFeature={currentFeature} />          
          {
            editFeatureVisible && (
              <div style={{
                position: 'fixed',
                bottom: 0,
                right: 0,
                width: 440,
                height: HeaderStore.announcementClosed ? 'calc(100% - 106px)' : 'calc(100% - 158px)',
                background: 'white',
                zIndex: 8,
              }}
              >
                <EditFeature 
                  store={FeatureStore}
                  issueId={currentFeature}
                  onCancel={this.handleCancel}
                  onUpdate={this.loadRoadMap}
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
