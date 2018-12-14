import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Content, stores, axios } from 'choerodon-front-boot';
import {
  Form, Modal, Input, Select,
} from 'choerodon-ui';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';
import { STATUS } from '../../../../../common/Constant';

const FormItem = Form.Item;
const { Sidebar } = Modal;
const { Option } = Select;
const { AppState } = stores;

@observer
class AddStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      statusType: false,
    };
    this.checkStatusDebounce = false;
  }

  handleAddStatus(e) {
    e.preventDefault();
    const { form, onChangeVisible, refresh } = this.props;
    form.validateFields((err, values) => {
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
          onChangeVisible(false);
          refresh();
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
    const { store, form } = this.props;
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
              categoryCode: res.type,
            });
          });
        } else {
          this.setState({
            statusType: false,
          }, () => {
            form.setFieldsValue({
              categoryCode: '',
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
      fromStatus,
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
        title="添加状态"
        visible={visible}
        onCancel={onChangeVisible.bind(this, false)}
        onOk={this.handleAddStatus.bind(this)}
        confirmLoading={loading}
        okText="创建"
        cancelText="取消"
      >
        <Content
          style={{ padding: 0 }}
          title={fromStatus ? `在项目“${AppState.currentMenuType.name}”中创建状态` : `添加看板“${kanbanName}”的状态`}
          description="请在下面输入状态名称，选择状态的类别。可以添加、删除、重新排序和重命名一个状态，配置完成后，您可以通过board对问题拖拽进行状态的流转。"
          link="http://v0-10.choerodon.io/zh/docs/user-guide/agile/sprint/manage-kanban/"
        >
          <Form style={{ width: 512 }}>
            <FormItem>
              {getFieldDecorator('name', {
                rules: [{
                  required: true, message: '状态名称是必填的',
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
                  required: true, message: '类别是必填的',
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

export default Form.create()(AddStatus);
