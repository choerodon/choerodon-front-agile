import React, { Component } from 'react';
import { Page, Header, Content } from 'choerodon-front-boot';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import { Icon, Button } from 'choerodon-ui';
import moment from 'moment';
import { artListLink } from '../../../../common/utils';
import { ArtSetting } from './components';

function formatter(values) {
  // eslint-disable-next-line no-param-reassign
  values.fromDate = moment(values.fromDate).format('YYYY-MM-DD');
  return values;
}
class EditArt extends Component {
  state = {
    data: {},
    isModified: false,
  }

  componentDidMount() {
    // eslint-disable-next-line react/destructuring-assignment
    const { id } = this.props.match.params;
    this.setState({
      data: {
        enginner: 7631,
        fromDate: '2018-03-22',
        isActive: true,

        ipDays: 5,
        sprintNum: 5,
        sprintWorkDays: 5,

        piPrefix: 'pre',
        piStartNum: '5',
      },
    });
  }

  handleFormChange = (changedValues, allValues) => {
    const { data, isModified } = this.state;   
    if (!isEqual(formatter(allValues), data)) {
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

  handleClearModify=() => {
    const { data } = this.state;
    // 触发form的重置
    this.setState({
      data: { ...data },
      isModified: false,
    });
  }

  handleSave = () => {

  }

  render() {
    const { data, isModified } = this.state;
    return (
      <Page className="c7ntest-Issue c7ntest-region">
        <Header
          title="编辑ART"
          backPath={artListLink()}
        />
        <Content>
          <div style={{ display: 'flex' }}>
            <div><Icon type="warning" style={{ color: '#FADB14' }} /></div>
            <div style={{ width: 500, marginLeft: 5 }}>
              注意：此ART正在进行中。你正在编辑 项目A敏捷发布火车 ，如果编辑后的修
              改需要生效，请点击 发布 。清除修改 点击后恢复为当前设置。
            </div>
            <div style={{ flex: 1, visibility: 'hidden' }} />
            <div>
              {!isModified && <Button type="primary" funcType="raised">发布</Button>}
              {isModified && <Button funcType="raised" style={{ marginLeft: 10 }} onClick={this.handleClearModify}>清除修改</Button>}
            </div>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 500, margin: '20px 0 10px' }}>项目A敏捷发布火车</div>
          <div style={{ marginBottom: 20 }}>项目A敏捷发布火车的各种机会机会计划计划计划</div>
          <ArtSetting
            initValue={data}
            onFormChange={this.handleFormChange}
            onSave={this.handleSave}
          />
        </Content>
      </Page>
    );
  }
}

EditArt.propTypes = {

};

export default EditArt;
