/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  Form, Input, Tabs, DatePicker,
  Button, Divider, Select,
} from 'choerodon-ui';
import EventEmitter from 'wolfy87-eventemitter';
import './ArtForm.scss';

import SelectFocusLoad from '../../../../../../../components/SelectFocusLoad';
import PIList from './PIList';

const ee = new EventEmitter();

const { Option } = Select;
const { TabPane } = Tabs;
const FormItem = Form.Item;
const Fields = {
  1: ['code', 'piCount', 'rteId', 'startDate'],
  2: ['ipWeeks', 'interationCount', 'interationWeeks'],
  3: ['piCodePrefix', 'piCodeNumber', 'sprintCompleteSetting'],
};
const propTypes = {
  initValue: PropTypes.shape({}).isRequired,
  onSave: PropTypes.func.isRequired,
};
class ArtForm extends Component {
  state = {
    currentTab: '1',
  }

  componentDidMount() {
    const { form, initValue } = this.props;
    form.setFieldsValue(initValue);
    ee.addListener('setCurrentTab', this.handleSetCurrentTab);
  }

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, prevState) {
    const { form, initValue } = this.props;
    if (prevProps.initValue !== initValue) {
      form.setFieldsValue(initValue);
    }
  }

  handleTabChange = (currentTab) => {
    this.setState({
      currentTab,
    });
  }

  onSave = () => {
    const { onSave, form } = this.props;
    const { currentTab } = this.state;
    const fields = Fields[currentTab];
    form.validateFieldsAndScroll(fields, (err, values) => {
      if (!err) {
        onSave(values);
      }
    });
  }

  handleCancel = () => {
    const { currentTab } = this.state;
    const fields = Fields[currentTab];
    const { form, initValue } = this.props;
    const values = {};
    fields.forEach((field) => {
      values[field] = initValue[field];
    });
    form.setFieldsValue(values);
  }

  handleSetCurrentTab = () => {
    this.setState({
      currentTab: '4',
    });
  }

  checkPiCodePrefix = (rule, value, callback) => {
    if (/^[a-z]*?$/i.test(value)) {
      callback();
    } else {
      callback('前缀只允许字母');
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    // eslint-disable-next-line no-shadow
    const {
      initValue, PiList, onGetPIList, data, onGetArtInfo, onDeletePI,
    } = this.props;
    const { currentTab } = this.state;
    return (
      <Form className="c7nagile-ArtForm">
        <Tabs defaultActiveKey="1" activeKey={currentTab} onChange={this.handleTabChange}>
          <TabPane tab="ART设置" key="1">
            <FormItem>
              {getFieldDecorator('rteId', {
                normalize: value => (value === 0 || value === null ? undefined : value),
              })(
                <SelectFocusLoad allowClear type="user" label="发布火车工程师" style={{ width: 500 }} />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('startDate', {
                rules: [{
                  required: true,
                  message: '请选择日期!',
                }],
                normalize: value => value && moment(value),
              })(
                <DatePicker
                  allowClear={false}
                  format="YYYY-MM-DD"
                  style={{ width: 500 }}
                  label="开始日期"
                  disabledDate={current => current < moment()}
                />,
              )}
            </FormItem>
            <FormItem style={{ marginBottom: 16 }}>
              {
                getFieldDecorator('piCount', {
                  rules: [{
                    required: true,
                    message: '请选择PI生成个数',
                  }],
                  initialValue: 3,
                })(
                  <Input style={{ width: 500, marginBottom: 15 }} label="PI生成个数" disabled />,
                )
              }
            </FormItem>
          </TabPane>
          <TabPane tab="ART节奏" key="2">
            <div style={{ display: 'flex', width: 500 }}>
              <FormItem style={{ marginRight: 20 }}>
                {getFieldDecorator('interationCount', {
                  rules: [{
                    required: true, message: '请输入ART中每个PI的迭代数',
                  }],
                })(
                  <Select style={{ width: 180 }} label="迭代数" placeholder="请输入ART中每个PI的迭代数">
                    {
                      [2, 3, 4].map(value => <Option value={value}>{value}</Option>)
                    }
                  </Select>,

                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('interationWeeks', {
                  rules: [{
                    required: true, message: '请选择每个迭代的工作周数',
                  }],
                })(
                  <Select style={{ width: 300 }} label="迭代时长（周）" placeholder="请选择每个迭代的工作周数">
                    {
                      [1, 2, 3, 4].map(value => <Option value={value}>{value}</Option>)
                    }
                  </Select>,
                )}
              </FormItem>
            </div>

            <FormItem>
              {getFieldDecorator('ipWeeks', {
                rules: [{
                  required: true, message: '请选择IP时长!',
                }],
                initialValue: 1,
              })(
                <Input style={{ width: 500 }} label="IP时长（周）" disabled />,
              )}
            </FormItem>
          </TabPane>
          <TabPane tab="PI规则" key="3">
            <FormItem>
              {getFieldDecorator('piCodePrefix', {
                rules: [{
                  required: true, message: '请输入PI前缀',
                }, {
                  validator: this.checkPiCodePrefix,
                }],
              })(
                <Input style={{ width: 500 }} label="PI前缀" maxLength={10} placeholder="请输入PI前缀" />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('piCodeNumber', {
                rules: [{
                  required: true, message: '请输入PI起始编号',
                }],
                normalize: value => (value ? value.toString().replace(/[^\d]|^0/g, '') : value),
              })(
                <Input style={{ width: 500 }} label="PI起始编号" maxLength={3} placeholder="请输入PI起始编号" />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('sprintCompleteSetting', {
                rules: [{
                  required: true, message: '请选择要移动的位置',
                }],
              })(
                <Select style={{ width: 500 }} label="冲刺中未完成问题移动位置">
                  <Option key="backlog" value="backlog">待办事项</Option>
                  <Option key="next_sprint" value="next_sprint">下个冲刺</Option>
                </Select>,
              )}
            </FormItem>
          </TabPane>
          {data.statusCode !== 'todo' && (
            <TabPane tab="PI列表" key="4">
              <PIList
                name={initValue.name}
                data={data}
                artId={initValue.id}
                PiList={PiList}
                onGetPIList={onGetPIList}
                onGetArtInfo={onGetArtInfo}
                onDeletePI={onDeletePI}
              />
            </TabPane>
          )}
        </Tabs>
        <Divider />
        {
          currentTab !== '4' && (
            <div>
              <Button onClick={this.onSave} type="primary" funcType="raised">保存</Button>
              <Button onClick={this.handleCancel} funcType="raised" style={{ marginLeft: 10 }}>取消</Button>
            </div>
          )
        }
      </Form>
    );
  }
}

ArtForm.propTypes = propTypes;

export { ee };
export default Form.create({
  onValuesChange(props, ...args) {
    props.onChange(...args);
  },
})(ArtForm);
