import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Content, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import {
  Form, Modal, Input, Select, 
} from 'choerodon-ui';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';

const FormItem = Form.Item;
const { Sidebar } = Modal;
const Option = Select.Option;
const { AppState } = stores;

@observer
class AddStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  handleAddStatus(e) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          loading: true,
        });
        
        const params = {
          name: values.name,
          projectId: AppState.currentMenuType.id,
          enable: true,
          categoryCode: values.categoryCode,
        };
        ScrumBoardStore.axiosAddStatus(params).then((data) => {
          this.props.onChangeVisible(false);
          this.props.refresh();
          this.setState({
            loading: false,
          });
        }).catch((error) => {
          this.setState({
            loading: false,
          });
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
      for (let index = 0, len = data.length; index < len; index += 1) {
        let color = '';
        if (data[index].valueCode === 'doing') {
          color = 'rgb(77, 144, 254)';
        } else if (data[index].valueCode === 'done') {
          color = 'rgb(0, 191, 165)';
        } else {
          color = 'rgb(255, 177, 0)';
        }
        result.push(
          <Option value={data[index].valueCode}>
            <div style={{ display: 'inline-flex', justifyContent: 'flex-start', alignItems: 'center' }}>
              <div style={{
                width: 15, height: 15, borderRadius: 2, marginRight: 5, background: color, 
              }}
              />
              <span> 
                {' '}
                {data[index].name}
              </span>
            </div>

          </Option>,
        );
      }
    }
    return result;
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let name;
    for (let index = 0, len = ScrumBoardStore.getBoardList.length; index < len; index += 1) {
      if (ScrumBoardStore.getBoardList[index].boardId === ScrumBoardStore.getSelectedBoard) {
        name = ScrumBoardStore.getBoardList[index].name;
      }
    }
    return (
      <Sidebar
        title="添加状态"
        visible={this.props.visible}
        onCancel={this.props.onChangeVisible.bind(this, false)}
        onOk={this.handleAddStatus.bind(this)}
        confirmLoading={this.state.loading}
        okText="创建"
        cancelText="取消"
      >
        <Content
          style={{ padding: 0 }}
          title={this.props.fromStatus ? `在项目“${AppState.currentMenuType.name}”中创建状态` : `添加看板“${name}”的状态`}
          description="请在下面输入状态名称，选择状态的类别。可以添加、删除、重新排序和重命名一个状态，配置完成后，您可以通过board对问题拖拽进行状态的流转。"
          link="http://v0-10.choerodon.io/zh/docs/user-guide/agile/sprint/manage-kanban/"
        >
          <Form style={{ width: 512 }}>
            <FormItem>
              {getFieldDecorator('name', {
                rules: [{
                  required: true, message: '状态名称是必须的',
                }, {
                  validator: this.checkStatusName.bind(this),
                }],
              })(
                <Input label="状态名称" placeholder="请输入状态名称" maxLength={30} />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('categoryCode', {
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

export default Form.create()(AddStatus);
