import ReactDOM from 'react-dom';
import { Collection, MultiGrid, List, Column, Grid } from 'react-virtualized';
import { observer } from 'mobx-react';
import 'react-virtualized/styles.css';
import React, { Component } from 'react';
import _ from 'lodash';
import { Page, Header, Content } from 'choerodon-front-boot';

// Collection data as an array of objects
const list = [
  { name: 'Brian Vaughn', x: 0, y: 0, width: 220, height: 42 },
  { name: 'Brian Vaughn', x: 0, y: 42, width: 220, height: 142 },
  // And so on...
];

function cellSizeAndPositionGetter ({ index, indexa }) {
  // const datum = index === 0 ? list[index] : list[index - 1];
  return {
    height: index === 0 ? 42 : 142,
    width: index === 0 ? window.innerWidth - 250 - 48 : 220,
    x: index === 0 ? 0 : (index - 1) * 220,
    y: index === 0 ? 0 : 42,
  }
}
let left = 0;

@observer
class Test extends Component {
  constructor(props, context) {
    super(props, context);
    this.handleScroll = this.handleScroll.bind(this);
  }

  componentDidMount(){
    const { UserMapStore } = this.props;
    UserMapStore.loadEpic();
    UserMapStore.initData();
  }

  rowRenderer = ({ columnData, dataKey, index }) => {
    const { UserMapStore } = this.props;
    const epicData = UserMapStore.getEpics;
    return (
      <div
        key={dataKey}
        style={style}
      >
        <div style={{ background: 'red' }}>
          {epicData[index].issueNum}
        </div>
      </div>
    )
  }
   cellRenderer = ({ index, key, style, text }) => {
    window.console.log(text);
     const { UserMapStore } = this.props;
     const epicData = UserMapStore.getEpics;
     const issues = UserMapStore.issues;
     window.console.log(epicData.length);
    return (
      index === 0 ? (<div
        key={key}
        style={style}
      >
        {<div>未计划</div>}
      </div>) : (<div
        key={key}
        style={style}
      >
        {index >= epicData.length && <div>
          {_.filter(issues, item => item.epicId === epicData[index - 1].issueId).map(issue => (<div>
            {issue.epicId}
          </div>))}
        </div>}

      </div>)

    )
  }

  renderEpic = ({ columnIndex, key, rowIndex, style }) => {
    const { UserMapStore } = this.props;
    const epicData = UserMapStore.getEpics;
    window.console.log(key);
    return (
      <div
        key={key}
        style={{
          background: 'pink',
          ...style,
        }}
      >
        {epicData[columnIndex].issueId}
      </div>
    )
  }
  connectionRendered =({ indices }) => {
    return indices.slice(0, 8);
  }
  renderCellGroup =({
                             cellCache,
                             cellRenderer,
                             cellSizeAndPositionGetter,
                             indices,
                             isScrolling,
                           }) => {
    const data = [1, 2, 3];
    return indices
      .map(index => {
        const cellMetadata = cellSizeAndPositionGetter({ index });

        let cellRendererProps = {
          index,
          isScrolling,
          key: index,
          style: {
            height: cellMetadata.height,
            left: cellMetadata.x,
            position: 'absolute',
            top: cellMetadata.y,
            width: cellMetadata.width,
          },
        };

        // Avoid re-creating cells while scrolling.
        // This can lead to the same cell being created many times and can cause performance issues for "heavy" cells.
        // If a scroll is in progress- cache and reuse cells.
        // This cache will be thrown away once scrolling complets.
       if (index === 0) {
         return cellRenderer({
           index,
           isScrolling,
           key: index,
           style: {
             height: cellMetadata.height,
             left,
             position: 'fixed',
             top: 0,
             width: cellMetadata.width,
           },
           text: index === 0 ? '未计划' : '',
         });
       } else {
         return cellRenderer(cellRendererProps);
       }
      })
      .filter(renderedCell => !!renderedCell);

  }

  handleScroll =_.debounce(({ clientHeight, clientWidth, scrollHeight, scrollLeft, scrollTop, scrollWidth }) => {
    left = scrollLeft;
  }, 50);
  render () {
    const { UserMapStore } = this.props;
    const epicData = UserMapStore.getEpics;
    const data = [1, 2, 3];
    return (
      <Page
        className="c7n-userMap"
        service={['agile-service.issue.deleteIssue', 'agile-service.issue.listIssueWithoutSub']}
      >
        <Content>
          <div className="epic">
            <Grid
              cellRenderer={this.renderEpic}
              columnCount={UserMapStore.getEpics.length}
              columnWidth={220}
              height={100}
              rowCount={1}
              rowHeight={90}
              width={window.innerWidth - 250 - 48}
            />
          </div>
          <div className="column">
            <Collection
              onScroll={this.handleScroll}
              sectionSize={2}
              cellGroupRenderer={this.renderCellGroup}
              onSectionRendered={this.connectionRendered}
              cellCount={epicData.length + 1}
              cellRenderer={this.cellRenderer}
              cellSizeAndPositionGetter={cellSizeAndPositionGetter}
              height={window.innerHeight - 48 - 24 - 100}
              width={window.innerWidth - 250 - 48}
              style={{ background: '#f0f0f0' }}
            />
          </div>

        </Content>
      </Page>);
    // return(
    //   <MultiGrid
    //     cellCount={epicData.length}
    //     cellRenderer={this.cellRenderer}
    //     columnWidth={75}
    //     columnCount={50}
    //     fixedColumnCount={2}
    //     fixedRowCount={1}
    //     height={300}
    //     rowHeight={40}
    //     rowCount={100}
    //     width={800}
    //   />
    // )
  }
}

export default Test;

