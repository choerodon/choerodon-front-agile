import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Content } from 'choerodon-front-boot';
import { Select } from 'choerodon-ui';
import KanbanStore from '../../../../../../stores/program/Kanban/KanbanStore';


const { Option } = Select;

@observer
class SwimLanePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectValue: '',
    };
  }

  handleSave(select) {
    const { selectValue, selectedValue } = this.state;
    const data = {
      // objectVersionNumber: select.objectVersionNumber,
      boardId: select.boardId,
      swimlaneBasedCode: selectValue || KanbanStore.getSwimLaneCode,
    };
    KanbanStore.axiosUpdateBoardDefault(data).then((res) => {
      KanbanStore.setSwimLaneCode(selectedValue);
      Choerodon.prompt('保存成功');
    }).catch((error) => {      
      Choerodon.prompt('保存失败');
    });
  }

  render() {
    const defaultSelect = KanbanStore.getBoardList.get(KanbanStore.getSelectedBoard);
    return (
      <Content
        description="请在下面输入列名，选择列的类别。可以添加、删除、重新排序和重命名一个列。状态为 待处理 的特性卡片可以在项目中显示。"
        style={{
          padding: 0,         
          height: '100%',
        }}
        link="http://v0-16.choerodon.io/zh/docs/user-guide/agile/sprint/manage-kanban/"
      >
        <Select
          style={{ width: 512 }}
          label="基础泳道在"
          defaultValue={KanbanStore.getSwimLaneCode || 'swimlane_none'}
          onChange={(value) => {
            this.setState({
              selectValue: value,
            }, () => {
              this.handleSave(defaultSelect);
            });
          }}
        >
          <Option value="feature">特性</Option>          
          <Option value="swimlane_none">无</Option>
        </Select>
      </Content>
    );
  }
}

export default SwimLanePage;
