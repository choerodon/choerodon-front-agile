/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  Form, Input, Tabs, DatePicker, Checkbox,
  Icon, Button, Divider, InputNumber, Select,
} from 'choerodon-ui';

import SelectFocusLoad from '../../../../../../components/SelectFocusLoad';


const { Option } = Select;
const { TabPane } = Tabs;
const FormItem = Form.Item;
const Fields = {
  1: ['rteId', 'startDate', 'enabled'],
  2: ['ipWorkdays', 'interationCount', 'interationWeeks'],
  3: ['piCodePrefix', 'piCodeNumber'],
};
function NumberFormatter(value) {
  return value && !isNaN(parseInt(value)) && parseInt(value) > 0 ? parseInt(value) : null;// eslint-disable-line
}
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
  }

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

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form>
        <Tabs defaultActiveKey="1" onChange={this.handleTabChange}>
          <TabPane tab="ART设置" key="1">
            <FormItem>
              {getFieldDecorator('rteId')(
                <SelectFocusLoad allowClear type="user" label="发布火车工程师" style={{ width: 500 }} />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('startDate', {
                rules: [{
                  required: true,
                  message: '请选择日期!',
                }],
                normalize: value => moment(value),
              })(
                <DatePicker
                  allowClear={false}
                  format="YYYY-MM-DD"
                  style={{ width: 500 }}
                  label="开始日期"
                />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('enabled', {
                valuePropName: 'checked',
              })(
                <Checkbox>启用</Checkbox>,
              )}
            </FormItem>
          </TabPane>
          <TabPane tab="ART节奏" key="2">
            <FormItem>
              {getFieldDecorator('ipWorkdays', {
                rules: [{
                  required: true, message: '请选择日期!',
                }],
              })(
                <InputNumber
                  formatter={NumberFormatter}
                  style={{ width: 500 }}
                  label="IP工作日"
                  placeholder="请输入IP工作日天数"
                />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('interationCount', {
                rules: [{
                  required: true, message: '请输入ART中每个PI的迭代数!',
                }],
              })(
                <InputNumber
                  formatter={NumberFormatter}
                  style={{ width: 500 }}
                  label="迭代数"
                  placeholder="请输入ART中每个PI的迭代数"
                />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('interationWeeks', {
                rules: [{
                  required: true, message: '请选择每个迭代的工作周数!',
                }],
              })(
                <Select style={{ width: 500 }} label="迭代工作周" placeholder="请选择每个迭代的工作周数">
                  {
                    [1, 2, 3, 4].map(value => <Option value={value}>{value}</Option>)
                  }
                </Select>,
              )}
            </FormItem>
          </TabPane>
          <TabPane tab="PI规则" key="3">
            <FormItem>
              {getFieldDecorator('piCodePrefix', {
                rules: [{
                  required: true, message: '请输入PI前缀!',
                }],
              })(
                <Input style={{ width: 500 }} label="PI前缀" placeholder="请输入PI前缀" />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('piCodeNumber', {
                rules: [{
                  required: true, message: '请输入PI起始编号!',
                }],
              })(
                <Input style={{ width: 500 }} label="PI起始编号" placeholder="请输入PI起始编号" />,
              )}
            </FormItem>
          </TabPane>
        </Tabs>
        <Divider />
        <Button onClick={this.onSave} type="primary" funcType="raised">保存</Button>
        <Button onClick={this.handleCancel} funcType="raised" style={{ marginLeft: 10 }}>取消</Button>
      </Form>
    );
  }
}

ArtForm.propTypes = propTypes;

export default Form.create({
  onValuesChange(props, ...args) {
    props.onChange(...args);
  },
})(ArtForm);
