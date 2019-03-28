import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Form, Input, Modal, DatePicker, Select, Steps, Button, Tabs,
} from 'choerodon-ui';
import SelectFocusLoad from '../../../../../../components/SelectFocusLoad';
import './CreateArt.scss';

const FormItem = Form.Item;
const { Sidebar } = Modal;
const { Option } = Select;
const { Step } = Steps;
const { TabPane } = Tabs;


const propTypes = {
  visible: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
class CreateArt extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 0,
    };
  }

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, prevState) {
    const { form, visible } = this.props;
    if (!prevProps.visible && visible) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        currentStep: 0,
      });
      form.resetFields();
    }
  }

  handlePrevStep = () => {
    const { currentStep } = this.state;
    const prevStep = currentStep - 1;
    this.setState({
      currentStep: prevStep,
    });
  }

  handleNextStep = () => {
    const { currentStep } = this.state;
    const nextStep = currentStep + 1;
    this.setState({
      currentStep: nextStep,
    });
  }

  handleOk = () => {
    const { onSubmit, form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        onSubmit(values);
      }
    });
  }

  handlePrevStep = () => {
    const { currentStep } = this.state;
    const prevStep = currentStep - 1;
    this.setState({
      currentStep: prevStep,
    });
  }


  handleNextStep = () => {
    const { currentStep } = this.state;
    const nextStep = currentStep + 1;
    this.setState({
      currentStep: nextStep,
    });
  }


  render() {
    const {
      visible, onCancel, loading, form,
    } = this.props;
    const { getFieldDecorator } = form;
    const { currentStep } = this.state;
    const steps = [
      {
        title: 'ART基本信息',
        content: (
          <div>
            <FormItem>
              {getFieldDecorator('name', {
                rules: [{
                  required: true, message: '请输入ART名称!',
                }],
              })(
                <Input style={{ width: 500 }} maxLength={30} label="ART名称" placeholder="请输入ART名称" />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('code', {
                rules: [{
                  required: true, message: '请输入ART的编号!',
                }],
              })(
                <Input style={{ width: 500 }} maxLength={30} label="编号" placeholder="请输入ART的编号" />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('rteId', {
                normalize: value => (value === 0 ? undefined : value),
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
             
              })(
                <DatePicker
                  allowClear
                  format="YYYY-MM-DD"
                  style={{ width: 500 }}
                  label="开始日期"
                />,
              )}
            </FormItem>
            <FormItem>
              {
                getFieldDecorator('piCount', {
                  rules: [{
                    required: true,
                    message: '请选择初始PI生成个数',
                  }],
                })(
                  <Select style={{ width: 500, marginBottom: 15 }} label="请选择初始PI生成个数">
                    {
                      [1, 2, 3, 4, 5, 6, 7, 8].map(value => <Option key={value} value={value}>{value}</Option>)
                    }
                  </Select>,
                )
              }
            </FormItem>
            {/* <FormItem>
              {getFieldDecorator('enabled', {
                valuePropName: 'checked',
                initialValue: false,
              })(
                <Checkbox>启用</Checkbox>,
              )}
            </FormItem> */}
          </div>),
      },
      {
        title: 'ART节奏',
        content: (
          <div>
            <div style={{ display: 'flex', width: 500 }}>
              <FormItem style={{ marginRight: 20 }}>
                {getFieldDecorator('interationCount', {
                  rules: [{
                    required: true, message: '请输入ART中每个PI的迭代数!',
                  }],
                })(
                  <Select style={{ width: 180 }} label="迭代数" placeholder="请输入ART中每个PI的迭代数">
                    {
                      [1, 2, 3, 4].map(value => <Option value={value}>{value}</Option>)
                    }
                  </Select>,

                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('interationWeeks', {
                  rules: [{
                    required: true, message: '请选择每个迭代的工作周数!',
                  }],
                })(
                  <Select style={{ width: 300 }} label="迭代时长（周）" placeholder="请选择每个迭代的工作周数">
                    {
                    [1, 2, 3, 4].map(value => <Option value={value}>{value}</Option>)
                  }
                  </Select>,
                )}
                {/* <Tooltip title="规划一个迭代的时长，通常是2周或者4周。">
                <Icon
                  type="error"
                  className="tooltip-icon"
                />
              </Tooltip> */}
              </FormItem>
            </div>
            <FormItem>
              {getFieldDecorator('ipWeeks', {
                rules: [{
                  required: true, message: '请选择日期!',
                }],
              })(
                <Select style={{ width: 500 }} label="IP时长（周）" placeholder="请选择IP时长">
                  {
                    [1, 2, 3, 4].map(value => <Option value={value}>{value}</Option>)
                  }
                </Select>,
              )}
              {/* <Tooltip title="为团队提供规律、有节奏的时间，让团队可以有机会开展一些在持续不断的增量价值发布的环境中很难进行的工作。通常设为1周">
                <Icon
                  type="error"
                  className="tooltip-icon after-input"
                />
              </Tooltip> */}
            </FormItem>
          </div>),
      },
      {
        title: 'PI规则',
        content: (
          <div>
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
                normalize: value => (value ? value.replace(/[^\d]/g, '') : value),
              })(
                <Input style={{ width: 500 }} label="PI起始编号" placeholder="请输入PI起始编号" maxLength={3} />,
              )}
            </FormItem>
          </div>),
      },
    ];
    return (
      <Sidebar
        title="创建ART"
        visible={visible}
        footer={(
          <div className="c7n-art-stepBtn">
            {
              currentStep > 0 && (
                <Button type="primary" onClick={() => this.handlePrevStep()}>上一步</Button>
              )
            }
            {
              currentStep < steps.length - 1 && (
                <Button type="primary" funcType="raised" onClick={() => this.handleNextStep()}>下一步</Button>
              )
            }
            {
              currentStep === steps.length - 1 && (
              <Button type="primary" funcType="raised" onClick={() => { this.handleOk(); }}>保存</Button>
              )
            }
            <Button onClick={onCancel} funcType="raised" style={{ marginLeft: 10 }}>取消</Button>
          </div>
          )}
        confirmLoading={loading}
        // eslint-disable-next-line react/jsx-no-duplicate-props
        footer={(
          <div className="c7n-art-stepBtn">
            {
              currentStep > 0 && (
                <Button type="primary" onClick={() => this.handlePrevStep()}>上一步</Button>
              )
            }
            {
              currentStep < steps.length - 1 && (
                <Button type="primary" funcType="raised" onClick={() => this.handleNextStep()}>下一步</Button>
              )
            }
            {
              currentStep === steps.length - 1 && (
              <Button type="primary" funcType="raised" onClick={() => { this.handleOk(); }}>保存</Button>
              )
            }
            <Button onClick={onCancel} funcType="raised" style={{ marginLeft: 10 }}>取消</Button>
          </div>
          )}
      >
        <Steps current={currentStep}>
          {
            steps.map(item => <Step title={item.title} key={item.title} />)
          }
        </Steps>
        <div className="c7n-art-stepContent">
          <Tabs activeKey={currentStep.toString()}>
            {
            steps.map((item, index) => (
              <TabPane tab={item.title} key={index.toString()}>{item.content}</TabPane>
            ))
          }
          </Tabs>
        </div>
      </Sidebar>
    );
  }
}

CreateArt.propTypes = propTypes;

export default Form.create()(CreateArt);
