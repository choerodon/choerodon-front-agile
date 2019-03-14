import React, { Component, Fragment } from 'react';
import { Page, Header, Content } from 'choerodon-front-boot';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import {
  Icon, Button, Progress, Spin,
} from 'choerodon-ui';
import moment from 'moment';
import { artListLink } from '../../../../common/utils';
import { ArtInfo, ArtSetting, ReleaseArt } from './components';

import { getArtById, editArt, releaseArt } from '../../../../api/ArtApi';
import './EditArt.scss';

const requiredFields = ['startDate', 'ipWorkdays', 'interationCount', 'interationWeeks', 'piCodePrefix', 'piCodeNumber'];
function formatter(values) {
  const data = { ...values };
  Object.keys(data).forEach((key) => {
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
    isModified: false,
    canRelease: false,
    releaseArtVisible: false,
  }

  componentDidMount() {
    this.loadArt();
  }

  loadArt = () => {
    // eslint-disable-next-line react/destructuring-assignment
    const { id } = this.props.match.params;
    this.setState({
      loading: true,
    });
    getArtById(id).then((data) => {
      const {
        enabled,
        interationCount,
        interationWeeks,
        ipWorkdays,
        piCodeNumber,
        piCodePrefix,
        rteId,
        startDate,
      } = data;
      const formData = {
        enabled,
        interationCount,
        interationWeeks,
        ipWorkdays,
        piCodeNumber,
        piCodePrefix,
        rteId,
        startDate,
      };
      this.setState({
        loading: false,
        formData,
        data,
        canRelease: this.checkCanRelease(formData),
      });
    });
  }

  checkCanRelease = data => !requiredFields.some(field => data[field] == undefined)

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

  handleClearModify = () => {
    const { formData } = this.state;
    // 触发form的重置
    this.setState({
      formData: { ...formData },
      isModified: false,
    });
  }

  handleSave = (newValues) => {
    const { data } = this.state;
    const artDTO = { ...data, ...formatter(newValues) };    
    editArt(artDTO).then((res) => {
      this.loadArt();
    });
  }

  handleReleaseClick = () => {
    this.setState({
      releaseArtVisible: true,
    });
  }

  handleReleaseOk = (PINum) => {
    const { data, formData } = this.state;
    releaseArt(data.id, PINum).then((res) => {

    });
  }

  handleReleaseCancel = () => {
    this.setState({
      releaseArtVisible: false,
    });
  }

  render() {
    const {
      formData, isModified, canRelease,
      releaseArtVisible, data, loading,
    } = this.state;
    const {
      id, name, description, enabled, 
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
                visible={releaseArtVisible}
                onOk={this.handleReleaseOk}
                onCancel={this.handleReleaseCancel}
              />
              <ArtInfo 
                enabled={enabled}
                canRelease={canRelease}
                isModified={isModified}  
                onSubmit={this.handleSave}
                name={name}
                description={description}
                onReleaseClick={this.handleReleaseClick}
                onClearModify={this.handleClearModify}
              />
              <ArtSetting
                initValue={formData}
                onFormChange={this.handleFormChange}
                onSave={this.handleSave}
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
