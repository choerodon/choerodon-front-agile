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
        description="泳道是指看板中一横排的主板，基于横排对问题进行状态的流转。泳道类型可以在下面进行修改，并将自动保存。注意：修改泳道会修改看板的分组维度，同事修改看板样式。"
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
            }, () => {
              this.handleSave(defaultSelect);
            });
          }}
        >
          <Option value="parent_child">故事</Option>
          <Option value="assignee">经办人</Option>
          <Option value="swimlane_none">无</Option>
        </Select>
        {/* <div style={{ marginTop: 12 }}>
          <Button
            type="primary" 
            funcType="raised"
            onClick={this.handleSave.bind(this, defaultSelect)}
          >保存</Button>
          <Button style={{ marginLeft: 12 }} funcType="raised">取消</Button>
        </div> */}
      </Content>
    );
  }
}

export default SwimLanePage;

