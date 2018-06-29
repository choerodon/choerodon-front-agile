import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Content, stores } from 'choerodon-front-boot';
import { Form, Modal, Input, Select } from 'choerodon-ui';
import _ from 'lodash';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';

const FormItem = Form.Item;
const { Sidebar } = Modal;
const Option = Select.Option;
const confirm = Modal.confirm;
const { AppState } = stores;

@observer
class AddColumn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }
  handleAddColumn(e) {
    this.setState({
      loading: true,
    });
    const that = this;
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        ScrumBoardStore.axiosCheckRepeatName(values.column_name).then((res) => {
          this.setState({
            loading: false,
          });
          if (res) {
            confirm({
              title: '警告',
              content: '已有重名列，如果创建该列，不会创建同名状态',
              onOk() {
                const categoryCode = values.column_categoryCode;
                const data = {
                  boardId: ScrumBoardStore.getSelectedBoard,
                  name: values.column_name,
                  projectId: AppState.currentMenuType.id,
                  maxNum: 1,
                  minNum: 1,
                  categoryCode: values.column_categoryCode,
                  sequence: ScrumBoardStore.getBoardData.length - 1,
                };
                ScrumBoardStore.axiosAddColumn(categoryCode, data).then((res2) => {
                  that.props.onChangeVisible(false);
                  that.props.refresh();
                }).catch((error) => {
                  window.console.error(error);
                });
              },
              onCancel() {
                window.console.log('cancel');
              },
            });
          } else {
            const categoryCode = values.column_categoryCode;
            const data = {
              boardId: ScrumBoardStore.getSelectedBoard,
              name: values.column_name,
              projectId: AppState.currentMenuType.id,
              maxNum: 1,
              minNum: 1,
              categoryCode: values.column_categoryCode,
              sequence: ScrumBoardStore.getBoardData.length - 1,
            };
            ScrumBoardStore.axiosAddColumn(categoryCode, data).then((res2) => {
              that.props.onChangeVisible(false);
              that.props.refresh();
              this.setState({
                loading: false,
              });
            }).catch((error) => {
              window.console.error(error);
              this.setState({
                loading: false,
              });
            });
          }
        }).catch((error) => {
          window.console.error(error);
          this.setState({
            loading: false,
          });
        });
      }
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
        title="添加列"
        visible={this.props.visible}
        onCancel={this.props.onChangeVisible.bind(this, false)}
        confirmLoading={this.state.loading}
        onOk={this.handleAddColumn.bind(this)}
        okText="创建"
        cancelText="取消"
      >
        <Content
          style={{ padding: 0 }}
          title={`添加看板“${name}”的列`}
          description="请在下面输入列名，选择列的类别。可以添加、删除、重新排序和重命名一个列，同时可以通过设置最大最小值来控制每列中的问题数量。"
          // link="#"
        >
          <Form style={{ width: 512 }}>
            <FormItem>
              {getFieldDecorator('column_name', {
                rules: [{
                  required: true, message: '列名称是必须的',
                }],
              })(
                <Input label="列名称" placeholder="请输入列名称" />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('column_categoryCode', {
                rules: [{
                  required: true, message: '类别是必须的',
                }],
              })(
                <Select
                  label="类别"
                  placeholder="请选择类别"
                >
                  {this.renderOptions()}
                </Select>,
              )}
            </FormItem>
          </Form>
        </Content>
      </Sidebar>
    );
  }
}

export default Form.create()(AddColumn);

