import React, { Component } from 'react';
import {
  stores, axios, Page, Header, Content, Permission, 
} from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import {
  Form, Input, Button, Icon, Select, Radio, Spin, message,
} from 'choerodon-ui';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';

const { AppState } = stores;
const { Option } = Select;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const sign = false;

class EditBoardName extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      initialBoardName: '',
      boardName: '',
      checkResult: true,
    };
  }

  componentDidMount() {
    this.setState({
      initialBoardName: ScrumBoardStore.getBoardList.find(item => item.boardId === ScrumBoardStore.getSelectedBoard).name,
    });
  }

  checkBoardNameRepeat = (rule, value, callback) => {
    const proId = AppState.currentMenuType.id;
    this.setState(
      { boardName: value },
    );
    ScrumBoardStore.checkBoardNameRepeat(proId, value)
      .then((res) => {
        this.setState({
          checkResult: res,
        });
        if (res) {
          callback('看板名称重复');
        } else {
          callback();
        }
      });
  };

  handleUpdateBoardName = () => {
    const { boardName, checkResult } = this.state;
    const currentEditBoard = ScrumBoardStore.getBoardList.find(item => item.boardId === ScrumBoardStore.getSelectedBoard);
    const { objectVersionNumber, boardId, projectId } = currentEditBoard;
    const data = {
      objectVersionNumber,
      boardId,
      name: boardName,
      projectId,
    };

    if (!checkResult && boardName) {
      this.setState({
        loading: true,
      });
      axios.put(`/agile/v1/projects/${data.projectId}/board/${data.boardId}?boardName=${encodeURIComponent(data.name)}`, data)
        .then(() => {
          this.setState({
            loading: false,
          });
          message.success('保存成功');
          this.props.history.push(`/agile/scrumboard?type=project&id=${data.projectId}&name=${encodeURIComponent(AppState.currentMenuType.name)}&organizationId=${AppState.currentMenuType.organizationId}`);
        });
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { initialBoardName, boardName, loading } = this.state;
    return (
      <Content
        description={`您正在编辑项目“${AppState.currentMenuType.name}”的看板名称`}
        style={{
          padding: 0,
          height: '100%',
        }}
      >
        <Spin spinning={loading}>
          <Form layout="vertical">
            <FormItem label="boardName" style={{ width: 512 }}>
              {getFieldDecorator('boardName', {
                rules: [{ required: true, message: '看板名称必填' }, {
                  validator: this.checkBoardNameRepeat,
                }],
                initialValue: initialBoardName,
              })(
                <Input
                  label="看板名称"
                  maxLength={10}
                />,
              )}
            </FormItem>
          </Form>
          <div style={{ padding: '12px 0', borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
            <Button
              type="primary"
              funcType="raised"
              loading={this.state.loading}
              onClick={this.handleUpdateBoardName}
            >
              {'保存'}
            </Button>
            <Button
              funcType="raised"
              style={{ marginLeft: 12 }}
              onClick={() => {
                this.props.history.push(`/agile/scrumboard?type=project&id=${AppState.currentMenuType.id}&name=${encodeURIComponent(AppState.currentMenuType.name)}&organizationId=${AppState.currentMenuType.organizationId}`);
              }}
            >
              {'取消'}
            </Button>
          </div>
        </Spin>
       
      </Content>
    );
  }
}
export default withRouter(Form.create()(EditBoardName));
