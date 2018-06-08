import React, { Component } from 'react';
import { stores, axios } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import _ from 'lodash';
import { Select, Form, Input, DatePicker, Button, Modal, Tabs, Tooltip, Radio, message, Icon } from 'choerodon-ui';

import './DailyLog.scss';
import '../../containers/main.scss';
import { NumericInput } from '../CommonComponent';
import {
  delta2Html,
  escape,
  handleFileUpload,
  text2Delta,
  beforeTextUpload,
} from '../../common/utils';
import { createWorklog } from '../../api/NewIssueApi';
import WYSIWYGEditor from '../WYSIWYGEditor';
import FullEditor from '../FullEditor';

const DATA_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const { Sidebar } = Modal;
const { Option } = Select;
const { AppState } = stores;
const RadioGroup = Radio.Group;
const TYPE = {
  1: 'self_adjustment',
  2: 'no_set_prediction_time',
  3: 'set_to',
  4: 'reduce',
};

class CreateSprint extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dissipate: undefined,
      dissipateUnit: 'h',
      startTime: null,
      radio: 1,
      time: undefined,
      timeUnit: 'h',
      reduce: undefined,
      reduceUnit: 'h',
      delta: '',
      createLoading: false,
    };
  }

  componentDidMount() {
  }


  onRadioChange = (e) => {
    this.setState({
      radio: e.target.value,
    });
  }

  handleFullEdit = (delta) => {
    this.setState({
      delta,
      edit: false,
    });
  }

  transformTime(pro, unit) {
    const TIME = {
      h: 1,
      d: 8,
      w: 40,
    };
    if (!this.state[pro]) {
      return 0;
    } else {
      return this.state[pro] * TIME[this.state[unit]];
    }
  }

  handleCreateDailyLog = () => {
    const { dissipate, startTime } = this.state;
    if (typeof dissipate === 'undefined' || dissipate === '' || startTime == null) {
      message.warning('请输入预计时间和耗费时间');
      return;
    }
    this.setState({ createLoading: true });
    let num;
    if (this.state.radio === '3' || this.state.radio === 3) {
      num = this.transformTime('time', 'timeUnit');
    }
    if (this.state.radio === '4' || this.state.radio === 4) {
      num = this.transformTime('reduce', 'reduceUnit');
    }
    const extra = {
      issueId: this.props.issueId,
      projectId: AppState.currentMenuType.id,
      startDate: this.state.startTime.format('YYYY-MM-DD HH:mm:ss'),
      workTime: this.transformTime('dissipate', 'dissipateUnit'),
      residualPrediction: TYPE[this.state.radio],
      predictionTime: [3, 4].indexOf(this.state.radio) === -1 ? undefined : num,
    };
    const deltaOps = this.state.delta;
    if (deltaOps) {
      beforeTextUpload(deltaOps, extra, this.handleSave);
    } else {
      extra.description = '';
      this.handleSave(extra);
    }
  };

  handleSave = (data) => {
    createWorklog(data)
      .then((res) => {
        this.props.onOk();
      })
      .catch((error) => {
        window.console.log('创建工作日志失败');
      });
  };

  handleDissipateChange = (e) => {
    this.setState({ dissipate: e });
  }

  handleDissipateUnitChange = (value) => {
    this.setState({ dissipateUnit: value });
  }

  handleTimeChange = (e) => {
    this.setState({ time: e.target.value });
  }

  handleTimeUnitChange = (value) => {
    this.setState({ timeUnit: value });
  }

  handleReduceChange = (e) => {
    this.setState({ reduce: e.target.value });
  }

  handleReduceUnitChange = (value) => {
    this.setState({ reduceUnit: value });
  }

  changeEndTime = (value) => {
    const startTime = this.transTime(value);
    this.setState({
      startTime: value,
    });
  }

  isEmpty(data) {
    return data === '' || data === undefined || data === null;
  }

  formDate(data) {
    const temp = data ? new Date(data) : new Date();
    return `${temp.getFullYear()}-${temp.getMonth() + 1}-${temp.getDate()}`;
  }

  transTime(data) {
    if (this.isEmpty(data)) {
      return undefined;
    } else if (typeof data === 'string') {
      return moment(this.formDate(data), DATA_FORMAT);
    } else {
      return data.format('YYYY-MM-DD HH:mm:ss');
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { initValue, visible, onCancel, onOk } = this.props;
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    const tempAlignStyle = {
      lineHeight: '21px',
      marginBottom: 0,
      width: 100,
    };
    const callback = (value) => {
      this.setState({
        delta: value,
        edit: false,
      });
    };

    return (
      <Sidebar
        className="choerodon-modal-createSprint"
        title="登记工作日志"
        visible={visible || false}
        onOk={this.handleCreateDailyLog}
        onCancel={onCancel}
        okText="创建"
        cancelText="取消"
        confirmLoading={this.state.createLoading}
      >
        <div className="c7n-region">
          <h2 className="c7n-space-first">{`登记"${this.props.issueNum}"的工作日志`}</h2>
          <p>
            您可以在这里记录您的工作，花费的时间会在关联问题中预估时间进行扣减，以便更精确地计算问题进度和提升工作效率。
            {/* <a href="http://c7n.saas.hand-china.com/docs/devops/develop/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
              了解详情
              </span>
              <Icon type="open_in_new" />
            </a> */}
          </p>
          <section className="info">
            <div className="line-info">
              <NumericInput
                label="耗费时间*"
                style={tempAlignStyle}
                value={this.state.dissipate}
                onChange={this.handleDissipateChange.bind(this)}
              />
              <Select
                value={this.state.dissipateUnit}
                style={{ width: 100, marginLeft: 18 }}
                onChange={this.handleDissipateUnitChange.bind(this)}
              >
                {['h', 'd', 'w'].map(type => (
                  <Option key={`${type}`} value={`${type}`}>
                    {type}
                  </Option>),
                )}
              </Select>
            </div>
            <div className="dataPicker" style={{ marginBottom: 32, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <p style={{ fontSize: '12px', transform: 'scale(0.8)', color: 'rgba(0, 0, 0, 0.54)', position: 'absolute', left: -5 }}>开始时间*</p>
              <div style={{ marginTop: 20, width: 220, borderBottom: '1px solid rgba(0, 0, 0, 0.54)', paddingBottom: 3 }}>
                <DatePicker
                  value={this.state.startTime}
                  // value={this.transTime(this.state.startTime)}
                  format={DATA_FORMAT}
                  onChange={this.changeEndTime}
                />
              </div>
            </div>

            <div className="line-info">
              <RadioGroup label="剩余的估计" onChange={this.onRadioChange} value={this.state.radio}>
                <Radio style={radioStyle} value={1}>自动调整</Radio>
                <Radio style={radioStyle} value={2}>不设置预估时间</Radio>
                <Radio style={radioStyle} value={3}>
                  <span style={{ display: 'inline-block', width: 52 }}>设置为</span>
                  <Input
                    style={tempAlignStyle}
                    disabled={this.state.radio !== 3}
                    value={this.state.time}
                    onChange={this.handleTimeChange.bind(this)}
                  />
                  <Select
                    disabled={this.state.radio !== 3}
                    style={{ width: 100, marginLeft: 18 }}
                    value={this.state.timeUnit}
                    onChange={this.handleTimeUnitChange.bind(this)}
                  >
                    {['h', 'd', 'w'].map(type => (
                      <Option key={`${type}`} value={`${type}`}>
                        {type}
                      </Option>),
                    )}
                  </Select>
                </Radio>
                <Radio style={radioStyle} value={4}>
                  <span style={{ display: 'inline-block', width: 52 }}>缩减</span>
                  <Input
                    style={tempAlignStyle}
                    disabled={this.state.radio !== 4}
                    value={this.state.reduce}
                    onChange={this.handleReduceChange.bind(this)}
                  />
                  <Select
                    disabled={this.state.radio !== 4}
                    style={{ width: 100, marginLeft: 18 }}
                    value={this.state.reduceUnit}
                    onChange={this.handleReduceUnitChange.bind(this)}
                  >
                    {['h', 'd', 'w'].map(type => (
                      <Option key={`${type}`} value={`${type}`}>
                        {type}
                      </Option>),
                    )}
                  </Select>
                </Radio>
              </RadioGroup>
            </div>

            <div className="c7n-sidebar-info">
              <div>
                <div style={{ marginBottom: '16px', fontWeight: 'bold' }}>工作说明</div>
                {
                  !this.state.edit && (
                    <div className="clear-p-mw">
                      <WYSIWYGEditor
                        value={this.state.delta}
                        style={{ height: 200, width: '100%' }}
                        onChange={(value) => {
                          this.setState({ delta: value });
                        }}
                      />
                    </div>
                  )
                }
                <div style={{ marginTop: '23px', marginBottom: '16px' }}>
                  <Button type="primary" funcType="flat" onClick={() => this.setState({ edit: true })}>
                    全屏编辑
                  </Button>
                </div>
              </div>
            </div> 
          </section>
        </div>
        {
          this.state.edit ? (
            <FullEditor
              initValue={this.state.delta}
              visible={this.state.edit}
              onCancel={() => this.setState({ edit: false })}
              onOk={callback}
            />
          ) : null
        }
      </Sidebar>
    );
  }
}
export default Form.create({})(withRouter(CreateSprint));
