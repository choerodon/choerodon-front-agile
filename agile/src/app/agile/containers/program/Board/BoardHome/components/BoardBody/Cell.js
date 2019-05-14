import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { observer } from 'mobx-react';
import BoardStore from '../../../../../../stores/program/Board/BoardStore';
import IssueCard from './IssueCard';
import { ColumnWidth } from '../Constants';
import './Cell.scss';

const AUTOSCROLL_RATE = 7;
const isScrollable = (...values) => values.some(value => value === 'auto' || value === 'scroll');
function findScroller(n) {
  let node = n;
  while (node) {
    const style = window.getComputedStyle(node);
    if (isScrollable(style.overflow, style.overflowY, style.overflowX)) {
      return node;
    } else {
      node = node.parentNode;
    }
  }
  return null;
}
@observer
class Cell extends Component {
  state={
    resizing: false,
  }

  prepareForScroll = () => {
    const scroller = findScroller(findDOMNode(this));// eslint-disable-line
    const { left, width } = scroller.getBoundingClientRect();
    const scrollRightPosition = left + width;
    const scrollLeftPosition = left;
    this.autoScroll = {
      scroller,
      scrollLeftPosition,
      scrollRightPosition,
    };
  }

  // 拖动时，当鼠标到边缘时，自动滚动
  startAutoScroll = (initMouseX, mode) => {
    // console.log('start');
    const {
      scroller,
      scrollLeftPosition,
      scrollRightPosition,
    } = this.autoScroll;
    const initScrollLeft = scroller.scrollLeft;
    // 到最左或最右，停止滚动
    const shouldStop = () => (mode === 'right' && ~~(scroller.scrollLeft + scroller.offsetWidth) === scroller.scrollWidth)// eslint-disable-line
      || (mode === 'left' && scroller.scrollLeft === 0);
    if (shouldStop()) {
      cancelAnimationFrame(this.scrollTimer);
      return;
    }
    if (this.scrollTimer) {
      cancelAnimationFrame(this.scrollTimer);
    }
    const scrollFunc = () => {
      if (mode === 'right') {
        scroller.scrollLeft += AUTOSCROLL_RATE;
      } else {
        scroller.scrollLeft -= AUTOSCROLL_RATE;
      }
      const { scrollLeft } = this.initScrollPosition;
      this.initScrollPosition.scrollPos = scroller.scrollLeft - scrollLeft;
      // 因为鼠标并没有move，所以这里要手动触发，否则item的宽度不会变化
      this.fireResize(initMouseX);

      if (shouldStop()) {
        cancelAnimationFrame(this.scrollTimer);
      } else {
        this.scrollTimer = requestAnimationFrame(scrollFunc);
      }
    };
    this.scrollTimer = requestAnimationFrame(scrollFunc);
  }

  // 停止自动滚动
  stopAutoScroll = () => {
    cancelAnimationFrame(this.scrollTimer);
  }

  /**
   * item改变大小
   * @parameter mode 模式 left或right
   * @parameter multiple 变几个 => 1
   */
  handleItemResize = (mode, multiple) => {
    const { sprintIndex } = this.props;    
    let width = this.initWidth;    
    switch (mode) {
      case 'right': {
        width += multiple;       
        break;
      }     
      default: break;
    }

    // 最小为一
    if (width > 0) {
      BoardStore.setSprintWidth(sprintIndex, width); 
    }
  }

  handleMouseDown = (mode, e) => {
    e.stopPropagation();
    e.preventDefault();
    const { sprintIndex } = this.props;
    this.initWidth = BoardStore.sprints[sprintIndex].width;
    // 为自动滚动做准备
    this.prepareForScroll();
    // console.log(this[mode].getBoundingClientRect().left, e.clientX);
    this.setState({
      resizing: true, 
    });
    const { scroller } = this.autoScroll;
    this.initScrollPosition = {
      x: e.clientX,
      scrollPos: 0,
      scrollLeft: scroller.scrollLeft,
    };
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('mousemove', this.handleMouseMove);
  }

  handleMouseMove = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const {
      scroller,
      scrollLeftPosition,
      scrollRightPosition,
    } = this.autoScroll;
    this.initMouseX = e.clientX;
    if (scrollLeftPosition >= e.clientX) {
      this.startAutoScroll(e.clientX, 'left');
    } else if (scrollRightPosition <= e.clientX) {
      this.startAutoScroll(e.clientX, 'right');
    } else {
      this.stopAutoScroll(e.clientX);
    }

    this.fireResize(e.clientX);
  }

  // 触发item的宽度变化
  fireResize = (clientX) => { 
    if (this.initScrollPosition) {
      // resize的变化量
      const { x, scrollPos } = this.initScrollPosition;
      const posX = clientX - this.initScrollPosition.x + scrollPos;
    
     
      // 一个所占宽度
      if (Math.abs(posX) > (ColumnWidth / 2)) {
        // 变化的倍数 当达到宽度1/2的倍数的时候触发变化        
        const multiple = Math.round(Math.abs(posX) / (ColumnWidth / 2));
        // console.log(multiple);
        // 奇数和偶数的不同处理 5=>2  4=>2
        if (multiple % 2 === 0) {
          this.handleItemResize('right', multiple * (posX > 0 ? 1 : -1) / 2);
        } else {
          this.handleItemResize('right', (multiple - 1) / 2 * (posX > 0 ? 1 : -1));
        }
      }
    }
  }

  /**
   * 鼠标up将数据初始化
   * 
   * 
   */
  handleMouseUp = (e) => {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    this.stopAutoScroll();
    this.setState({
      resizing: false,
    });
    const { sprintIndex } = this.props;
    const { width } = BoardStore.sprints[sprintIndex].width;
    // 只在数据变化时才请求
    if (this.initWidth !== width) {
      // console.log('change');
    }
  }

  render() {
    const { data, project, sprintIndex } = this.props;
    const { width } = BoardStore.sprints[sprintIndex];
    const { issues, id } = data;
    const { resizing } = this.state;
    return (
      <div className="c7nagile-Cell" style={{ width: ColumnWidth * width }}>
        {issues.map(issue => <IssueCard issue={issue} sprintId={id} projectId={project.id} />)}
        {resizing && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            zIndex: 9999,
            cursor: 'col-resize',
          }}
          />
        )}
        <div
          style={{
            top: 0,
            height: '100%',
            width: 20,
            position: 'absolute',
            zIndex: 2,
            cursor: 'col-resize',
            right: -10,
          }}
          onMouseDown={this.handleMouseDown.bind(this, 'right')}
          role="none"
        />
      </div>
    );
  }
}

Cell.propTypes = {

};

export default Cell;
