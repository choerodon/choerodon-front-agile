import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Content, stores } from 'choerodon-front-boot';
import { Button, Select, Icon, message } from 'choerodon-ui';
import _ from 'lodash';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';

const { AppState } = stores;
const Option = Select.Option;

@observer
class SwimLanePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectValue: '',
    };
  }
  handleSave(select) {
    const data = {
      objectVersionNumber: select.objectVersionNumber,
      boardId: select.boardId,
      swimlaneBasedCode: this.state.selectValue ? this.state.selectValue : select.swimlaneBasedCode,
      projectId: AppState.currentMenuType.id,
    };
    ScrumBoardStore.axiosUpdateBoard(data).then((res) => {
      message.success('保存成功');
      window.console.log(res);
    }).catch((error) => {
      message.success('保存失败');
      window.console.log(error);
    });
  }
  render() {
    const data = ScrumBoardStore.getBoardList;
    const selectBoard = ScrumBoardStore.getSelectedBoard;
    let defaultSelect;
    _.forEach(data, (item) => {
      if (String(item.boardId) === String(selectBoard)) {
        defaultSelect = item;
      }
    });
    return (
      <Content
        description="Swimlane一横排是一行的主板。可以用于组的问题。Swimlane类型可以更改如下，并将被自动保存。注意:查询将不会丢失的更改为另一种Swimlane类型。"
        style={{
          padding: 0,
          height: '100%',
        }}
      >
        <Select
          style={{ width: 512 }} 
          label="基础泳道在" 
          defaultValue={defaultSelect.swimlaneBasedCode || 'parent_child'}
          onChange={(value) => {
            this.setState({
              selectValue: value,
            });
          }}
        >
          <Option value="parent_child">故事</Option>
          <Option value="assignee">经办人</Option>
          {/* <Option value="swimlane_none">无</Option> */}
        </Select>
        <div style={{ marginTop: 12 }}>
          <Button
            type="primary" 
            funcType="raised"
            onClick={this.handleSave.bind(this, defaultSelect)}
          >保存</Button>
          <Button style={{ marginLeft: 12 }} funcType="raised">取消</Button>
        </div>
      </Content>
    );
  }
}

export default SwimLanePage;

