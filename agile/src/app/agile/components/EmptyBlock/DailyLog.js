import React, { Component } from 'react';
import './DailyLog.scss';

class EmptyBlock extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
  }

  render() {
    return (
      <div
        className="c7n-emptyBlock"
        style={{ ...this.props.style }}
      >
        <div
          className="c7n-wrap"
          style={{
            border: this.props.border ? '1px dashed rgba(0, 0, 0, 0.54)' : '',
          }}
        >
          <div className="c7n-imgWrap">
            <img src={this.props.pic} alt="" className="c7n-img" />
          </div>
          <div className="c7n-textWrap">
            <h1 className="c7n-title">
              {this.props.title || ''}
            </h1>
            <p className="c7n-des">
              {this.props.des || ''}
            </p>
          </div>
        </div>
      </div>
    );
  }
}
export default EmptyBlock;
