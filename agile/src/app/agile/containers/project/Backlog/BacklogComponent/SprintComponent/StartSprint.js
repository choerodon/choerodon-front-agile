import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Form, Modal, Select, Input, DatePicker } from 'choerodon-ui';
import { Content, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import moment from 'moment';
import BacklogStore from '../../../../../stores/project/backlog/BacklogStore';

const { Sidebar } = Modal;
const FormItem = Form.Item;
const { TextArea } = Input;
const Option = Select.Option;
const { AppState } = stores;

@observer
class StartSprint extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: null,
      endDate: null,
    };
  }
  handleStartSprint(e) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const data = {
          endDate: values.endDate ? `${moment(values.endDate).format('YYYY-MM-DD')} 00:00:00` : null,
          startDate: values.startDate ? `${moment(values.startDate).format('YYYY-MM-DD')} 00:00:00` : null,
          projectId: AppState.currentMenuType.id,
          sprintGoal: values.goal,
          sprintId: this.props.data.sprintId,
          sprintName: values.name,
          objectVersionNumber: this.props.data.objectVersionNumber,
        };
        BacklogStore.axiosStartSprint(data).then((res) => {
          this.props.onCancel();
          this.props.refresh();
        }).catch((error) => {
          window.console.log(error);
        });
      }
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const data = this.props.data;
    const completeMessage = JSON.stringify(BacklogStore.getOpenSprintDetail) === '{}' ? null : BacklogStore.getOpenSprintDetail;
    return (
      <Sidebar
        title="开启冲刺"
        visible={this.props.visible}
        okText="开启"
        cancelText="取消"
        onCancel={this.props.onCancel.bind(this)}
        onOk={this.handleStartSprint.bind(this)}
      >
        <Content
          style={{
            padding: 0,
            paddingBottom: 20,
          }}
          title={`开启冲刺“${data.sprintName}”`}
          description="请在下面输入冲刺名称、目标，选择冲刺的时间周期范围，开启新的冲刺。每个项目中仅能有一个活跃的冲刺，同时尽量避免在开启的冲刺中添加新的故事和任务，尽可能在开启冲刺前的迭代会议上完成冲刺的任务范围。"
          
        >
          <p className="c7n-closeSprint-message">
            <span>{!_.isNull(completeMessage) ? completeMessage.issueCount : ''}</span> 个问题 将包含在此Sprint中
          </p>
          <Form style={{ width: 512, marginTop: 24 }}>
            <FormItem>
              {getFieldDecorator('name', {
                initialValue: !_.isNull(completeMessage) ? completeMessage.sprintName : null,
                rules: [{
                  required: true,
                  message: '冲刺名称是必须的',
                }],
              })(
                <Input label="Sprint名称" maxLength={30} />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('goal', {
                initialValue: !_.isNull(completeMessage) ? completeMessage.sprintGoal : null,
              })(
                <TextArea label="目标" autoSize maxLength={30} />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('duration', {
                initialValue: '0',
              })(
                <Select
                  label="周期"
                  onChange={(value) => {
                    if (parseInt(value, 10) > 0) {
                      if (!this.props.form.getFieldValue('startDate')) {
                        this.props.form.setFieldsValue({
                          startDate: moment(),
                        });
                        this.setState({
                          startDate: moment(),
                        });
                      }
                      this.props.form.setFieldsValue({
                        endDate: moment(this.props.form.getFieldValue('startDate')).add(parseInt(value, 10), 'w'),
                      });
                      this.setState({
                        endDate: moment(this.props.form.getFieldValue('startDate')).add(parseInt(value, 10), 'w'),
                      });
                    }
                  }}
                >
                  <Option value="0">自定义</Option>
                  <Option value="1">1周</Option>
                  <Option value="2">2周</Option>
                  <Option value="4">4周</Option>
                </Select>,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('startDate', {
                rules: [{
                  required: true,
                  message: '开始日期是必须的',
                }],
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  label="开始日期"
                  disabledDate={this.state.endDate ? 
                    current => current > moment(this.state.endDate) || current < moment().subtract(1, 'days') : current => current < moment().subtract(1, 'days')}
                  onChange={(date, dateString) => {
                    this.props.form.setFieldsValue({
                      startDate: date,
                    });
                    this.setState({
                      startDate: date,
                    });
                    if (parseInt(this.props.form.getFieldValue('duration'), 10) > 0) {
                      this.props.form.setFieldsValue({
                        endDate: moment(this.props.form.getFieldValue('startDate')).add(parseInt(this.props.form.getFieldValue('duration'), 10), 'w'),
                      });
                      this.setState({
                        endDate: moment(this.props.form.getFieldValue('startDate')).add(parseInt(this.props.form.getFieldValue('duration'), 10), 'w'),
                      });
                    }
                  }}
                />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('endDate', {
                rules: [{
                  required: true,
                  message: '结束日期是必须的',
                }],
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  label="结束日期"
                  disabled={parseInt(this.props.form.getFieldValue('duration'), 10) > 0}
                  onChange={(date) => {
                    this.setState({
                      endDate: date,
                    });
                  }}
                  disabledDate={this.state.startDate ? 
                    current => current < moment(this.state.startDate) || current < moment().subtract(1, 'days') : 
                    current => current < moment().subtract(1, 'days')}
                />,
              )}
            </FormItem>
          </Form>
        </Content>
      </Sidebar>
    );
  }
}

export default Form.create()(StartSprint);
