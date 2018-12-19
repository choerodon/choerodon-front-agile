import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  Modal, Form, Select, Icon, Input,
} from 'choerodon-ui';
import { Content, stores } from 'choerodon-front-boot';
import TypeTag from '../../../../../components/TypeTag';

const { AppState } = stores;
const { Sidebar } = Modal;
const FormItem = Form.Item;
const { Option } = Select.Option;
const { TextArea } = Input;

@observer
class CreateEpic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  /**
   *
   * 创建史诗
   * @param {*} e
   * @memberof CreateEpic
   */
  handleCreateEpic =(e) => {
    const { form, store, onCancel } = this.props;
    const issueTypes = store.getIssueTypes || [];
    const defaultPriorityId = store.getDefaultPriority ? store.getDefaultPriority.id : '';
    e.preventDefault();
    form.validateFieldsAndScroll((err, value) => {
      if (!err) {
        const epicType = issueTypes.find(t => t.typeCode === 'issue_epic');
        const data = {
          projectId: AppState.currentMenuType.id,
          epicName: value.name,
          summary: value.summary,
          typeCode: 'issue_epic',
          issueTypeId: epicType && epicType.id,
          priorityCode: `priority-${defaultPriorityId}`,
          priorityId: defaultPriorityId,
        };
        this.setState({
          loading: true,
        });
        store.axiosEasyCreateIssue(data).then((res) => {
          this.setState({
            loading: false,
          });
          form.resetFields();
          onCancel();
          store.axiosGetEpic().then((data3) => {
            const newEpic = [...data3];
            for (let index = 0, len = newEpic.length; index < len; index += 1) {
              newEpic[index].expand = false;
            }
            store.setEpicData(newEpic);
          }).catch((error3) => {
          });
        }).catch((error) => {
          this.setState({
            loading: false,
          });
        });
      }
    });
  };

  render() {
    const {
      form, onCancel, visible, store,
    } = this.props;
    const issueTypes = store.getIssueTypes || [];
    const epicType = issueTypes.find(t => t.typeCode === 'issue_epic');
    const { loading } = this.state;
    const { getFieldDecorator } = form;
    return (
      <Sidebar
        title="创建史诗"
        visible={visible}
        okText="新建"
        cancelText="取消"
        onCancel={() => {
          form.resetFields();
          onCancel();
        }}
        confirmLoading={loading}
        onOk={this.handleCreateEpic}
      >
        <Content
          style={{
            padding: 0,
          }}
          title={`创建项目“${AppState.currentMenuType.name}”的史诗`}
          description="请在下面输入史诗名称、概要，创建新史诗。"
          link="http://v0-10.choerodon.io/zh/docs/user-guide/agile/backlog/epic/"
        >
          <Form style={{ width: 512 }}>
            <FormItem>
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                  message: '史诗名称不能为空',
                  transform: value => value && value.trim(),
                }],
              })(
                <Input label="史诗名称" maxLength={10} />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('summary', {
                rules: [{
                  required: true,
                  message: '概要不能为空',
                  transform: value => value && value.trim(),
                }],
              })(
                <TextArea autosize label="概要" maxLength={44} />,
              )}
            </FormItem>
          </Form>
        </Content>
      </Sidebar>
    );
  }
}

export default Form.create()(CreateEpic);
