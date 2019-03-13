import React, { Component, Fragment } from 'react';
import { Page, Header, Content } from 'choerodon-front-boot';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import {
  Icon, Button, Progress, Spin,
} from 'choerodon-ui';
import moment from 'moment';
import { artListLink } from '../../../../common/utils';
import { ArtSetting, ReleaseArt } from './components';
import { getArtById, editArt, releaseArt } from '../../../../api/ArtApi';
import './EditArt.scss';

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
        interationWorkdays,
        ipWorkdays,
        piCodeNumber,
        piCodePrefix,
        rteId,
        startDate,
      } = data;
      this.setState({
        loading: false,
        formData: {
          enabled,
          interationCount,
          interationWorkdays,
          ipWorkdays,
          piCodeNumber,
          piCodePrefix,
          rteId,
          startDate,
        },
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
    console.log(newValues, artDTO);
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
    const requiredFields = ['startDate', 'ipWorkdays', 'interationCount', 'interationWorkdays', 'piCodePrefix', 'piCodeNumber'];
    // 如果有字段没输入
    if (requiredFields.some(field => !formData[field])) {
      Choerodon.prompt('请完善信息再发布！');
    } else {
      releaseArt(data.id, PINum).then((res) => {

      });
    }
  }

  handleReleaseCancel = () => {
    this.setState({
      releaseArtVisible: false,
    });
  }

  render() {
    const {
      formData, isModified, releaseArtVisible, data, loading,
    } = this.state;
    const { id, name, description } = data;
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
              <div style={{ display: 'flex' }}>
                <div><Icon type="warning" style={{ color: '#FADB14' }} /></div>
                <div style={{ width: 500, marginLeft: 5 }}>
                  注意：此ART正在进行中。你正在编辑
                  <span className="weight">{name}</span>
                  ，如果编辑后的修改需要生效，请点击
                  <span className="weight">发布</span>
                  。
                  <span className="weight">清除修改</span>
                  点击后恢复为当前设置。
                </div>
                <div style={{ flex: 1, visibility: 'hidden' }} />
                <div>
                  {!isModified && <Button type="primary" funcType="raised" onClick={this.handleReleaseClick}>发布</Button>}
                  {isModified && <Button funcType="raised" style={{ marginLeft: 10 }} onClick={this.handleClearModify}>清除修改</Button>}
                </div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 500, margin: '20px 0 10px' }}>{name}</div>
              <div style={{ marginBottom: 20 }}>{description}</div>
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
