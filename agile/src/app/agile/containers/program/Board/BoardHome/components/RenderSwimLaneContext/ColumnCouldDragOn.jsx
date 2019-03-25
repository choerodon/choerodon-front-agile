import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import BoardStore from '../../../../../../stores/Program/Board/BoardStore';

@observer
class ColumnCouldDragOn extends Component {
  shouldComponentUpdate(nextProps) {
    const { dragOn } = this.props;
    if (nextProps.dragOn !== dragOn) {
      return true;
    }
    return false;
  }

  // 当 Table 为 expand 时，添加 ClassName，从而实现不渲染 Table 改变 css 样式的效果
  render() {
    // const { keyId } = this.props;
    const { keyId } = this.props;
    const dragOn = BoardStore.getCurrentDrag === keyId;
    // cpmst dragOn={BoardStore.getCurrentDrag === keyId}
    return (
      <div className={classnames({
        onColumnDragOn: dragOn,
      })}
      />
    );
  }
}

export default ColumnCouldDragOn;
