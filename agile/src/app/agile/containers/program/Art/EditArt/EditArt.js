
import React, { Component } from 'react';
import {
  Page, Header, Content, axios, stores, 
} from 'choerodon-front-boot';
import { isEqual } from 'lodash';
import {
  Progress, Spin,
} from 'choerodon-ui';
import moment from 'moment';
import { artListLink } from '../../../../common/utils';
import { ArtInfo, ArtSetting, ReleaseArt } from './components';

import {
  getArtById, editArt, getArtsByProjectId, beforeStop, stopArt, startArt,
} from '../../../../api/ArtApi';
import StartArtModal from './components/StartArtModal';
import StopArtModal from './components/StopArtModal';

import './EditArt.scss';

const { AppState } = stores;
const startArtShowInfo = {
  startDate: {
    name: '火车开始时间',
    empty: false,
  },
  piCount: {
    name: '生成PI数',
    empty: false,
  },
  piName: {
    name: 'PI名称',
    empty: false,
  },
  interationCount: {
    name: '迭代数',
    empty: false,
  },
  interationWeeks: {
    name: '迭代时长（周）',
    empty: false,
  },
  ipWeeks: {
    name: 'IP时长（周）',
    empty: false,
  },
};

function formatter(values) {
  const data = { ...values };
  Object.keys(data).forEach((key) => {
    if (key === 'rteId' && data[key] === undefined) {
      data[key] = 0;
    }
    if (moment.isMoment(data[key])) {
      data[key] = moment(data[key]).format('YYYY-MM-DD HH:mm:ss');
    }
  });
  return data;
}
class EditArt extends Component {
  state = {
    loading: true,
    formData: {},
    data: {},
    artList: [],
    isModified: false,
    releaseArtVisible: false,
    releaseLoading: false,
    startArtModalVisible: false,
    stopArtModalVisible: false,
    stopArtPIInfo: undefined,
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    const { match: { params: { id } } } = this.props;
    this.setState({
      loading: true,
    });
    Promise.all([getArtsByProjectId(), getArtById(id)]).then((ress) => {
      const {
        interationCount,
        interationWeeks,
        ipWeeks,
        piCodeNumber,
        piCodePrefix,      
        startDate,
        rteId,
        name,
        piCount,
        statusCode,
      } = ress[1];
      const formData = {
        interationCount,
        interationWeeks,
        ipWeeks,
        piCodeNumber,
        piCodePrefix,
        rteId,
        startDate,
        name,
        piCount,
        id,
        statusCode,
      };
      this.setState({
        loading: false,
        formData,
        data: ress[1],
        artList: ress[0].content,
      });
    });
  }

  loadArt = () => {
    // eslint-disable-next-line react/destructuring-assignment
    const { id } = this.props.match.params;
    this.setState({
      loading: true,
    });
    getArtById(id).then((data) => { 
      const {
        interationCount,
        interationWeeks,
        ipWeeks,
        piCodeNumber,
        piCodePrefix,      
        startDate,
        rteId,
        name,
        piCount,
        statusCode,
      } = data;
      const formData = {
        interationCount,
        interationWeeks,
        ipWeeks,
        piCodeNumber,
        piCodePrefix,
        rteId,
        startDate,
        name,
        piCount,
        statusCode,
        id,
      };
      this.setState({
        loading: false,
        formData,
        data,
      });
    });
  }


  handleFormChange = (changedValues, allValues) => {
    const { formData, isModified } = this.state;
    if (!isEqual(formatter(allValues), formData)) {
      if (!isModified) {
        this.setState({
          isModified: true,
        });
      }
    } else if (isModified) {
      this.setState({
        isModified: false,
      });
    }
  }

  handleSave = (newValues) => {
    const { data } = this.state;
    const artDTO = { ...data, ...formatter(newValues) };    
    editArt(artDTO).then(() => {
      this.loadArt();
    });
  }

  handleReleaseCancel = () => {
    this.setState({
      releaseArtVisible: false,
    });
  }

  checkEmptyField = () => {
    const { data } = this.state;
    // eslint-disable-next-line array-callback-return
    Object.keys(startArtShowInfo).map((key) => {
      if (data[key]) {
        startArtShowInfo[key].empty = false;
      } else {
        startArtShowInfo[key].empty = true;
      }
    });
  }

  handleStartArtBtnClick = () => {
    this.setState({
      startArtModalVisible: true,
    }, () => {
      this.checkEmptyField();
    });
  }

  handleStopArtBtnClick = () => {
    const { match: { params: { id } } } = this.props;
    beforeStop(id).then((res) => {
      this.setState({
        stopArtPIInfo: res,
      });
    });
    this.setState({
      stopArtModalVisible: true,
    });
  }

  startArtOk = (canStart) => {
    const { data } = this.state;
    const { match: { params: { id } } } = this.props;
    if (canStart) {
      startArt({
        programId: AppState.currentMenuType.id,
        id,
        objectVersionNumber: data.objectVersionNumber,
      }).then(() => {
        this.loadArt();
        this.setState({
          startArtModalVisible: false,
        });
      });
    } else {
      this.setState({
        startArtModalVisible: false,
      });
    }
  }

  startArtCancel = () => {
    this.setState({
      startArtModalVisible: false,
    });
  }

  stopArtOk = (canStop) => {
    const { data } = this.state;
    const { match: { params: { id } } } = this.props;
    if (canStop) {
      stopArt({
        programId: AppState.currentMenuType.id,
        id,
        objectVersionNumber: data.objectVersionNumber,
      }).then(() => {
        this.loadArt();
        this.setState({
          stopArtModalVisible: false,
        });
      });
    } else {
      this.setState({
        stopArtModalVisible: false,
      });
    }
  }

  stopArtCancel = () => {
    this.setState({
      stopArtModalVisible: false,
    });
  }

  render() {
    const {
      formData, releaseArtVisible, data, artList, loading, releaseLoading, startArtModalVisible, stopArtModalVisible, stopArtPIInfo,
    } = this.state;
    const {
      id, name, statusCode,
    } = data;
    return (
      <Page className="c7nagile-EditArt">
        <Header
          title="编辑ART"
          backPath={artListLink()}
        />
        <Content>
          {id ? (
            <Spin spinning={loading}>
              <ReleaseArt
                loading={releaseLoading}
                visible={releaseArtVisible}
                onOk={this.handleReleaseOk}
                onCancel={this.handleReleaseCancel}
              />
              <ArtInfo 
                onSubmit={this.handleSave}
                name={name}
                startBtnVisible={statusCode === 'todo'}
                stopBtnVisible={statusCode === 'doing'}
                onStartArtBtnClick={this.handleStartArtBtnClick}
                onStopArtBtnClick={this.handleStopArtBtnClick}
              />
              <ArtSetting
                initValue={formData}
                onFormChange={this.handleFormChange}
                onSave={this.handleSave}
              />
              <StartArtModal
                visible={startArtModalVisible}
                onOk={this.startArtOk}
                onCancel={this.startArtCancel}
                data={data}
                artList={artList}
                startArtShowInfo={startArtShowInfo}
              />
              <StopArtModal
                visible={stopArtModalVisible}
                onOk={this.stopArtOk}
                onCancel={this.stopArtCancel}
                data={data}
                stopArtPIInfo={stopArtPIInfo}
              />
            </Spin>
          ) : <Progress type="loading" className="spin-container" />}
        </Content>
      </Page>
    );
  }
}

EditArt.propTypes = {

};

export default EditArt;
