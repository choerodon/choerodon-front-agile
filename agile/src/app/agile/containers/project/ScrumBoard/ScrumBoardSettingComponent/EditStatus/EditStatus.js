import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Content, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import { Form, Modal, Input, Select } from 'choerodon-ui';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';

const FormItem = Form.Item;
const { Sidebar } = Modal;
const Option = Select.Option;
const { AppState } = stores;

@observer
class EditStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  handleEditStatus(e) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const params = {
          name: values.name,
          projectId: AppState.currentMenuType.id,
          enable: true,
          categoryCode: values.categoryCode,
        };
        ScrumBoardStore.axiosAddStatus(params).then((data) => {
          this.props.onChangeVisible(false);
          this.props.refresh();
        }).catch((error) => {
          window.console.log(error);
        });
      }
    });
  }
  checkStatusName(rule, value, callback) {
    ScrumBoardStore.axiosCheckRepeatName(value).then((res) => {
      if (res) {
        callback('状态名称重复');
      } else {
        callback();
      }
    }).catch((error) => {
      window.console.log(error);
    });
  }
  renderOptions() {
    const result = [];
    if (JSON.stringify(ScrumBoardStore.getStatusCategory) !== '{}') {
      const data = ScrumBoardStore.getStatusCategory.lookupValues;
      data.sort((x, y) => {
        if (x.valueCode === 'todo') {
          return -1;
        } else if (x.valueCode === 'done') {
          return 1;
        } else if (y.valueCode === 'todo') {
          return 1;
        } else {
          return -1;
        }
      });
      _.forEach(data, (item) => {
        result.push(
          <Option value={item.valueCode}>{item.name}</Option>,
        );
      });
    }
    return result;
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    let name;
    _.forEach(ScrumBoardStore.getBoardList, (item) => {
      if (item.boardId === ScrumBoardStore.getSelectedBoard) {
        name = item.name;
      }
    });
    return (
      <Sidebar
        title="修改状态"
        visible={this.props.visible}
        onCancel={this.props.onChangeVisible.bind(this, false)}
        onOk={this.handleEditStatus.bind(this)}
        okText="修改"
        cancelText="取消"
      >
        <Content
          style={{ padding: 0 }}
          title={`修改看板“${name}”的状态`}
          description="请在下面输入状态名称，选择状态的类别。可以添加、删除、重新排序和重命名一个状态，配置完成后，您可以通过board对问题拖拽进行状态的流转。"
          // link="#"
        >
          <Form style={{ width: 512 }}>
            <FormItem>
              {getFieldDecorator('name', {
                initialValue: this.props.data.name ? this.props.data.name : undefined,
                rules: [{
                  required: true, message: '状态名称是必须的',
                }, {
                  validator: this.checkStatusName.bind(this),
                }],
              })(
                <Input label="状态名称" placeholder="请输入状态名称" />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('categoryCode', {
                initialValue: this.props.data.categoryCode ? 
                  this.props.data.categoryCode : undefined,
                rules: [{
                  required: true, message: '类别是必须的',
                }],
              })(
                <Select
                  label="类别"
                  placeholder="请选择类别"
                >
                  {this.renderOptions()}
                  {/* <Option value="todo">todo</Option> */}
                </Select>,
              )}
            </FormItem>
          </Form>
        </Content>
      </Sidebar>
    );
  }
}

export default Form.create()(EditStatus);

