import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { axios, Content, stores } from 'choerodon-front-boot';
import {
  Form, Modal, Input, Select,
} from 'choerodon-ui';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';
import { STATUS } from '../../../../../common/Constant';

const FormItem = Form.Item;
const { Sidebar } = Modal;
const { Option } = Select;
const { confirm } = Modal;
const { AppState } = stores;

@observer
class AddColumn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      statusType: false,
    };
    this.checkStatusDebounce = false;
  }

  handleAddColumn(e) {
    const { form } = this.props;
    const { statusType } = this.state;
    const that = this;
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        if (statusType) {
          confirm({
            title: '警告',
            content: `已存在状态${values.column_name}，如果创建该列，不会创建同名状态`,
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
              });
            },
            onCancel() {
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
            this.setState({
              loading: false,
            });
          });
        }
      }
    });
  }

  checkStatusName(rule, value, callback) {
    const { store, form } = this.props;
    const statusDate = store.getStatusList;
    if (this.checkStatusDebounce) {
      clearTimeout(this.checkStatusDebounce);
      this.checkStatusDebounce = null;
    }
    this.checkStatusDebounce = setTimeout(() => {
      axios.get(`state/v1/projects/${AppState.currentMenuType.id}/status/project_check_name?organization_id=${AppState.currentMenuType.organizationId}&name=${value}`).then((res) => {
        if (res.statusExist) {
          this.setState({
            statusType: res.type,
          }, () => {
            form.setFieldsValue({
              column_categoryCode: res.type,
            });
          });
        } else {
          this.setState({
            statusType: false,
          }, () => {
            form.setFieldsValue({
              column_categoryCode: '',
            });
          });
        }
        callback();
      });
    }, 300);
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
        result.push(
          <Option value={data[index].valueCode}>
            <div style={{ display: 'inline-flex', justifyContent: 'flex-start', alignItems: 'center' }}>
              <div style={{
                width: 15,
                height: 15,
                borderRadius: 2,
                marginRight: 5,
                background: STATUS[data[index].valueCode] || 'rgb(255, 177, 0)',
              }}
              />
              <span>
                {` ${data[index].name}`}
              </span>
            </div>
          </Option>,
        );
      }
    }
    return result;
  }

  render() {
    const {
      form,
      visible,
      onChangeVisible,
    } = this.props;
    const {
      loading,
      statusType,
    } = this.state;
    const { getFieldDecorator } = form;
    let kanbanName;
    for (let index = 0, len = ScrumBoardStore.getBoardList.length; index < len; index += 1) {
      if (ScrumBoardStore.getBoardList[index].boardId === ScrumBoardStore.getSelectedBoard) {
        kanbanName = ScrumBoardStore.getBoardList[index].name;
      }
    }
    return (
      <Sidebar
        title="添加列"
        visible={visible}
        onCancel={onChangeVisible.bind(this, false)}
        confirmLoading={loading}
        onOk={this.handleAddColumn.bind(this)}
        okText="创建"
        cancelText="取消"
      >
        <Content
          style={{ padding: 0 }}
          title={`添加看板“${kanbanName}”的列`}
          description="请在下面输入列名，选择列的类别。可以添加、删除、重新排序和重命名一个列，同时可以通过设置最大最小值来控制每列中的问题数量。"
          link="http://v0-10.choerodon.io/zh/docs/user-guide/agile/sprint/manage-kanban/"
        >
          <Form style={{ width: 512 }}>
            <FormItem>
              {getFieldDecorator('column_name', {
                rules: [{
                  required: true, message: '列名称是必须的',
                }, {
                  validator: this.checkStatusName.bind(this),
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
                  disabled={!!statusType}
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
